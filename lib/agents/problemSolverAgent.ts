import { createMessage, getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON } from './client'
import type { BusinessProfile, ProblemSolverResponse } from './types'

export async function runProblemSolver(
  business: BusinessProfile,
  problem: string,
  context?: { totalRevenue?: number; totalContacts?: number; recentJobs?: number }
): Promise<ProblemSolverResponse> {
  const client = getClient()

  const response = await createMessage({
    model: MODELS.PROBLEM_SOLVER,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('max'),
    system: `You are ELEVO AI's expert Business Problem Solver — the most powerful feature of the platform. You are like having a senior business consultant, operations expert, and marketing strategist on call 24/7.

You work exclusively with small and medium local businesses. You understand the real pressures they face: cash flow, slow seasons, competition, staffing, customer retention, pricing confidence, and more.

Your role is to:
1. Diagnose the real root cause (not just the surface symptom)
2. Provide an urgent, actionable plan
3. Generate specific content or scripts they can use TODAY
4. Give longer-term strategic recommendations

You are direct, practical, empathetic, and specific. Never give generic advice. Always tailor to this exact business.`,
    messages: [
      {
        role: 'user',
        content: `Business Profile:
Name: ${business.business_name}
Type: ${business.category}
Location: ${business.city}, ${business.country}
Services: ${business.services.join(', ')}
USPs: ${business.unique_selling_points.join(', ')}
${business.description ? `Description: ${business.description}` : ''}
${business.target_audience ? `Target audience: ${business.target_audience}` : ''}
${context?.totalRevenue ? `Total recorded revenue: £${context.totalRevenue}` : ''}
${context?.totalContacts ? `Total contacts: ${context.totalContacts}` : ''}
${context?.recentJobs ? `Recent jobs (30 days): ${context.recentJobs}` : ''}

PROBLEM:
${problem}

Analyse this problem deeply and provide a comprehensive solution. Return ONLY valid JSON:
{
  "diagnosis": "Clear, specific diagnosis of what's actually happening and why it matters",
  "rootCause": "The underlying root cause (2-3 sentences)",
  "urgency": "low|medium|high|critical",
  "actionPlan": [
    { "step": "Specific action to take", "timeframe": "Today|This week|This month", "impact": "low|medium|high" }
  ],
  "generatedContent": "Ready-to-use content, script, email, or message they can deploy immediately (if applicable)",
  "longerTermRecommendations": ["Strategic recommendation 1", "Strategic recommendation 2", "Strategic recommendation 3"],
  "estimatedImpact": "Realistic estimate of what following this plan could achieve"
}`,
      },
    ],
  })

  try {
    return parseJSON<ProblemSolverResponse>(extractText(response))
  } catch {
    return {
      diagnosis: 'Unable to parse full analysis. Please try again.',
      rootCause: 'Analysis error.',
      urgency: 'medium',
      actionPlan: [{ step: 'Retry the analysis with more detail.', timeframe: 'Today', impact: 'high' }],
      longerTermRecommendations: [],
      estimatedImpact: 'Retry for full impact estimate.',
    }
  }
}
