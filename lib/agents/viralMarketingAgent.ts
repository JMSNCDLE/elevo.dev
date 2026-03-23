import { createMessage, WEB_SEARCH_TOOL, buildThinkingConfig, buildEffortConfig, extractText, parseJSON } from './client'
import type { BusinessProfile } from './types'

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ViralStrategyInput {
  businessProfile: BusinessProfile
  targetPlatforms: string[]
  contentBudget: 'zero' | 'low' | 'medium' | 'high'
  goal: 'followers' | 'leads' | 'sales' | 'brand_awareness' | 'traffic'
  locale: string
}

export interface ViralStrategy {
  viralFormula: {
    contentPillar: string
    emotionalTrigger: string
    formatToMaster: string
    postingWindow: string
    consistencyRequirement: string
    expectedBreakthroughTimeline: string
  }
  trendingNow: Array<{
    platform: string
    trend: string
    trendType: string
    peakExpected: string
    howToUse: string
    urgency: 'post_today' | 'this_week' | 'upcoming'
    viralPotential: 'low' | 'medium' | 'high' | 'explosive'
    exampleHook: string
  }>
  platformBlueprints: Record<string, {
    algorithmInsights: string[]
    viralFormats: Array<{
      formatName: string
      hook: string
      structure: string
      callToAction: string
      exampleCaption: string
      estimatedReach: string
      whyItVirals: string
    }>
    optimalPostingTimes: string[]
    hashtagStrategy: { formula: string; specific: string[]; toAvoid: string[] }
    engagementHacks: string[]
    commentStrategy: string
  }>
  viralCalendar: Array<{
    day: number
    date: string
    platform: string
    contentType: string
    hook: string
    fullScript: string
    viralElement: string
    trendToRide?: string
    expectedViews: string
    hashtags: string[]
    bestTimeToPost: string
    vegaPrompt?: string
    thumbnail: string
    cta: string
  }>
  hookLibrary: Array<{
    hook: string
    platform: string
    emotion: string
    type: 'question' | 'statement' | 'controversial' | 'number' | 'secret' | 'fear'
    exampleExpansion: string
  }>
  engagementTactics: Array<{
    tactic: string
    how: string
    expectedResult: string
    platform: string
  }>
  paidBoost: {
    strategy: string
    whenToBoost: string
    budget: string
    platforms: string[]
    expectedROAS: string
  }
  eleveOwnViralPlan?: {
    targetNiches: string[]
    crossPlatformAngle: string
    founderContentStrategy: string
    urgentActions: string[]
    first7DaysScript: Array<{
      day: number
      platform: string
      hook: string
      content: string
    }>
  }
  kpis: Array<{
    metric: string
    baseline: string
    day30Target: string
    day90Target: string
    howToTrack: string
  }>
  executiveSummary: string
  viralReadinessScore: number
  biggestOpportunity: string
}

// ─── buildViralStrategy ───────────────────────────────────────────────────────

export async function buildViralStrategy(
  input: ViralStrategyInput,
  locale: string,
): Promise<ViralStrategy> {
  const biz = input.businessProfile
  const platforms = input.targetPlatforms.join(', ')

  const systemPrompt = `You are ELEVO Viral™ — the world's most advanced viral marketing strategist for local businesses.

You have deep expertise in:
- TikTok, Instagram Reels, YouTube Shorts, Facebook, LinkedIn algorithms
- Viral content mechanics: hooks, emotional triggers, shareability
- Trend identification and trend-riding strategies
- Organic growth without big budgets
- Turning local businesses into content powerhouses

YOUR TASK:
1. Use web search to find what is trending RIGHT NOW in the client's niche and on their target platforms
2. Build a complete, actionable 30-day viral strategy
3. Write real hooks, real scripts, real captions — not templates
4. Give specific posting times, hashtag strategies, engagement hacks

LOCALE: ${locale}
BUSINESS: ${biz.business_name} — ${biz.category} in ${biz.city}, ${biz.country}
PLATFORMS: ${platforms}
BUDGET: ${input.contentBudget}
GOAL: ${input.goal}

Respond ONLY with a valid JSON object matching the ViralStrategy interface. No markdown, no explanation.

The viralCalendar must have exactly 30 entries (days 1-30).
The hookLibrary must have at least 20 hooks.
The viralReadinessScore must be a number between 0 and 100.`

  const userPrompt = `Build a complete viral marketing strategy for:

Business: ${biz.business_name}
Category: ${biz.category}
Location: ${biz.city}, ${biz.country}
Services: ${biz.services?.join(', ') ?? 'not specified'}
USPs: ${biz.unique_selling_points?.join(', ') ?? 'not specified'}
Target Audience: ${biz.target_audience ?? 'local customers'}
Tone of Voice: ${biz.tone_of_voice}

Target Platforms: ${platforms}
Content Budget: ${input.contentBudget}
Primary Goal: ${input.goal}

Use web search to:
1. Find what is trending on ${platforms} RIGHT NOW in the ${biz.category} niche
2. Find the best posting times for ${biz.city} timezone
3. Find viral hashtags for ${biz.category} on ${platforms}
4. Find competitor content strategies in this niche
5. Find the most viral content formats working right now

Build a complete ViralStrategy JSON with:
- A viral formula tailored to this specific business and niche
- 30-day viral calendar with real, specific content for each day
- At least 20 hooks in the hook library
- Platform blueprints for each of: ${platforms}
- Engagement tactics specific to this business type
- KPIs with realistic baselines and targets

Make the content hyper-specific to ${biz.business_name} — not generic templates.`

  const response = await createMessage({
    model: 'claude-opus-4-6',
    max_tokens: 8000,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    tools: [WEB_SEARCH_TOOL],
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  let jsonText = ''
  for (const block of response.content) {
    if (block.type === 'text') {
      jsonText += block.text
    }
  }

  try {
    return parseJSON<ViralStrategy>(jsonText)
  } catch {
    // Try to extract JSON from the text
    const match = jsonText.match(/\{[\s\S]*\}/)
    if (match) {
      return JSON.parse(match[0]) as ViralStrategy
    }
    throw new Error('Failed to parse viral strategy response')
  }
}

// ─── generateViralPost ────────────────────────────────────────────────────────

export async function generateViralPost(params: {
  businessProfile: BusinessProfile
  platform: string
  trendToRide?: string
  format: string
  hook?: string
  locale: string
}): Promise<{
  hook: string
  fullScript: string
  caption: string
  hashtags: string[]
  thumbnail: string
  bestTimeToPost: string
  vegaPrompt: string
  estimatedReach: string
  viralElements: string[]
}> {
  const biz = params.businessProfile

  const systemPrompt = `You are ELEVO Viral™ — expert in creating viral content for local businesses.

Platform: ${params.platform}
Format: ${params.format}
Business: ${biz.business_name} — ${biz.category} in ${biz.city}, ${biz.country}
Locale: ${params.locale}

Create ONE viral post that will genuinely perform well on ${params.platform}.
Make the hook stop the scroll in the first 3 seconds.
Write the full script/caption as if this is real content to be posted today.

Respond ONLY with a valid JSON object with these exact fields:
{
  "hook": "the opening hook (first 3 seconds)",
  "fullScript": "the complete script or caption",
  "caption": "platform-optimised caption with emojis",
  "hashtags": ["array", "of", "hashtags", "without", "hash"],
  "thumbnail": "description of ideal thumbnail image",
  "bestTimeToPost": "day and time e.g. Tuesday 7pm",
  "vegaPrompt": "prompt for AI video generation if applicable",
  "estimatedReach": "estimated organic reach range",
  "viralElements": ["list", "of", "viral", "elements", "in", "this", "post"]
}`

  const userPrompt = `Create a viral ${params.format} post for ${params.platform}.

Business: ${biz.business_name} (${biz.category}, ${biz.city})
Services: ${biz.services?.join(', ') ?? 'not specified'}
Tone: ${biz.tone_of_voice}
${params.trendToRide ? `Trend to ride: ${params.trendToRide}` : ''}
${params.hook ? `Use this hook: ${params.hook}` : 'Create a scroll-stopping hook'}

Make it genuinely viral — not generic. Specific to this business and niche.`

  const response = await createMessage({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  const text = extractText(response)
  try {
    return parseJSON(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Failed to parse viral post response')
  }
}

// ─── getTrendingNow ───────────────────────────────────────────────────────────

export async function getTrendingNow(
  niche: string,
  platforms: string[],
  locale: string,
): Promise<Array<{
  trend: string
  platform: string
  type: string
  peakWindow: string
  howToUse: string
  hook: string
}>> {
  const platformList = platforms.join(', ')

  const systemPrompt = `You are ELEVO Viral™ — real-time trend intelligence for local businesses.

Use web search to find what is ACTUALLY trending right now (today) in the "${niche}" niche on ${platformList}.

Find 5-10 genuine trends that a local business in this niche could use for viral content.

Respond ONLY with a valid JSON array of trend objects with these exact fields:
[
  {
    "trend": "name or description of the trend",
    "platform": "which platform",
    "type": "hashtag|sound|format|challenge|news|meme",
    "peakWindow": "how long this trend will last e.g. '3-5 days' or 'this week'",
    "howToUse": "specific advice for a ${niche} business",
    "hook": "example hook sentence to ride this trend"
  }
]`

  const userPrompt = `Find what is trending RIGHT NOW on ${platformList} for businesses in the "${niche}" niche.

Locale: ${locale}

Search for:
1. Trending hashtags on each platform for ${niche}
2. Trending audio/sounds on TikTok/Reels for ${niche} content
3. Viral content formats working in ${niche} right now
4. Any news or events in ${niche} being talked about
5. Challenges or memes relevant to ${niche} businesses

Return 5-10 actionable trends as a JSON array.`

  const response = await createMessage({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('medium'),
    tools: [WEB_SEARCH_TOOL],
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  const text = extractText(response)
  try {
    return parseJSON(text)
  } catch {
    const match = text.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
    return []
  }
}
