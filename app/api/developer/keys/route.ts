import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { generateApiKey } from '@/lib/api-auth'

const CreateSchema = z.object({
  name: z.string().min(1).max(50),
  expiresIn: z.enum(['never', '30d', '90d', '1y']).default('never'),
})

const MAX_KEYS_PER_PLAN: Record<string, number> = {
  trial: 0,
  launch: 0,
  orbit: 0,
  galaxy: 5,
}

function getExpiryDate(expiresIn: string): string | null {
  if (expiresIn === 'never') return null
  const d = new Date()
  if (expiresIn === '30d') d.setDate(d.getDate() + 30)
  else if (expiresIn === '90d') d.setDate(d.getDate() + 90)
  else if (expiresIn === '1y') d.setFullYear(d.getFullYear() + 1)
  return d.toISOString()
}

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  if (!profile || profile.plan !== 'galaxy') {
    return NextResponse.json({ error: 'Galaxy plan required' }, { status: 403 })
  }

  const { data: keys } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, last_used_at, expires_at, revoked, created_at')
    .eq('user_id', user.id)
    .eq('revoked', false)
    .order('created_at', { ascending: false })

  return NextResponse.json({ keys: keys ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const maxKeys = MAX_KEYS_PER_PLAN[profile.plan] ?? 0
  if (maxKeys === 0) {
    return NextResponse.json({ error: 'Galaxy plan required to create API keys' }, { status: 403 })
  }

  // Count existing active keys
  const { count } = await supabase
    .from('api_keys')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('revoked', false)

  if ((count ?? 0) >= maxKeys) {
    return NextResponse.json({ error: `Maximum of ${maxKeys} API keys allowed` }, { status: 429 })
  }

  const body = await request.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const { name, expiresIn } = parsed.data
  const { key, hash, prefix } = generateApiKey(user.id)

  await supabase.from('api_keys').insert({
    user_id: user.id,
    name,
    key_prefix: prefix,
    key_hash: hash,
    expires_at: getExpiryDate(expiresIn),
    revoked: false,
  })

  // Return the full key ONCE — it won't be shown again
  return NextResponse.json({ success: true, key, prefix, name })
}

export async function DELETE(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'Key ID required' }, { status: 400 })

  await supabase
    .from('api_keys')
    .update({ revoked: true })
    .eq('id', id)
    .eq('user_id', user.id)

  return NextResponse.json({ success: true })
}
