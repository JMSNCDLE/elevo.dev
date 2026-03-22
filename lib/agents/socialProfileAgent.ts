// ─── ELEVO Profile — Social Profile Agent ────────────────────────────────────
// Creates optimised social media profiles with 30-day content calendars.

import { createMessage, MODELS, MAX_TOKENS, WEB_SEARCH_TOOL, extractText } from './client'
import type { BusinessProfile } from './types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContentCalendarEntry {
  day: number
  date: string
  dayOfWeek: string
  contentType: string
  topic: string
  hook: string
  caption: string
  hashtags: string[]
  callToAction: string
  isUGC: boolean
  vegaPrompt?: string
  bestTimeToPost: string
  estimatedReach: string
}

export interface SocialProfileKit {
  platform: string
  username: string
  displayName: string
  bio: string
  bioVariations: string[]
  profileImageConcept: string
  coverImageConcept: string
  linkInBioUrl: string
  linkInBioStructure: Array<{ label: string; emoji: string; url: string }>
  pinnedPostIdea: string
  instagramHighlights?: Array<{ name: string; coverConcept: string }>
  tiktokPinnedVideos?: string[]
  contentCalendar: ContentCalendarEntry[]
  megaHashtags: string[]
  midHashtags: string[]
  niceHashtags: string[]
  brandedHashtag: string
  growthTactics: Array<{
    tactic: string
    howTo: string
    timeCommitment: string
    expectedResult: string
  }>
  viralConcepts: Array<{
    hook: string
    concept: string
    format: string
    whyItWillGo: string
    vegaPrompt?: string
  }>
  competitorGaps: Array<{
    platform: string
    gapOpportunity: string
    contentIdea: string
  }>
}

// ─── Generate Social Profile Kit ─────────────────────────────────────────────

export async function generateSocialProfileKit(params: {
  businessProfile: BusinessProfile
  platform: string
  goal: string
  locale: string
}): Promise<SocialProfileKit> {
  const { businessProfile: bp, platform, goal, locale } = params

  const message = await createMessage({
    model: MODELS.SPECIALIST,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: { type: 'adaptive' },
    effort: 'high',
    tools: [WEB_SEARCH_TOOL],
    messages: [
      {
        role: 'user',
        content: `You are ELEVO Profile, an expert social media strategist. Create a complete ${platform} profile kit for:

Business: ${bp.business_name} (${bp.category})
Location: ${bp.city}, ${bp.country}
Target audience: ${bp.target_audience ?? 'local customers'}
Tone: ${bp.tone_of_voice ?? 'professional and friendly'}
Goal: ${goal}
Language: ${locale}
USPs: ${bp.unique_selling_points?.join(', ') ?? 'quality service'}

Use web_search to research top-performing ${bp.category} accounts on ${platform}.

Return JSON with this structure (generate ALL fields with real, specific content — no placeholders):
{
  "platform": "${platform}",
  "username": "@suggested_handle",
  "displayName": "Display Name (can differ from legal name)",
  "bio": "Optimised bio within platform character limit",
  "bioVariations": ["variation 1", "variation 2", "variation 3"],
  "profileImageConcept": "Specific visual concept description",
  "coverImageConcept": "Specific cover/banner concept",
  "linkInBioUrl": "https://",
  "linkInBioStructure": [
    { "label": "Book Now", "emoji": "📅", "url": "booking link" },
    { "label": "See Our Work", "emoji": "✨", "url": "portfolio" },
    { "label": "Reviews", "emoji": "⭐", "url": "google reviews" }
  ],
  "pinnedPostIdea": "First pinned post concept that introduces the business",
  "instagramHighlights": [
    { "name": "Our Work", "coverConcept": "Before/after thumbnail" },
    { "name": "Reviews", "coverConcept": "5-star graphic" },
    { "name": "Pricing", "coverConcept": "Price card graphic" },
    { "name": "About", "coverConcept": "Team photo" },
    { "name": "Tips", "coverConcept": "Lightbulb graphic" }
  ],
  "contentCalendar": [
    {
      "day": 1,
      "date": "Monday",
      "dayOfWeek": "Monday",
      "contentType": "Educational",
      "topic": "Specific topic relevant to ${bp.category}",
      "hook": "Attention-grabbing first line",
      "caption": "Full caption with personality, 150-200 words",
      "hashtags": ["#relevant1", "#relevant2", "#local"],
      "callToAction": "Specific CTA",
      "isUGC": false,
      "bestTimeToPost": "9:00 AM",
      "estimatedReach": "500-2,000"
    }
  ],
  "megaHashtags": ["#business (50M+)", "#entrepreneur (45M+)"],
  "midHashtags": ["#localbusiness (500k)", "#${bp.category?.toLowerCase().replace(/\s+/g, '')} (200k)"],
  "niceHashtags": ["#${bp.city?.toLowerCase().replace(/\s+/g, '')}business (10k)", "#local${bp.category?.toLowerCase().replace(/\s+/g, '')} (5k)"],
  "brandedHashtag": "#${bp.business_name?.replace(/\s+/g, '').toLowerCase()}",
  "growthTactics": [
    { "tactic": "Tactic name", "howTo": "Step by step", "timeCommitment": "15 min/day", "expectedResult": "Expected outcome in 30 days" }
  ],
  "viralConcepts": [
    { "hook": "Hook text", "concept": "Full concept", "format": "Reel/Story/Post", "whyItWillGo": "Explanation", "vegaPrompt": "ELEVO Studio prompt for this video" }
  ],
  "competitorGaps": [
    { "platform": "${platform}", "gapOpportunity": "What competitors are missing", "contentIdea": "Your content idea to fill that gap" }
  ]
}

Generate a FULL 30-day content calendar (days 1-30). Make it highly specific to ${bp.category} in ${bp.city}.`,
      },
    ],
  })

  const text = extractText(message)
  const json = text.match(/\{[\s\S]*\}/)?.[0] ?? '{}'
  try {
    return JSON.parse(json) as SocialProfileKit
  } catch {
    return {
      platform,
      username: `@${bp.business_name?.toLowerCase().replace(/\s+/g, '') ?? 'mybusiness'}`,
      displayName: bp.business_name ?? 'My Business',
      bio: `${bp.category} in ${bp.city}. ${bp.unique_selling_points?.[0] ?? 'Quality service'}.`,
      bioVariations: [],
      profileImageConcept: 'Professional logo on clean background',
      coverImageConcept: 'Team or work showcase',
      linkInBioUrl: 'https://',
      linkInBioStructure: [],
      pinnedPostIdea: 'Introduction post',
      contentCalendar: [],
      megaHashtags: [],
      midHashtags: [],
      niceHashtags: [],
      brandedHashtag: `#${bp.business_name?.replace(/\s+/g, '').toLowerCase() ?? 'mybusiness'}`,
      growthTactics: [],
      viralConcepts: [],
      competitorGaps: [],
    }
  }
}
