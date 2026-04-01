// ─── Agent Run Logger ────────────────────────────────────────────────────────
// Logs every agent call to Supabase for observability.
// NEVER blocks the response — fire and forget with silent error handling.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = any

function classifyError(error: string): string {
  if (error.includes('JSON') || error.includes('parse')) return 'parse'
  if (error.includes('401') || error.includes('auth') || error.includes('Unauthorized')) return 'auth'
  if (error.includes('timeout') || error.includes('ETIMEDOUT')) return 'timeout'
  if (error.includes('429') || error.includes('rate')) return 'rate_limit'
  if (error.includes('529') || error.includes('overloaded')) return 'overloaded'
  if (error.includes('500') || error.includes('Internal')) return 'server_error'
  if (error.includes('credit')) return 'credits'
  return 'unknown'
}

export async function logAgentRun(supabase: SB, data: {
  userId?: string
  agent: string
  status: 'success' | 'error'
  input?: string
  output?: string
  error?: string
  durationMs?: number
  tokensInput?: number
  tokensOutput?: number
  toolUsed?: string
  plan?: string
  locale?: string
}) {
  try {
    await supabase.from('agent_runs').insert({
      user_id: data.userId ?? null,
      agent: data.agent,
      status: data.status,
      error_type: data.error ? classifyError(data.error) : null,
      input: data.input?.slice(0, 2000),
      output: data.output?.slice(0, 2000),
      error: data.error?.slice(0, 1000),
      duration_ms: data.durationMs ?? null,
      tokens_input: data.tokensInput ?? null,
      tokens_output: data.tokensOutput ?? null,
      tool_used: data.toolUsed ?? null,
      plan: data.plan ?? null,
      locale: data.locale ?? null,
    })
  } catch (logError) {
    // NEVER block the response if logging fails
    console.error('[logger] Failed to log agent run:', logError)
  }
}
