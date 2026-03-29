import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const CreateSchema = z.object({
  name: z.string().min(1).max(50),
  position: z.enum(['bottom-right', 'bottom-left']).default('bottom-right'),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366F1'),
  greeting: z.string().max(200).default('Hi! How can I help you today?'),
})

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  if (!profile || profile.plan !== 'galaxy') {
    return NextResponse.json({ error: 'Galaxy plan required' }, { status: 403 })
  }

  const { data: widgets } = await supabase
    .from('widgets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ widgets: widgets ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  if (!profile || profile.plan !== 'galaxy') {
    return NextResponse.json({ error: 'Galaxy plan required' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const { data: widget, error } = await supabase
    .from('widgets')
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      position: parsed.data.position,
      primary_color: parsed.data.primaryColor,
      greeting: parsed.data.greeting,
      active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Widget create error:', error)
    return NextResponse.json({ error: 'Failed to create widget' }, { status: 500 })
  }

  return NextResponse.json({ widget }, { status: 201 })
}

export async function DELETE(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'Widget ID required' }, { status: 400 })

  await supabase.from('widgets').delete().eq('id', id).eq('user_id', user.id)

  return NextResponse.json({ success: true })
}
