import { createMessage, getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON, WEB_SEARCH_TOOL } from './client'
import type { BusinessProfile } from './types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GoogleOptReport {
  gbpScore: number
  completenessAudit: {
    businessName: boolean
    category: boolean
    address: boolean
    phone: boolean
    website: boolean
    hours: boolean
    photos: { hasPhotos: boolean; photoCount?: number; needsMore: boolean }
    description: boolean
    attributes: boolean
    products: boolean
    services: boolean
    q_and_a: boolean
    bookingLink: boolean
    score: number
  }
  rankingFactors: Array<{
    factor: string
    status: 'optimised' | 'needs_work' | 'critical'
    impact: 'high' | 'medium' | 'low'
    action: string
    contentToCreate?: string
  }>
  reviewStrategy: {
    currentVelocity: string
    targetVelocity: string
    responseRate: string
    actions: string[]
    reviewRequestTemplate: string
  }
  localPackOpportunities: Array<{
    keyword: string
    estimatedSearchVolume: string
    currentPosition: 'in_pack' | 'near_pack' | 'not_ranking'
    actionToImprove: string
  }>
  competitorGBPInsights: Array<{
    competitorType: string
    theirStrengths: string[]
    yourAdvantage: string[]
  }>
  mapsOptimisationPlan: Array<{
    step: number
    action: string
    impact: 'high' | 'medium' | 'low'
    timeToComplete: string
    generateWithElevo: boolean
  }>
  photoStrategy: {
    typesNeeded: string[]
    captionFormula: string
    postingFrequency: string
  }
  googlePostsStrategy: {
    recommendedFrequency: string
    bestTypes: string[]
    optimalPostingTimes: string[]
    nextPostSuggestion: string
  }
  aiSearchOptimisation: {
    currentAIVisibility: 'high' | 'medium' | 'low' | 'unknown'
    contentStructureRecommendations: string[]
    schemaToAdd: string[]
    faqTopics: string[]
  }
  thirtyDayPlan: Array<{
    week: number
    actions: string[]
    expectedImpact: string
  }>
  executiveSummary: string
}

// ─── Agent ────────────────────────────────────────────────────────────────────

export async function runGoogleOptimisation(businessProfile: BusinessProfile, locale: string): Promise<GoogleOptReport> {
  const client = getClient()

  // Assess completeness from businessProfile fields
  const hasName = !!businessProfile.business_name
  const hasCategory = !!businessProfile.category
  const hasCity = !!businessProfile.city
  const hasPhone = !!businessProfile.phone
  const hasWebsite = !!businessProfile.website_url
  const hasDescription = !!businessProfile.description
  const hasGBPUrl = !!businessProfile.google_business_url
  const hasReviewUrl = !!businessProfile.google_review_url
  const hasServices = businessProfile.services && businessProfile.services.length > 0
  const hasUSPs = businessProfile.unique_selling_points && businessProfile.unique_selling_points.length > 0

  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    tools: [WEB_SEARCH_TOOL],
    system: `You are ELEVO AI's Google & Local Search Expert — Geo. You are an expert in Google Business Profile (GBP) optimisation, local SEO, Google Maps ranking, and AI search visibility (Google AI Overviews, ChatGPT, Perplexity).

You have deep knowledge of:
1. The Google local pack ranking algorithm (relevance, distance, prominence)
2. GBP completeness scoring and its impact on rankings
3. Review velocity and response rate as ranking factors
4. Google Posts and their CTR impact
5. Photo quality and quantity signals
6. Schema markup for local businesses
7. AI search optimisation (appearing in AI Overviews and AI assistants)
8. Competitor GBP strategies in local markets

Use web search to:
- Find local search trends for the business's category and location
- Research competitor GBP strategies in the area
- Find high-volume local keywords for this business type
- Check current best practices for AI search visibility

COMPLETENESS SCORING (out of 100):
- Business name: 5pts
- Category: 10pts
- Address/location: 10pts
- Phone: 8pts
- Website: 8pts
- Hours: 10pts
- Photos (any): 8pts
- Description (keyword-rich): 10pts
- Attributes: 5pts
- Products/services listed: 8pts
- Q&A populated: 5pts
- Booking link: 5pts
- Google review link: 8pts

Locale: ${locale}`,
    messages: [
      {
        role: 'user',
        content: `Conduct a Google Business Profile & Local SEO audit for ${businessProfile.business_name}.

BUSINESS PROFILE:
- Name: ${businessProfile.business_name}
- Category: ${businessProfile.category}
- Location: ${businessProfile.city}, ${businessProfile.country}
- Phone: ${businessProfile.phone || 'Not provided'}
- Website: ${businessProfile.website_url || 'Not provided'}
- Email: ${businessProfile.email || 'Not provided'}
- Description: ${businessProfile.description || 'Not provided'}
- Services: ${businessProfile.services?.join(', ') || 'Not provided'}
- USPs: ${businessProfile.unique_selling_points?.join(', ') || 'Not provided'}
- Target audience: ${businessProfile.target_audience || 'Not specified'}
- GBP URL: ${businessProfile.google_business_url || 'Not provided'}
- Review URL: ${businessProfile.google_review_url || 'Not provided'}
- Tone of voice: ${businessProfile.tone_of_voice || 'Professional'}

COMPLETENESS ASSESSMENT:
- Business name populated: ${hasName}
- Category populated: ${hasCategory}
- City/location populated: ${hasCity}
- Phone populated: ${hasPhone}
- Website populated: ${hasWebsite}
- Description populated: ${hasDescription}
- GBP URL provided: ${hasGBPUrl}
- Review URL provided: ${hasReviewUrl}
- Services listed: ${hasServices}
- USPs listed: ${hasUSPs}

Use web search to find:
1. High-volume local search keywords for ${businessProfile.category} in ${businessProfile.city}, ${businessProfile.country}
2. Competitor GBP strategies and typical strengths in this sector
3. Current AI search visibility best practices for local businesses

Build a complete 30-day Google optimisation plan with specific actions and expected impact.

Return ONLY valid JSON:
{
  "gbpScore": <number 0-100>,
  "completenessAudit": {
    "businessName": <boolean>,
    "category": <boolean>,
    "address": <boolean>,
    "phone": <boolean>,
    "website": <boolean>,
    "hours": <boolean — assume false if not verifiable>,
    "photos": { "hasPhotos": <boolean>, "photoCount": <number or null>, "needsMore": <boolean> },
    "description": <boolean>,
    "attributes": <boolean — assume partially complete>,
    "products": <boolean>,
    "services": <boolean>,
    "q_and_a": <boolean — assume false if not verifiable>,
    "bookingLink": <boolean — assume false if no booking URL>,
    "score": <number 0-100>
  },
  "rankingFactors": [
    {
      "factor": "<ranking factor name>",
      "status": "optimised|needs_work|critical",
      "impact": "high|medium|low",
      "action": "<specific action to take>",
      "contentToCreate": "<optional — if ELEVO can generate this content>"
    }
  ],
  "reviewStrategy": {
    "currentVelocity": "<estimated — e.g. Unknown or low>",
    "targetVelocity": "<e.g. 2-3 new reviews per week>",
    "responseRate": "<estimated current rate>",
    "actions": ["<specific action 1>", "<specific action 2>"],
    "reviewRequestTemplate": "<ready-to-use SMS or WhatsApp review request message>"
  },
  "localPackOpportunities": [
    {
      "keyword": "<local search keyword>",
      "estimatedSearchVolume": "<e.g. 200-500/month>",
      "currentPosition": "in_pack|near_pack|not_ranking",
      "actionToImprove": "<specific action>"
    }
  ],
  "competitorGBPInsights": [
    {
      "competitorType": "<type of competitor in this space>",
      "theirStrengths": ["<strength 1>", "<strength 2>"],
      "yourAdvantage": ["<how to differentiate 1>", "<how to differentiate 2>"]
    }
  ],
  "mapsOptimisationPlan": [
    {
      "step": <number>,
      "action": "<specific action>",
      "impact": "high|medium|low",
      "timeToComplete": "<e.g. 10 minutes, 1 hour>",
      "generateWithElevo": <boolean — true if ELEVO AI can help generate this content>
    }
  ],
  "photoStrategy": {
    "typesNeeded": ["<photo type 1>", "<photo type 2>"],
    "captionFormula": "<formula for writing keyword-rich photo captions>",
    "postingFrequency": "<recommended frequency>"
  },
  "googlePostsStrategy": {
    "recommendedFrequency": "<e.g. 2x per week>",
    "bestTypes": ["<post type 1>", "<post type 2>"],
    "optimalPostingTimes": ["<time 1>", "<time 2>"],
    "nextPostSuggestion": "<specific next Google Post idea>"
  },
  "aiSearchOptimisation": {
    "currentAIVisibility": "high|medium|low|unknown",
    "contentStructureRecommendations": ["<recommendation 1>", "<recommendation 2>"],
    "schemaToAdd": ["<schema type 1>", "<schema type 2>"],
    "faqTopics": ["<FAQ topic 1>", "<FAQ topic 2>", "<FAQ topic 3>"]
  },
  "thirtyDayPlan": [
    {
      "week": <1-4>,
      "actions": ["<specific action 1>", "<specific action 2>"],
      "expectedImpact": "<what this week's work should achieve>"
    }
  ],
  "executiveSummary": "<2-3 paragraph summary of current GBP health, biggest opportunities, and immediate wins>"
}`,
      },
    ],
  })

  try {
    return parseJSON<GoogleOptReport>(extractText(response))
  } catch {
    return {
      gbpScore: 0,
      completenessAudit: {
        businessName: false,
        category: false,
        address: false,
        phone: false,
        website: false,
        hours: false,
        photos: { hasPhotos: false, needsMore: true },
        description: false,
        attributes: false,
        products: false,
        services: false,
        q_and_a: false,
        bookingLink: false,
        score: 0,
      },
      rankingFactors: [],
      reviewStrategy: {
        currentVelocity: 'Unknown',
        targetVelocity: '2-3 per week',
        responseRate: 'Unknown',
        actions: [],
        reviewRequestTemplate: '',
      },
      localPackOpportunities: [],
      competitorGBPInsights: [],
      mapsOptimisationPlan: [],
      photoStrategy: {
        typesNeeded: [],
        captionFormula: '',
        postingFrequency: '',
      },
      googlePostsStrategy: {
        recommendedFrequency: '',
        bestTypes: [],
        optimalPostingTimes: [],
        nextPostSuggestion: '',
      },
      aiSearchOptimisation: {
        currentAIVisibility: 'unknown',
        contentStructureRecommendations: [],
        schemaToAdd: [],
        faqTopics: [],
      },
      thirtyDayPlan: [],
      executiveSummary: 'Google optimisation analysis could not be completed. Please try again.',
    }
  }
}
