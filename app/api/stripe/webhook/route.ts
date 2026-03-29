import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail, sendSequenceEmail } from '@/lib/email/send'
import { calculateCommission } from '@/lib/affiliate'
import { sendWhatsAppToJames, JAMES_ALERTS } from '@/lib/notifications/whatsapp'
import { notifyNewSubscription, notifyChurn } from '@/lib/notifications/notify-owner'

let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'placeholder', { apiVersion: '2025-02-24.acacia' })
  return _stripe
}

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
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.supabase_user_id
    const planId = session.metadata?.plan_id
    const affiliateCode = session.metadata?.affiliate_code

    if (userId && planId && PLAN_CREDITS[planId]) {
      // Store billing anchor day
      const anchorDay = new Date().getDate()
      await supabase.from('profiles').update({
        plan: planId,
        credits_limit: PLAN_CREDITS[planId].credits_limit,
        credits_used: 0,
        stripe_subscription_id: session.subscription as string,
        billing_anchor_day: anchorDay,
      }).eq('id', userId)

      // WhatsApp notification to James
      const { data: { user: buyerUser } } = await supabase.auth.admin.getUserById(userId)
      const buyerEmail = buyerUser?.email ?? 'unknown'
      const amountTotal = session.amount_total ? `£${(session.amount_total / 100).toFixed(2)}` : '£0'
      sendWhatsAppToJames(JAMES_ALERTS.newSale(planId, amountTotal, buyerEmail)).catch(console.error)
      notifyNewSubscription(buyerEmail, planId, amountTotal).catch(console.error)

      // Mark discount code as used if one was applied
      const discountDbId = session.metadata?.discount_db_id
      if (discountDbId && discountDbId.length > 0) {
        await supabase
          .from('discount_codes')
          .update({ used: true, used_at: new Date().toISOString(), used_by_user_id: userId })
          .eq('id', discountDbId)
      }

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
    const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : (invoice.subscription as Stripe.Subscription | null)?.id
    if (subscriptionId) {
      const stripe = getStripe()
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : (subscription.customer as Stripe.Customer).id

      // Get user from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, billing_anchor_day')
        .eq('stripe_customer_id', customerId)
        .single()

      if (profile) {
        // Get business profile for name
        const { data: biz } = await supabase
          .from('business_profiles')
          .select('business_name')
          .eq('user_id', profile.id)
          .single()

        // Generate invoice number: ELEVO-YYYY-NNNN
        const { data: existingInvoices } = await supabase
          .from('invoices')
          .select('id')
          .eq('user_id', profile.id)
        const seq = ((existingInvoices?.length ?? 0) + 1).toString().padStart(4, '0')
        const invoiceNumber = `ELEVO-${new Date().getFullYear()}-${seq}`

        // Calculate billing dates
        const periodStart = new Date((subscription.current_period_start) * 1000)
        const periodEnd = new Date((subscription.current_period_end) * 1000)
        const anchorDay = profile.billing_anchor_day ?? periodStart.getDate()

        const nextMonth = new Date(periodEnd)
        nextMonth.setDate(anchorDay)
        const nextBillingDate = nextMonth.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

        const plan = (subscription.metadata?.plan as string) ?? 'orbit'
        const amountPaid = (invoice.amount_paid ?? 0) / 100
        const currency = invoice.currency ?? 'gbp'

        // Save to invoices table
        await supabase.from('invoices').insert({
          user_id: profile.id,
          stripe_payment_intent_id: typeof invoice.payment_intent === 'string' ? invoice.payment_intent : undefined,
          stripe_invoice_id: invoice.id,
          invoice_number: invoiceNumber,
          amount: amountPaid,
          currency,
          plan,
          billing_period_start: periodStart.toISOString().split('T')[0],
          billing_period_end: periodEnd.toISOString().split('T')[0],
          status: 'paid',
        })

        // Send invoice email
        const firstName = ((profile.full_name as string | null) ?? 'there').split(' ')[0]
        const { generateInvoiceEmail } = await import('@/lib/email/invoice-template')
        const { sendEmail } = await import('@/lib/email/send')
        const html = generateInvoiceEmail({
          firstName,
          businessName: biz?.business_name,
          invoiceNumber,
          plan,
          amount: amountPaid,
          currency,
          billingPeriodStart: periodStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
          billingPeriodEnd: periodEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
          nextBillingDate,
          nextBillingAmount: amountPaid.toString(),
          paymentMethod: 'Card on file',
          locale: 'en',
        })

        // Get user email
        const { data: { user: stripeUser } } = await supabase.auth.admin.getUserById(profile.id)
        if (stripeUser?.email) {
          await sendEmail({
            to: stripeUser.email,
            subject: `Payment confirmed — ${invoiceNumber} — ELEVO AI™`,
            html,
            agentName: 'Invoice',
            userId: profile.id,
          })
        }
      }

      // Also send onboarding email for first invoice
      const isFirstInvoice = invoice.billing_reason === 'subscription_create'
      if (isFirstInvoice) {
        const { data: profileForEmail } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profileForEmail?.email) {
          const firstName = (profileForEmail.full_name as string | null)?.split(' ')[0] ?? 'there'
          const { data: bp } = await supabase
            .from('business_profiles')
            .select('business_name')
            .eq('user_id', profileForEmail.id)
            .single()

          await sendSequenceEmail('onboardingBot', profileForEmail.email, {
            first_name: firstName,
            business_name: bp?.business_name ?? 'your business',
            dashboard_url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev',
          })
        }
      }

      // Resolve any active dunning for this user
      if (profile) {
        await supabase
          .from('dunning_events')
          .update({ status: 'resolved', resolved_at: new Date().toISOString() })
          .eq('user_id', profile.id)
          .eq('status', 'active')

        // Restore subscription status
        await supabase.from('profiles').update({ subscription_status: 'active' }).eq('id', profile.id)
      }
    }
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : (invoice.subscription as Stripe.Subscription | null)?.id
    if (subscriptionId) {
      const stripe = getStripe()
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : (subscription.customer as Stripe.Customer).id
      const { data: failedProfile } = await supabase.from('profiles').select('id').eq('stripe_customer_id', customerId).single()
      if (failedProfile) {
        const { data: { user: failedUser } } = await supabase.auth.admin.getUserById(failedProfile.id)
        const failedEmail = failedUser?.email ?? 'unknown'
        const failedCurrency = invoice.currency === 'gbp' ? '£' : invoice.currency === 'eur' ? '€' : '$'
        const failedAmount = invoice.amount_due ? `${failedCurrency}${(invoice.amount_due / 100).toFixed(2)}` : `${failedCurrency}0`
        sendWhatsAppToJames(JAMES_ALERTS.paymentFailed(failedEmail, failedAmount)).catch(console.error)

        // Create dunning event
        await supabase.from('dunning_events').insert({
          user_id: failedProfile.id,
          stripe_invoice_id: invoice.id,
          amount_due: invoice.amount_due ?? 0,
          currency: invoice.currency ?? 'eur',
          step: 1,
          status: 'active',
          last_email_sent_at: new Date().toISOString(),
          failed_at: new Date().toISOString(),
        })

        // Update profile status
        await supabase.from('profiles').update({ subscription_status: 'past_due' }).eq('id', failedProfile.id)

        // Send dunning email (Day 0)
        if (failedEmail !== 'unknown') {
          const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev'}/en/billing`
          sendEmail({
            to: failedEmail,
            subject: "Your payment didn't go through — let's fix it",
            body: `Hey there,

We tried to process your ELEVO AI payment of ${failedAmount}, but it didn't go through. This can happen for lots of reasons — expired card, insufficient funds, or a bank hold.

No worries — your AI agents are still running for now. Just update your payment method and everything will continue as normal.

[Update payment method →] ${portalUrl}

If you need help, just reply to this email. We're here for you.

The ELEVO AI Team`,
            agentName: 'Dunning System',
          }).catch(console.error)
        }
      }
    }
  }

  if (event.type === 'customer.subscription.created') {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string
    const { data: newSubProfile } = await supabase.from('profiles').select('id').eq('stripe_customer_id', customerId).single()
    if (newSubProfile) {
      const { data: { user: newUser } } = await supabase.auth.admin.getUserById(newSubProfile.id)
      const newEmail = newUser?.email ?? 'unknown'
      sendWhatsAppToJames(JAMES_ALERTS.newUser(newEmail, 'UK')).catch(console.error)
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

    const { data: profile } = await supabase.from('profiles').select('id, email, plan').eq('stripe_customer_id', customerId).single()
    if (profile) {
      await supabase.from('profiles').update({ plan: 'trial', credits_limit: 20, credits_used: 0, stripe_subscription_id: null }).eq('id', profile.id)
      notifyChurn(profile.email ?? customerId, profile.plan ?? 'unknown').catch(console.error)
    }
  }

  return NextResponse.json({ received: true })
}
