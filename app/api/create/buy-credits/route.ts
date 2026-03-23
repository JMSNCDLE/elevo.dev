import { NextResponse } from 'next/server'
import { z } from 'zod'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase/server'

let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'placeholder', { apiVersion: '2025-02-24.acacia' })
  return _stripe
}

const Schema = z.object({
  packSize: z.union([z.literal(100), z.literal(500)]),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { packSize } = parsed.data

  const priceId =
    packSize === 100
      ? process.env.STRIPE_CREATE_PACK_100_ID
      : process.env.STRIPE_CREATE_PACK_500_ID

  if (!priceId) {
    return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email ?? profile?.email ?? '',
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/en/create?credits_added=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/en/create`,
    metadata: {
      userId: user.id,
      packSize: String(packSize),
      type: 'creative_credits',
    },
  })

  return NextResponse.json({ url: session.url })
}
