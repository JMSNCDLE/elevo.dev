import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { buildConversationFlow } from '@/lib/agents/conversationAgent'
import type { ConversationFlow } from '@/lib/agents/conversationAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  flow: z.record(z.unknown()),
  locale: z.string().min(2),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan, credits_used, credits_limit').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (profile.plan !== 'orbit' && profile.plan !== 'galaxy') return NextResponse.json({ error: 'Orbit plan required' }, { status: 403 })
  if (profile.credits_used >= profile.credits_limit) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { data: bp } = await supabase.from('business_profiles').select('*').eq('id', parsed.data.businessProfileId).eq('user_id', user.id).single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  try {
    const flow = parsed.data.flow as unknown as ConversationFlow
    const result = await buildConversationFlow(flow)

    await supabase.from('campaigns').insert({
      user_id: user.id,
      business_profile_id: bp.id,
      name: flow.name,
      type: 'conversation_flow',
      segment: flow.triggerType,
      message: JSON.stringify(result),
      status: 'draft',
    })
    await supabase.from('profiles').update({ credits_used: profile.credits_used + 2 }).eq('id', user.id)

    return NextResponse.json({ result })
  } catch (err) {
    console.error('Conversation flow agent error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
