import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { runWeeklyReview } from '@/lib/agents/superMarketingAgent'
import { ADMIN_IDS } from '@/lib/admin'
import type { MarketingMissionPlan } from '@/lib/agents/superMarketingAgent'

const Schema = z.object({
  missionId: z.string().uuid(),
  performanceData: z.record(z.unknown()),
  locale: z.string().default('en'),
})

const CREDIT_COST = 3

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_used, credits_limit')
    .eq('id', user.id)
    .single()

  if (!ADMIN_IDS.includes(user.id) && (!profile || (profile.plan !== 'orbit' && profile.plan !== 'galaxy'))) {
    return NextResponse.json({ error: 'Orbit plan required' }, { status: 403 })
  }

  if (!ADMIN_IDS.includes(user!.id) && profile && (profile ?? { credits_used: 0 }).credits_used + CREDIT_COST > (profile ?? { credits_limit: 9999 }).credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  const { data: mission } = await supabase
    .from('marketing_missions')
    .select('*')
    .eq('id', parsed.data.missionId)
    .eq('user_id', user.id)
    .single()

  if (!mission) return NextResponse.json({ error: 'Mission not found' }, { status: 404 })

  try {
    const review = await runWeeklyReview(
      parsed.data.missionId,
      parsed.data.performanceData,
      parsed.data.locale,
    )

    const existingPlan = mission.plan as MarketingMissionPlan
    const updatedPlan: MarketingMissionPlan = {
      ...existingPlan,
      contentCalendar: [
        ...(existingPlan.contentCalendar || []).filter((e) => e.status === 'published'),
        ...review.updatedCalendar,
      ],
    }

    await supabase
      .from('marketing_missions')
      .update({
        plan: updatedPlan as unknown as Record<string, unknown>,
        performance: {
          ...(mission.performance as Record<string, unknown> || {}),
          lastReview: review,
          lastReviewAt: new Date().toISOString(),
        },
        current_week: (mission.current_week || 1) + 1,
      })
      .eq('id', parsed.data.missionId)

    await supabase
      .from('profiles')
      .update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + CREDIT_COST })
      .eq('id', user.id)

    return NextResponse.json({ success: true, review })
  } catch (err) {
    console.error('[market/review]', err)
    return NextResponse.json({ error: 'Review failed' }, { status: 500 })
  }
}
