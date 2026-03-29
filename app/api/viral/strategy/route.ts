import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { buildViralStrategy } from '@/lib/agents/viralMarketingAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  targetPlatforms: z.array(z.string()).min(1),
  contentBudget: z.enum(['zero', 'low', 'medium', 'high']),
  goal: z.enum(['followers', 'leads', 'sales', 'brand_awareness', 'traffic']),
  locale: z.string().default('en'),
})

const CREDIT_COST = 5

export async function POST(request: Request) {
  // 1. Auth check
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // 2. Zod validate
  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  // 3. Plan check
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_used, credits_limit')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.plan !== 'orbit' && profile.plan !== 'galaxy')) {
    return NextResponse.json({ error: 'Orbit plan required' }, { status: 403 })
  }

  // 4. Credit check
  if (profile.credits_used + CREDIT_COST > profile.credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  // 5. Fetch business profile
  const { data: bp } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', parsed.data.businessProfileId)
    .eq('user_id', user.id)
    .single()

  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  try {
    // 6. Call agent
    const strategy = await buildViralStrategy(
      {
        businessProfile: bp as BusinessProfile,
        targetPlatforms: parsed.data.targetPlatforms,
        contentBudget: parsed.data.contentBudget,
        goal: parsed.data.goal,
        locale: parsed.data.locale,
      },
      parsed.data.locale,
    )

    // 7. Save result to growth_reports
    await supabase.from('growth_reports').insert({
      user_id: user.id,
      business_profile_id: bp.id,
      type: 'campaign_plan',
      title: `Viral Strategy — ${new Date().toLocaleDateString('en-GB')}`,
      content: { strategy_type: 'viral', platforms: parsed.data.targetPlatforms, goal: parsed.data.goal, ...strategy } as unknown as Record<string, unknown>,
    })

    // 8. Deduct credits after success
    await supabase
      .from('profiles')
      .update({ credits_used: profile.credits_used + CREDIT_COST })
      .eq('id', user.id)

    return NextResponse.json({ success: true, strategy })
  } catch (err) {
    console.error('[viral/strategy]', err)
    return NextResponse.json({ error: 'Strategy generation failed' }, { status: 500 })
  }
}
