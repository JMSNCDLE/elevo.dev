import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { runCEOSession } from '@/lib/agents/ceoAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const CREDIT_COST = 10

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  question: z.string().min(10),
  context: z.string().default(''),
  decisionType: z.enum(['pricing', 'hiring', 'pivot', 'fundraising', 'partnership', 'market_entry', 'cost_cutting', 'exit_strategy']),
  locale: z.string().default('en'),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_used, credits_limit')
    .eq('id', user.id)
    .single()

  if (!profile || profile.plan !== 'galaxy') {
    return NextResponse.json({ error: 'Galaxy plan required' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  if (profile.credits_used + CREDIT_COST > profile.credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  const { data: bp } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', parsed.data.businessProfileId)
    .eq('user_id', user.id)
    .single()

  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  try {
    const result = await runCEOSession(
      bp as BusinessProfile,
      parsed.data.question,
      parsed.data.context,
      parsed.data.decisionType,
      parsed.data.locale
    )

    // Deduct credits after success
    await supabase
      .from('profiles')
      .update({ credits_used: profile.credits_used + CREDIT_COST })
      .eq('id', user.id)

    // Save session
    await supabase.from('ceo_sessions').insert({
      user_id: user.id,
      business_profile_id: parsed.data.businessProfileId,
      decision_type: parsed.data.decisionType,
      question: parsed.data.question,
      response: result,
      credits_used: CREDIT_COST,
    })

    return NextResponse.json({ result })
  } catch (err) {
    console.error('CEO session error:', err)
    return NextResponse.json({ error: 'Agent failed. Please try again.' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data } = await supabase
    .from('ceo_sessions')
    .select('id, decision_type, question, credits_used, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ sessions: data ?? [] })
}
