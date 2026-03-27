import { createMessage, MODELS, extractText, parseJSON } from './client'

export interface RouteResult {
  recommendedAgent: string
  agentPage: string
  reason: string
  alternativeAgents: string[]
  suggestedPrompt: string
}

export async function routePrompt(prompt: string, businessContext: string): Promise<RouteResult> {
  const systemPrompt = `You are ELEVO Route™ — an intelligent prompt router. 
Given a user's prompt and their business context, determine which ELEVO agent is best suited to handle it.

Available agents and their routes:
- ELEVO Write (content) → /dashboard/content/gbp-posts | /dashboard/content/blog | /dashboard/content/social | /dashboard/content/email | /dashboard/content/seo
- ELEVO Solve (problem solver) → /dashboard/advisor
- ELEVO Rank™ (SEO) → /seo
- ELEVO Spy™ (competitor intelligence) → /spy
- ELEVO Market™ (full marketing) → /market
- ELEVO Viral™ (viral content) → /viral
- ELEVO Studio (video) → /video-studio
- ELEVO Create™ (creative prompts) → /create
- ELEVO Drop™ (dropshipping) → /drop
- ELEVO Sales (proposals) → /dashboard/growth/sales
- ELEVO Research (market research) → /dashboard/growth/research
- ELEVO Strategy (SWOT) → /dashboard/growth/strategy
- ELEVO Money (financial) → /dashboard/growth/financial
- ELEVO People (HR) → /dashboard/growth/management
- ELEVO Connect (CRM) → /conversations
- ELEVO CEO™ (executive strategy) → /ceo
- ELEVO Write Pro™ (humanise text) → /write-pro
- ELEVO Deep™ (complex execution) → /deep
- ELEVO Creator™ (YouTube/TikTok) → /creator
- ELEVO Ads Pro (ad campaigns) → /ads

Respond ONLY with JSON.`

  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: 500,
    thinking: { type: 'adaptive' },
    betas: ['interleaved-thinking-2025-05-14'],
    messages: [
      {
        role: 'user',
        content: `Business context: ${businessContext}\n\nUser prompt: "${prompt}"\n\nReturn JSON:\n{\n  "recommendedAgent": "Agent name",\n  "agentPage": "/route",\n  "reason": "Why this agent",\n  "alternativeAgents": ["Agent 2", "Agent 3"],\n  "suggestedPrompt": "Refined version of the prompt for best results"\n}`,
      },
    ],
    system: systemPrompt,
  })

  const text = extractText(response)
  try {
    return parseJSON<RouteResult>(text)
  } catch {
    return {
      recommendedAgent: 'ELEVO Solve',
      agentPage: '/dashboard/advisor',
      reason: 'General business problem solving',
      alternativeAgents: ['ELEVO Write', 'ELEVO Research'],
      suggestedPrompt: prompt,
    }
  }
}
