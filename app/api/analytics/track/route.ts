import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { createServerClient } from '@/lib/supabase/server'

const TrackSchema = z.object({
  businessProfileId: z.string().uuid().optional(),
  eventType: z.enum([
    'page_view', 'session_start', 'session_end',
    'content_generated', 'roas_viewed', 'problem_solved',
    'contact_added', 'review_requested', 'campaign_sent',
    'upgrade_clicked', 'feature_used', 'agent_chat',
  ]),
  page: z.string().optional(),
  agentName: z.string().optional(),
  feature: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = TrackSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false }, { status: 400 })
    }

    // Try to get user from session (optional — analytics can be unauthenticated)
    let userId: string | null = null
    try {
      const supabase = await createServerClient()
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id ?? null
    } catch {
      // No session — fire-and-forget still works
    }

    const serviceClient = await createServiceClient()

    await serviceClient.from('analytics_events').insert({
      business_profile_id: parsed.data.businessProfileId ?? null,
      user_id: userId,
      event_type: parsed.data.eventType,
      page: parsed.data.page ?? null,
      agent_name: parsed.data.agentName ?? null,
      feature: parsed.data.feature ?? null,
      metadata: parsed.data.metadata ?? {},
    })

    return NextResponse.json({ success: true })
  } catch {
    // Never block the UI — silently succeed
    return NextResponse.json({ success: true })
  }
}
