import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/send'
import { buildTrialReminderEmail, type TrialReminderVariant } from '@/lib/email/flows'

const CRON_SECRET = process.env.CRON_SECRET

interface ProfileRow {
  id: string
  email: string | null
  full_name: string | null
  credits_used: number | null
  trial_ends_at: string | null
  plan: string | null
  email_trial_reminders_enabled: boolean | null
  trial_reminder_sent_3d: boolean | null
  trial_reminder_sent_1d: boolean | null
  trial_reminder_sent_0d: boolean | null
}

function pickVariant(profile: ProfileRow): TrialReminderVariant | null {
  if (!profile.trial_ends_at) return null
  const now = Date.now()
  const ends = new Date(profile.trial_ends_at).getTime()
  const hoursUntil = (ends - now) / (1000 * 60 * 60)

  // Day-of: trial expired in last 24 hours
  if (hoursUntil <= 0 && hoursUntil > -24 && !profile.trial_reminder_sent_0d) return '0d'
  // 1-day: trial ends in 0–36 hours
  if (hoursUntil > 0 && hoursUntil <= 36 && !profile.trial_reminder_sent_1d) return '1d'
  // 3-day: trial ends in 60–84 hours (centred on 72)
  if (hoursUntil > 60 && hoursUntil <= 84 && !profile.trial_reminder_sent_3d) return '3d'
  return null
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: 'Supabase env missing' }, { status: 500 })
  const supabase = createClient(url, key)

  const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  const fourDaysAhead = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, credits_used, trial_ends_at, plan, email_trial_reminders_enabled, trial_reminder_sent_3d, trial_reminder_sent_1d, trial_reminder_sent_0d')
    .eq('plan', 'trial')
    .gte('trial_ends_at', fourDaysAgo)
    .lte('trial_ends_at', fourDaysAhead)
    .limit(200)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = { sent: 0, skipped: 0, errors: 0, byVariant: { '3d': 0, '1d': 0, '0d': 0 } }

  for (const user of (users ?? []) as ProfileRow[]) {
    try {
      if (user.email_trial_reminders_enabled === false) { results.skipped++; continue }

      const variant = pickVariant(user)
      if (!variant) { results.skipped++; continue }

      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(user.id)
      const email = authUser?.email ?? user.email
      if (!email) { results.skipped++; continue }

      const firstName = (user.full_name ?? 'there').split(' ')[0]
      const locale = (authUser?.user_metadata?.locale as string) ?? 'en'

      // Gather stats
      const { count: contentGenerated } = await supabase
        .from('saved_generations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { count: contactsAdded } = await supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { subject, html } = buildTrialReminderEmail(
        user.id,
        firstName,
        variant,
        {
          contentGenerated: contentGenerated ?? 0,
          contactsAdded: contactsAdded ?? 0,
          creditsUsed: user.credits_used ?? 0,
        },
        locale
      )

      await sendEmail({
        to: email,
        subject,
        html,
        agentName: `Trial Reminder ${variant}`,
        userId: user.id,
      })

      const flagCol = `trial_reminder_sent_${variant}`
      await supabase.from('profiles').update({ [flagCol]: true }).eq('id', user.id)

      results.sent++
      results.byVariant[variant]++
    } catch (err) {
      console.error('[trial-reminders] error for user', user.id, err)
      results.errors++
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
