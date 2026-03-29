import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const MAX_ACCOUNTS_PER_PLATFORM = 2

// GET — list user's ad accounts
export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data, error } = await supabase
    .from('ad_accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ accounts: data })
}

// POST — connect a new ad account
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Tier check — Orbit+ only
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.plan !== 'orbit' && profile.plan !== 'galaxy')) {
    return NextResponse.json({ error: 'Upgrade to Orbit to manage ad accounts' }, { status: 403 })
  }

  const { platform, account_name, account_id } = await req.json()

  if (!platform || !['meta', 'google'].includes(platform)) {
    return NextResponse.json({ error: 'platform must be "meta" or "google"' }, { status: 400 })
  }

  if (!account_name?.trim()) {
    return NextResponse.json({ error: 'account_name required' }, { status: 400 })
  }

  // Check max 2 per platform
  const { count } = await supabase
    .from('ad_accounts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('platform', platform)

  if ((count ?? 0) >= MAX_ACCOUNTS_PER_PLATFORM) {
    return NextResponse.json({ error: `Maximum ${MAX_ACCOUNTS_PER_PLATFORM} ${platform} accounts allowed` }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('ad_accounts')
    .insert({
      user_id: user.id,
      platform,
      account_name: account_name.trim(),
      account_id: account_id || null,
      status: 'active',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ account: data })
}

// DELETE — disconnect an ad account
export async function DELETE(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabase
    .from('ad_accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
