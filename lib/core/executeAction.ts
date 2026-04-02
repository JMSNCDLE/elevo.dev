// ─── Unified Action Executor with Idempotency ───────────────────────────────
// Wraps ALL side-effect actions with duplicate protection.

import { checkIdempotency, completeAction, failAction, type ActionSource } from './idempotency'

type ActionHandler = (payload: Record<string, unknown>, userId: string) => Promise<unknown>

const ACTION_HANDLERS: Record<string, ActionHandler> = {}

/** Register an action handler at module load time. */
export function registerAction(name: string, handler: ActionHandler) {
  ACTION_HANDLERS[name] = handler
}

/** Execute an action with idempotency protection. */
export async function executeAction(
  userId: string,
  action: string,
  payload: Record<string, unknown>,
  source: ActionSource = 'manual'
): Promise<{ success: boolean; result?: unknown; wasDuplicate?: boolean; error?: string }> {
  const check = await checkIdempotency(userId, action, payload, source)

  if (check.isDuplicate) {
    console.log(`[executeAction] Duplicate detected for ${action}`)
    return { success: true, result: check.previousResult, wasDuplicate: true }
  }

  const handler = ACTION_HANDLERS[action]
  if (!handler) {
    if (check.logId) await failAction(check.logId, new Error(`Unknown action: ${action}`))
    return { success: false, error: `Unknown action: ${action}` }
  }

  try {
    const result = await handler(payload, userId)
    if (check.logId) await completeAction(check.logId, result)
    return { success: true, result }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    if (check.logId) await failAction(check.logId, error)
    return { success: false, error: msg }
  }
}
