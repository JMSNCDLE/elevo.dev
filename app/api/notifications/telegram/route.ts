import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramNotification } from '@/lib/notifications/telegram'

interface NotifyBody {
  event:
    | 'new_signup'
    | 'new_subscription'
    | 'trial_ending'
    | 'payment_failed'
    | 'agent_error'
    | 'daily_summary'
    | 'health_check'
    | 'competitor_alert'
    | 'custom'
  message?: string
  data?: Record<string, unknown>
}

function format(event: NotifyBody['event'], message: string | undefined, data: Record<string, unknown> | undefined): string {
  const d = data ?? {}
  switch (event) {
    case 'new_signup':
      return `🎉 <b>New Signup!</b>\n\nUser: ${d.email ?? 'Unknown'}\nPlan: ${d.plan ?? 'Free trial'}\nSource: ${d.source ?? 'Direct'}`
    case 'new_subscription':
      return `💰 <b>New Subscription!</b>\n\nPlan: ${d.plan ?? 'Unknown'}\nAmount: €${d.amount ?? '0'}/mo\nCustomer: ${d.email ?? 'Unknown'}`
    case 'trial_ending':
      return `⏰ <b>Trial Ending Soon</b>\n\nUser: ${d.email ?? 'Unknown'}\nExpires: ${d.expiresAt ?? 'Unknown'}\nUsage: ${d.creditsUsed ?? 0} credits used`
    case 'payment_failed':
      return `⚠️ <b>Payment Failed</b>\n\nCustomer: ${d.email ?? 'Unknown'}\nAmount: €${d.amount ?? '0'}\nCheck Stripe dashboard.`
    case 'agent_error':
      return `🚨 <b>Agent Error</b>\n\nAgent: ${d.agentName ?? 'Unknown'}\nError: ${d.error ?? 'Unknown error'}\nUser: ${d.email ?? 'System'}`
    case 'daily_summary':
      return `📊 <b>ELEVO Daily Summary</b>\n\nNew signups: ${d.newSignups ?? 0}\nActive users: ${d.activeUsers ?? 0}\nRevenue: €${d.revenue ?? '0'}\nAgent calls: ${d.agentCalls ?? 0}\nErrors: ${d.errors ?? 0}`
    case 'health_check':
      return `${d.healthy ? '✅' : '🔴'} <b>Health Check</b>\n\nStatus: ${d.healthy ? 'All systems operational' : 'ISSUES DETECTED'}\nPages checked: ${d.pagesChecked ?? 0}\nFailed: ${d.failedPages ?? 0}\nResponse time: ${d.avgResponseMs ?? 0}ms`
    case 'competitor_alert':
      return `🕵️ <b>Competitor Alert</b>\n\n${d.competitor ?? 'Unknown'} just: ${d.action ?? 'did something'}\n\nELEVO Spy™ has flagged this for review.`
    case 'custom':
    default:
      return message || `📢 <b>ELEVO Notification</b>\n\n${JSON.stringify(d)}`
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as NotifyBody
    if (!body || typeof body !== 'object' || !body.event) {
      return NextResponse.json({ success: false, error: 'event required' }, { status: 400 })
    }
    const text = format(body.event, body.message, body.data)
    const success = await sendTelegramNotification({ text })
    return NextResponse.json({ success })
  } catch (err) {
    console.error('[notifications/telegram] error:', err)
    return NextResponse.json({ success: false, error: 'Failed to send' }, { status: 500 })
  }
}
