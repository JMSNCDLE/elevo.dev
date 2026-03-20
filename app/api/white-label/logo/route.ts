import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const Schema = z.object({
  logoUrl: z.string().url(),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  if (!profile || profile.plan !== 'galaxy') {
    return NextResponse.json({ error: 'Galaxy plan required' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })

  const { logoUrl } = parsed.data

  await supabase.from('white_label_configs').upsert({
    user_id: user.id,
    logo_url: logoUrl,
    brand_name: 'My Brand', // will be overwritten by full config save
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  return NextResponse.json({ success: true, logoUrl })
}
