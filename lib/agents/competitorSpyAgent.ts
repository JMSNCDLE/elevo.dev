import { createMessage, WEB_SEARCH_TOOL, buildThinkingConfig, buildEffortConfig } from './client'
import type { BusinessProfile } from './types'

export interface SpyInput {
  competitorName: string
  competitorWebsite?: string
  competitorInstagram?: string
  competitorGoogleBusiness?: string
  yourBusinessProfile: BusinessProfile
  analysisDepth: 'quick' | 'deep' | 'full'
  locale: string
}

export interface CompetitorIntelReport {
  competitor: {
    name: string
    estimatedRevenue: string
    estimatedEmployees: string
    yearsInBusiness: string
    rating: string
    reviewCount: number
    gbpPostFrequency: string
    socialFollowers: Record<string, string>
  }
  strengths: Array<{
    area: string
    detail: string
    howTheyDoIt: string
    howYouCanMatch: string
    eleveCanHelp: boolean
  }>
  weaknesses: Array<{
    area: string
    detail: string
    yourOpportunity: string
    urgency: 'immediate' | 'this_month' | 'long_term'
  }>
  contentStrategy: {
    postingFrequency: Record<string, string>
    topContentTypes: string[]
    bestPerformingTopics: string[]
    contentGaps: string[]
    hashtagStrategy: string
    captionStyle: string
    responseToReviews: string
  }
  adIntelligence: {
    isRunningAds: boolean
    estimatedAdSpend: string
    platforms: string[]
    adAngles: string[]
    targetAudiences: string[]
    weaknesses: string[]
    opportunityGaps: string[]
  }
  seoIntelligence: {
    estimatedMonthlyTraffic: string
    topRankingKeywords: string[]
    missingKeywords: string[]
    backlinks: string
    contentStrategy: string
    localSEOStrength: string
  }
  pricingIntelligence: {
    estimatedPricing: Record<string, string>
    pricingStrategy: string
    promos: string[]
    yourPricingAdvantage: string
  }
  customerSentiment: {
    averageRating: number
    positiveThemes: string[]
    negativeThemes: string[]
    commonComplaints: string[]
    opportunityFromComplaints: string
  }
  battlePlan: Array<{
    priority: 'immediate' | 'this_week' | 'this_month'
    action: string
    whyNow: string
    expectedImpact: string
    eleveCanDoThis: boolean
    eleveFeature?: string
  }>
  alertSuggestions: Array<{
    trigger: string
    frequency: string
    importance: 'critical' | 'high' | 'medium'
  }>
  quickWins: string[]
  executiveSummary: string
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  threatReason: string
  lastUpdated: string
  nextRefreshSuggested: string
}

const DEPTH_TOKENS: Record<SpyInput['analysisDepth'], number> = {
  quick: 2000,
  deep: 5000,
  full: 8000,
}

export async function runCompetitorSpy(
  input: SpyInput,
  locale: string,
): Promise<CompetitorIntelReport> {
  const biz = input.yourBusinessProfile
  const maxTokens = DEPTH_TOKENS[input.analysisDepth]

  const systemPrompt = `You are ELEVO Spy™ — the world's most advanced competitive intelligence agent for local businesses.

You are analysing a competitor of ${biz.business_name}, a ${biz.category} business in ${biz.city}, ${biz.country}.

YOUR JOB:
1. Use web search to find everything about the competitor: Google Business profile, social media, website, reviews, ads, pricing
2. Find their weaknesses — these are GOLD for the client
3. Build a prioritised battle plan using ELEVO AI features
4. Be specific, actionable, and brutally honest

ELEVO features available: Content (GBP Posts, Blog, Social, Email, Reviews, SEO), Growth (Sales, Research, Strategy, Financial, Campaigns), Intelligence (ROAS, Finance, Inventory, Customer Trends, Google Opt), Social Hub, Video Studio, Conversations (ManyChat-style), Ad Campaigns, SEO Rankings, CRM

Respond ONLY with a valid JSON object matching the CompetitorIntelReport interface. No markdown, no explanation.`

  const userPrompt = `Analyse this competitor for ${biz.business_name}:

Competitor: ${input.competitorName}
Website: ${input.competitorWebsite ?? 'unknown — search for it'}
Instagram: ${input.competitorInstagram ?? 'unknown — search for it'}
Google Business: ${input.competitorGoogleBusiness ?? input.competitorName}
Analysis depth: ${input.analysisDepth}

Our business:
- Name: ${biz.business_name}
- Category: ${biz.category}
- Location: ${biz.city}, ${biz.country}
- USPs: ${biz.unique_selling_points?.join(', ') ?? 'not specified'}

Search for:
1. Their Google Business profile (reviews, rating, posts, photos)
2. Their social media (Instagram, Facebook, TikTok)
3. Their website (services, pricing, SEO)
4. Any Facebook/Google/Instagram ads they are running
5. Recent reviews and recurring complaints

Return a comprehensive CompetitorIntelReport JSON.`

  const response = await createMessage({
    model: 'claude-opus-4-6',
    max_tokens: maxTokens,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    tools: [WEB_SEARCH_TOOL],
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  // Extract JSON from response
  let jsonText = ''
  for (const block of response.content) {
    if (block.type === 'text') {
      jsonText = block.text
      break
    }
  }

  // Strip markdown code fences if present
  jsonText = jsonText.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()

  const parsed = JSON.parse(jsonText) as CompetitorIntelReport
  parsed.lastUpdated = new Date().toISOString()
  parsed.nextRefreshSuggested = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  return parsed
}

export async function monitorCompetitor(
  competitorName: string,
  _businessProfileId: string,
  locale: string,
): Promise<{
  changes: Array<{
    type: string
    description: string
    detectedAt: string
    urgency: string
  }>
  summary: string
}> {
  const response = await createMessage({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    thinking: buildThinkingConfig(),
    tools: [WEB_SEARCH_TOOL],
    messages: [
      {
        role: 'user',
        content: `Search for recent activity (last 7 days) for this business: "${competitorName}".

Check:
- New Google reviews
- New social media posts
- Any new ads running
- Any pricing changes
- Any news mentions

Return JSON: { changes: [{ type, description, detectedAt, urgency }], summary }
urgency: "critical" | "high" | "medium" | "low"`,
      },
    ],
  })

  let jsonText = ''
  for (const block of response.content) {
    if (block.type === 'text') {
      jsonText = block.text
      break
    }
  }
  jsonText = jsonText.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()

  try {
    return JSON.parse(jsonText)
  } catch {
    return { changes: [], summary: 'No significant changes detected.' }
  }
}
