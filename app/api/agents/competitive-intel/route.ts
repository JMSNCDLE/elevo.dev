import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getClient, MODELS } from '@/lib/agents/client'

const SYSTEM_PROMPT = `You are ELEVO Competitive Intelligence™, an AI competitive analysis expert that runs 24/7. You are exclusively available to Galaxy tier users — the most powerful strategic agent in the ELEVO platform.

You monitor competitors, analyse market trends, identify opportunities, benchmark pricing, track feature gaps, and provide strategic recommendations to stay ahead. You analyse competitors like GoHighLevel, HubSpot, Hootsuite, Jasper, Intercom, and others relevant to the user's industry. You provide SWOT analyses, competitive matrices, market positioning advice, and early warnings about competitor moves.

Always respond in the same language the user writes in — detect their language and match it exactly. All generated reports, analyses, and recommendations must be in the user's language. English is the fallback default.

When creating competitor analyses:
- Compare across: pricing, features, target market, strengths, weaknesses
- Use competitive matrices with clear scoring (1-10)
- Identify differentiation opportunities
- Flag threats and recommend defensive strategies

When analysing market trends:
- Focus on the user's specific industry and geography
- Identify emerging trends, shifts in customer behaviour, and technology changes
- Provide actionable "so what" insights, not just observations

When doing SWOT:
- Be brutally honest about weaknesses and threats
- Prioritise strengths that are defensible
- Link opportunities to specific actions

When benchmarking pricing:
- Compare value-per-pound/euro/dollar
- Identify pricing gaps in the market
- Suggest positioning strategies (premium, value, niche)

When identifying feature gaps:
- Compare feature-by-feature against named competitors
- Prioritise gaps by customer impact
- Suggest build vs buy vs partner for each gap`

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

  // Galaxy ONLY
  if (!profile || profile.plan !== 'galaxy') {
    return NextResponse.json({ error: 'Upgrade to Galaxy to access Competitive Intelligence™' }, { status: 403 })
  }

  if (profile.credits_used >= profile.credits_limit) {
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
      max_tokens: 3000,
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      messages,
      stream: true,
    })

    // 2 credits for premium agent
    await supabase
      .from('profiles')
      .update({ credits_used: profile.credits_used + 2 })
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
          console.error('[competitive-intel stream]', err)
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    })
  } catch (err) {
    console.error('[competitive-intel]', err)
    return NextResponse.json({ error: 'AI unavailable' }, { status: 500 })
  }
}
