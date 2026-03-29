import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET — list user's pipeline leads
export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Tier check
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  if (!profile || (profile.plan !== 'orbit' && profile.plan !== 'galaxy')) {
    return NextResponse.json({ error: 'Upgrade to Orbit' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('pipeline_leads')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ leads: data })
}

// POST — create a new lead
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  if (!profile || (profile.plan !== 'orbit' && profile.plan !== 'galaxy')) {
    return NextResponse.json({ error: 'Upgrade to Orbit' }, { status: 403 })
  }

  const { full_name, company, email, notes, value } = await req.json()
  if (!full_name?.trim()) return NextResponse.json({ error: 'full_name required' }, { status: 400 })

  const { data, error } = await supabase
    .from('pipeline_leads')
    .insert({
      user_id: user.id,
      full_name: full_name.trim(),
      company: company?.trim() || null,
      email: email?.trim() || null,
      notes: notes?.trim() || null,
      value: value || 0,
      stage: 'lead',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ lead: data })
}

// PATCH — update lead (stage, notes, etc.)
export async function PATCH(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id, ...updates } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabase
    .from('pipeline_leads')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE — remove a lead
export async function DELETE(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabase
    .from('pipeline_leads')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
