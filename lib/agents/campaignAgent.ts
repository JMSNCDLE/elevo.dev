import { getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON, WEB_SEARCH_TOOL } from './client'
import type { BusinessProfile, CampaignPlan } from './types'

export async function runCampaignAgent(
  business: BusinessProfile,
  params: {
    campaignGoal: string
    campaignDuration?: string
    budget?: string
    targetAudience?: string
    channels?: string[]
    season?: string
    offer?: string
  }
): Promise<CampaignPlan> {
  const client = getClient()

  const response = await client.messages.create({
    model: MODELS.SPECIALIST,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    tools: [WEB_SEARCH_TOOL],
    system: `You are ELEVO AI's Marketing Campaign strategist. You build practical, creative marketing campaigns for local small businesses. You understand what actually works for local SMEs: community marketing, Google Business, social media, email, and word-of-mouth. You search for relevant trend data and local insights to make campaigns timely and relevant.`,
    messages: [
      {
        role: 'user',
        content: `Plan a marketing campaign for ${business.business_name}.

Business context:
- Type: ${business.category}
- Location: ${business.city}, ${business.country}
- Services: ${business.services.join(', ')}
- USPs: ${business.unique_selling_points.join(', ')}
- Tone: ${business.tone_of_voice}

Campaign details:
- Goal: ${params.campaignGoal}
- Duration: ${params.campaignDuration || '4 weeks'}
${params.budget ? `- Budget: ${params.budget}` : '- Budget: Minimal/organic'}
- Target audience: ${params.targetAudience || business.target_audience || 'Local customers'}
- Preferred channels: ${params.channels?.join(', ') || 'Google Business, Instagram, Email'}
${params.season ? `- Season/occasion: ${params.season}` : ''}
${params.offer ? `- Core offer/hook: ${params.offer}` : ''}

Search for current trends relevant to this campaign, then build the plan.

Return ONLY valid JSON:
{
  "campaignName": "Catchy campaign name",
  "objective": "Clear measurable objective",
  "targetAudience": "Specific audience description",
  "channels": ["Channel 1", "Channel 2"],
  "messaging": "Core message and value proposition",
  "contentCalendar": [
    { "week": "Week 1", "content": "Content to create/post", "channel": "Channel" }
  ],
  "budget": "Budget breakdown and recommendations",
  "kpis": ["KPI 1 to measure", "KPI 2 to measure"],
  "fullPlan": "Complete campaign plan document (use markdown)"
}`,
      },
    ],
  })

  try {
    const text = extractText(response)
    return parseJSON<CampaignPlan>(text)
  } catch {
    return {
      campaignName: 'Campaign Plan',
      objective: params.campaignGoal,
      targetAudience: params.targetAudience || 'Local customers',
      channels: params.channels || [],
      messaging: '',
      contentCalendar: [],
      budget: params.budget || '',
      kpis: [],
      fullPlan: extractText(response),
    }
  }
}
