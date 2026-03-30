import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { prepareInvestorPitch } from '@/lib/agents/ceoAgent'
import { ADMIN_IDS } from '@/lib/admin'
import type { BusinessProfile } from '@/lib/agents/types'

const CREDIT_COST = 10

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  stage: z.enum(['pre-seed', 'seed', 'series-a', 'series-b']),
  askAmount: z.string().min(1),
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

  if (!ADMIN_IDS.includes(user.id) && (!profile || profile.plan !== 'galaxy')) {
    return NextResponse.json({ error: 'Galaxy plan required' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  if (!ADMIN_IDS.includes(user!.id) && profile && (profile ?? { credits_used: 0 }).credits_used + CREDIT_COST > (profile ?? { credits_limit: 9999 }).credits_limit) {
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
    const result = await prepareInvestorPitch(
      bp as BusinessProfile,
      parsed.data.stage,
      parsed.data.askAmount,
      parsed.data.locale
    )

    await supabase
      .from('profiles')
      .update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + CREDIT_COST })
      .eq('id', user.id)

    return NextResponse.json({ result })
  } catch (err) {
    console.error('CEO investor error:', err)
    return NextResponse.json({ error: 'Agent failed. Please try again.' }, { status: 500 })
  }
}
