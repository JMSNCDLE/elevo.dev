import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const Schema = z.object({
  subdomain: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
})

const RESERVED = ['www', 'app', 'api', 'admin', 'mail', 'smtp', 'support', 'help', 'blog', 'shop']

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })

  const { subdomain } = parsed.data

  if (RESERVED.includes(subdomain)) {
    return NextResponse.json({ error: 'That subdomain is reserved', available: false }, { status: 400 })
  }

  // Check availability
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('custom_subdomain', subdomain)
    .neq('id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ available: false, error: 'Subdomain already taken' }, { status: 409 })
  }

  // Save
  await supabase.from('profiles').update({ custom_subdomain: subdomain }).eq('id', user.id)

  return NextResponse.json({ success: true, subdomain, available: true })
}

export async function GET(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const url = new URL(request.url)
  const subdomain = url.searchParams.get('subdomain')

  if (!subdomain) {
    // Return current subdomain
    const { data: profile } = await supabase
      .from('profiles')
      .select('custom_subdomain')
      .eq('id', user.id)
      .single()
    return NextResponse.json({ subdomain: profile?.custom_subdomain ?? null })
  }

  if (RESERVED.includes(subdomain)) {
    return NextResponse.json({ available: false })
  }

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('custom_subdomain', subdomain)
    .neq('id', user.id)
    .single()

  return NextResponse.json({ available: !existing })
}
