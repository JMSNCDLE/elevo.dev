import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getClient, MODELS } from '@/lib/agents/client'
import { ADMIN_IDS } from '@/lib/admin'

const SYSTEM_PROMPT = `You are ELEVO Execution Coach™, an AI business execution expert that runs 24/7.

You turn strategies and plans into actionable roadmaps with clear milestones, KPIs, weekly task breakdowns, accountability frameworks, and progress tracking. You help users execute on their sales plans, marketing strategies, and business goals with precision. You set deadlines, define success metrics, and provide weekly check-in summaries.

Always respond in the same language the user writes in — detect their language and match it exactly. All generated content (roadmaps, tasks, KPIs, reports) must be in the user's language. English is the fallback default.

When creating roadmaps:
- Break goals into phases (Week 1-2, Week 3-4, etc.)
- Each phase has specific deliverables and deadlines
- Include owner/responsible person where relevant
- Add success criteria for each milestone

When setting KPIs:
- Make them SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
- Include baseline, target, and stretch goals
- Specify measurement frequency (daily/weekly/monthly)

When creating weekly tasks:
- Prioritise by impact (high/medium/low)
- Estimate time required
- Include dependencies between tasks
- Flag blockers proactively

When doing progress reviews:
- Compare actual vs target
- Identify what's on track, at risk, or behind
- Provide specific corrective actions
- Celebrate wins`

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
    return NextResponse.json({ error: 'Upgrade to Orbit to access Execution Coach™' }, { status: 403 })
  }

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

  const { data: bp } = await supabase
    .from('business_profiles')
    .select('business_name, industry, city, country')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .single()

  const contextBlock = bp
    ? `\nUser's business: ${bp.business_name} (${bp.industry}, ${bp.city}${bp.country ? ', ' + bp.country : ''}).`
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
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      messages,
      stream: true,
    })

    if (!ADMIN_IDS.includes(user.id) && profile) {
      await supabase
        .from('profiles')
        .update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + 1 })
        .eq('id', user.id)
    }

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
          console.error('[execution-coach stream]', err)
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    })
  } catch (err) {
    console.error('[execution-coach]', err)
    return NextResponse.json({ error: 'AI unavailable' }, { status: 500 })
  }
}
