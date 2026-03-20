import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { runFinancialIntelligence } from '@/lib/agents/financeAgent'
import { parseRawData } from '@/lib/agents/dataIngestionAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  rawData: z.string().min(1),
  dataType: z.enum(['pl', 'cashflow', 'invoices', 'bank_statement', 'mixed']),
  period: z.string().min(1),
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
    const cleanedData = await parseRawData(parsed.data.rawData, 'financial')

    const data = {
      rawData: parsed.data.rawData,
      cleanedData,
      dataType: parsed.data.dataType,
      period: parsed.data.period,
      currency: parsed.data.currency,
      businessProfile: bp as BusinessProfile,
    }

    const result = await runFinancialIntelligence(data, parsed.data.locale)

    await supabase.from('growth_reports').insert({
      user_id: user.id,
      business_profile_id: bp.id,
      type: 'financial',
      title: `Financial Report - ${parsed.data.period}`,
      content: result,
    })
    await supabase.from('profiles').update({ credits_used: profile.credits_used + 3 }).eq('id', user.id)

    return NextResponse.json({ result })
  } catch (err) {
    console.error('Finance agent error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
