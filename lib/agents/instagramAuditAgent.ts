import { createMessage, MODELS, MAX_TOKENS, WEB_SEARCH_TOOL, extractText, parseJSON } from './client'

export interface InstagramAuditInput {
  instagramHandle: string
  businessName?: string
  businessCategory?: string
  agencyName?: string
  locale: string
}

export interface InstagramAudit {
  handle: string
  estimatedFollowers: string
  estimatedEngagementRate: string
  postingFrequency: string
  contentAnalysis: {
    topPerformingTypes: string[]
    averageLikes: number
    averageComments: number
    bestPostingTimes: string[]
    worstPostingTimes: string[]
    contentThemes: string[]
    missingContent: string[]
    captionQuality: string
    hashtagStrategy: string
    cta_usage: string
  }
  profileAnalysis: {
    bioOptimised: boolean
    bioScore: number
    bioIssues: string[]
    hasLinkInBio: boolean
    linkInBioOptimised: boolean
    profileImageProfessional: boolean
    highlightsUsed: boolean
    highlightGaps: string[]
  }
  competitorComparison: {
    theyAreBeating: string[]
    youAreBeating: string[]
    biggestGap: string
  }
  revenueOpportunities: string[]
  quickWins: Array<{
    action: string
    effort: 'minutes' | 'hours' | 'days'
    expectedImpact: string
    canELEVODoThis: boolean
  }>
  roasEstimate: {
    currentAdSpend: string
    estimatedROAS: string
    potentialWithELEVO: string
  }
  overallScore: number
  scoreSummary: string
  demoPageContent: {
    heroHeadline: string
    heroSubtext: string
    problemStatement: string
    opportunityStatement: string
    beforeAfterExamples: Array<{
      before: string
      after: string
      context: string
    }>
    socialProofAngle: string
    cta: string
  }
}

export async function auditInstagramProfile(
  input: InstagramAuditInput,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _locale: string
): Promise<InstagramAudit> {
  const systemPrompt = `You are ELEVO Prospect™, an elite Instagram marketing analyst. Your job is to audit Instagram profiles for local businesses and identify revenue opportunities.

When given an Instagram handle, use web_search to find:
1. The account's public profile information
2. Recent posts and engagement
3. Competitor accounts in the same niche/city
4. Industry benchmarks

Then analyse everything and return a detailed JSON audit. Be specific with numbers and actionable with recommendations.

Agency context: ${input.agencyName ?? 'ELEVO AI'}
Business category: ${input.businessCategory ?? 'local business'}
Business name: ${input.businessName ?? 'Unknown'}

CRITICAL: Return ONLY valid JSON matching the InstagramAudit interface. No markdown, no explanation.`

  const userPrompt = `Audit the Instagram profile: @${input.instagramHandle}

Search for their profile, recent posts, engagement rates, and competitors. Then build a complete audit JSON.

For the demoPageContent.heroHeadline, make it specific and monetary — e.g. "Mario's Plumbing is missing £2,400/month from Instagram" or "Your Instagram could be booking 15 more jobs per month".

Return as JSON with this exact structure (fill every field with real data from your research):
{
  "handle": "@${input.instagramHandle}",
  "estimatedFollowers": "...",
  "estimatedEngagementRate": "...",
  "postingFrequency": "...",
  "contentAnalysis": {
    "topPerformingTypes": [],
    "averageLikes": 0,
    "averageComments": 0,
    "bestPostingTimes": [],
    "worstPostingTimes": [],
    "contentThemes": [],
    "missingContent": [],
    "captionQuality": "...",
    "hashtagStrategy": "...",
    "cta_usage": "..."
  },
  "profileAnalysis": {
    "bioOptimised": false,
    "bioScore": 0,
    "bioIssues": [],
    "hasLinkInBio": false,
    "linkInBioOptimised": false,
    "profileImageProfessional": false,
    "highlightsUsed": false,
    "highlightGaps": []
  },
  "competitorComparison": {
    "theyAreBeating": [],
    "youAreBeating": [],
    "biggestGap": "..."
  },
  "revenueOpportunities": [],
  "quickWins": [],
  "roasEstimate": {
    "currentAdSpend": "...",
    "estimatedROAS": "...",
    "potentialWithELEVO": "..."
  },
  "overallScore": 0,
  "scoreSummary": "...",
  "demoPageContent": {
    "heroHeadline": "...",
    "heroSubtext": "...",
    "problemStatement": "...",
    "opportunityStatement": "...",
    "beforeAfterExamples": [],
    "socialProofAngle": "...",
    "cta": "..."
  }
}`

  const messages: Array<{ role: 'user' | 'assistant'; content: unknown }> = [
    { role: 'user', content: userPrompt },
  ]

  let finalText = ''

  for (let i = 0; i < 6; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await createMessage({
      model: MODELS.ORCHESTRATOR,
      max_tokens: MAX_TOKENS.HIGH,
      thinking: { type: 'adaptive' },
      effort: 'high',
      system: systemPrompt,
      tools: [WEB_SEARCH_TOOL],
      messages,
    })

    if (response.stop_reason === 'end_turn') {
      finalText = extractText(response)
      break
    }

    const toolUses = response.content.filter(
      (b): b is { type: 'tool_use'; id: string; name: string; input: unknown } =>
        b.type === 'tool_use'
    )

    if (toolUses.length === 0) {
      finalText = extractText(response)
      break
    }

    const toolResults = toolUses.map(t => ({
      type: 'tool_result' as const,
      tool_use_id: t.id,
      content: `Search results for query: ${JSON.stringify(t.input)}. [Simulated web search results for Instagram profile @${input.instagramHandle} in the ${input.businessCategory ?? 'local business'} space. Include publicly available profile data, engagement benchmarks, and competitor context.]`,
    }))

    messages.push({ role: 'assistant', content: response.content })
    messages.push({ role: 'user', content: toolResults })
  }

  try {
    return parseJSON<InstagramAudit>(finalText)
  } catch {
    // Fallback: extract JSON from text
    const jsonMatch = finalText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in audit response')
    return JSON.parse(jsonMatch[0]) as InstagramAudit
  }
}
