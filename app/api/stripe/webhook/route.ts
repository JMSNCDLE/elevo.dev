import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { sendSequenceEmail } from '@/lib/email/send'
import { calculateCommission } from '@/lib/affiliate'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const PLAN_CREDITS: Record<string, { credits_limit: number }> = {
  launch: { credits_limit: 100 },
  orbit: { credits_limit: 300 },
  galaxy: { credits_limit: 999 },
}

const PLAN_PRICES_GBP: Record<string, number> = {
  launch: 39,
  orbit: 79,
  galaxy: 149,
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
    const affiliateCode = session.metadata?.affiliate_code

    if (userId && planId && PLAN_CREDITS[planId]) {
      await supabase.from('profiles').update({
        plan: planId,
        credits_limit: PLAN_CREDITS[planId].credits_limit,
        credits_used: 0,
        stripe_subscription_id: session.subscription as string,
      }).eq('id', userId)

      // Handle affiliate referral commission
      if (affiliateCode && affiliateCode.length > 0) {
        const { data: affiliate } = await supabase
          .from('affiliates')
          .select('id, tier, pending_commission, total_referrals')
          .eq('code', affiliateCode)
          .single()

        if (affiliate) {
          const planPrice = PLAN_PRICES_GBP[planId] ?? 0
          const tierLevel = (affiliate.tier as 1 | 2 | 3) ?? 1
          const commission = calculateCommission(planPrice, tierLevel)

          // Create referral record
          await supabase.from('affiliate_referrals').insert({
            affiliate_id: affiliate.id,
            referred_user_id: userId,
            plan: planId,
            plan_price: planPrice,
            commission,
            status: 'pending',
            stripe_session_id: session.id,
          })

          // Update affiliate totals
          await supabase.from('affiliates').update({
            pending_commission: (affiliate.pending_commission ?? 0) + commission,
            total_referrals: (affiliate.total_referrals ?? 0) + 1,
          }).eq('id', affiliate.id)
        }
      }
    }
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = invoice.customer as string

    // Check if this is a new subscriber (first invoice)
    const isFirstInvoice = invoice.billing_reason === 'subscription_create'

    if (isFirstInvoice && customerId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('stripe_customer_id', customerId)
        .single()

      if (profile?.email) {
        const firstName = profile.full_name?.split(' ')[0] ?? 'there'

        // Get business profile for the name
        const { data: bp } = await supabase
          .from('business_profiles')
          .select('name')
          .eq('user_id', profile.id)
          .single()

        await sendSequenceEmail('onboardingBot', profile.email, {
          first_name: firstName,
          business_name: bp?.name ?? 'your business',
          dashboard_url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.ai',
        })
      }
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
