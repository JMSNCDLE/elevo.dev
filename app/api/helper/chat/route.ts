import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getClient, MODELS, extractText } from '@/lib/agents/client'

// POST /api/helper/chat
// Body: { message: string, conversationHistory: Array<{role: 'user'|'assistant', content: string}> }
// No credit cost — support feature

const SYSTEM_PROMPT = `You are Mira, the friendly help guide for ELEVO AI — the AI operating system for local businesses.

ELEVO AI features:
- Content tools: GBP Posts, Blog, Social Captions, Reviews, Email, SEO (all plans)
- Growth tools: Sales Proposals, Market Research, SWOT Strategy, Financial Health, HR Docs, Campaigns (Orbit+)
- Intelligence: ROAS Analysis, Financial Intelligence, Inventory, Customer Trends, Google Optimisation, Alternatives (Orbit+)
- Social & Video: Social Hub, Video Studio, ELEVO Viral™, ELEVO Creator™, ELEVO Create™, ELEVO Clip™, ELEVO SMM™ (various plans)
- Marketing: ELEVO Market™ full marketing automation (Orbit+)
- CRM: Customers, Conversations, Follow-ups (all plans)
- Ecommerce: ELEVO Drop™, Store Analytics (Galaxy only)
- Advisor: Problem Solver, Live Assistant, All Agents (various plans)
- Admin: ELEVO PA™, ELEVO Spy™, QA Suite, ELEVO Update™ (admin only)

Plans: Trial (free, 7 days) → Launch (€29.99/mo) → Orbit (€49.99/mo) → Galaxy (€79.99/mo)
Credits reset monthly. Most tools cost 1-3 credits. Problem Solver costs 2.

Answer helpfully and concisely. If you don't know something specific, guide the user to the relevant section of the dashboard or suggest they contact support.
Keep responses under 100 words unless a longer explanation is truly needed.`

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await req.json()
  const { message, conversationHistory = [], locale = 'en' } = body as {
    message: string
    conversationHistory: ConversationMessage[]
    locale?: string
  }

  if (!message?.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }

  // Build messages array from history + new message
  const messages: { role: 'user' | 'assistant'; content: string }[] = [
    // Exclude the initial assistant greeting from history to avoid confusion
    ...conversationHistory
      .filter(m => !(m.role === 'assistant' && m.content.startsWith("Hi! I'm Mira")))
      .map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ]

  try {
    const client = getClient()
    const response = await client.messages.create({
      model: MODELS.AGENT,
      max_tokens: 512,
      system: `You MUST respond entirely in ${locale === 'es' ? 'Spanish' : 'English'}. Every word must be in this language.\n\n${SYSTEM_PROMPT}`,
      messages,
    })

    const text = extractText(response)
    return NextResponse.json({ response: text })
  } catch (err) {
    console.error('[helper/chat]', err)
    return NextResponse.json(
      { error: 'AI unavailable', response: 'Sorry, I\'m having trouble right now. Please try again in a moment.' },
      { status: 500 }
    )
  }
}
