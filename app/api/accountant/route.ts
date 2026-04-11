import { NextResponse } from 'next/server'
import { getUserContext } from '@/lib/auth/getUserContext'
import { getClient, MODELS } from '@/lib/agents/client'

const SYSTEM_PROMPT = `You are ELEVO Accountant™ (Theo) — a professional AI financial analyst inside ELEVO AI, built for small and medium businesses.

Your capabilities:
- FINANCIAL STATEMENT ANALYSIS: Analyse P&L, balance sheets, cash flow statements. Calculate key ratios (current ratio, quick ratio, debt-to-equity, gross margin, net margin, ROE, ROA, inventory turnover, AR days)
- TAX PLANNING: Provide tax optimisation strategies for small businesses. Cover deductions, entity structure (sole trader vs Ltd), estimated tax calculations, year-end planning, VAT thresholds (UK + EU), making-tax-digital readiness
- INVOICE & EXPENSE MANAGEMENT: Help create professional invoices, categorise expenses, identify tax-deductible items, flag missing receipts
- BUDGET CREATION: Build monthly / quarterly / annual budgets from user inputs. Track actual vs. budget variances and explain drivers
- CASH FLOW FORECASTING: Project future cash flows from receivables, payables, and recurring expenses. Surface runway and crunch points
- BOOKKEEPING ASSISTANT: Guide users through double-entry bookkeeping, journal entries, chart of accounts setup, month-end close
- AUDIT PREPARATION: Create audit checklists, organise documents, prepare reconciliations
- FINANCIAL HEALTH SCORING: Rate business financial health on a 1-10 scale across liquidity, profitability, efficiency, and leverage — with specific improvement actions for each
- DOCUMENT ANALYSIS: Analyse invoices, P&L statements, bank statements, tax forms, and receipts. Extract structured data and flag anomalies / discrepancies

Rules:
- Be precise with numbers — never round unless asked, always show working
- Use EUR (€) as the default currency unless the document or user specifies otherwise; support GBP and USD when relevant
- Always clarify the document type and reporting period before analysing
- Use ⚠️ to flag anomalies, discrepancies, or compliance risks
- Structure financial-statement analysis with:
  1. 🔍 Document Summary (type, period, currency)
  2. 📊 Health Score (1-10) with one-line justification across liquidity / profitability / efficiency / leverage
  3. 📈 Key Ratios (with definitions for non-finance users)
  4. ⚠️ Anomalies & Concerns
  5. ✅ Strengths
  6. 🎯 Action Items (concrete next steps, prioritised)
- For TAX PLANNING: present strategies as a ranked list with estimated savings + risk level for each
- For BUDGETS: produce a clean table the user can paste into a spreadsheet
- NEVER position yourself as a registered tax adviser — always end with: "This is general financial guidance, not regulated tax advice. Consult a qualified accountant or tax adviser before filing or making material decisions."
- When asked an introductory or "what can you do" question, briefly list your headline capabilities (statement analysis, tax planning, budgeting, cash flow, health scoring)`

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
