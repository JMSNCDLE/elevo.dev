// ─── Cost Guard + Usage Limiter ───────────────────────────────────────────────
// Prevents runaway API costs with per-day and per-run limits.

import { createServerClient } from '@/lib/supabase/server'

// Cost per token (Claude Sonnet 4) in cents
const INPUT_COST_PER_1K = 0.3
const OUTPUT_COST_PER_1K = 1.5

const DAILY_COST_LIMITS: Record<string, number> = {
  trial: 50, launch: 200, orbit: 500, galaxy: 1500, admin: 99999,
}

const DAILY_REQUEST_LIMITS: Record<string, number> = {
  trial: 20, launch: 100, orbit: 300, galaxy: 1000, admin: 99999,
}

const MAX_STEPS_PER_RUN: Record<string, number> = {
  trial: 5, launch: 8, orbit: 12, galaxy: 20, admin: 50,
}

const MAX_COST_PER_RUN: Record<string, number> = {
  trial: 10, launch: 30, orbit: 50, galaxy: 100, admin: 9999,
}

export interface CostCheckResult {
  allowed: boolean
  reason?: string
  usage?: { dailyCostCents: number; dailyRequests: number; dailyLimit: number; costLimit: number }
}

export async function checkDailyBudget(userId: string, plan: string): Promise<CostCheckResult> {
  const supabase = await createServerClient()
  const effectivePlan = plan || 'trial'
  const today = new Date().toISOString().split('T')[0]

  const { data: usage } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle()

  const currentCost = usage?.estimated_cost_cents || 0
  const currentRequests = usage?.requests_count || 0
  const costLimit = DAILY_COST_LIMITS[effectivePlan] ?? DAILY_COST_LIMITS.trial
  const requestLimit = DAILY_REQUEST_LIMITS[effectivePlan] ?? DAILY_REQUEST_LIMITS.trial

  if (currentCost >= costLimit) {
    return { allowed: false, reason: `Daily cost limit reached (€${(costLimit / 100).toFixed(2)}). Resets at midnight UTC.`, usage: { dailyCostCents: currentCost, dailyRequests: currentRequests, dailyLimit: requestLimit, costLimit } }
  }
  if (currentRequests >= requestLimit) {
    return { allowed: false, reason: `Daily request limit reached (${requestLimit}). Resets at midnight UTC.`, usage: { dailyCostCents: currentCost, dailyRequests: currentRequests, dailyLimit: requestLimit, costLimit } }
  }
  return { allowed: true, usage: { dailyCostCents: currentCost, dailyRequests: currentRequests, dailyLimit: requestLimit, costLimit } }
}

export function checkRunBudget(plan: string, currentSteps: number, currentCostCents: number): { allowed: boolean; reason?: string } {
  const effectivePlan = plan || 'trial'
  const maxSteps = MAX_STEPS_PER_RUN[effectivePlan] ?? MAX_STEPS_PER_RUN.trial
  const maxCost = MAX_COST_PER_RUN[effectivePlan] ?? MAX_COST_PER_RUN.trial
  if (currentSteps >= maxSteps) return { allowed: false, reason: `Maximum steps reached (${maxSteps}). Upgrade for higher limits.` }
  if (currentCostCents >= maxCost) return { allowed: false, reason: `Cost limit reached (€${(maxCost / 100).toFixed(2)}).` }
  return { allowed: true }
}

export function estimateCost(inputTokens: number, outputTokens: number): number {
  return Math.ceil((inputTokens / 1000) * INPUT_COST_PER_1K + (outputTokens / 1000) * OUTPUT_COST_PER_1K)
}

export async function recordUsage(userId: string, inputTokens: number, outputTokens: number, steps = 1) {
  try {
    const supabase = await createServerClient()
    const today = new Date().toISOString().split('T')[0]
    const costCents = estimateCost(inputTokens, outputTokens)

    const { data: existing } = await supabase
      .from('usage_tracking')
      .select('id, requests_count, tokens_input, tokens_output, estimated_cost_cents, workflow_steps')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle()

    if (existing) {
      await supabase.from('usage_tracking').update({
        requests_count: (existing.requests_count || 0) + 1,
        tokens_input: (existing.tokens_input || 0) + inputTokens,
        tokens_output: (existing.tokens_output || 0) + outputTokens,
        estimated_cost_cents: (existing.estimated_cost_cents || 0) + costCents,
        workflow_steps: (existing.workflow_steps || 0) + steps,
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id)
    } else {
      await supabase.from('usage_tracking').insert({
        user_id: userId, date: today, requests_count: 1,
        tokens_input: inputTokens, tokens_output: outputTokens,
        estimated_cost_cents: costCents, workflow_steps: steps,
      })
    }
  } catch (err) {
    // Never block agent response if usage tracking fails
    console.error('[costGuard] recordUsage failed:', err)
  }
}
