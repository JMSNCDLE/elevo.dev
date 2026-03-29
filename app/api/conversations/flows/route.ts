import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { buildConversationFlow } from '@/lib/agents/crmConversationAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const buildSchema = z.object({
  businessProfileId: z.string().uuid(),
  params: z.object({
    triggerType: z.string(),
    platform: z.string(),
    channel: z.string(),
    objective: z.string(),
    locale: z.string().default('en'),
  }),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('conversation_flows')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ flows: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = buildSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { businessProfileId, params } = parsed.data

  const { data: bp } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', businessProfileId)
    .eq('user_id', user.id)
    .single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  const flow = await buildConversationFlow({
    businessProfile: bp as BusinessProfile,
    triggerType: params.triggerType,
    platform: params.platform,
    channel: params.channel,
    objective: params.objective,
    locale: params.locale,
  })

  const { data: saved, error } = await supabase
    .from('conversation_flows')
    .insert({
      user_id: user.id,
      business_profile_id: businessProfileId,
      name: flow.flowName,
      trigger_type: params.triggerType,
      trigger_config: { keywords: flow.triggerKeywords ?? [] },
      platform: params.platform,
      channel: params.channel,
      flow_steps: flow.steps,
      is_active: false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ flow: saved, generatedFlow: flow })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, is_active } = body as { id: string; is_active: boolean }

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabase
    .from('conversation_flows')
    .update({ is_active })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
