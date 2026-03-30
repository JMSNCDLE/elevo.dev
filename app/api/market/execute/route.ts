import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { executeMarketingDay } from '@/lib/agents/superMarketingAgent'
import { ADMIN_IDS } from '@/lib/admin'

const Schema = z.object({
  missionId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  locale: z.string().default('en'),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan, credits_used, credits_limit').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (!ADMIN_IDS.includes(user.id) && profile.plan !== 'galaxy') return NextResponse.json({ error: 'Galaxy plan required for auto-execute' }, { status: 403 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { data: mission } = await supabase
    .from('marketing_missions')
    .select('id, user_id, status')
    .eq('id', parsed.data.missionId)
    .eq('user_id', user.id)
    .single()

  if (!mission) return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
  if (mission.status !== 'active') return NextResponse.json({ error: 'Mission is not active' }, { status: 400 })

  try {
    const result = await executeMarketingDay(parsed.data.missionId, parsed.data.date, parsed.data.locale)

    await supabase.from('mission_executions').insert({
      mission_id: parsed.data.missionId,
      execution_date: parsed.data.date,
      tasks_completed: result.tasksCompleted,
      posts_generated: result.postsGenerated,
      posts_scheduled: result.postsScheduled,
      credits_used: result.postsGenerated,
      issues: result.issuesFound,
      summary: result.summary,
    })

    return NextResponse.json({ result })
  } catch (err) {
    console.error('Execute mission error:', err)
    return NextResponse.json({ error: 'Execution failed' }, { status: 500 })
  }
}
