import { getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON } from './client'

export interface ROASInput {
  campaigns: Array<{
    name: string
    platform: 'google' | 'meta' | 'tiktok' | 'instagram' | 'email' | 'other'
    spend: number
    revenue: number
    clicks?: number
    impressions?: number
    conversions?: number
    period: string
  }>
  currency: string
  businessCategory: string
  businessName: string
}

export interface ROASReport {
  overallROAS: number
  overallROASRating: 'excellent' | 'good' | 'poor' | 'critical'
  totalSpend: number
  totalRevenue: number
  netROI: number
  byChannel: Array<{
    platform: string
    spend: number
    revenue: number
    roas: number
    roasRating: 'excellent' | 'good' | 'poor' | 'critical'
    recommendation: string
    budgetChange: 'increase' | 'decrease' | 'maintain' | 'pause'
    suggestedBudgetChange: number
  }>
  topPerformer: string
  worstPerformer: string
  wastedSpend: number
  actionPlan: Array<{
    priority: 'immediate' | 'this_week' | 'this_month'
    action: string
    expectedROASImprovement: string
    effort: 'low' | 'medium' | 'high'
  }>
  budgetRecommendation: {
    reallocate: Array<{ from: string; to: string; amount: number }>
    pause: string[]
    scale: string[]
  }
  benchmarks: {
    industryAverageROAS: number
    yourROASVsIndustry: 'above' | 'at' | 'below'
    interpretation: string
  }
  weeklyProjection: string
  keyInsight: string
}

export async function runROASAnalysis(input: ROASInput, locale: string): Promise<ROASReport> {
  const client = getClient()

  const campaignDetails = input.campaigns
    .map(
      (c) =>
        `- ${c.name} (${c.platform}): Spend ${input.currency}${c.spend}, Revenue ${input.currency}${c.revenue}` +
        (c.clicks ? `, Clicks: ${c.clicks}` : '') +
        (c.impressions ? `, Impressions: ${c.impressions}` : '') +
        (c.conversions ? `, Conversions: ${c.conversions}` : '') +
        `, Period: ${c.period}`
    )
    .join('\n')

  const totalSpend = input.campaigns.reduce((sum, c) => sum + c.spend, 0)
  const totalRevenue = input.campaigns.reduce((sum, c) => sum + c.revenue, 0)

  const response = await client.messages.create({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    system: `You are ELEVO AI's ROAS & Advertising Intelligence engine — Leo. You are an elite performance marketing analyst specialising in local and SME businesses.

Your job is to:
1. Calculate exact ROAS (revenue ÷ spend) per channel and overall
2. Rate each ROAS: excellent (>6:1), good (4:1–6:1), poor (2:1–4:1), critical (<2:1 — losing money)
3. Identify wasted spend (campaigns with ROAS below break-even of 2:1)
4. Surface the single biggest win available (best opportunity for improvement)
5. Provide a concrete reallocation plan — take from poor performers, scale winners
6. Benchmark against industry averages (${input.businessCategory} sector)
7. Build a prioritised action plan with expected ROAS improvement per action

BENCHMARKING RULES:
- Industry average ROAS for local service businesses: 3.5–4.5:1
- Retail/ecommerce: 4:1–5:1
- Professional services: 5:1–8:1
- Google Ads average across all industries: ~2:1
- Meta Ads average: ~2.5:1–3:1
- Email marketing: typically 36:1–42:1

Be brutally honest. If campaigns are underperforming, say so clearly. Give specific, actionable recommendations — not generic advice.`,
    messages: [
      {
        role: 'user',
        content: `Analyse the advertising performance for ${input.businessName} (${input.businessCategory}).

CAMPAIGN DATA:
${campaignDetails}

TOTALS:
- Total Spend: ${input.currency}${totalSpend}
- Total Revenue: ${input.currency}${totalRevenue}
- Currency: ${input.currency}

Calculate all ROAS figures, identify wasted spend, benchmark against ${input.businessCategory} industry averages, and build a clear action plan.

Return ONLY valid JSON matching this exact structure:
{
  "overallROAS": <number — totalRevenue / totalSpend>,
  "overallROASRating": "excellent|good|poor|critical",
  "totalSpend": <number>,
  "totalRevenue": <number>,
  "netROI": <number — (totalRevenue - totalSpend) / totalSpend * 100>,
  "byChannel": [
    {
      "platform": "<platform name>",
      "spend": <number>,
      "revenue": <number>,
      "roas": <number — revenue / spend>,
      "roasRating": "excellent|good|poor|critical",
      "recommendation": "<specific action for this channel>",
      "budgetChange": "increase|decrease|maintain|pause",
      "suggestedBudgetChange": <number — percentage change, e.g. 25 means +25%, -30 means cut 30%>
    }
  ],
  "topPerformer": "<platform name>",
  "worstPerformer": "<platform name>",
  "wastedSpend": <number — spend on critical/poor performers below 2:1 ROAS>,
  "actionPlan": [
    {
      "priority": "immediate|this_week|this_month",
      "action": "<specific action>",
      "expectedROASImprovement": "<e.g. +0.5 ROAS points or +15% revenue>",
      "effort": "low|medium|high"
    }
  ],
  "budgetRecommendation": {
    "reallocate": [{ "from": "<platform>", "to": "<platform>", "amount": <number in currency> }],
    "pause": ["<platform names to pause>"],
    "scale": ["<platform names to scale>"]
  },
  "benchmarks": {
    "industryAverageROAS": <number>,
    "yourROASVsIndustry": "above|at|below",
    "interpretation": "<2-3 sentence interpretation of how they compare>"
  },
  "weeklyProjection": "<projected weekly revenue if recommendations followed>",
  "keyInsight": "<single most important insight — the one thing they must act on first>"
}`,
      },
    ],
  })

  try {
    return parseJSON<ROASReport>(extractText(response))
  } catch {
    return {
      overallROAS: 0,
      overallROASRating: 'poor',
      totalSpend: totalSpend,
      totalRevenue: totalRevenue,
      netROI: 0,
      byChannel: [],
      topPerformer: '',
      worstPerformer: '',
      wastedSpend: 0,
      actionPlan: [],
      budgetRecommendation: {
        reallocate: [],
        pause: [],
        scale: [],
      },
      benchmarks: {
        industryAverageROAS: 4,
        yourROASVsIndustry: 'below',
        interpretation: 'Unable to complete benchmark analysis. Please retry.',
      },
      weeklyProjection: 'Unable to project. Please retry.',
      keyInsight: 'Analysis could not be completed. Please try again.',
    }
  }
}
