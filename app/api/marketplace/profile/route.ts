import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET — get freelancer profile
export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data } = await supabase
    .from('marketplace_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ profile: data })
}

// POST — create or update freelancer profile
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { bio, skills, hourly_rate, portfolio_url } = await req.json()

  const { data: existing } = await supabase
    .from('marketplace_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('marketplace_profiles')
      .update({ bio, skills: skills || [], hourly_rate, portfolio_url })
      .eq('user_id', user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase
      .from('marketplace_profiles')
      .insert({ user_id: user.id, bio, skills: skills || [], hourly_rate, portfolio_url })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
