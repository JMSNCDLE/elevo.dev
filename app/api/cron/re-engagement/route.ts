import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/send'
import { buildReEngagementEmail } from '@/lib/email/flows'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: 'Supabase env missing' }, { status: 500 })
  const supabase = createClient(url, key)

  // Inactive 5+ days, re-engagement enabled, not sent in last 14 days
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, last_active_at, reengagement_sent_at, email_reengagement_enabled')
    .lt('last_active_at', fiveDaysAgo)
    .neq('email_reengagement_enabled', false)
    .or(`reengagement_sent_at.is.null,reengagement_sent_at.lt.${fourteenDaysAgo}`)
    .limit(200)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = { sent: 0, skipped: 0, errors: 0 }

  for (const user of users ?? []) {
    try {
      if (user.email_reengagement_enabled === false) { results.skipped++; continue }

      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(user.id)
      const email = authUser?.email ?? user.email
      if (!email) { results.skipped++; continue }

      const lastActive = user.last_active_at ? new Date(user.last_active_at as string) : new Date()
      const daysInactive = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
      const firstName = (user.full_name as string | null)?.split(' ')[0] ?? 'there'
      const locale = (authUser?.user_metadata?.locale as string) ?? 'en'

      const { subject, html } = buildReEngagementEmail(user.id, firstName, daysInactive, locale)

      await sendEmail({
        to: email,
        subject,
        html,
        agentName: 'Re-engagement',
        userId: user.id,
      })

      await supabase
        .from('profiles')
        .update({ reengagement_sent_at: new Date().toISOString() })
        .eq('id', user.id)

      results.sent++
    } catch (err) {
      console.error('[re-engagement] error for user', user.id, err)
      results.errors++
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
