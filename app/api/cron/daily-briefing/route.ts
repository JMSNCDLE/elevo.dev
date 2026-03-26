import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyDailySummary } from '@/lib/notifications/notify-owner'

// Runs daily at 8:00 UTC (9:00 CET)
// Vercel cron: "0 8 * * *"

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')
  const validSecret = process.env.CRON_SECRET

  if (validSecret && cronSecret !== validSecret && authHeader !== `Bearer ${validSecret}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const sb = createClient(url, key)

    // Fetch stats
    const { data: profiles } = await sb.from('profiles').select('plan, credits_used')
    const totalUsers = profiles?.length ?? 0
    const paidUsers = profiles?.filter(p => p.plan !== 'trial').length ?? 0
    const planRevenue: Record<string, number> = { launch: 39, orbit: 79, galaxy: 149 }
    const revenue = profiles?.reduce((s, p) => s + (planRevenue[p.plan] ?? 0), 0) ?? 0

    // Today's signups
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { count: newSignups } = await sb
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString())

    // Credits used today
    const totalCredits = profiles?.reduce((s, p) => s + (p.credits_used ?? 0), 0) ?? 0

    // Top agent from saved_generations
    const { data: gens } = await sb
      .from('saved_generations')
      .select('content_type')
      .limit(500)

    const agentCounts: Record<string, number> = {}
    for (const g of gens ?? []) {
      const t = g.content_type || 'unknown'
      agentCounts[t] = (agentCounts[t] ?? 0) + 1
    }
    const topAgent = Object.entries(agentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'None'

    // Recent health check issues
    const { data: healthChecks } = await sb
      .from('health_checks')
      .select('critical_count')
      .order('checked_at', { ascending: false })
      .limit(1)

    const issues = healthChecks?.[0]?.critical_count ?? 0

    // Send notification
    await notifyDailySummary({
      totalUsers,
      newSignups: newSignups ?? 0,
      revenue,
      paidUsers,
      creditsUsed: totalCredits,
      topAgent,
      issues,
    })

    return NextResponse.json({
      ok: true,
      date: new Date().toISOString().split('T')[0],
      summary: { totalUsers, newSignups: newSignups ?? 0, revenue, paidUsers },
    })
  } catch (err) {
    console.error('[cron/daily-briefing]', err)
    return NextResponse.json({ error: 'Briefing failed' }, { status: 500 })
  }
}
