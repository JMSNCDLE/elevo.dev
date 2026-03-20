import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const PLAN_CREDITS: Record<string, { credits_limit: number }> = {
  launch: { credits_limit: 100 },
  orbit: { credits_limit: 300 },
  galaxy: { credits_limit: 999 },
}

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession
    const userId = session.metadata?.supabase_user_id
    const planId = session.metadata?.plan_id

    if (userId && planId && PLAN_CREDITS[planId]) {
      await supabase.from('profiles').update({
        plan: planId,
        credits_limit: PLAN_CREDITS[planId].credits_limit,
        credits_used: 0,
        stripe_subscription_id: session.subscription as string,
      }).eq('id', userId)
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string
    const priceId = sub.items.data[0]?.price.id

    const { data: profile } = await supabase.from('profiles').select('id').eq('stripe_customer_id', customerId).single()
    if (!profile) return NextResponse.json({ received: true })

    // Find matching plan
    const planId = Object.keys(PLAN_CREDITS).find(p => {
      // Check if this price ID matches any configured price
      return process.env[`STRIPE_${p.toUpperCase()}_GBP_ID`] === priceId ||
             process.env[`STRIPE_${p.toUpperCase()}_USD_ID`] === priceId ||
             process.env[`STRIPE_${p.toUpperCase()}_EUR_ID`] === priceId
    })

    if (planId) {
      await supabase.from('profiles').update({
        plan: planId,
        credits_limit: PLAN_CREDITS[planId].credits_limit,
        stripe_subscription_id: sub.id,
      }).eq('id', profile.id)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string

    const { data: profile } = await supabase.from('profiles').select('id').eq('stripe_customer_id', customerId).single()
    if (profile) {
      await supabase.from('profiles').update({ plan: 'trial', credits_limit: 20, credits_used: 0, stripe_subscription_id: null }).eq('id', profile.id)
    }
  }

  return NextResponse.json({ received: true })
}
