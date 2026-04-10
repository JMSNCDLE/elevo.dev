import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function GET() {
  try {
    const supabase = getSupabase()
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setUTCHours(0, 0, 0, 0)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Credit usage
    const [todayCreditsRes, weekCreditsRes] = await Promise.all([
      supabase.from('credit_usage').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
      supabase.from('credit_usage').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
    ])

    // Most used agents
    const { data: agentUsage } = await supabase
      .from('credit_usage')
      .select('agent_id')
      .gte('created_at', weekAgo.toISOString())

    const agentCounts: Record<string, number> = {}
    agentUsage?.forEach(u => {
      const id = u.agent_id || 'unknown'
      agentCounts[id] = (agentCounts[id] || 0) + 1
    })

    const topAgents = Object.entries(agentCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([agent, count]) => ({ agent, uses: count }))

    // Agent communications + pending tasks + latest build
    const [commsRes, pendingRes, buildRes] = await Promise.all([
      supabase.from('agent_communications').select('from_agent, to_agent, message, priority, created_at').order('created_at', { ascending: false }).limit(10),
      supabase.from('agent_communications').select('*').eq('priority', 'high').is('resolved_at', null).order('created_at', { ascending: false }).limit(5),
      supabase.from('build_agent_reports').select('*').order('created_at', { ascending: false }).limit(1).single(),
    ])

    return NextResponse.json({
      timestamp: now.toISOString(),
      credits: {
        today: todayCreditsRes.count || 0,
        this_week: weekCreditsRes.count || 0,
      },
      top_agents: topAgents,
      recent_communications: commsRes.data || [],
      pending_high_priority: pendingRes.data || [],
      latest_build_report: buildRes.data ? {
        date: buildRes.data.created_at,
        issues: buildRes.data.issues_count,
        critical: buildRes.data.critical_count,
      } : null,
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
