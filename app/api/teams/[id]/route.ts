import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

interface RouteCtx { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: team } = await supabase
    .from('agent_teams')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 })

  const { data: members } = await supabase
    .from('agent_team_members')
    .select('*')
    .eq('team_id', id)
    .order('created_at', { ascending: true })

  const { data: tasks } = await supabase
    .from('agent_tasks')
    .select('*')
    .eq('team_id', id)
    .order('priority', { ascending: true })

  const { data: handoffs } = await supabase
    .from('agent_handoffs')
    .select('*')
    .eq('team_id', id)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json({
    team,
    members: members ?? [],
    tasks: tasks ?? [],
    handoffs: handoffs ?? [],
  })
}

const PatchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: z.enum(['active', 'paused', 'completed', 'failed']).optional(),
})

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = PatchSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { error } = await supabase
    .from('agent_teams')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('agent_teams')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
