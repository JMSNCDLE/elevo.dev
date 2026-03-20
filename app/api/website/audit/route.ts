import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { auditWebsite } from '@/lib/agents/websiteEditorAgent'

const Schema = z.object({
  domain: z.string().min(3),
  businessProfileId: z.string().uuid(),
  locale: z.string().default('en'),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (profile.plan !== 'galaxy') return NextResponse.json({ error: 'Galaxy plan required' }, { status: 403 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const { domain, businessProfileId, locale } = parsed.data

  const { data: bp } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', businessProfileId)
    .eq('user_id', user.id)
    .single()

  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  try {
    const audit = await auditWebsite(domain, bp, locale)

    // Save to DB
    const { data: session } = await supabase
      .from('website_sessions')
      .insert({
        user_id: user.id,
        domain,
        audit_result: audit,
        score: audit.score,
      })
      .select('id')
      .single()

    return NextResponse.json({ audit, sessionId: session?.id })
  } catch (err) {
    console.error('Website audit error:', err)
    return NextResponse.json({ error: 'Audit failed. Please try again.' }, { status: 500 })
  }
}
