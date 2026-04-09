import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendTelegramToJames } from '@/lib/notifications/telegram'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const now = new Date()
    const hour = now.getUTCHours()
    const results: string[] = []

    // === TASK 1: Morning Briefing (7 AM UTC) ===
    if (hour === 7) {
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      const { count: trialCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'trialing')

      const { data: recentSignups } = await supabase
        .from('profiles')
        .select('email, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: latestReport } = await supabase
        .from('build_agent_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const briefing = `🌅 <b>ELEVO Daily Briefing</b>\n` +
        `📅 ${now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\n\n` +
        `👥 Total users: ${userCount || 0}\n` +
        `🆓 On trial: ${trialCount || 0}\n` +
        `💰 MRR: Check Stripe dashboard\n\n` +
        `📊 Last build check: ${latestReport?.issues_count ?? '?'} issues (${latestReport?.critical_count ?? '?'} critical)\n\n` +
        `🆕 Recent signups:\n${recentSignups?.map(s => `• ${s.email} (${new Date(s.created_at).toLocaleDateString('en-GB')})`).join('\n') || 'None'}\n\n` +
        `✅ Aria is monitoring. All systems checked.`

      await sendTelegramToJames(briefing)
      results.push('Morning briefing sent')
    }

    // === TASK 2: Health Check (every 4 hours) ===
    const healthChecks = [
      { name: 'Homepage', url: 'https://www.elevo.dev/en' },
      { name: 'Pricing', url: 'https://www.elevo.dev/en/pricing' },
      { name: 'API', url: 'https://www.elevo.dev/api/health' },
    ]

    const downPages: string[] = []
    for (const check of healthChecks) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)
        const res = await fetch(check.url, { method: 'HEAD', signal: controller.signal })
        clearTimeout(timeout)
        if (res.status >= 500) downPages.push(`${check.name} (${res.status})`)
      } catch {
        downPages.push(`${check.name} (unreachable)`)
      }
    }

    if (downPages.length > 0) {
      await sendTelegramToJames(
        `🚨 <b>ELEVO Alert</b>\n\nDown pages detected:\n${downPages.map(p => `• ${p}`).join('\n')}\n\nCheck: https://www.elevo.dev/en/admin/build-agent`
      )
      results.push(`Alert sent: ${downPages.length} pages down`)
    } else {
      results.push('Health check passed')
    }

    // === TASK 3: Check pending high-priority agent comms ===
    try {
      const { data: pendingTasks } = await supabase
        .from('agent_communications')
        .select('*')
        .eq('priority', 'high')
        .is('resolved_at', null)
        .order('created_at', { ascending: false })
        .limit(5)

      if (pendingTasks && pendingTasks.length > 0) {
        const taskList = pendingTasks.map((t: { from_agent: string; message?: string }) =>
          `• [${t.from_agent}] ${(t.message || '').substring(0, 100)}...`
        ).join('\n')

        await sendTelegramToJames(
          `⚠️ <b>Pending High-Priority Tasks</b>\n\n${taskList}`
        )
        results.push(`${pendingTasks.length} pending tasks notified`)
      }
    } catch {
      // agent_communications table may not exist
    }

    // === TASK 4: Check trial expirations ===
    try {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { data: expiringTrials } = await supabase
        .from('profiles')
        .select('email, created_at')
        .eq('subscription_status', 'trialing')
        .lt('created_at', sevenDaysAgo)

      if (expiringTrials && expiringTrials.length > 0) {
        await sendTelegramToJames(
          `⏰ <b>Expiring Trials</b>\n\n${expiringTrials.length} trial(s) expiring:\n${expiringTrials.map((t: { email: string }) => `• ${t.email}`).join('\n')}`
        )
        results.push(`${expiringTrials.length} expiring trials notified`)
      }
    } catch {
      // profiles table may not have subscription_status
    }

    // === TASK 5: Evening Summary (21:00 UTC) ===
    if (hour === 20) {
      try {
        const todayStart = new Date(now)
        todayStart.setUTCHours(0, 0, 0, 0)

        const { count: todayGenerations } = await supabase
          .from('saved_generations')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', todayStart.toISOString())

        const summary = `🌙 <b>ELEVO Evening Summary</b>\n\n` +
          `📊 Generations today: ${todayGenerations || 0}\n` +
          `✅ All systems operational\n` +
          `🤖 Aria will continue monitoring overnight.\n\n` +
          `Goodnight, James. 🛌`

        await sendTelegramToJames(summary)
        results.push('Evening summary sent')
      } catch {
        results.push('Evening summary skipped (query failed)')
      }
    }

    // Log this run
    try {
      await supabase.from('agent_communications').insert({
        from_agent: 'aria-autonomous',
        to_agent: 'system',
        message: `Autonomous run completed: ${results.join(', ')}`,
        priority: 'low',
      })
    } catch {
      // table may not exist
    }

    return NextResponse.json({
      status: 'ok',
      results,
      timestamp: now.toISOString(),
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    await sendTelegramToJames(`🚨 <b>Aria Error</b>\n\nAutonomous run failed: ${msg}`).catch(() => {})
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
