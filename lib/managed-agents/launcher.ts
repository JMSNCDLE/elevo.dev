// ─── Managed Agent Session Launcher ──────────────────────────────────────────
// Triggers a background agent session in Anthropic Console.
// Usage: import and call from cron routes or admin endpoints.

import { managedAgentsClient } from './registry'

export async function launchBackgroundAgent(
  agentId: string,
  task: string,
  context?: Record<string, unknown>
): Promise<{ sessionId: string; status: string }> {
  if (!agentId) {
    console.warn('[managed-agents] No agent ID provided — skipping launch')
    return { sessionId: '', status: 'skipped' }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await (managedAgentsClient.beta as any).agents.sessions.create(agentId, {
      input: {
        role: 'user',
        content: context
          ? `${task}\n\nContext: ${JSON.stringify(context, null, 2)}`
          : task,
      },
    })

    return {
      sessionId: session.id,
      status: session.status ?? 'started',
    }
  } catch (err) {
    console.error('[managed-agents] launch failed:', err)
    return { sessionId: '', status: 'error' }
  }
}
