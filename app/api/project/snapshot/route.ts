import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    snapshotType,
    title,
    summary,
    agentsUsed = [],
    contentGenerated = 0,
    keyResults = [],
    nextActions = [],
    businessProfileId,
  } = body

  if (!title || !summary) {
    return NextResponse.json({ error: 'title and summary are required' }, { status: 400 })
  }

  const { data: snapshot, error } = await supabase
    .from('project_snapshots')
    .insert({
      user_id: user.id,
      business_profile_id: businessProfileId ?? null,
      snapshot_type: snapshotType ?? 'general',
      title,
      summary,
      agents_used: agentsUsed,
      content_generated: contentGenerated,
      key_results: keyResults,
      next_actions: nextActions,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ snapshot })
}

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: snapshots, error } = await supabase
    .from('project_snapshots')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(snapshots ?? [])
}
