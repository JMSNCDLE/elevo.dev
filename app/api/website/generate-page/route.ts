import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { generatePageContent } from '@/lib/agents/websiteEditorAgent'

const Schema = z.object({
  pageType: z.enum(['home', 'about', 'services', 'contact', 'faq']),
  businessProfileId: z.string().uuid(),
  params: z.record(z.string()).default({}),
  locale: z.string().default('en'),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const { pageType, businessProfileId, params, locale } = parsed.data

  const { data: bp } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', businessProfileId)
    .eq('user_id', user.id)
    .single()

  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  try {
    const content = await generatePageContent(pageType, bp, params, locale)
    return NextResponse.json({ content })
  } catch (err) {
    console.error('Page generation error:', err)
    return NextResponse.json({ error: 'Generation failed. Please try again.' }, { status: 500 })
  }
}
