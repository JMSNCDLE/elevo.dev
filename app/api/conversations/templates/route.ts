import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateTemplateLibrary } from '@/lib/agents/crmConversationAgent'
import type { BusinessProfile } from '@/lib/agents/types'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const businessProfileId = searchParams.get('businessProfileId')

  let query = supabase
    .from('conversation_templates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)
  if (businessProfileId) query = query.eq('business_profile_id', businessProfileId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ templates: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { businessProfileId, category, locale } = body as {
    businessProfileId: string
    category: string
    locale?: string
  }

  if (!businessProfileId || !category) {
    return NextResponse.json({ error: 'businessProfileId and category required' }, { status: 400 })
  }

  const { data: bp } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', businessProfileId)
    .eq('user_id', user.id)
    .single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  const generatedTemplates = await generateTemplateLibrary(
    bp as BusinessProfile,
    category,
    locale ?? 'en'
  )

  const toInsert = generatedTemplates.map(t => ({
    user_id: user.id,
    business_profile_id: businessProfileId,
    name: t.name,
    category: t.category ?? category,
    platform: t.platform ?? null,
    message: t.message,
    quick_replies: t.quickReplies ?? [],
    variables: t.variables ?? [],
  }))

  const { data: saved, error } = await supabase
    .from('conversation_templates')
    .insert(toInsert)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ templates: saved })
}
