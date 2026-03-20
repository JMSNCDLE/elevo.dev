import { getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON } from './client'
import type { BusinessProfile, SWOTStrategy } from './types'

export async function runStrategyAgent(
  business: BusinessProfile,
  params: {
    strategicGoal: string
    timeframe?: string
    currentChallenges?: string
    budget?: string
  }
): Promise<SWOTStrategy> {
  const client = getClient()

  const response = await client.messages.create({
    model: MODELS.SPECIALIST,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    system: `You are ELEVO AI's Business Strategy expert. You create clear, actionable strategic plans and SWOT analyses for local SMEs. You combine business consulting depth with practical local business insight. Your strategies are realistic, ambitious, and specific — not theoretical MBA frameworks.`,
    messages: [
      {
        role: 'user',
        content: `Create a strategic plan and SWOT analysis for ${business.business_name}.

Business context:
- Type: ${business.category}
- Location: ${business.city}, ${business.country}
- Services: ${business.services.join(', ')}
- USPs: ${business.unique_selling_points.join(', ')}
- Target audience: ${business.target_audience || 'Local customers'}

Strategic goal: ${params.strategicGoal}
Timeframe: ${params.timeframe || '12 months'}
${params.currentChallenges ? `Current challenges: ${params.currentChallenges}` : ''}
${params.budget ? `Budget context: ${params.budget}` : ''}

Return ONLY valid JSON:
{
  "strengths": ["Strength 1", "Strength 2", "Strength 3", "Strength 4"],
  "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
  "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
  "threats": ["Threat 1", "Threat 2", "Threat 3"],
  "strategicGoals": ["Goal 1 (measurable)", "Goal 2 (measurable)", "Goal 3 (measurable)"],
  "actionPlan": ["Month 1-3 action", "Month 4-6 action", "Month 7-12 action"],
  "priorityActions": "The 3 highest-priority actions to take in the next 30 days (paragraph)",
  "fullDocument": "Complete SWOT & strategy document (use markdown)"
}`,
      },
    ],
  })

  try {
    return parseJSON<SWOTStrategy>(extractText(response))
  } catch {
    return {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
      strategicGoals: [],
      actionPlan: [],
      priorityActions: extractText(response).slice(0, 500),
      fullDocument: extractText(response),
    }
  }
}
