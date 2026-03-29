import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { executeMarketingDay } from '@/lib/agents/superMarketingAgent'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createServiceClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: missions, error } = await supabase
    .from('marketing_missions')
    .select('id, user_id')
    .eq('status', 'active')
    .eq('auto_execute', true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!missions || missions.length === 0) {
    return NextResponse.json({ executed: 0, message: 'No active auto-execute missions' })
  }

  const results: Array<{ missionId: string; success: boolean; error?: string }> = []

  for (const mission of missions) {
    try {
      const result = await executeMarketingDay(mission.id, today, 'en')

      await supabase.from('mission_executions').insert({
        mission_id: mission.id,
        execution_date: today,
        tasks_completed: result.tasksCompleted,
        posts_generated: result.postsGenerated,
        posts_scheduled: result.postsScheduled,
        credits_used: result.postsGenerated,
        issues: result.issuesFound,
        summary: result.summary,
      })

      results.push({ missionId: mission.id, success: true })
    } catch (err) {
      console.error(`[execute-missions] mission ${mission.id}`, err)
      results.push({ missionId: mission.id, success: false, error: String(err) })
    }
  }

  return NextResponse.json({
    date: today,
    executed: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  })
}
