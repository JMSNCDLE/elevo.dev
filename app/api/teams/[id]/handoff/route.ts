import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

interface RouteCtx { params: Promise<{ id: string }> }

const HandoffSchema = z.object({
  task_id: z.string().uuid().optional(),
  from_agent: z.string(),
  to_agent: z.string(),
  context: z.string().min(1),
  task_data: z.unknown().optional(),
  priority: z.enum(['normal', 'urgent']).default('normal'),
})

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { id: teamId } = await ctx.params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: team } = await supabase
    .from('agent_teams')
    .select('id')
    .eq('id', teamId)
    .eq('user_id', user.id)
    .single()
  if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 })

  const parsed = HandoffSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { error } = await supabase.from('agent_handoffs').insert({
    team_id: teamId,
    task_id: parsed.data.task_id ?? null,
    from_agent: parsed.data.from_agent,
    to_agent: parsed.data.to_agent,
    context: parsed.data.context,
    task_data: (parsed.data.task_data as object | null) ?? null,
    priority: parsed.data.priority,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
