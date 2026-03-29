import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const ConfigSchema = z.object({
  brandName: z.string().min(1).max(50),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366F1'),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#4F46E5'),
  logoUrl: z.string().url().optional(),
  hideElevoBranding: z.boolean().default(false),
  customCss: z.string().max(10000).optional(),
})

async function requireGalaxy(supabase: Awaited<ReturnType<typeof createServerClient>>, userId: string) {
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', userId).single()
  if (!profile) return false
  return profile.plan === 'galaxy'
}

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  if (!(await requireGalaxy(supabase, user.id))) {
    return NextResponse.json({ error: 'Galaxy plan required' }, { status: 403 })
  }

  const { data } = await supabase
    .from('white_label_configs')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ config: data ?? null })
}

export async function PUT(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  if (!(await requireGalaxy(supabase, user.id))) {
    return NextResponse.json({ error: 'Galaxy plan required' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = ConfigSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const config = parsed.data

  const { error } = await supabase.from('white_label_configs').upsert({
    user_id: user.id,
    brand_name: config.brandName,
    primary_color: config.primaryColor,
    accent_color: config.accentColor,
    logo_url: config.logoUrl ?? null,
    hide_elevo_branding: config.hideElevoBranding,
    custom_css: config.customCss ?? null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  if (error) {
    console.error('White label config error:', error)
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
