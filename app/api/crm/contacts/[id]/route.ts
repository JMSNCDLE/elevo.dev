import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const UpdateSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  postcode: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
  status: z.enum(['active', 'lapsed', 'at_risk', 'vip']).optional(),
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: contact, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })

  const { data: interactions } = await supabase
    .from('interactions')
    .select('*')
    .eq('contact_id', params.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ contact, interactions: interactions ?? [] })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (parsed.data.fullName !== undefined) updates.full_name = parsed.data.fullName
  if (parsed.data.email !== undefined) updates.email = parsed.data.email || null
  if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone || null
  if (parsed.data.address !== undefined) updates.address = parsed.data.address || null
  if (parsed.data.postcode !== undefined) updates.postcode = parsed.data.postcode || null
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes || null
  if (parsed.data.tags !== undefined) updates.tags = parsed.data.tags
  if (parsed.data.source !== undefined) updates.source = parsed.data.source || null
  if (parsed.data.status !== undefined) updates.status = parsed.data.status

  const { data: contact, error } = await supabase.from('contacts').update(updates).eq('id', params.id).eq('user_id', user.id).select().single()

  if (error) return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })

  return NextResponse.json({ contact })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { error } = await supabase.from('contacts').delete().eq('id', params.id).eq('user_id', user.id)

  if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })

  return NextResponse.json({ success: true })
}
