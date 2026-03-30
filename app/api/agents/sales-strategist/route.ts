import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getClient, MODELS } from '@/lib/agents/client'
import { ADMIN_IDS } from '@/lib/admin'

const SYSTEM_PROMPT = `You are ELEVO Sales Strategist™, an AI sales expert that runs 24/7.

You create data-driven sales plans, build pipeline strategies, score and prioritise leads, optimise conversion funnels, generate outreach templates (cold email, follow-up, closing), and provide actionable sales insights. You speak with authority and back recommendations with reasoning.

When generating plans or templates, use clear formatting:
- Use **bold** for headings and key points
- Use numbered lists for step-by-step processes
- Use bullet points for quick tips
- Include specific metrics, timelines, and KPIs where relevant

When scoring leads, use a 1-100 scale and explain each factor.
When creating outreach templates, include subject lines, opening hooks, value propositions, and clear CTAs.
When building pipeline strategies, define stages, conversion targets, and follow-up cadences.

Always tailor advice to the user's business context when provided. Be specific, not generic.`

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Check plan — Orbit+ only
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_used, credits_limit')
    .eq('id', user.id)
    .single()

  if (!ADMIN_IDS.includes(user.id) && (!profile || (profile.plan !== 'orbit' && profile.plan !== 'galaxy'))) {
    return NextResponse.json({ error: 'Upgrade to Orbit to access Sales Strategist™' }, { status: 403 })
  }

  // Check credits
  if (!ADMIN_IDS.includes(user.id) && profile && (profile ?? { credits_used: 0 }).credits_used >= (profile ?? { credits_limit: 9999 }).credits_limit) {
    return NextResponse.json({ error: 'No credits remaining' }, { status: 403 })
  }

  const body = await req.json()
  const { message, conversationHistory = [] } = body as {
    message: string
    conversationHistory: ConversationMessage[]
  }

  if (!message?.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }

  // Get business context
  const { data: bp } = await supabase
    .from('business_profiles')
    .select('business_name, industry, city, country, unique_selling_points')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .single()

  const contextBlock = bp
    ? `\nUser's business: ${bp.business_name} (${bp.industry}, ${bp.city}${bp.country ? ', ' + bp.country : ''}). USPs: ${(bp.unique_selling_points ?? []).join(', ') || 'Not specified'}.`
    : ''

  const messages: { role: 'user' | 'assistant'; content: string }[] = [
    ...conversationHistory
      .filter((m: ConversationMessage) => !(m.role === 'assistant' && m.content.startsWith("Hi! I'm")))
      .map((m: ConversationMessage) => ({ role: m.role, content: m.content })),
    { role: 'user', content: `${contextBlock}\n\n${message}` },
  ]

  try {
    const client = getClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = await (client.messages as any).create({
      model: MODELS.AGENT,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages,
      stream: true,
    })

    // Deduct 1 credit
    await supabase
      .from('profiles')
      .update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + 1 })
      .eq('id', user.id)

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          controller.close()
        } catch (err) {
          console.error('[sales-strategist stream]', err)
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    })
  } catch (err) {
    console.error('[sales-strategist]', err)
    return NextResponse.json({ error: 'AI unavailable' }, { status: 500 })
  }
}
