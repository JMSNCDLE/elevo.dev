import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { validateApiKey } from '@/lib/api-auth'

const CreateSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization') ?? ''
  const apiKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

  const { valid, userId } = await validateApiKey(apiKey)
  if (!valid || !userId) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  const supabase = await createServiceClient()
  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50'), 100)
  const offset = parseInt(url.searchParams.get('offset') ?? '0')

  const { data: contacts, count } = await supabase
    .from('crm_contacts')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return NextResponse.json({ contacts: contacts ?? [], total: count ?? 0, limit, offset })
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization') ?? ''
  const apiKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

  const { valid, userId } = await validateApiKey(apiKey)
  if (!valid || !userId) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const supabase = await createServiceClient()

  const { data: contact, error } = await supabase
    .from('crm_contacts')
    .insert({ ...parsed.data, user_id: userId })
    .select()
    .single()

  if (error) {
    console.error('v1 contacts create error:', error)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }

  return NextResponse.json({ contact }, { status: 201 })
}
