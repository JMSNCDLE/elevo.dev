import { createMessage, MODELS, extractText, parseJSON } from './client'
import { createServerClient } from '@/lib/supabase/server'

export interface ReturnBriefing {
  greeting: string
  whereWeLeftOff: string
  whatHappened: string
  nextRecommendedAction: string
  quickLinks: Array<{ label: string; href: string; reason: string }>
}

export async function generateReturnBriefing(params: {
  userId: string
  businessProfile: Record<string, unknown>
  lastSession: Record<string, unknown>
  recentGenerations: Record<string, unknown>[]
  daysSinceLastLogin: number
  locale: string
}): Promise<ReturnBriefing> {
  const { businessProfile, lastSession, recentGenerations, daysSinceLastLogin, locale } = params

  const businessName = (businessProfile?.business_name as string) ?? 'your business'
  const lastPage = (lastSession?.last_active_page as string) ?? 'unknown'
  const lastAgent = (lastSession?.last_active_agent as string) ?? 'unknown'
  const genSummary = recentGenerations.slice(0, 5).map(g => `- ${g.type}: ${String(g.content ?? '').slice(0, 80)}`).join('\n')

  const prompt = `You are ELEVO AI's personal assistant creating a return briefing for a user who has been away for ${daysSinceLastLogin} day(s).

Business: ${businessName}
Last active page: ${lastPage}
Last agent used: ${lastAgent}
Recent content generated:
${genSummary || 'No recent generations'}
Locale: ${locale}

Create a warm, personal briefing in JSON format:
{
  "greeting": "A warm welcome back message (1 sentence, mention business name)",
  "whereWeLeftOff": "Brief summary of what they were working on (1-2 sentences)",
  "whatHappened": "What may have changed in their business world while they were away (1-2 sentences, encouraging)",
  "nextRecommendedAction": "The single most important thing they should do next in ELEVO (1 sentence, specific)",
  "quickLinks": [
    { "label": "Action label", "href": "/dashboard/path", "reason": "Why this is relevant now (short)" },
    { "label": "Action label", "href": "/dashboard/path", "reason": "Why this is relevant now (short)" },
    { "label": "Action label", "href": "/dashboard/path", "reason": "Why this is relevant now (short)" }
  ]
}

Return ONLY the JSON, no markdown.`

  const response = await createMessage({
    model: MODELS.SPECIALIST,
    max_tokens: 1000,
    thinking: { type: 'adaptive' },
    betas: ['interleaved-thinking-2025-05-14'],
    messages: [{ role: 'user', content: prompt }],
  })

  const text = extractText(response)
  try {
    return parseJSON<ReturnBriefing>(text)
  } catch {
    return {
      greeting: `Welcome back to ELEVO AI!`,
      whereWeLeftOff: `You were last working on ${lastPage}.`,
      whatHappened: `Your business has been running while you were away. Time to get back on track!`,
      nextRecommendedAction: `Check your Mission Control dashboard to see where things stand.`,
      quickLinks: [
        { label: 'Mission Control', href: '/dashboard', reason: 'Get an overview of your business' },
        { label: 'Create Content', href: '/dashboard/content/gbp-posts', reason: 'Generate fresh content for your audience' },
        { label: 'Check CRM', href: '/dashboard/customers', reason: 'See which contacts need attention' },
      ],
    }
  }
}

export async function updateProjectContext(
  userId: string,
  page: string,
  agentUsed: string,
  generationId?: string
): Promise<void> {
  try {
    const supabase = await createServerClient()
    const updateData: Record<string, unknown> = {
      user_id: userId,
      last_active_page: page,
      last_active_agent: agentUsed,
      last_session_at: new Date().toISOString(),
    }
    if (generationId) {
      updateData.last_generation_id = generationId
    }
    await supabase
      .from('user_sessions')
      .upsert(updateData, { onConflict: 'user_id' })
  } catch (err) {
    console.error('[projectMemoryAgent] updateProjectContext error:', err)
  }
}
