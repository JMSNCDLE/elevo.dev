import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { generateWebsiteChanges } from '@/lib/agents/websiteEditorAgent'
import type { WebsiteAuditResult } from '@/lib/agents/websiteEditorAgent'

const Schema = z.object({
  sessionId: z.string().uuid(),
  audit: z.any(),
  priorities: z.array(z.string()).default(['seo', 'conversion']),
  locale: z.string().default('en'),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const { sessionId, audit, priorities, locale } = parsed.data

  // Verify session belongs to user
  const { data: session } = await supabase
    .from('website_sessions')
    .select('user_id')
    .eq('id', sessionId)
    .single()

  if (!session || session.user_id !== user.id) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // Get business profile
  const { data: bp } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  try {
    const changes = await generateWebsiteChanges(audit as WebsiteAuditResult, bp, priorities, locale)

    // Save changes to DB
    const rows = changes.map(c => ({
      user_id: user.id,
      session_id: sessionId,
      page_url: c.pageUrl,
      change_type: c.changeType,
      current_content: c.currentContent ?? null,
      proposed_content: c.proposedContent,
      reason: c.reason,
      priority: c.priority,
      estimated_impact: c.estimatedImpact,
      status: 'pending',
    }))

    await supabase.from('website_changes').insert(rows)

    return NextResponse.json({ changes })
  } catch (err) {
    console.error('Website changes error:', err)
    return NextResponse.json({ error: 'Failed to generate changes. Please try again.' }, { status: 500 })
  }
}
