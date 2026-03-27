import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { validateApiKey } from '@/lib/api-auth'
import { createMessage, MODELS, MAX_TOKENS, extractText } from '@/lib/agents/client'

const AVAILABLE_AGENTS = [
  'content', 'strategy', 'research', 'sales', 'financial',
  'management', 'campaign', 'crm', 'assistant',
] as const

const Schema = z.object({
  agent: z.enum(AVAILABLE_AGENTS),
  prompt: z.string().min(1).max(5000),
  businessProfileId: z.string().uuid().optional(),
  context: z.record(z.unknown()).optional(),
})

const AGENT_DESCRIPTIONS: Record<string, string> = {
  content: 'Content writer for blogs, social, GBP posts, emails, SEO',
  strategy: 'SWOT analysis and business strategy',
  research: 'Market research with web search',
  sales: 'Sales proposals and pitch decks',
  financial: 'Financial health analysis',
  management: 'HR documents and management',
  campaign: 'Marketing campaign planning',
  crm: 'CRM briefings and customer messages',
  assistant: 'General business assistant',
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization') ?? ''
  const apiKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

  const { valid, userId } = await validateApiKey(apiKey)
  if (!valid || !userId) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const { agent, prompt, businessProfileId, context } = parsed.data

  const supabase = await createServiceClient()

  // Credit check
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_used, credits_limit')
    .eq('id', userId)
    .single()

  if (!profile || profile.credits_used >= profile.credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  let businessContext = ''
  if (businessProfileId) {
    const { data: bp } = await supabase
      .from('business_profiles')
      .select('name, category, city, country, services, description')
      .eq('id', businessProfileId)
      .eq('user_id', userId)
      .single()

    if (bp) {
      businessContext = `\n\nBusiness context: ${bp.name}, ${bp.category} in ${bp.city}, ${bp.country}. Services: ${Array.isArray(bp.services) ? (bp.services as string[]).join(', ') : bp.services}.`
    }
  }

  try {
    const response = await createMessage({
      model: MODELS.AGENT,
      max_tokens: MAX_TOKENS.HIGH,
      thinking: { type: 'adaptive' },
      system: `You are ELEVO AI's ${agent} agent. ${AGENT_DESCRIPTIONS[agent]}. You help small business owners with expert, actionable advice.${businessContext}`,
      messages: [
        {
          role: 'user',
          content: context ? `${prompt}\n\nAdditional context: ${JSON.stringify(context)}` : prompt,
        },
      ],
    })

    const result = extractText(response)

    await supabase.from('profiles').update({ credits_used: profile.credits_used + 1 }).eq('id', userId)

    return NextResponse.json({ agent, result })
  } catch (err) {
    console.error('v1 agent error:', err)
    return NextResponse.json({ error: 'Agent call failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    agents: AVAILABLE_AGENTS.map(name => ({
      name,
      description: AGENT_DESCRIPTIONS[name],
    })),
  })
}
