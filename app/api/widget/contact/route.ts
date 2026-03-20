import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const Schema = z.object({
  widgetId: z.string().uuid(),
  sessionId: z.string().uuid().optional().nullable(),
  visitorName: z.string().min(1).max(100).optional(),
  visitorEmail: z.string().email().optional(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { widgetId, sessionId, visitorName, visitorEmail } = parsed.data

  const supabase = await createServiceClient()

  // Verify widget exists
  const { data: widget } = await supabase
    .from('widgets')
    .select('id, user_id, active')
    .eq('id', widgetId)
    .single()

  if (!widget || !widget.active) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 })
  }

  if (sessionId) {
    // Update existing session with contact info
    await supabase
      .from('widget_sessions')
      .update({
        visitor_name: visitorName ?? null,
        visitor_email: visitorEmail ?? null,
      })
      .eq('id', sessionId)
  } else {
    // Create new session
    await supabase.from('widget_sessions').insert({
      widget_id: widgetId,
      visitor_name: visitorName ?? null,
      visitor_email: visitorEmail ?? null,
      messages: [],
    })
  }

  // Also add to CRM contacts if email provided
  if (visitorEmail) {
    const existing = await supabase
      .from('crm_contacts')
      .select('id')
      .eq('user_id', widget.user_id)
      .eq('email', visitorEmail)
      .single()

    if (!existing.data) {
      await supabase.from('crm_contacts').insert({
        user_id: widget.user_id,
        full_name: visitorName ?? 'Widget Visitor',
        email: visitorEmail,
        notes: 'Added via website widget',
        source: 'widget',
      })
    }
  }

  return NextResponse.json({ success: true })
}
