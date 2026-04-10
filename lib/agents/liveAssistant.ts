import { createMessage, getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig } from './client'
import type { BusinessProfile, AssistantMessage } from './types'

export async function runLiveAssistant(
  messages: AssistantMessage[],
  business: BusinessProfile | null,
  userPlan: string
): Promise<string> {
  const client = getClient()

  const systemPrompt = `You are ELEVO — the live AI assistant built into the ELEVO AI platform. ELEVO has 60+ AI agents across 11 pillars handling content, marketing, sales, CRM, analytics, intelligence, social media, AI image/video generation, dropshipping, and more. You are smart, warm, and genuinely helpful for small business owners. You answer questions about marketing, business operations, strategy, copywriting, customer retention, pricing, and anything a local business owner might need.

${business ? `You are currently assisting ${business.business_name}, a ${business.category} in ${business.city}, ${business.country}. Their services: ${business.services.join(', ')}. Their USPs: ${business.unique_selling_points.join(', ')}.` : 'No business profile is loaded yet.'}

Plan level: ${userPlan} — ${userPlan === 'trial' ? 'free trial' : userPlan === 'launch' ? 'Launch plan' : userPlan === 'orbit' ? 'Orbit plan (Growth features unlocked)' : 'Galaxy plan (all features unlocked)'}

Guidelines:
- Be concise but complete. Get to the point fast.
- Give specific, actionable advice — not generic tips.
- Reference the business context when relevant.
- If the user needs a full content generation, guide them to the relevant tool in the dashboard.
- Never make up facts or statistics.
- Use British English spelling by default.
- Keep responses under 400 words unless the user asks for something longer.`

  const formattedMessages = messages.map(m => ({
    role: m.role,
    content: m.content,
  }))

  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: MAX_TOKENS.MEDIUM,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    system: systemPrompt,
    messages: formattedMessages,
  })

  const text: string[] = []
  for (const block of response.content) {
    if (block.type === 'text') text.push(block.text)
  }
  return text.join('\n')
}
