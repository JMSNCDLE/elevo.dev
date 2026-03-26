import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/send'

// Runs daily at 7 AM UTC (8 AM CET)
// Processes dunning events: Day 3 email, Day 7 email, Day 10 downgrade

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')
  const validSecret = process.env.CRON_SECRET
  if (validSecret && cronSecret !== validSecret && authHeader !== `Bearer ${validSecret}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev'}/en/billing`

  const { data: events } = await sb
    .from('dunning_events')
    .select('*, profiles:user_id(id, full_name, email, plan)')
    .eq('status', 'active')

  let processed = 0

  for (const event of events ?? []) {
    const profile = event.profiles as unknown as { id: string; full_name: string | null; email: string | null; plan: string } | null
    if (!profile?.email) continue

    const daysSince = Math.floor((Date.now() - new Date(event.failed_at).getTime()) / 86400000)
    const firstName = (profile.full_name ?? 'there').split(' ')[0]
    const amount = `€${(event.amount_due / 100).toFixed(2)}`

    // Day 3: Reminder email
    if (daysSince >= 3 && event.step < 2) {
      await sendEmail({
        to: profile.email,
        subject: `Just a reminder — your ELEVO payment is still pending`,
        body: `Hey ${firstName},

We noticed your payment of ${amount} still hasn't gone through. Your AI agents are still working, but we'll need to pause them soon if we can't process the payment.

It usually takes less than a minute to update:

[Update payment method →] ${portalUrl}

If something's wrong or you need help, just reply to this email.

The ELEVO AI Team`,
        agentName: 'Dunning System',
      })

      await sb.from('dunning_events').update({ step: 2, last_email_sent_at: new Date().toISOString() }).eq('id', event.id)
      processed++
    }

    // Day 7: Final warning
    if (daysSince >= 7 && event.step < 3) {
      await sendEmail({
        to: profile.email,
        subject: `Action needed — your account will be downgraded in 3 days`,
        body: `Hey ${firstName},

This is your final reminder. Your payment of ${amount} has been pending for ${daysSince} days.

If we don't receive payment by ${new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}, your account will be downgraded and your AI agents will be paused.

[Fix this now →] ${portalUrl}

We really don't want to lose you. If there's anything we can do, just reply.

The ELEVO AI Team`,
        agentName: 'Dunning System',
      })

      await sb.from('dunning_events').update({ step: 3, last_email_sent_at: new Date().toISOString() }).eq('id', event.id)
      processed++
    }

    // Day 10: Auto-downgrade
    if (daysSince >= 10 && event.step < 4) {
      await sb.from('profiles').update({
        plan: 'trial',
        credits_limit: 20,
        subscription_status: 'canceled',
      }).eq('id', profile.id)

      await sb.from('dunning_events').update({
        step: 4,
        status: 'downgraded',
        resolved_at: new Date().toISOString(),
      }).eq('id', event.id)

      await sendEmail({
        to: profile.email,
        subject: `Your ELEVO account has been downgraded`,
        body: `Hey ${firstName},

Your payment of ${amount} was not resolved after 10 days, so your account has been downgraded to the free tier.

Your data is safe — nothing has been deleted. You can reactivate your plan at any time:

[Reactivate now →] ${portalUrl}

We hope to see you back soon.

The ELEVO AI Team`,
        agentName: 'Dunning System',
      })

      processed++
    }
  }

  return NextResponse.json({ ok: true, processed, total: events?.length ?? 0 })
}
