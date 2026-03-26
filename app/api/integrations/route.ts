import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET — list user's connected integrations
export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data, error } = await supabase
    .from('user_integrations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ integrations: data })
}

// POST — connect/disconnect an integration
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { action, integration_name } = await req.json()

  if (!integration_name) {
    return NextResponse.json({ error: 'integration_name required' }, { status: 400 })
  }

  if (action === 'connect') {
    // Upsert: create or update
    const { data: existing } = await supabase
      .from('user_integrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('integration_name', integration_name)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('user_integrations')
        .update({ status: 'pending', connected_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      const { error } = await supabase
        .from('user_integrations')
        .insert({
          user_id: user.id,
          integration_name,
          status: 'pending',
          connected_at: new Date().toISOString(),
        })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, status: 'pending' })
  }

  if (action === 'disconnect') {
    const { error } = await supabase
      .from('user_integrations')
      .update({ status: 'disconnected', connected_at: null })
      .eq('user_id', user.id)
      .eq('integration_name', integration_name)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, status: 'disconnected' })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
