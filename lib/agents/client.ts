import Anthropic from '@anthropic-ai/sdk'
import type { APIPromise } from '@anthropic-ai/sdk/core'

// ─── Singleton Client ─────────────────────────────────────────────────────────

let _client: Anthropic | null = null

export function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

// ─── Model Constants ──────────────────────────────────────────────────────────

export const MODELS = {
  ORCHESTRATOR: 'claude-opus-4-6',
  PROBLEM_SOLVER: 'claude-opus-4-6',
  SPECIALIST: 'claude-sonnet-4-6',
} as const

// ─── Token Limits ─────────────────────────────────────────────────────────────

export const MAX_TOKENS = {
  HIGH: 8000,
  MEDIUM: 5000,
  LOW: 3000,
} as const

// ─── Extended Message Params (thinking + effort not yet in SDK types) ─────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtendedParams = Record<string, any>

/**
 * Wrapper around client.messages.create that:
 * 1. Always uses the non-streaming overload (returns Message, not Stream)
 * 2. Supports extended params (thinking, effort) not yet typed in SDK 0.32
 */
export function createMessage(params: ExtendedParams): APIPromise<Anthropic.Message> {
  const client = getClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (client.messages as any).create({ stream: false, ...params }) as APIPromise<Anthropic.Message>
}

// ─── Thinking Config ──────────────────────────────────────────────────────────

export function buildThinkingConfig() {
  return { type: 'adaptive' as const }
}

// ─── Output Config ────────────────────────────────────────────────────────────

export function buildEffortConfig(effort: 'low' | 'medium' | 'high' | 'max') {
  return { effort }
}

// ─── Tool: Web Search ─────────────────────────────────────────────────────────

// Cast to any so it's accepted in tools[] without requiring input_schema
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const WEB_SEARCH_TOOL: any = {
  type: 'web_search_20250305',
  name: 'web_search',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function extractText(response: Anthropic.Message): string {
  const texts: string[] = []
  for (const block of response.content) {
    if (block.type === 'text') texts.push(block.text)
  }
  return texts.join('\n')
}

export function parseJSON<T>(text: string): T {
  // Strip markdown code fences
  const cleaned = text
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```\s*$/im, '')
    .trim()
  return JSON.parse(cleaned) as T
}
