import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { runStrategyAgent } from '@/lib/agents/strategyAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  strategicGoal: z.string().min(5),
  timeframe: z.string().optional(),
  currentChallenges: z.string().optional(),
  budget: z.string().optional(),
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
    const result = await runStrategyAgent(bp as BusinessProfile, {
      strategicGoal: parsed.data.strategicGoal,
      timeframe: parsed.data.timeframe,
      currentChallenges: parsed.data.currentChallenges,
      budget: parsed.data.budget,
    })

    await supabase.from('growth_reports').insert({ user_id: user.id, business_profile_id: bp.id, type: 'swot_strategy', title: `Strategy Plan — ${new Date().toLocaleDateString('en-GB')}`, content: result })
    await supabase.from('profiles').update({ credits_used: profile.credits_used + 1 }).eq('id', user.id)

    return NextResponse.json({ result })
  } catch (err) {
    console.error('Strategy agent error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
