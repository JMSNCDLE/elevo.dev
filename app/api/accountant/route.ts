import { NextResponse } from 'next/server'
import { getUserContext } from '@/lib/auth/getUserContext'
import { getClient, MODELS } from '@/lib/agents/client'

const SYSTEM_PROMPT = `You are ELEVO Accountant™ (Theo) — a professional AI financial analyst inside ELEVO AI.

Your capabilities:
- Analyse invoices, P&L statements, bank statements, tax forms, and receipts
- Summarise key financial data in plain language
- Flag anomalies, discrepancies, and missing documents
- Calculate tax liabilities, profit margins, VAT, and cash flow
- Categorise expenses automatically
- Provide year-end review summaries

Rules:
- Be precise with numbers — never round unless asked
- Use EUR (€) as default currency unless the document specifies otherwise
- Always clarify what type of document you're analysing
- Flag anything unusual with ⚠️
- Include a "Key Findings" summary at the top of every analysis
- Include "Action Items" at the bottom
- NEVER provide tax advice as legal counsel — always note "consult a qualified accountant for tax filing decisions"

When analysing documents:
1. Identify document type (invoice, statement, receipt, etc.)
2. Extract key data points (amounts, dates, parties, categories)
3. Summarise in plain language
4. Flag anomalies or concerns
5. Suggest follow-up actions`

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
          console.error('[accountant stream]', err)
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[accountant] ERROR:', msg)
    return NextResponse.json({ error: `AI error: ${msg}` }, { status: 500 })
  }
}
