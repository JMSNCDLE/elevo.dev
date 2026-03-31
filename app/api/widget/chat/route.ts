import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { getClient, MODELS, MAX_TOKENS, extractText } from '@/lib/agents/client'

const Schema = z.object({
  widgetId: z.string().uuid(),
  message: z.string().min(1).max(1000),
  sessionId: z.string().uuid().optional().nullable(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).default([]),
  locale: z.string().default('en'),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { widgetId, message, sessionId, history, locale } = parsed.data

  const supabase = await createServiceClient()

  // Load widget config
  const { data: widget } = await supabase
    .from('widgets')
    .select('id, user_id, active, greeting')
    .eq('id', widgetId)
    .single()

  if (!widget || !widget.active) {
    return NextResponse.json({ error: 'Widget not found or inactive' }, { status: 404 })
  }

  // Load business profile for context
  const { data: bp } = await supabase
    .from('business_profiles')
    .select('name, category, city, country, services, description')
    .eq('user_id', widget.user_id)
    .single()

  const businessContext = bp
    ? `You represent ${bp.name}, a ${bp.category} business in ${bp.city}, ${bp.country}. Services: ${Array.isArray(bp.services) ? (bp.services as string[]).join(', ') : bp.services}. ${bp.description ?? ''}`
    : 'You are a helpful business assistant.'

  // Get or create session
  let currentSessionId = sessionId

  if (!currentSessionId) {
    const { data: newSession } = await supabase
      .from('widget_sessions')
      .insert({ widget_id: widgetId, messages: [] })
      .select('id')
      .single()
    currentSessionId = newSession?.id ?? null
  }

  const client = getClient()

  try {
    // Build message history (limit to last 10 turns)
    const recentHistory = history.slice(-10)
    const messages = [
      ...recentHistory,
      { role: 'user' as const, content: message },
    ]

    const response = await client.messages.create({
      model: MODELS.AGENT,
      max_tokens: MAX_TOKENS.LOW,
      system: `You MUST respond entirely in ${locale === 'es' ? 'Spanish' : 'English'}. Every word must be in this language.\n\n${businessContext}\n\nYou are a friendly, helpful chat assistant for this business. Answer questions about services, pricing (if known), and general enquiries. If you don't know something specific, offer to connect the visitor with the team. Keep responses concise (2-4 sentences max). Never make up specific prices or appointments.`,
      messages,
    })

    const reply = extractText(response)

    // Update session with new messages
    if (currentSessionId) {
      const updatedMessages = [
        ...recentHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: reply },
      ]

      await supabase
        .from('widget_sessions')
        .update({ messages: updatedMessages })
        .eq('id', currentSessionId)

      // Increment widget session count (ignore if RPC doesn't exist)
      void supabase.rpc('increment_widget_sessions', { widget_id: widgetId })
    }

    return NextResponse.json({ reply, sessionId: currentSessionId })
  } catch (err) {
    console.error('Widget chat error:', err)
    return NextResponse.json({ reply: 'Sorry, I\'m having trouble right now. Please try again shortly.' })
  }
}
