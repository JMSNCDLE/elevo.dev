import { NextResponse } from 'next/server'
import { createServerClient, createServiceClient } from '@/lib/supabase/server'
import { ADMIN_IDS } from '@/lib/admin'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_IDS.includes(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = await createServiceClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  try {
    const [totalRuns, errorRuns, allRuns, recentErrors] = await Promise.all([
      admin.from('agent_runs').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      admin.from('agent_runs').select('id', { count: 'exact', head: true }).eq('status', 'error').gte('created_at', today.toISOString()),
      admin.from('agent_runs').select('agent, status, duration_ms').gte('created_at', weekAgo),
      admin.from('agent_runs').select('agent, error, error_type, created_at, duration_ms').eq('status', 'error').order('created_at', { ascending: false }).limit(10),
    ])

    // Aggregate top agents
    const agentCounts: Record<string, number> = {}
    const agentDurations: Record<string, { total: number; count: number }> = {}

    for (const r of allRuns.data ?? []) {
      agentCounts[r.agent] = (agentCounts[r.agent] || 0) + 1
      if (r.status === 'success' && r.duration_ms) {
        if (!agentDurations[r.agent]) agentDurations[r.agent] = { total: 0, count: 0 }
        agentDurations[r.agent].total += r.duration_ms
        agentDurations[r.agent].count++
      }
    }

    return NextResponse.json({
      today: {
        totalRuns: totalRuns.count ?? 0,
        errors: errorRuns.count ?? 0,
        errorRate: totalRuns.count ? ((errorRuns.count ?? 0) / totalRuns.count * 100).toFixed(1) : '0',
      },
      topAgents: Object.entries(agentCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([agent, count]) => ({ agent, count })),
      slowestAgents: Object.entries(agentDurations)
        .map(([agent, d]) => ({ agent, avgMs: Math.round(d.total / d.count) }))
        .sort((a, b) => b.avgMs - a.avgMs)
        .slice(0, 10),
      recentErrors: recentErrors.data ?? [],
    })
  } catch (err) {
    // Table may not exist yet
    return NextResponse.json({
      today: { totalRuns: 0, errors: 0, errorRate: '0' },
      topAgents: [],
      slowestAgents: [],
      recentErrors: [],
      note: 'agent_runs table may not exist yet — run the migration SQL',
    })
  }
}
