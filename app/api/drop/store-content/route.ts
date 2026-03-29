import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { buildShopifyContent } from '@/lib/agents/dropshippingAgent'
import type { WinningProduct } from '@/lib/agents/dropshippingAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const Schema = z.object({
  productData: z.record(z.unknown()),
  businessProfileId: z.string().uuid(),
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
  if (profile.plan !== 'galaxy') return NextResponse.json({ error: 'Galaxy plan required' }, { status: 403 })

  const CREDIT_COST = 1
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
    const content = await buildShopifyContent(
      parsed.data.productData as Partial<WinningProduct>,
      bp as BusinessProfile,
      parsed.data.locale
    )

    await supabase
      .from('profiles')
      .update({ credits_used: profile.credits_used + CREDIT_COST })
      .eq('id', user.id)

    return NextResponse.json({ content })
  } catch (err) {
    console.error('[drop/store-content]', err)
    return NextResponse.json({ error: 'Content generation failed' }, { status: 500 })
  }
}
