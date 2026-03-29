import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { buildMarketingMission } from '@/lib/agents/superMarketingAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  goal: z.string().min(5),
  timeframe: z.string().min(1),
  budget: z.string().min(1),
  platforms: z.array(z.string()).min(1),
  locale: z.string().default('en'),
  autoExecute: z.boolean().optional().default(false),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan, credits_used, credits_limit').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (profile.plan !== 'orbit' && profile.plan !== 'galaxy') return NextResponse.json({ error: 'Orbit plan required' }, { status: 403 })
  if (profile.credits_used + 10 > profile.credits_limit) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const { data: bp } = await supabase.from('business_profiles').select('*').eq('id', parsed.data.businessProfileId).eq('user_id', user.id).single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  try {
    const plan = await buildMarketingMission({
      businessProfile: bp as BusinessProfile,
      goal: parsed.data.goal,
      timeframe: parsed.data.timeframe,
      budget: parsed.data.budget,
      platforms: parsed.data.platforms,
      connectedAccounts: [],
      locale: parsed.data.locale,
    }, parsed.data.locale)

    const timeframeWeeks = parseInt(parsed.data.timeframe) || 4
    const endsAt = new Date()
    endsAt.setDate(endsAt.getDate() + timeframeWeeks * 7)

    const { data: mission, error: insertError } = await supabase.from('marketing_missions').insert({
      user_id: user.id,
      business_profile_id: parsed.data.businessProfileId,
      title: plan.missionTitle,
      goal: parsed.data.goal,
      timeframe: parsed.data.timeframe,
      status: 'active',
      plan,
      current_week: 1,
      performance: {},
      auto_execute: parsed.data.autoExecute && profile.plan === 'galaxy',
      total_credits_used: 10,
      ends_at: endsAt.toISOString(),
    }).select().single()

    if (insertError) throw insertError

    await supabase.from('profiles').update({ credits_used: profile.credits_used + 10 }).eq('id', user.id)

    return NextResponse.json({ mission, plan })
  } catch (err) {
    console.error('Market mission error:', err)
    return NextResponse.json({ error: 'Mission generation failed' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')

  const { data, error } = await supabase
    .from('marketing_missions')
    .select('id, title, goal, timeframe, status, current_week, auto_execute, started_at, ends_at, total_credits_used, plan')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ missions: data })
}
