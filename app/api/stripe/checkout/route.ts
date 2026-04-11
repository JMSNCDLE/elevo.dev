import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import Stripe from 'stripe'
import { createServerClient, createServiceClient } from '@/lib/supabase/server'
import { getPriceId } from '@/lib/stripe/pricing'
import { getAffiliateRef } from '@/lib/cookies'

let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'placeholder', { apiVersion: '2025-02-24.acacia' })
  return _stripe
}

const Schema = z.object({
  planId: z.enum(['launch', 'orbit', 'galaxy']),
  currency: z.enum(['gbp', 'usd', 'eur']).default('gbp'),
  annual: z.boolean().default(false),
  discountCode: z.string().optional(),
})

export async function POST(request: NextRequest) {
  // Sanity check: STRIPE_SECRET_KEY must be set or we can't create sessions at all
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[stripe/checkout] STRIPE_SECRET_KEY env var is missing')
    return NextResponse.json(
      { error: 'Stripe is not configured on the server. Please contact support.', code: 'no_stripe_key' },
      { status: 500 }
    )
  }

  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'You need to sign in before subscribing.', code: 'unauthorized' },
        { status: 401 }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { planId, currency, annual, discountCode } = parsed.data
    const priceId = getPriceId(planId, currency, annual)
    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID for plan "${planId}" (${currency}) is not configured` },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, subscription_status')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email ?? profile?.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    // Read affiliate code from cookie
    const affiliateCode = getAffiliateRef(request)

    // Validate and apply discount code if provided
    let discounts: { coupon: string }[] = []
    let discountDbId: string | null = null

    if (discountCode) {
      const serviceSupabase = await createServiceClient()
      const { data: dc } = await serviceSupabase
        .from('discount_codes')
        .select('id, discount_percent, used, expires_at')
        .eq('code', discountCode.toUpperCase())
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (dc) {
        const coupon = await getStripe().coupons.create({
          percent_off: dc.discount_percent,
          duration: 'once',
          metadata: { elevo_code: discountCode, discount_id: dc.id },
        })
        discounts = [{ coupon: coupon.id }]
        discountDbId = dc.id
      }
    }

    // Detect existing subscriber: if they already have an active subscription,
    // skip the trial and force immediate billing for upgrades
    const isUpgrade =
      profile?.stripe_customer_id != null &&
      (profile as { subscription_status?: string })?.subscription_status === 'active'

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev'

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      payment_method_collection: 'always',
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: discounts.length === 0,
      subscription_data: isUpgrade
        ? {
            metadata: {
              supabase_user_id: user.id,
              plan_id: planId,
            },
          }
        : {
            trial_period_days: 7,
            metadata: {
              supabase_user_id: user.id,
              plan_id: planId,
            },
          },
      success_url: `${baseUrl}/en/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/en/pricing?checkout=cancelled`,
      metadata: {
        supabase_user_id: user.id,
        plan_id: planId,
        affiliate_code: affiliateCode ?? '',
        discount_db_id: discountDbId ?? '',
      },
    }

    if (discounts.length > 0) {
      sessionParams.discounts = discounts
    }

    const session = await getStripe().checkout.sessions.create(sessionParams)

    if (!session.url) {
      console.error('[stripe/checkout] session created but no URL returned', session.id)
      return NextResponse.json(
        { error: 'Stripe did not return a checkout URL. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    // CRITICAL: catch every Stripe / runtime error and return JSON.
    // Without this, an unhandled throw becomes an HTML 500 page and the
    // client's r.json() crashes with "Unexpected token <" → "Connection error".
    const message =
      err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string'
        ? (err as { message: string }).message
        : 'Unknown error creating checkout session'
    console.error('[stripe/checkout] error:', err)
    return NextResponse.json(
      { error: message, code: 'stripe_error' },
      { status: 500 }
    )
  }
}
