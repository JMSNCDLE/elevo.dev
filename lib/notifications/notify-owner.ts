import { sendTelegramToJames } from './telegram'
import { sendEmail } from '../email/send'
import { createClient } from '@supabase/supabase-js'

const JAMES_EMAIL = 'jamescn.2504@gmail.com'

type NotificationType = 'signup' | 'subscription' | 'churn' | 'alert' | 'daily_summary' | 'weekly_insight' | 'agent_insight'
type Channel = 'telegram' | 'email' | 'both'

interface NotifyParams {
  type: NotificationType
  title: string
  message: string
  channel?: Channel
  metadata?: Record<string, unknown>
}

async function logNotification(params: NotifyParams & { status: string }) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return
    const sb = createClient(url, key)
    await sb.from('owner_notifications').insert({
      type: params.type,
      title: params.title,
      message: params.message,
      channel: params.channel ?? 'both',
      status: params.status,
      metadata: params.metadata ?? {},
    })
  } catch {
    // Don't fail notification sends if logging fails
  }
}

export async function notifyOwner(params: NotifyParams): Promise<boolean> {
  const channel = params.channel ?? 'both'
  let telegramOk = true
  let emailOk = true

  // Telegram
  if (channel === 'telegram' || channel === 'both') {
    telegramOk = await sendTelegramToJames(`<b>${params.title}</b>\n\n${params.message}`)
  }

  // Email
  if (channel === 'email' || channel === 'both') {
    const result = await sendEmail({
      to: JAMES_EMAIL,
      subject: `ELEVO PA™ — ${params.title}`,
      body: params.message,
      agentName: 'Aria (PA)',
    })
    emailOk = result.success
  }

  const status = telegramOk && emailOk ? 'sent' : 'failed'
  await logNotification({ ...params, status })

  return telegramOk || emailOk
}

// ─── Pre-built notification templates ────────────────────────────────────────

export async function notifyNewSignup(email: string, plan: string) {
  return notifyOwner({
    type: 'signup',
    title: 'New Signup',
    message: `${email} just signed up for the ${plan} plan.`,
    channel: 'both',
    metadata: { email, plan },
  })
}

export async function notifyNewSubscription(email: string, plan: string, amount: string) {
  return notifyOwner({
    type: 'subscription',
    title: 'New Paid Customer!',
    message: `${email} upgraded to ${plan} (${amount}/mo). Revenue is growing!`,
    channel: 'both',
    metadata: { email, plan, amount },
  })
}

export async function notifyChurn(email: string, plan: string) {
  return notifyOwner({
    type: 'churn',
    title: 'Subscription Cancelled',
    message: `${email} cancelled their ${plan} subscription. Consider reaching out.`,
    channel: 'both',
    metadata: { email, plan },
  })
}

export async function notifyCriticalAlert(title: string, detail: string) {
  return notifyOwner({
    type: 'alert',
    title: `Alert: ${title}`,
    message: detail,
    channel: 'both',
    metadata: { severity: 'critical' },
  })
}

export async function notifyAgentInsight(agentName: string, insight: string) {
  return notifyOwner({
    type: 'agent_insight',
    title: `Insight from ${agentName}`,
    message: insight,
    channel: 'email', // insights go email-only to avoid WhatsApp noise
    metadata: { agentName },
  })
}

export async function notifyDailySummary(summary: {
  totalUsers: number
  newSignups: number
  revenue: number
  paidUsers: number
  creditsUsed: number
  topAgent: string
  issues: number
}) {
  const message = `Today's numbers:
- Total users: ${summary.totalUsers}
- New signups: ${summary.newSignups}
- Revenue (MRR): €${summary.revenue}
- Paid customers: ${summary.paidUsers}
- Credits used today: ${summary.creditsUsed}
- Most used agent: ${summary.topAgent}
- Issues detected: ${summary.issues}

Have a productive day!`

  return notifyOwner({
    type: 'daily_summary',
    title: `Daily Briefing — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
    message,
    channel: 'both',
    metadata: summary,
  })
}
