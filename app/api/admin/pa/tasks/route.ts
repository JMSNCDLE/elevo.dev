import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

async function getAdminUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, error: 'Unauthorised' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { supabase, user: null, error: 'Admin access required' }
  }

  return { supabase, user, error: null }
}

// GET — list tasks ordered by priority
export async function GET() {
  const { supabase, user, error } = await getAdminUser()
  if (!user) return NextResponse.json({ error }, { status: error === 'Unauthorised' ? 401 : 403 })

  const priorityOrder = ['urgent', 'high', 'medium', 'low']

  const { data: tasks, error: dbErr } = await supabase
    .from('pa_tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (dbErr) {
    console.error('[pa/tasks GET]', dbErr)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }

  const sorted = (tasks ?? []).sort((a, b) => {
    const ai = priorityOrder.indexOf(a.priority)
    const bi = priorityOrder.indexOf(b.priority)
    return ai - bi
  })

  return NextResponse.json(sorted)
}

// POST — create task
export async function POST(request: Request) {
  const { supabase, user, error } = await getAdminUser()
  if (!user) return NextResponse.json({ error }, { status: error === 'Unauthorised' ? 401 : 403 })

  const body = await request.json()
  const { type, priority, title, description, autoFixAvailable, estimatedTime } = body

  if (!type || !title) {
    return NextResponse.json({ error: 'type and title are required' }, { status: 400 })
  }

  const { data: task, error: dbErr } = await supabase
    .from('pa_tasks')
    .insert({
      user_id: user.id,
      type,
      priority: priority ?? 'medium',
      title,
      description: description ?? '',
      status: 'open',
      auto_fix_available: autoFixAvailable ?? false,
      estimated_time: estimatedTime ?? '1h',
    })
    .select()
    .single()

  if (dbErr) {
    console.error('[pa/tasks POST]', dbErr)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }

  return NextResponse.json(task, { status: 201 })
}

// PATCH — update task status
export async function PATCH(request: Request) {
  const { supabase, user, error } = await getAdminUser()
  if (!user) return NextResponse.json({ error }, { status: error === 'Unauthorised' ? 401 : 403 })

  const body = await request.json()
  const { id, status } = body

  if (!id || !status) {
    return NextResponse.json({ error: 'id and status are required' }, { status: 400 })
  }

  const updateData: Record<string, unknown> = { status }
  if (status === 'done') {
    updateData.resolved_at = new Date().toISOString()
  }

  const { data: task, error: dbErr } = await supabase
    .from('pa_tasks')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (dbErr) {
    console.error('[pa/tasks PATCH]', dbErr)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }

  return NextResponse.json(task)
}
