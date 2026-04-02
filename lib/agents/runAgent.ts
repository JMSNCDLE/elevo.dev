import { createMessage, MODELS, extractText } from './client'
import { getUserContext } from '@/lib/auth/getUserContext'
import { getOrCreateConversation, loadMessages, saveMessage, formatMessagesForClaude } from './memory'
import { logAgentRun } from './logger'
import { withRetry } from './retry'
import { canExecute, recordSuccess, recordFailure } from './circuitBreaker'

// ─── Types ───────────────────────────────────────────────────────────────────

export type AgentResponse = {
  type: 'text' | 'tool_result' | 'error'
  content?: string
  tool?: string
  result?: unknown
  message?: string
}

export type RunAgentParams = {
  agent: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  input?: string           // single user input (memory-backed)
  systemPrompt?: string
  tools?: unknown[]
  maxRetries?: number
  maxTokens?: number
  model?: string
  useMemory?: boolean      // opt-in to conversation memory
}

// ─── System Prompt Builder ───────────────────────────────────────────────────

function buildSystemPrompt(agent: string, language: string, customPrompt?: string): string {
  const languageDirective = `You MUST respond entirely in ${language}. Every word must be in this language.`

  if (customPrompt) {
    return `${languageDirective}\n\n${customPrompt}`
  }

  return `${languageDirective}\n\nYou are ELEVO AI (${agent} agent). Be concise, actionable, and helpful. Match the user's tone. Never hallucinate data.`
}

// ─── JSON Parser ─────────────────────────────────────────────────────────────

export function parseAgentJSON<T = unknown>(text: string): T {
  // Try direct parse
  try { return JSON.parse(text) } catch {}

  // Try extracting from markdown code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()) } catch {}
  }

  // Try finding JSON object in text
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]) } catch {}
  }

  throw new Error('Failed to parse JSON from agent response')
}

// ─── Response Handler ────────────────────────────────────────────────────────

function handleResponse(response: { content: Array<{ type: string; text?: string; name?: string; input?: unknown }> }): AgentResponse {
  // Guard against HTML responses (routing error)
  if (response && typeof response === 'object' && 'content' in response) {
    const firstText = response.content.find(c => c.type === 'text')
    if (firstText && typeof firstText.text === 'string' && firstText.text.trim().startsWith('<!DOCTYPE')) {
      return { type: 'error', message: 'Received HTML instead of JSON — likely a routing error' }
    }
  }

  // 1. Tool call detected
  const toolCall = response.content.find(c => c.type === 'tool_use')
  if (toolCall && 'name' in toolCall) {
    return {
      type: 'tool_result',
      tool: toolCall.name as string,
      result: toolCall.input,
    }
  }

  // 2. Text response
  const text = response.content
    .filter(c => c.type === 'text')
    .map(c => (c as { type: 'text'; text: string }).text)
    .join('\n')

  return { type: 'text', content: text }
}

// ─── Main Executor ───────────────────────────────────────────────────────────

export async function runAgent({
  agent,
  messages,
  input,
  systemPrompt,
  tools = [],
  maxRetries = 2,
  maxTokens = 4000,
  model,
  useMemory = false,
}: RunAgentParams): Promise<AgentResponse> {
  const ctx = await getUserContext()
  const system = buildSystemPrompt(agent, ctx.language, systemPrompt)

  // Memory-backed mode: load history + save messages
  let conversationId: string | null = null
  let finalMessages = messages

  if (useMemory && input && ctx.user) {
    const convo = await getOrCreateConversation(ctx.user.id, agent, ctx.supabase, ctx.locale)
    if (convo) {
      conversationId = convo.id
      const history = await loadMessages(convo.id, ctx.supabase)
      const formattedHistory = formatMessagesForClaude(history)
      finalMessages = [...formattedHistory, { role: 'user' as const, content: input }]
      await saveMessage({ conversationId: convo.id, role: 'user', content: input, supabase: ctx.supabase })
    } else {
      // Memory unavailable — fall back to direct messages
      finalMessages = input ? [{ role: 'user' as const, content: input }] : messages
    }
  }

  const params: Record<string, unknown> = {
    model: model ?? MODELS.AGENT,
    system,
    messages: finalMessages,
    max_tokens: maxTokens,
  }

  if (tools.length > 0) {
    params.tools = tools
  }

  async function executeWithResilience(): Promise<AgentResponse> {
    // Circuit breaker check
    if (!canExecute('anthropic')) {
      return { type: 'error', message: 'Our AI service is temporarily busy. Please try again in 30 seconds.' }
    }

    try {
      const response = await withRetry(
        async () => {
          console.log(`[runAgent:${agent}] Calling Anthropic (model: ${params.model}, msgs: ${finalMessages.length})`)
          return createMessage(params)
        },
        {
          maxRetries: 2,
          initialDelayMs: 1500,
          maxDelayMs: 10000,
          onRetry: (attempt, error, delay) => {
            const err = error as { message?: string }
            console.warn(`[runAgent:${agent}] Retry ${attempt} after ${Math.round(delay)}ms — ${err?.message ?? 'unknown'}`)
          },
        }
      )

      recordSuccess('anthropic')
      console.log(`[runAgent:${agent}] Response received (${response.content.length} blocks)`)
      return handleResponse(response as { content: Array<{ type: string; text?: string; name?: string; input?: unknown }> })
    } catch (error: unknown) {
      recordFailure('anthropic')
      const err = error as { status?: number; message?: string }
      const msg = err?.message ?? 'Unknown error'
      console.error(`[runAgent:${agent}] FAILED:`, msg)
      return { type: 'error', message: `Agent error: ${msg}` }
    }
  }

  const start = Date.now()
  const result = await executeWithResilience()
  const durationMs = Date.now() - start

  // Save assistant response to memory
  if (useMemory && conversationId && ctx.user) {
    if (result.type === 'text' && result.content) {
      await saveMessage({ conversationId, role: 'assistant', content: result.content, supabase: ctx.supabase })
    } else if (result.type === 'tool_result') {
      await saveMessage({ conversationId, role: 'tool', content: JSON.stringify(result.result), toolName: result.tool, supabase: ctx.supabase })
    }
  }

  // Log to observability (fire and forget — never blocks response)
  logAgentRun(ctx.supabase, {
    userId: ctx.user?.id,
    agent,
    status: result.type === 'error' ? 'error' : 'success',
    input: input ?? JSON.stringify(finalMessages.slice(-1)).slice(0, 2000),
    output: result.type === 'text' ? result.content?.slice(0, 2000) : JSON.stringify(result).slice(0, 2000),
    error: result.type === 'error' ? result.message : undefined,
    durationMs,
    toolUsed: result.tool,
    plan: ctx.plan,
    locale: ctx.locale,
  })

  return result
}

// ─── Convenience: Run agent and extract text ─────────────────────────────────

export async function runAgentText(params: RunAgentParams): Promise<string> {
  const result = await runAgent(params)
  if (result.type === 'error') throw new Error(result.message)
  return result.content ?? ''
}

// ─── Convenience: Run agent and parse JSON ───────────────────────────────────

export async function runAgentJSON<T = unknown>(params: RunAgentParams): Promise<T> {
  const text = await runAgentText(params)
  return parseAgentJSON<T>(text)
}
