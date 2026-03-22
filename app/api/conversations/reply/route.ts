import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleIncomingMessage, type ConversationContext } from '@/lib/agents/crmConversationAgent'
import type { BusinessProfile, Contact } from '@/lib/agents/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { conversationId, incomingMessage, sendReply } = body as {
    conversationId: string
    incomingMessage: string
    sendReply?: boolean
  }

  if (!conversationId || !incomingMessage) {
    return NextResponse.json({ error: 'conversationId and incomingMessage required' }, { status: 400 })
  }

  // Load conversation
  const { data: conv } = await supabase
    .from('live_conversations')
    .select('*, contacts(*), business_profiles(*)')
    .eq('id', conversationId)
    .eq('user_id', user.id)
    .single()

  if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

  // Load business profile
  const { data: bp } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .single()

  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  const context: ConversationContext = {
    businessProfile: bp as BusinessProfile,
    contact: conv.contacts as Contact | undefined,
    platform: conv.platform,
    channel: conv.channel,
    conversationHistory: (conv.messages ?? []) as Array<{ role: 'user' | 'assistant'; content: string }>,
    intent: conv.intent ?? undefined,
    locale: 'en',
  }

  const reply = await handleIncomingMessage(incomingMessage, context)

  // Update messages in DB
  const newMessages = [
    ...(conv.messages ?? []),
    { role: 'user', content: incomingMessage, ts: new Date().toISOString() },
    { role: 'assistant', content: reply.message, ts: new Date().toISOString() },
  ]

  await supabase
    .from('live_conversations')
    .update({
      messages: newMessages,
      intent: reply.intent,
      sentiment: reply.sentiment,
      last_message_at: new Date().toISOString(),
      status: reply.shouldEscalate ? 'escalated' : conv.status,
      conversion_achieved: reply.conversionAchieved || conv.conversion_achieved,
      conversion_type: reply.conversionType ?? conv.conversion_type,
    })
    .eq('id', conversationId)

  // 8E: Auto-upsert contact if Sage collected info
  if (reply.crm_updates && Object.keys(reply.crm_updates).length > 0) {
    const updates = reply.crm_updates

    if (conv.contact_id) {
      // Update existing contact
      await supabase
        .from('contacts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', conv.contact_id)
    } else if (updates.full_name || updates.email || updates.phone) {
      // Create new contact
      const { data: newContact } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          business_profile_id: bp.id,
          full_name: updates.full_name ?? 'Unknown',
          email: updates.email,
          phone: updates.phone,
          source: `${conv.platform}_${conv.channel}`,
          tags: [conv.platform, 'social_lead'],
          status: 'active',
          total_jobs: 0,
          total_revenue: 0,
        })
        .select('id')
        .single()

      if (newContact) {
        await supabase
          .from('live_conversations')
          .update({ contact_id: newContact.id })
          .eq('id', conversationId)
      }
    }

    // Track lead_captured_social analytics
    void supabase.from('analytics_events').insert({
      user_id: user.id,
      business_profile_id: bp.id,
      event_type: 'contact_added',
      feature: 'conversation_crm',
      metadata: { platform: conv.platform, channel: conv.channel, source: 'sage_conversation' },
    })
  }

  // Track conversion
  if (reply.conversionAchieved) {
    void supabase.from('analytics_events').insert({
      user_id: user.id,
      business_profile_id: bp.id,
      event_type: 'feature_used',
      feature: 'conversation_conversion',
      metadata: { conversionType: reply.conversionType, platform: conv.platform },
    })
  }

  return NextResponse.json({ reply, sendReply: sendReply ?? false })
}
