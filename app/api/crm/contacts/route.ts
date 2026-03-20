import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const CreateSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  postcode: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
  businessProfileId: z.string().uuid().optional(),
})

const PLAN_CONTACT_LIMITS: Record<string, number> = {
  trial: 20,
  launch: 100,
  orbit: Infinity,
  galaxy: Infinity,
}

export async function GET(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const offset = parseInt(searchParams.get('offset') ?? '0')

  let query = supabase
    .from('contacts')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) query = query.ilike('full_name', `%${search}%`)
  if (status && status !== 'all') query = query.eq('status', status)

  const { data: contacts, count, error } = await query
  if (error) return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })

  return NextResponse.json({ contacts: contacts ?? [], total: count ?? 0 })
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  // Contact limit check
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  const plan = profile?.plan ?? 'trial'
  const limit = PLAN_CONTACT_LIMITS[plan] ?? 20

  if (limit !== Infinity) {
    const { count } = await supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if ((count ?? 0) >= limit) {
      return NextResponse.json({ error: `Contact limit reached (${limit}). Upgrade to add more.` }, { status: 402 })
    }
  }

  // Get primary business profile if not specified
  let businessProfileId = parsed.data.businessProfileId
  if (!businessProfileId) {
    const { data: bp } = await supabase.from('business_profiles').select('id').eq('user_id', user.id).eq('is_primary', true).single()
    businessProfileId = bp?.id
  }

  const { data: contact, error } = await supabase.from('contacts').insert({
    user_id: user.id,
    business_profile_id: businessProfileId ?? null,
    full_name: parsed.data.fullName,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    address: parsed.data.address || null,
    postcode: parsed.data.postcode || null,
    notes: parsed.data.notes || null,
    tags: parsed.data.tags ?? [],
    source: parsed.data.source || null,
    status: 'active',
  }).select().single()

  if (error) {
    console.error('Contact create error:', error)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }

  return NextResponse.json({ contact }, { status: 201 })
}
