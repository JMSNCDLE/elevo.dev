import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { runCampaignAgent } from '@/lib/agents/campaignAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  campaignGoal: z.string().min(5),
  campaignDuration: z.string().optional(),
  budget: z.string().optional(),
  targetAudience: z.string().optional(),
  channels: z.array(z.string()).optional(),
  season: z.string().optional(),
  offer: z.string().optional(),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan, credits_used, credits_limit').eq('id', user.id).single()
  if (!profile || (profile.plan !== 'orbit' && profile.plan !== 'galaxy')) return NextResponse.json({ error: 'Orbit plan required' }, { status: 403 })
  if (profile.credits_used >= profile.credits_limit) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { data: bp } = await supabase.from('business_profiles').select('*').eq('id', parsed.data.businessProfileId).eq('user_id', user.id).single()
  if (!bp) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const result = await runCampaignAgent(bp as BusinessProfile, {
      campaignGoal: parsed.data.campaignGoal,
      campaignDuration: parsed.data.campaignDuration,
      budget: parsed.data.budget,
      targetAudience: parsed.data.targetAudience,
      channels: parsed.data.channels,
      season: parsed.data.season,
      offer: parsed.data.offer,
    })

    await supabase.from('growth_reports').insert({ user_id: user.id, business_profile_id: bp.id, type: 'campaign_plan', title: result.campaignName || 'Campaign Plan', content: result })
    await supabase.from('profiles').update({ credits_used: profile.credits_used + 1 }).eq('id', user.id)

    return NextResponse.json({ result })
  } catch (err) {
    console.error('Campaign agent error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
