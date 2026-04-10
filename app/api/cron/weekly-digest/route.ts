import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/send'
import { buildWeeklyDigestEmail } from '@/lib/email/flows'

const CRON_SECRET = process.env.CRON_SECRET

const ALL_AGENTS = [
  'ELEVO Market™', 'ELEVO Creator™', 'ELEVO SMM™', 'ELEVO CEO™', 'ELEVO Spy™',
  'ELEVO Viral™', 'ELEVO Rank™', 'ELEVO Accountant™', 'ELEVO Lawyer™',
]

function weekLabel(): string {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - 7)
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${fmt(start)} – ${fmt(now)}`
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

  // Active subscribers only (not trial — they get trial reminders)
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, plan, email_digest_enabled')
    .neq('plan', 'trial')
    .neq('email_digest_enabled', false)
    .limit(500)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = { sent: 0, skipped: 0, errors: 0 }
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const label = weekLabel()

  for (const user of users ?? []) {
    try {
      if (user.email_digest_enabled === false) { results.skipped++; continue }

      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(user.id)
      const email = authUser?.email ?? user.email
      if (!email) { results.skipped++; continue }

      // This week's generations
      const { data: thisWeekGens } = await supabase
        .from('saved_generations')
        .select('agent_name, credits_used')
        .eq('user_id', user.id)
        .gte('created_at', oneWeekAgo)

      // Last week's generations
      const { data: lastWeekGens } = await supabase
        .from('saved_generations')
        .select('credits_used')
        .eq('user_id', user.id)
        .gte('created_at', twoWeeksAgo)
        .lt('created_at', oneWeekAgo)

      // Skip users with zero activity in BOTH weeks (re-engagement covers them)
      if ((thisWeekGens?.length ?? 0) === 0 && (lastWeekGens?.length ?? 0) === 0) {
        results.skipped++
        continue
      }

      const creditsThisWeek = (thisWeekGens ?? []).reduce((s, g) => s + ((g.credits_used as number | null) ?? 1), 0)
      const creditsLastWeek = (lastWeekGens ?? []).reduce((s, g) => s + ((g.credits_used as number | null) ?? 1), 0)

      const agentCounts: Record<string, number> = {}
      for (const g of thisWeekGens ?? []) {
        const name = (g.agent_name as string | null) ?? 'Unknown'
        agentCounts[name] = (agentCounts[name] ?? 0) + 1
      }
      const topAgents = Object.entries(agentCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => `${name} (${count}×)`)

      const usedAgentNames = new Set(Object.keys(agentCounts))
      const unusedAgents = ALL_AGENTS.filter(a => !usedAgentNames.has(a)).slice(0, 2)

      const firstName = (user.full_name as string | null)?.split(' ')[0] ?? 'there'
      const locale = (authUser?.user_metadata?.locale as string) ?? 'en'

      const { subject, html } = buildWeeklyDigestEmail(
        user.id,
        firstName,
        label,
        {
          creditsThisWeek,
          creditsLastWeek,
          topAgents,
          generationsCount: thisWeekGens?.length ?? 0,
          unusedAgents,
        },
        locale
      )

      await sendEmail({
        to: email,
        subject,
        html,
        agentName: 'Weekly Digest',
        userId: user.id,
      })

      await supabase
        .from('profiles')
        .update({ digest_last_sent_at: new Date().toISOString() })
        .eq('id', user.id)

      results.sent++
    } catch (err) {
      console.error('[weekly-digest] error for user', user.id, err)
      results.errors++
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
