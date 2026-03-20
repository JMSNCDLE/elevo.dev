import { createMessage, getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON } from './client'
import type { BusinessProfile, FinancialHealthReport } from './types'

export async function runFinancialAgent(
  business: BusinessProfile,
  params: {
    monthlyRevenue?: number
    monthlyExpenses?: number
    topExpenses?: string
    revenueBreakdown?: string
    financialConcern: string
    goal?: string
  }
): Promise<FinancialHealthReport> {
  const client = getClient()

  const response = await createMessage({
    model: MODELS.SPECIALIST,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    system: `You are ELEVO AI's Financial Health advisor for small businesses. You provide practical, specific financial insights that help business owners understand and improve their numbers. You are not a chartered accountant — you are a smart financial advisor who speaks plain English and gives actionable guidance.`,
    messages: [
      {
        role: 'user',
        content: `Produce a Financial Health Report for ${business.business_name}.

Business context:
- Type: ${business.category}
- Location: ${business.city}, ${business.country}
- Services: ${business.services.join(', ')}

Financial data:
${params.monthlyRevenue ? `- Monthly revenue: £${params.monthlyRevenue}` : ''}
${params.monthlyExpenses ? `- Monthly expenses: £${params.monthlyExpenses}` : ''}
${params.topExpenses ? `- Top expense categories: ${params.topExpenses}` : ''}
${params.revenueBreakdown ? `- Revenue breakdown: ${params.revenueBreakdown}` : ''}
- Primary financial concern: ${params.financialConcern}
${params.goal ? `- Financial goal: ${params.goal}` : ''}

Return ONLY valid JSON:
{
  "executiveSummary": "2-3 sentence financial health summary",
  "revenueAnalysis": "Revenue patterns, seasonality, growth trajectory analysis",
  "expenseReview": "Expense efficiency analysis and observations",
  "cashFlowInsights": "Cash flow health and timing observations",
  "kpiRecommendations": ["KPI 1 to track", "KPI 2 to track", "KPI 3 to track"],
  "costSavingOpportunities": ["Cost saving idea 1", "Cost saving idea 2"],
  "growthLevers": ["Revenue growth lever 1", "Revenue growth lever 2", "Revenue growth lever 3"],
  "actionPlan": ["Immediate financial action 1", "30-day action", "90-day action"],
  "fullReport": "Complete financial health report (use markdown)"
}`,
      },
    ],
  })

  try {
    return parseJSON<FinancialHealthReport>(extractText(response))
  } catch {
    return {
      executiveSummary: 'Financial report generated.',
      revenueAnalysis: '',
      expenseReview: '',
      cashFlowInsights: '',
      kpiRecommendations: [],
      costSavingOpportunities: [],
      growthLevers: [],
      actionPlan: [],
      fullReport: extractText(response),
    }
  }
}
