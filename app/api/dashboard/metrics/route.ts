import { NextResponse } from 'next/server'
import { getUserContext } from '@/lib/auth/getUserContext'

export async function GET() {
  const ctx = await getUserContext()
  if (!ctx.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const userId = ctx.user.id
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()

  try {
    const [agentRuns, tasks, contacts, generations] = await Promise.all([
      ctx.supabase.from('agent_runs').select('id, agent, status, duration_ms, created_at').eq('user_id', userId).gte('created_at', thirtyDaysAgo),
      ctx.supabase.from('pa_tasks').select('id, status, created_at').eq('user_id', userId).gte('created_at', thirtyDaysAgo),
      ctx.supabase.from('contacts').select('id, created_at').eq('user_id', userId).gte('created_at', thirtyDaysAgo),
      ctx.supabase.from('saved_generations').select('id, type, created_at').eq('user_id', userId).gte('created_at', thirtyDaysAgo),
    ])

    const totalRuns = agentRuns.data?.length ?? 0
    const timeSavedHours = Math.round((totalRuns * 15) / 60)

    // Agent usage breakdown
    const agentBreakdown: Record<string, number> = {}
    agentRuns.data?.forEach((r: { agent: string }) => {
      agentBreakdown[r.agent] = (agentBreakdown[r.agent] || 0) + 1
    })

    // Daily activity
    const dailyActivity: Record<string, number> = {}
    agentRuns.data?.forEach((r: { created_at: string }) => {
      const day = r.created_at.split('T')[0]
      dailyActivity[day] = (dailyActivity[day] || 0) + 1
    })

    return NextResponse.json({
      summary: {
        totalAgentRuns: totalRuns,
        tasksCreated: tasks.data?.length ?? 0,
        contactsSaved: contacts.data?.length ?? 0,
        contentGenerated: generations.data?.length ?? 0,
        timeSavedHours,
        estimatedValueEur: timeSavedHours * 50,
      },
      agentBreakdown: Object.entries(agentBreakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([agent, count]) => ({ agent, count })),
      dailyActivity,
    })
  } catch {
    return NextResponse.json({
      summary: { totalAgentRuns: 0, tasksCreated: 0, contactsSaved: 0, contentGenerated: 0, timeSavedHours: 0, estimatedValueEur: 0 },
      agentBreakdown: [],
      dailyActivity: {},
    })
  }
}
