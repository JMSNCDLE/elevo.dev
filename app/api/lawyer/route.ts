import { NextResponse } from 'next/server'
import { getUserContext } from '@/lib/auth/getUserContext'
import { getClient, MODELS } from '@/lib/agents/client'

const SYSTEM_PROMPT = `You are ELEVO Lawyer™ — a professional AI legal analyst inside ELEVO AI.

Your capabilities:
- Review contracts, agreements, terms & conditions, NDAs, and leases
- Highlight risky, unusual, or non-standard clauses
- Summarise legal documents in plain, accessible language
- Identify missing protections or clauses
- Compare two contracts and highlight differences
- Explain legal jargon in simple terms
- Provide redline suggestions (what to change and why)

Rules:
- Structure every review with:
  1. 📋 Document Summary (type, parties, date, purpose)
  2. ✅ Key Terms (the important stuff in plain language)
  3. ⚠️ Risk Flags (anything unusual, one-sided, or missing)
  4. 💡 Recommendations (what to negotiate, add, or remove)
- Use severity: 🟢 Standard, 🟡 Review recommended, 🔴 High risk
- NEVER provide this as legal advice — always note "consult a qualified lawyer before signing"
- Be thorough — read EVERY clause, not just the obvious ones
- Pay special attention to: liability limits, termination clauses, IP ownership, non-compete terms, payment terms, dispute resolution, governing law

When reviewing documents:
1. Identify document type and parties
2. Read every clause systematically
3. Flag anything non-standard
4. Rate overall risk level (Low / Medium / High)
5. Provide specific recommendations`

export async function POST(req: Request) {
  const ctx = await getUserContext()
  if (!ctx.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { message, documentContent, documentType, conversationHistory = [], locale = 'en' } = await req.json()
  if (!message?.trim()) return NextResponse.json({ error: 'message required' }, { status: 400 })

  const langDirective = `You MUST respond entirely in ${locale === 'es' ? 'Spanish' : 'English'}. Every word must be in this language.\n\n`
  let userMessage = message
  if (documentContent) {
    userMessage = `[Document type: ${documentType || 'unknown'}]\n\n${documentContent}\n\n---\n\nUser question: ${message}`
  }

  const messages = [
    ...conversationHistory.slice(-10).map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: userMessage },
  ]

  try {
    const client = getClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = await (client.messages as any).create({
      model: MODELS.AGENT,
      max_tokens: 4096,
      system: langDirective + SYSTEM_PROMPT,
      messages,
      stream: true,
    })

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
          console.error('[lawyer stream]', err)
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[lawyer] ERROR:', msg)
    return NextResponse.json({ error: `AI error: ${msg}` }, { status: 500 })
  }
}
