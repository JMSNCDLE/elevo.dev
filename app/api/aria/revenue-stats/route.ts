import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET() {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured', mrr: { amount_eur: 'N/A' }, subscriptions: { active: 0, trialing: 0, recently_canceled: 0, plan_breakdown: {} }, revenue_7d: { amount_eur: 'N/A', charges: 0 } })
  }

  const stripe = new Stripe(stripeKey)

  try {
    const [subscriptions, trials, canceled] = await Promise.all([
      stripe.subscriptions.list({ status: 'active', limit: 100 }),
      stripe.subscriptions.list({ status: 'trialing', limit: 100 }),
      stripe.subscriptions.list({ status: 'canceled', limit: 10 }),
    ])

    let mrr = 0
    const planCounts: Record<string, number> = {}

    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        const amount = item.price.unit_amount || 0
        const interval = item.price.recurring?.interval
        mrr += interval === 'year' ? Math.round(amount / 12) : amount
        const planName = item.price.nickname || item.price.id
        planCounts[planName] = (planCounts[planName] || 0) + 1
      }
    }

    const weekAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000)
    const recentCharges = await stripe.charges.list({ created: { gte: weekAgo }, limit: 20 })
    const totalRevenue7d = recentCharges.data.filter(c => c.paid && !c.refunded).reduce((sum, c) => sum + c.amount, 0)

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      mrr: { amount_cents: mrr, amount_eur: `€${(mrr / 100).toFixed(2)}`, currency: 'eur' },
      subscriptions: { active: subscriptions.data.length, trialing: trials.data.length, recently_canceled: canceled.data.length, plan_breakdown: planCounts },
      revenue_7d: { amount_cents: totalRevenue7d, amount_eur: `€${(totalRevenue7d / 100).toFixed(2)}`, charges: recentCharges.data.length },
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
