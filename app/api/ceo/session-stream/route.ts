import { createServerClient } from '@/lib/supabase/server'
import { getClient, MODELS, buildThinkingConfig, buildEffortConfig, WEB_SEARCH_TOOL } from '@/lib/agents/client'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorised', { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_used, credits_limit')
    .eq('id', user.id)
    .single()

  if (!profile || profile.plan !== 'galaxy') {
    return new Response('Galaxy plan required', { status: 403 })
  }

  const body = await request.json()
  const { question, context, decisionType, businessName } = body

  if (!question) return new Response('Question required', { status: 400 })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const client = getClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anthropicStream = (client.messages as any).stream({
          model: MODELS.ORCHESTRATOR,
          max_tokens: 8000,
          thinking: buildThinkingConfig(),
          ...buildEffortConfig('max'),
          tools: [WEB_SEARCH_TOOL],
          system: `You are the ELEVO CEO™ — an elite AI C-suite executive. You are advising ${businessName ?? 'a business'} on a ${decisionType ?? 'business'} decision. Provide deep, strategic analysis. Think through all angles carefully.`,
          messages: [
            {
              role: 'user',
              content: `Question: ${question}\n\nContext: ${context ?? ''}`,
            },
          ],
          stream: true,
        })

        for await (const event of anthropicStream) {
          if (event.type === 'content_block_delta') {
            if (event.delta.type === 'text_delta') {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              )
            }
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        console.error('Stream error:', err)
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`)
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
