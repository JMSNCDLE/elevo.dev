// ─── Idempotent Action System ─────────────────────────────────────────────────
// Prevents duplicate side effects (double emails, double tasks, etc.)
// Uses SHA-256 hash of user + action + payload + time bucket as idempotency key.

import { createServerClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export type ActionSource = 'manual' | 'workflow' | 'next_action' | 'retry' | 'agent'

interface IdempotencyResult {
  isDuplicate: boolean
  previousResult?: unknown
  logId?: string
}

export function generateIdempotencyKey(
  userId: string,
  action: string,
  payload: Record<string, unknown>,
  timeBucketMinutes = 5
): string {
  const bucket = Math.floor(Date.now() / (timeBucketMinutes * 60 * 1000))
  const sortedPayload = JSON.stringify(payload, Object.keys(payload).sort())
  const raw = `${userId}:${action}:${sortedPayload}:${bucket}`
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 32)
}

export async function checkIdempotency(
  userId: string,
  action: string,
  payload: Record<string, unknown>,
  source: ActionSource = 'manual',
  timeBucketMinutes = 5
): Promise<IdempotencyResult> {
  const supabase = await createServerClient()
  const key = generateIdempotencyKey(userId, action, payload, timeBucketMinutes)

  const { data: existing } = await supabase
    .from('action_logs')
    .select('id, status, result')
    .eq('idempotency_key', key)
    .maybeSingle()

  if (existing) {
    if (existing.status === 'completed') {
      return { isDuplicate: true, previousResult: existing.result, logId: existing.id }
    }
    if (existing.status === 'pending') {
      return { isDuplicate: true, logId: existing.id }
    }
    // Failed — allow retry
    await supabase.from('action_logs').delete().eq('id', existing.id)
  }

  const { data: newEntry, error } = await supabase
    .from('action_logs')
    .insert({ user_id: userId, action, idempotency_key: key, payload, source, status: 'pending' })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { isDuplicate: true }
    console.error('[idempotency] Insert failed:', error.message)
  }

  return { isDuplicate: false, logId: newEntry?.id }
}

export async function completeAction(logId: string, result: unknown) {
  const supabase = await createServerClient()
  await supabase.from('action_logs').update({
    status: 'completed',
    result,
    completed_at: new Date().toISOString(),
  }).eq('id', logId)
}

export async function failAction(logId: string, error: unknown) {
  const supabase = await createServerClient()
  await supabase.from('action_logs').update({
    status: 'failed',
    result: { error: error instanceof Error ? error.message : String(error) },
    completed_at: new Date().toISOString(),
  }).eq('id', logId)
}
