import { createMessage, MODELS, extractText } from './client'
import { getUserContext } from '@/lib/auth/getUserContext'
import { getOrCreateConversation, loadMessages, saveMessage, formatMessagesForClaude } from './memory'

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

  async function attempt(retriesLeft: number): Promise<AgentResponse> {
    try {
      console.log(`[runAgent:${agent}] Calling Anthropic (model: ${params.model}, msgs: ${messages.length}, retries left: ${retriesLeft})`)
      const response = await createMessage(params)
      console.log(`[runAgent:${agent}] Response received (${response.content.length} blocks)`)
      return handleResponse(response as { content: Array<{ type: string; text?: string; name?: string; input?: unknown }> })
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string }
      if (retriesLeft <= 0) {
        const msg = err?.message ?? 'Unknown error'
        console.error(`[runAgent:${agent}] FAILED after retries:`, msg)
        return { type: 'error', message: `Agent error: ${msg}` }
      }
      // Overloaded — wait longer
      if (err?.status === 529) {
        console.warn(`[runAgent:${agent}] Overloaded, retrying in 1s...`)
        await new Promise(r => setTimeout(r, 1000))
      } else {
        console.warn(`[runAgent:${agent}] Error (status: ${err?.status}), retrying in 500ms...`)
        await new Promise(r => setTimeout(r, 500))
      }
      return attempt(retriesLeft - 1)
    }
  }

  const result = await attempt(maxRetries)

  // Save assistant response to memory
  if (useMemory && conversationId && ctx.user) {
    if (result.type === 'text' && result.content) {
      await saveMessage({ conversationId, role: 'assistant', content: result.content, supabase: ctx.supabase })
    } else if (result.type === 'tool_result') {
      await saveMessage({ conversationId, role: 'tool', content: JSON.stringify(result.result), toolName: result.tool, supabase: ctx.supabase })
    }
  }

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
