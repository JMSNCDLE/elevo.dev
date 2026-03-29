import { createMessage, getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON, WEB_SEARCH_TOOL } from './client'
import type { BusinessProfile } from './types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CustomerTrendsReport {
  totalCustomers: number
  segments: Array<{
    name: string
    size: number
    percentageOfBase: number
    averageValue: number
    characteristics: string[]
    recommendedAction: string
    contentStrategy: string
  }>
  churnRisk: {
    highRisk: number
    estimatedRevenueLost: number
    topChurnReasons: string[]
    retentionActions: string[]
  }
  behaviorTrends: Array<{
    trend: string
    direction: 'increasing' | 'stable' | 'decreasing'
    insight: string
    actionableRecommendation: string
  }>
  seasonalPatterns: Array<{
    period: string
    peakDemand: string[]
    slowPeriod: string[]
    recommendation: string
  }>
  lifetimeValueAnalysis: {
    averageLTV: number
    topSegmentLTV: number
    ltvGrowthOpportunity: string
  }
  externalTrends: string[]
  contentCalendarSuggestions: Array<{
    week: string
    targetSegment: string
    contentType: string
    topic: string
    rationale: string
  }>
  executiveSummary: string
}

// ─── Agent ────────────────────────────────────────────────────────────────────

export async function runCustomerTrendsAnalysis(
  businessProfile: BusinessProfile,
  crmData: {
    contacts: Array<{
      status: string
      total_jobs: number
      total_revenue: number
      last_contact_date: string
      tags: string[]
    }>
  },
  locale: string
): Promise<CustomerTrendsReport> {
  const client = getClient()

  const totalCustomers = crmData.contacts.length
  const activeCount = crmData.contacts.filter((c) => c.status === 'active').length
  const lapsedCount = crmData.contacts.filter((c) => c.status === 'lapsed').length
  const atRiskCount = crmData.contacts.filter((c) => c.status === 'at_risk').length
  const vipCount = crmData.contacts.filter((c) => c.status === 'vip').length
  const totalRevenue = crmData.contacts.reduce((sum, c) => sum + (c.total_revenue || 0), 0)
  const avgRevenue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0

  const allTags = crmData.contacts.flatMap((c) => c.tags || [])
  const tagFrequency: Record<string, number> = {}
  allTags.forEach((tag) => {
    tagFrequency[tag] = (tagFrequency[tag] || 0) + 1
  })
  const topTags = Object.entries(tagFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => `${tag} (${count})`)
    .join(', ')

  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    tools: [WEB_SEARCH_TOOL],
    system: `You are ELEVO AI's Customer Trends Analyst — Maya. You are an expert in customer behaviour analysis, segmentation, and retention strategy for local businesses.

Your role is to:
1. Segment customers into meaningful groups based on their behaviour (value, frequency, recency, status)
2. Identify churn risk — who is at risk, why, and how to win them back
3. Spot behavioural trends from the data patterns
4. Identify seasonal patterns relevant to the ${businessProfile.category} sector
5. Calculate and grow lifetime value
6. Use web search to surface external market trends affecting customer behaviour in this sector
7. Build a 4-week content calendar targeting specific segments

SEGMENTATION FRAMEWORK:
- VIP Champions: high revenue + recent activity
- Loyal Regulars: consistent, medium value
- At-Risk: once active, now quiet (60–90 days since contact)
- Lapsed: inactive 90+ days
- New & Growing: recently acquired, showing early value signals
- Single-Purchase: bought once, never returned

Use actual status field values: active, lapsed, at_risk, vip

Locale: ${locale}`,
    messages: [
      {
        role: 'user',
        content: `Analyse customer trends for ${businessProfile.business_name} (${businessProfile.category}).
Location: ${businessProfile.city}, ${businessProfile.country}
Services: ${businessProfile.services.join(', ')}
Target audience: ${businessProfile.target_audience || 'Not specified'}

CRM SUMMARY:
- Total customers: ${totalCustomers}
- Active: ${activeCount}
- VIP: ${vipCount}
- At-risk: ${atRiskCount}
- Lapsed: ${lapsedCount}
- Total revenue: ${totalRevenue.toFixed(2)}
- Average revenue per customer: ${avgRevenue.toFixed(2)}
- Top tags in use: ${topTags || 'None'}

Use web search to find current consumer behaviour trends and seasonal patterns for ${businessProfile.category} businesses in ${businessProfile.country}. Then segment customers, identify churn risk, surface trends, and build a content calendar.

Return ONLY valid JSON:
{
  "totalCustomers": <number>,
  "segments": [
    {
      "name": "<segment name>",
      "size": <number>,
      "percentageOfBase": <number>,
      "averageValue": <number>,
      "characteristics": ["<characteristic 1>", "<characteristic 2>"],
      "recommendedAction": "<specific action to take with this segment>",
      "contentStrategy": "<content approach for this segment>"
    }
  ],
  "churnRisk": {
    "highRisk": <number of at-risk/lapsed customers>,
    "estimatedRevenueLost": <estimated monthly revenue at risk>,
    "topChurnReasons": ["<reason 1>", "<reason 2>", "<reason 3>"],
    "retentionActions": ["<specific action 1>", "<specific action 2>", "<specific action 3>"]
  },
  "behaviorTrends": [
    {
      "trend": "<trend description>",
      "direction": "increasing|stable|decreasing",
      "insight": "<what this means for the business>",
      "actionableRecommendation": "<what to do about it>"
    }
  ],
  "seasonalPatterns": [
    {
      "period": "<e.g. Q4, Summer, December>",
      "peakDemand": ["<service or product>"],
      "slowPeriod": ["<service or product>"],
      "recommendation": "<how to capitalise or mitigate>"
    }
  ],
  "lifetimeValueAnalysis": {
    "averageLTV": <number>,
    "topSegmentLTV": <number>,
    "ltvGrowthOpportunity": "<specific strategy to grow LTV>"
  },
  "externalTrends": ["<external trend 1>", "<external trend 2>", "<external trend 3>"],
  "contentCalendarSuggestions": [
    {
      "week": "<e.g. Week 1>",
      "targetSegment": "<segment name>",
      "contentType": "<e.g. email, social post, GBP post>",
      "topic": "<specific topic>",
      "rationale": "<why this works for this segment this week>"
    }
  ],
  "executiveSummary": "<2-3 paragraph summary of customer base health, key trends, and top 3 priority actions>"
}`,
      },
    ],
  })

  try {
    return parseJSON<CustomerTrendsReport>(extractText(response))
  } catch {
    return {
      totalCustomers: 0,
      segments: [],
      churnRisk: {
        highRisk: 0,
        estimatedRevenueLost: 0,
        topChurnReasons: [],
        retentionActions: [],
      },
      behaviorTrends: [],
      seasonalPatterns: [],
      lifetimeValueAnalysis: {
        averageLTV: 0,
        topSegmentLTV: 0,
        ltvGrowthOpportunity: 'Analysis could not be completed. Please try again.',
      },
      externalTrends: [],
      contentCalendarSuggestions: [],
      executiveSummary: 'Customer trends analysis could not be completed. Please try again.',
    }
  }
}
