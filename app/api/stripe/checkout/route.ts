import { NextResponse } from 'next/server'
import { z } from 'zod'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase/server'
import { getPriceId } from '@/lib/stripe/pricing'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const Schema = z.object({
  planId: z.enum(['launch', 'orbit', 'galaxy']),
  currency: z.enum(['gbp', 'usd', 'eur']).default('gbp'),
  annual: z.boolean().default(false),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { planId, currency, annual } = parsed.data
  const priceId = getPriceId(planId, currency, annual)

  if (!priceId) return NextResponse.json({ error: 'Invalid plan or price ID not configured' }, { status: 400 })

  // Get or create Stripe customer
  const { data: profile } = await supabase.from('profiles').select('stripe_customer_id, email').eq('id', user.id).single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? profile?.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/en/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/en/pricing`,
    metadata: { supabase_user_id: user.id, plan_id: planId },
  })

  return NextResponse.json({ url: session.url })
}
