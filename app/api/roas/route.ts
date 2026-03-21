import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { runROASAnalysis } from '@/lib/agents/roasAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  campaigns: z.array(z.record(z.unknown())),
  currency: z.string().min(1),
  locale: z.string().min(2),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan, credits_used, credits_limit').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (profile.plan !== 'orbit' && profile.plan !== 'galaxy') return NextResponse.json({ error: 'Orbit plan required' }, { status: 403 })
  if (profile.credits_used >= profile.credits_limit) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { data: bp } = await supabase.from('business_profiles').select('*').eq('id', parsed.data.businessProfileId).eq('user_id', user.id).single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  try {
    const typedBp = bp as BusinessProfile
    const input = {
      campaigns: parsed.data.campaigns as Parameters<typeof runROASAnalysis>[0]['campaigns'],
      currency: parsed.data.currency,
      businessName: typedBp.business_name,
      businessCategory: typedBp.category,
    }

    const result = await runROASAnalysis(input, parsed.data.locale)

    const date = new Date().toISOString().slice(0, 10)
    await supabase.from('growth_reports').insert({
      user_id: user.id,
      business_profile_id: bp.id,
      type: 'roas_report',
      title: `ROAS Report - ${date}`,
      content: result,
    })
    await supabase.from('profiles').update({ credits_used: profile.credits_used + 3 }).eq('id', user.id)

    // Track analytics event
    await supabase.from('analytics_events').insert({
      user_id: user.id,
      business_profile_id: bp.id,
      event_type: 'roas_viewed',
      agent_name: 'Leo',
      feature: 'roas_analysis',
      metadata: { campaignCount: parsed.data.campaigns.length },
    })

    return NextResponse.json({ result })
  } catch (err) {
    console.error('ROAS agent error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
