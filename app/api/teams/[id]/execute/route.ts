import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createMessage, MODELS, MAX_TOKENS, extractText } from '@/lib/agents/client'

interface RouteCtx { params: Promise<{ id: string }> }

/**
 * POST /api/teams/[id]/execute
 * Runs the next pending task in priority order. Returns the result.
 * Sequential execution only — v1.
 */
export async function POST(_req: NextRequest, ctx: RouteCtx) {
  const { id: teamId } = await ctx.params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify team ownership
  const { data: team } = await supabase
    .from('agent_teams')
    .select('id, name, goal, status')
    .eq('id', teamId)
    .eq('user_id', user.id)
    .single()
  if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 })
  if (team.status !== 'active') {
    return NextResponse.json({ error: `Team is ${team.status}` }, { status: 400 })
  }

  // Find next pending task
  const { data: nextTask } = await supabase
    .from('agent_tasks')
    .select('*')
    .eq('team_id', teamId)
    .eq('status', 'pending')
    .order('priority', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!nextTask) {
    // No more tasks → mark team as completed
    await supabase.from('agent_teams').update({ status: 'completed' }).eq('id', teamId)
    return NextResponse.json({ done: true, message: 'All tasks complete — team marked as completed.' })
  }

  // Find the assigned member to get the role context
  const { data: member } = await supabase
    .from('agent_team_members')
    .select('role_title, context')
    .eq('team_id', teamId)
    .eq('agent_type', nextTask.assigned_agent)
    .maybeSingle()

  // Mark as in_progress
  await supabase
    .from('agent_tasks')
    .update({ status: 'in_progress', started_at: new Date().toISOString() })
    .eq('id', nextTask.id)

  try {
    // Build the team context system prompt
    const systemPrompt = `You are operating as part of an ELEVO AI team.
Team: ${team.name}
Team Goal: ${team.goal}
Your Role: ${member?.role_title ?? nextTask.assigned_agent}
Role Context: ${member?.context ?? 'Contribute to the team goal.'}

Complete the task assigned to you below. Structure your output clearly so the user (and the next agent) can act on it. Include:
1. What you accomplished
2. Key findings or outputs
3. What should happen next`

    const message = await createMessage({
      model: MODELS.AGENT,
      max_tokens: MAX_TOKENS.MEDIUM,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Task: ${nextTask.task_description}`,
        },
      ],
    })

    const output = extractText(message)

    // Save result + mark complete
    await supabase
      .from('agent_tasks')
      .update({
        status: 'completed',
        result: { output },
        completed_at: new Date().toISOString(),
        credits_used: 1,
      })
      .eq('id', nextTask.id)

    // Deduct credit + bump team total (best-effort)
    await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: 1,
      p_agent_type: nextTask.assigned_agent,
      p_conversation_id: null,
      p_description: `Team task: ${team.name}`,
    })
    const { data: currentTeam } = await supabase
      .from('agent_teams')
      .select('total_credits_used')
      .eq('id', teamId)
      .single()
    await supabase
      .from('agent_teams')
      .update({
        total_credits_used: (currentTeam?.total_credits_used ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', teamId)
    // Bump member credits used too
    await supabase
      .from('agent_team_members')
      .update({ credits_used: ((member as { credits_used?: number } | null)?.credits_used ?? 0) + 1 })
      .eq('team_id', teamId)
      .eq('agent_type', nextTask.assigned_agent)

    return NextResponse.json({
      task: { ...nextTask, status: 'completed', result: { output } },
    })
  } catch (err) {
    console.error('[teams/execute] error:', err)
    await supabase
      .from('agent_tasks')
      .update({ status: 'failed' })
      .eq('id', nextTask.id)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Task failed' },
      { status: 500 }
    )
  }
}
