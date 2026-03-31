// ─── ELEVO Ads Pro — Ad Campaign Agent ───────────────────────────────────────
// Uses claude-opus-4-6, effort "high" + web_search

import { createMessage, MODELS, MAX_TOKENS, WEB_SEARCH_TOOL, extractText } from './client'
import type { BusinessProfile } from './types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdCampaignBrief {
  businessProfile: BusinessProfile
  platform: 'meta' | 'google' | 'tiktok' | 'linkedin' | 'pinterest' | 'snapchat'
  objective: 'awareness' | 'traffic' | 'leads' | 'conversions' | 'app_installs' | 'video_views'
  dailyBudget: number
  currency: string
  targetLocation: string
  campaignDuration: string
  productOrService: string
  uniqueSellingPoint: string
  locale: string
}

export interface AdCampaignOutput {
  campaignName: string
  targeting: {
    locations: string[]
    ageRange: string
    gender: string
    interests: string[]
    behaviours: string[]
    excludeAudiences: string[]
    customAudiences: string[]
    lookalikeStrategy: string
    estimatedReach: string
    estimatedCPM: string
    estimatedCPC: string
  }
  adCopies: Array<{
    variation: string
    headline: string
    primaryText: string
    description: string
    callToAction: string
    hook: string
    whyThisWorks: string
    predictedCTR: string
  }>
  creativeBrief: {
    format: 'video' | 'image' | 'carousel' | 'story' | 'reels'
    dimensions: string
    duration?: string
    visualDirection: string
    scriptIfVideo: string
    vegaHiggsfieldPrompt: string
    musicMood: string
    brandColours: string[]
    doNots: string[]
  }
  campaignStructure: {
    adSets: Array<{
      name: string
      audience: string
      budget: number
      placements: string[]
    }>
    testingStrategy: string
    scalingPlan: string
  }
  predictions: {
    expectedCPM: string
    expectedCPC: string
    expectedCTR: string
    expectedLeadsPerDay: string
    expectedROAS: string
    breakEvenPoint: string
  }
  setupGuide: Array<{
    step: number
    platform: string
    action: string
    exactSetting: string
    screenshot_note: string
  }>
  eleveOwnAdRecommendation?: {
    targetAudience: string
    bestPlatform: string
    dailyBudget: string
    hook: string
    adCopy: string
    expectedCPA: string
  }
  executiveSummary: string
}

// ─── Build Ad Campaign ────────────────────────────────────────────────────────

export async function buildAdCampaign(brief: AdCampaignBrief): Promise<AdCampaignOutput> {
  const { businessProfile: bp, platform, objective, dailyBudget, currency, targetLocation, campaignDuration, productOrService, uniqueSellingPoint, locale } = brief

  const message = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: { type: 'adaptive' },
    effort: 'high',
    tools: [WEB_SEARCH_TOOL],
    messages: [
      {
        role: 'user',
        content: `You are ELEVO Ads Pro, the most advanced ad campaign builder for local businesses.

Business: ${bp.business_name} (${bp.category}, ${bp.city}, ${bp.country})
Platform: ${platform}
Objective: ${objective}
Daily budget: ${currency}${dailyBudget}
Target location: ${targetLocation}
Duration: ${campaignDuration}
Product/Service: ${productOrService}
USP: ${uniqueSellingPoint}
Language: ${locale}
Target audience: ${bp.target_audience ?? 'local customers'}

Use web_search to research:
1. "${productOrService} ${bp.city} ${platform} ads" — what competitors are running
2. "${bp.category} average CPM ${platform}" — real benchmarks
3. Best performing ${platform} ad formats for ${bp.category} businesses

Build a complete, ready-to-launch ad campaign. Return JSON:
{
  "campaignName": "${bp.business_name} — ${productOrService} ${new Date().getFullYear()}",
  "targeting": {
    "locations": ["${targetLocation}", "radius targeting options"],
    "ageRange": "25-55",
    "gender": "All",
    "interests": ["interest 1", "interest 2", "interest 3"],
    "behaviours": ["behaviour 1", "behaviour 2"],
    "excludeAudiences": ["existing customers", "employees"],
    "customAudiences": ["Website visitors last 30 days", "CRM list upload"],
    "lookalikeStrategy": "1% lookalike of existing customers",
    "estimatedReach": "50,000-120,000 per week",
    "estimatedCPM": "€${dailyBudget < 20 ? '8-12' : '6-10'}",
    "estimatedCPC": "€0.80-1.50"
  },
  "adCopies": [
    {
      "variation": "A",
      "headline": "Stop [pain point] — we fix it",
      "primaryText": "Multi-line ad copy addressing the pain point and offering the USP",
      "description": "Supporting description text",
      "callToAction": "Book Now",
      "hook": "First 3 seconds / opening line that stops the scroll",
      "whyThisWorks": "Psychological principle at work",
      "predictedCTR": "3.2%"
    },
    { "variation": "B", "headline": "...", "primaryText": "...", "description": "...", "callToAction": "...", "hook": "...", "whyThisWorks": "...", "predictedCTR": "..." },
    { "variation": "C", "headline": "...", "primaryText": "...", "description": "...", "callToAction": "...", "hook": "...", "whyThisWorks": "...", "predictedCTR": "..." }
  ],
  "creativeBrief": {
    "format": "video",
    "dimensions": "9:16 (1080x1920) for Stories/Reels, 1:1 (1080x1080) for Feed",
    "duration": "15-30 seconds",
    "visualDirection": "Detailed scene-by-scene visual brief",
    "scriptIfVideo": "Full video script with timing",
    "vegaHiggsfieldPrompt": "Detailed ELEVO Studio prompt for Higgsfield cinematic scene",
    "musicMood": "Upbeat, professional, local business feel",
    "brandColours": ["#6366F1", "#080C14"],
    "doNots": ["No generic stock photos", "No competitor brand names"]
  },
  "campaignStructure": {
    "adSets": [
      { "name": "Cold — Local Intent", "audience": "Interest targeting", "budget": ${Math.round(dailyBudget * 0.5)}, "placements": ["Feed", "Stories", "Reels"] },
      { "name": "Warm — Retargeting", "audience": "Website visitors + CRM", "budget": ${Math.round(dailyBudget * 0.3)}, "placements": ["Feed"] },
      { "name": "Lookalike", "audience": "1% LAL from customers", "budget": ${Math.round(dailyBudget * 0.2)}, "placements": ["Feed", "Stories"] }
    ],
    "testingStrategy": "Run A/B/C copy variations for 7 days, pause lowest CTR, double budget on winner",
    "scalingPlan": "Scale winning ad set by 20% every 3 days once CPA is below target"
  },
  "predictions": {
    "expectedCPM": "€8-12",
    "expectedCPC": "€0.80-1.50",
    "expectedCTR": "2.5-4%",
    "expectedLeadsPerDay": "${Math.round((dailyBudget / 1.2) * 0.03)} leads",
    "expectedROAS": "3-5x",
    "breakEvenPoint": "Day 8-12 of campaign"
  },
  "setupGuide": [
    { "step": 1, "platform": "${platform}", "action": "Create campaign", "exactSetting": "Objective: ${objective}", "screenshot_note": "Look for the blue Campaign button" }
  ],
  "executiveSummary": "2-3 sentence summary of why this campaign will work and the expected outcome"
}`,
      },
    ],
  })

  const text = extractText(message)
  const json = text.match(/\{[\s\S]*\}/)?.[0] ?? '{}'
  try {
    return JSON.parse(json) as AdCampaignOutput
  } catch {
    return {
      campaignName: `${bp.business_name} — ${productOrService}`,
      targeting: { locations: [targetLocation], ageRange: '25-55', gender: 'All', interests: [], behaviours: [], excludeAudiences: [], customAudiences: [], lookalikeStrategy: '', estimatedReach: 'Est. 50k-100k', estimatedCPM: '€8-12', estimatedCPC: '€1.00' },
      adCopies: [],
      creativeBrief: { format: 'video', dimensions: '9:16', visualDirection: '', scriptIfVideo: '', vegaHiggsfieldPrompt: '', musicMood: '', brandColours: [], doNots: [] },
      campaignStructure: { adSets: [], testingStrategy: '', scalingPlan: '' },
      predictions: { expectedCPM: '', expectedCPC: '', expectedCTR: '', expectedLeadsPerDay: '', expectedROAS: '', breakEvenPoint: '' },
      setupGuide: [],
      executiveSummary: text.slice(0, 300),
    }
  }
}

// ─── ELEVO Own Ads ────────────────────────────────────────────────────────────

export async function generateELEVOOwnAds(
  targetMarket: 'spain_hospitality' | 'uk_trades' | 'uk_professional' | 'global_agencies',
  locale: string
): Promise<AdCampaignOutput> {
  const marketDescriptions = {
    spain_hospitality: 'Spanish restaurant and hospitality owners, 30-55, Instagram/Facebook, budget €20/day',
    uk_trades: 'UK tradespeople (plumbers, electricians, roofers), 28-50, Facebook, budget €15/day',
    uk_professional: 'UK professional service firms (accountants, solicitors, dentists), 35-55, LinkedIn/Facebook, budget €25/day',
    global_agencies: 'Marketing and business coaches who can resell ELEVO to clients, 30-50, LinkedIn, budget €30/day',
  }

  const brief: AdCampaignBrief = {
    businessProfile: {
      id: 'elevo',
      user_id: 'james',
      business_name: 'ELEVO AI',
      category: 'SaaS / AI Platform',
      city: 'London',
      country: 'United Kingdom',
      tone_of_voice: 'confident, direct, no-fluff',
      target_audience: marketDescriptions[targetMarket],
      unique_selling_points: ['54+ AI agents', '4 pillars in one platform', 'Replaces €500/mo of tools', 'From €39/month'],
      is_primary: true,
    } as BusinessProfile,
    platform: targetMarket === 'global_agencies' || targetMarket === 'uk_professional' ? 'linkedin' : 'meta',
    objective: 'leads',
    dailyBudget: targetMarket === 'spain_hospitality' ? 20 : targetMarket === 'uk_trades' ? 15 : 30,
    currency: locale === 'es' ? '€' : '€',
    targetLocation: targetMarket === 'spain_hospitality' ? 'Spain' : 'United Kingdom',
    campaignDuration: '30 days',
    productOrService: 'ELEVO AI — AI operating system for local businesses',
    uniqueSellingPoint: '54+ AI agents from €39/month — replaces €500+ of separate tools',
    locale,
  }

  return buildAdCampaign(brief)
}
