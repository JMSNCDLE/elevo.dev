import { createMessage, getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON, WEB_SEARCH_TOOL } from './client'
import type { BusinessProfile, MarketResearchReport } from './types'

export async function runResearchAgent(
  business: BusinessProfile,
  params: {
    researchFocus: string
    industry?: string
    targetMarket?: string
    geographicScope?: string
  }
): Promise<MarketResearchReport> {
  const client = getClient()

  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    tools: [WEB_SEARCH_TOOL],
    system: `You are ELEVO AI's Market Research Agent. You conduct thorough, actionable market research for local businesses. You use web search to gather current data, then synthesise insights that are directly relevant and actionable for a local SME owner. You focus on practical intelligence, not academic theory.`,
    messages: [
      {
        role: 'user',
        content: `Conduct market research for ${business.business_name}.

Business context:
- Type: ${business.category}
- Location: ${business.city}, ${business.country}
- Services: ${business.services.join(', ')}
- USPs: ${business.unique_selling_points.join(', ')}

Research focus: ${params.researchFocus}
Industry: ${params.industry || business.category}
Target market: ${params.targetMarket || business.target_audience || 'Local consumers'}
Geographic scope: ${params.geographicScope || `${business.city} and surrounding area`}

Search for current market data, trends, and competitor intelligence. Then produce a comprehensive report.

Return ONLY valid JSON:
{
  "marketOverview": "Current state of the market (2-3 paragraphs)",
  "targetAudience": "Detailed target audience profile and behaviour",
  "competitorLandscape": ["Competitor insight 1", "Competitor insight 2", "Competitor insight 3"],
  "marketTrends": ["Key trend 1", "Key trend 2", "Key trend 3"],
  "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
  "threats": ["Threat 1", "Threat 2", "Threat 3"],
  "recommendations": ["Action 1", "Action 2", "Action 3"],
  "fullReport": "Complete formatted research report (use markdown)"
}`,
      },
    ],
  })

  try {
    const text = extractText(response)
    return parseJSON<MarketResearchReport>(text)
  } catch {
    return {
      marketOverview: 'Research completed. See full report below.',
      targetAudience: '',
      competitorLandscape: [],
      marketTrends: [],
      opportunities: [],
      threats: [],
      recommendations: [],
      fullReport: extractText(response),
    }
  }
}
