import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { analyseAndImproveSite } from '@/lib/agents/stitchDesignAgent'

const CREDIT_COST = 3

const Schema = z.object({
  siteUrl: z.string().url(),
  improvementGoal: z.string().min(5),
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

  if (!profile || (profile.plan !== 'orbit' && profile.plan !== 'galaxy')) {
    return NextResponse.json({ error: 'Orbit plan required' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  if (profile.credits_used + CREDIT_COST > profile.credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  try {
    const result = await analyseAndImproveSite(
      parsed.data.siteUrl,
      parsed.data.improvementGoal,
      parsed.data.locale
    )

    await supabase
      .from('profiles')
      .update({ credits_used: profile.credits_used + CREDIT_COST })
      .eq('id', user.id)

    return NextResponse.json({ result })
  } catch (err) {
    console.error('Stitch analyse error:', err)
    return NextResponse.json({ error: 'Agent failed. Please try again.' }, { status: 500 })
  }
}
