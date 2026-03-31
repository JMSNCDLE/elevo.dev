import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getClient, MODELS } from '@/lib/agents/client'
import { ADMIN_IDS } from '@/lib/admin'

const SYSTEM_PROMPT = `You are ELEVO Marketing Planner™, an AI marketing strategist that runs 24/7.

You create comprehensive marketing strategies, content calendars, social media plans, ad campaign blueprints (Meta, Google, TikTok), SEO strategies, email marketing sequences, growth hacking playbooks, and budget allocation recommendations. You tailor everything to the user's specific business, audience, and budget.

When generating plans:
- Use **bold** headings and clear structure
- Include specific dates, channels, and budgets where relevant
- For content calendars, use a week-by-week or day-by-day format
- For ad campaigns, specify platform, audience, budget split, creative direction, and KPIs
- For SEO, include target keywords, content topics, and link building tactics
- For email sequences, provide subject lines, send timing, and content outlines
- Always include measurable goals and success metrics

Be specific to the user's industry and location. Avoid generic advice.`

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_used, credits_limit')
    .eq('id', user.id)
    .single()

  if (!ADMIN_IDS.includes(user.id) && (!profile || (profile.plan !== 'orbit' && profile.plan !== 'galaxy'))) {
    return NextResponse.json({ error: 'Upgrade to Orbit to access Marketing Planner™' }, { status: 403 })
  }

  if (!ADMIN_IDS.includes(user.id) && profile && (profile ?? { credits_used: 0 }).credits_used >= (profile ?? { credits_limit: 9999 }).credits_limit) {
    return NextResponse.json({ error: 'No credits remaining' }, { status: 403 })
  }

  const body = await req.json()
  const { message, conversationHistory = [], locale = 'en' } = body as {
    message: string
    conversationHistory: ConversationMessage[]
    locale?: string
  }

  if (!message?.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }

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
      .filter((m: ConversationMessage) => !(m.role === 'assistant' && m.content.startsWith("I'm ELEVO")))
      .map((m: ConversationMessage) => ({ role: m.role, content: m.content })),
    { role: 'user', content: `${contextBlock}\n\n${message}` },
  ]

  try {
    const client = getClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = await (client.messages as any).create({
      model: MODELS.AGENT,
      max_tokens: 2048,
      system: `You MUST respond entirely in ${locale === 'es' ? 'Spanish' : 'English'}. Every word must be in this language.\n\n${SYSTEM_PROMPT}`,
      messages,
      stream: true,
    })

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
          console.error('[marketing-planner stream]', err)
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    })
  } catch (err) {
    console.error('[marketing-planner]', err)
    return NextResponse.json({ error: 'AI unavailable' }, { status: 500 })
  }
}
