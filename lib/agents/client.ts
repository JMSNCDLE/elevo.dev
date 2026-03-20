import Anthropic from '@anthropic-ai/sdk'

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

// ─── Thinking Config ──────────────────────────────────────────────────────────

export function buildThinkingConfig() {
  return { type: 'adaptive' as const }
}

// ─── Output Config ────────────────────────────────────────────────────────────

export function buildEffortConfig(effort: 'low' | 'medium' | 'high' | 'max') {
  return { effort }
}

// ─── Tool: Web Search ─────────────────────────────────────────────────────────

export const WEB_SEARCH_TOOL = {
  type: 'web_search_20250305' as const,
  name: 'web_search' as const,
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
