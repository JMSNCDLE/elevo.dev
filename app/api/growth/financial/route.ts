import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { runFinancialAgent } from '@/lib/agents/financialAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  financialConcern: z.string().min(5),
  monthlyRevenue: z.number().optional(),
  monthlyExpenses: z.number().optional(),
  topExpenses: z.string().optional(),
  goal: z.string().optional(),
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
    const result = await runFinancialAgent(bp as BusinessProfile, {
      financialConcern: parsed.data.financialConcern,
      monthlyRevenue: parsed.data.monthlyRevenue,
      monthlyExpenses: parsed.data.monthlyExpenses,
      topExpenses: parsed.data.topExpenses,
      goal: parsed.data.goal,
    })

    await supabase.from('growth_reports').insert({ user_id: user.id, business_profile_id: bp.id, type: 'financial_health', title: `Financial Health — ${new Date().toLocaleDateString('en-GB')}`, content: result })
    await supabase.from('profiles').update({ credits_used: profile.credits_used + 1 }).eq('id', user.id)

    return NextResponse.json({ result })
  } catch (err) {
    console.error('Financial agent error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
