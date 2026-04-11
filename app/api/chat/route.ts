import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { ADMIN_IDS } from '@/lib/admin'
import { processConversationalTask } from '@/lib/agents/conversationalTaskAgent'
import type { BusinessProfile } from '@/lib/agents/types'
import type { TaskMessage } from '@/lib/agents/conversationalTaskAgent'

const ChatSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationHistory: z.array(z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.string(),
    action: z.object({
      type: z.string(),
      result: z.unknown().optional(),
      status: z.string(),
      agentUsed: z.string().optional(),
      creditsUsed: z.number().optional(),
    }).optional(),
    contentCard: z.object({
      type: z.string(),
      content: z.string(),
      copyable: z.boolean(),
      schedulable: z.boolean(),
    }).optional(),
    dataCard: z.object({
      type: z.string(),
      data: z.unknown(),
    }).optional(),
  })).optional().default([]),
  businessProfileId: z.string().uuid().optional().nullable(),
  locale: z.string().min(2).default('en'),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = ChatSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  // Credit check — 1 credit per message
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_used, credits_limit, plan')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  if (!ADMIN_IDS.includes(user.id) && (profile ?? { credits_used: 0 }).credits_used >= (profile ?? { credits_limit: 9999 }).credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits. Please upgrade your plan.' }, { status: 402 })
  }

  // Get business profile
  let bp: BusinessProfile | null = null
  if (parsed.data.businessProfileId) {
    const { data } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('id', parsed.data.businessProfileId)
      .eq('user_id', user.id)
      .single()
    bp = data as BusinessProfile
  }

  if (!bp) {
    const { data } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()
    bp = data as BusinessProfile
  }

  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  // Get or create the persistent conversation row for this user × ELEVO chat
  const AGENT_TYPE = 'elevo-chat'
  let conversationId: string | null = null
  const { data: existingConv } = await supabase
    .from('conversations')
    .select('id')
    .eq('user_id', user.id)
    .eq('agent_type', AGENT_TYPE)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingConv?.id) {
    conversationId = existingConv.id
  } else {
    const { data: newConv } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, agent_type: AGENT_TYPE, title: parsed.data.message.slice(0, 80) })
      .select('id')
      .single()
    conversationId = newConv?.id ?? null
  }

  // Persist the user message first — so even if the agent crashes, history is preserved
  if (conversationId) {
    await supabase.from('conversation_messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: parsed.data.message,
    })
  }

  // Process the conversational task
  try {
    const result = await processConversationalTask(parsed.data.message, {
      businessProfile: bp,
      recentMessages: parsed.data.conversationHistory as TaskMessage[],
      availableCredits: (profile ?? { credits_limit: 9999 }).credits_limit - (profile ?? { credits_used: 0 }).credits_used,
      plan: profile.plan,
      locale: parsed.data.locale,
    })

    // Save assistant response BEFORE deducting credits — never charge for lost output
    if (conversationId) {
      await supabase.from('conversation_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: result.reply,
        credits_used: 1,
      })
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)
    }

    // Atomic credit deduction with audit trail (RPC, only deducts if save succeeded)
    if (!ADMIN_IDS.includes(user.id)) {
      await supabase.rpc('deduct_credits', {
        p_user_id: user.id,
        p_amount: 1,
        p_agent_type: AGENT_TYPE,
        p_conversation_id: conversationId,
        p_description: result.action?.agentUsed ?? 'ELEVO chat',
      })
    }

    // Track analytics event (best-effort, non-blocking on failure)
    await supabase.from('analytics_events').insert({
      user_id: user.id,
      business_profile_id: bp.id,
      event_type: 'agent_chat',
      agent_name: result.action?.agentUsed ?? 'ELEVO',
      feature: 'chat',
      metadata: { intent: result.action?.type ?? 'general', conversation_id: conversationId },
    })

    return NextResponse.json({
      reply: result.reply,
      action: result.action,
      contentCard: result.contentCard,
      dataCard: result.dataCard,
      followUpSuggestions: result.followUpSuggestions,
      conversationId,
      creditsRemaining: (profile ?? { credits_limit: 9999 }).credits_limit - (profile ?? { credits_used: 0 }).credits_used - 1,
    })
  } catch (err) {
    console.error('Chat error:', err)
    // No credit deduction on failure
    return NextResponse.json({ error: 'Failed to process your message. No credits were used.' }, { status: 500 })
  }
}
