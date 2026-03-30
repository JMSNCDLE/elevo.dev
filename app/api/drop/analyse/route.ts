import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { analyseProduct } from '@/lib/agents/dropshippingAgent'
import { ADMIN_IDS } from '@/lib/admin'

const Schema = z.object({
  productUrl: z.string().url(),
  businessContext: z.string().min(2),
  locale: z.string().default('en'),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_used, credits_limit')
    .eq('id', user.id)
    .single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (!ADMIN_IDS.includes(user.id) && profile.plan !== 'galaxy') return NextResponse.json({ error: 'Galaxy plan required' }, { status: 403 })

  const CREDIT_COST = 2
  if (!ADMIN_IDS.includes(user!.id) && profile && (profile ?? { credits_used: 0 }).credits_used + CREDIT_COST > (profile ?? { credits_limit: 9999 }).credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  try {
    const product = await analyseProduct(parsed.data.productUrl, parsed.data.businessContext, parsed.data.locale)

    await supabase
      .from('profiles')
      .update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + CREDIT_COST })
      .eq('id', user.id)

    return NextResponse.json({ product })
  } catch (err) {
    console.error('[drop/analyse]', err)
    return NextResponse.json({ error: 'Product analysis failed' }, { status: 500 })
  }
}
