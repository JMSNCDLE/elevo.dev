import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // 'active' | 'resolved' | 'escalated' | 'spam'
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 25
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('live_conversations')
    .select('*, contacts(full_name, email, phone)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('last_message_at', { ascending: false })
    .range(from, to)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ conversations: data, total: count, page, pages: Math.ceil((count ?? 0) / limit) })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, status, aiHandling } = body as { id?: string; status?: string; aiHandling?: boolean }

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (status !== undefined) updates.status = status
  if (aiHandling !== undefined) updates.ai_handling = aiHandling

  const { error } = await supabase
    .from('live_conversations')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
