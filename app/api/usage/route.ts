import { getUserContext } from '@/lib/auth/getUserContext'
import { NextResponse } from 'next/server'

export async function GET() {
  const ctx = await getUserContext()
  if (!ctx.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date().toISOString().split('T')[0]

  const { data } = await ctx.supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', ctx.user.id)
    .eq('date', today)
    .maybeSingle()

  return NextResponse.json({
    today: {
      requests: data?.requests_count ?? 0,
      inputTokens: data?.tokens_input ?? 0,
      outputTokens: data?.tokens_output ?? 0,
      estimatedCostCents: data?.estimated_cost_cents ?? 0,
      workflowSteps: data?.workflow_steps ?? 0,
    },
    plan: ctx.plan,
  })
}
