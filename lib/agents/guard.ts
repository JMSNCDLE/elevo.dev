/**
 * Development-time warnings to catch legacy patterns.
 * These don't block execution — they log warnings for visibility.
 */

const WARNED = new Set<string>()

export function warnDirectProfileAccess(caller: string) {
  if (process.env.NODE_ENV === 'development' && !WARNED.has(caller)) {
    WARNED.add(caller)
    console.warn(
      `⚠️ [ELEVO Guard] Direct profiles query detected in ${caller}. ` +
      `Use getUserContext() instead. See lib/auth/getUserContext.ts`
    )
  }
}

export function warnDirectAnthropicUsage(caller: string) {
  if (process.env.NODE_ENV === 'development' && !WARNED.has(caller)) {
    WARNED.add(caller)
    console.warn(
      `⚠️ [ELEVO Guard] Direct Anthropic client usage detected in ${caller}. ` +
      `Use runAgent() instead. See lib/agents/runAgent.ts`
    )
  }
}
