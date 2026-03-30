import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { findWinningProducts } from '@/lib/agents/dropshippingAgent'
import { ADMIN_IDS } from '@/lib/admin'
import type { ProductResearch } from '@/lib/agents/dropshippingAgent'

const Schema = z.object({
  niche: z.string().min(2),
  targetMarket: z.string().min(2),
  budget: z.string().min(1),
  count: z.number().int().min(1).max(10).default(5),
  locale: z.string().default('en'),
  existingStore: z.string().optional(),
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

  const CREDIT_COST = 5
  if (!ADMIN_IDS.includes(user!.id) && profile && (profile ?? { credits_used: 0 }).credits_used + CREDIT_COST > (profile ?? { credits_limit: 9999 }).credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  try {
    const research: ProductResearch = {
      niche: parsed.data.niche,
      targetMarket: parsed.data.targetMarket,
      budget: parsed.data.budget,
      existingStore: parsed.data.existingStore,
      locale: parsed.data.locale,
    }

    const products = await findWinningProducts(research, parsed.data.count, parsed.data.locale)

    await supabase
      .from('profiles')
      .update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + CREDIT_COST })
      .eq('id', user.id)

    return NextResponse.json({ products })
  } catch (err) {
    console.error('[drop/find]', err)
    return NextResponse.json({ error: 'Product research failed' }, { status: 500 })
  }
}
