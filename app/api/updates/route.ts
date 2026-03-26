import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceClient } from '@/lib/supabase/server'

const ADMIN_USER_ID = '5dc15dea-4633-441b-b37a-5406e7235114'

// GET — public: list published updates
export async function GET() {
  const admin = await createServiceClient()
  const { data, error } = await admin
    .from('platform_updates')
    .select('id, title, description, category, version, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ updates: data })
}

// POST — admin only: create a new update
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, description, category, version } = await req.json()
  if (!title || !description) {
    return NextResponse.json({ error: 'title and description required' }, { status: 400 })
  }

  const admin = await createServiceClient()
  const { data, error } = await admin
    .from('platform_updates')
    .insert({
      title,
      description,
      category: category || 'improvement',
      version: version || null,
      is_published: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ update: data })
}
