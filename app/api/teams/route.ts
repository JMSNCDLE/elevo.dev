import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { TEAM_TEMPLATES } from '@/lib/teams/templates'
import { decomposeGoal } from '@/lib/teams/decompose'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: teams, error } = await supabase
    .from('agent_teams')
    .select('id, name, goal, status, template, total_credits_used, credit_budget, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Augment with member counts
  const ids = (teams ?? []).map(t => t.id)
  const counts: Record<string, number> = {}
  if (ids.length > 0) {
    const { data: members } = await supabase
      .from('agent_team_members')
      .select('team_id')
      .in('team_id', ids)
    for (const m of members ?? []) counts[m.team_id] = (counts[m.team_id] ?? 0) + 1
  }

  return NextResponse.json({
    teams: (teams ?? []).map(t => ({ ...t, member_count: counts[t.id] ?? 0 })),
    templates: TEAM_TEMPLATES,
  })
}

const CreateSchema = z.object({
  name: z.string().min(1).max(100),
  goal: z.string().min(1).max(500),
  template: z.string().optional(),
  members: z.array(z.object({
    agent_type: z.string(),
    role_title: z.string(),
    context: z.string().optional(),
    credit_budget: z.number().int().positive().optional(),
  })).min(1).max(10),
})

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = CreateSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { name, goal, template, members } = parsed.data

  // 1. Insert team
  const { data: team, error: teamErr } = await supabase
    .from('agent_teams')
    .insert({ user_id: user.id, name, goal, template, status: 'active' })
    .select('id')
    .single()
  if (teamErr || !team) {
    return NextResponse.json({ error: teamErr?.message ?? 'Could not create team' }, { status: 500 })
  }

  // 2. Insert team members
  const memberRows = members.map(m => ({
    team_id: team.id,
    agent_type: m.agent_type,
    role_title: m.role_title,
    context: m.context ?? null,
    credit_budget: m.credit_budget ?? null,
  }))
  await supabase.from('agent_team_members').insert(memberRows)

  // 3. Decompose goal into tasks (best-effort — never fail team creation if this errors)
  try {
    const tasks = await decomposeGoal({
      goal,
      members: members.map(m => ({
        agent_type: m.agent_type,
        role_title: m.role_title,
        context: m.context ?? '',
      })),
    })
    if (tasks.length > 0) {
      await supabase.from('agent_tasks').insert(
        tasks.map(t => ({
          team_id: team.id,
          assigned_agent: t.assigned_agent,
          task_description: t.description,
          priority: t.priority,
          status: 'pending' as const,
        }))
      )
    }
  } catch (err) {
    console.error('[teams] decompose failed (team still created):', err)
  }

  return NextResponse.json({ teamId: team.id })
}

export const dynamic = 'force-dynamic'
