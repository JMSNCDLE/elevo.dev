import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, white_label_domain, white_label_active')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (profile.plan !== 'galaxy') return NextResponse.json({ error: 'Galaxy plan required' }, { status: 403 })

  return NextResponse.json({
    domain: profile.white_label_domain ?? null,
    active: profile.white_label_active ?? false,
  })
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (profile.plan !== 'galaxy') return NextResponse.json({ error: 'Galaxy plan required' }, { status: 403 })

  const { domain } = await request.json()
  if (!domain) return NextResponse.json({ error: 'Domain required' }, { status: 400 })

  await supabase.from('profiles').update({
    white_label_domain: domain,
    white_label_active: true,
  }).eq('id', user.id)

  return NextResponse.json({ success: true, domain })
}
