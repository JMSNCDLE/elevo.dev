import {
  createMessage,
  MODELS,
  MAX_TOKENS,
  buildThinkingConfig,
  buildEffortConfig,
  extractText,
  parseJSON,
  WEB_SEARCH_TOOL,
} from './client'
import type { BusinessProfile } from './types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DailySMMWorkflowResult {
  trendsScanned: number
  contentGenerated: number
  postsScheduled: number
  competitorAlerts: string[]
  performanceInsights: string[]
  recommendedActions: string[]
  creditsUsed: number
  summary: string
}

export interface PlatformGuide {
  platform: string
  username: string
  bio: string
  displayName: string
  profileImagePrompt: string
  coverImagePrompt: string
  contentPillars: string[]
  postingSchedule: string
  firstWeekContent: Array<{
    day: string
    type: string
    hook: string
    caption: string
    hashtags: string[]
    vegaPrompt?: string
  }>
  chromeGuide: Array<{
    step: number
    action: string
    url?: string
    exactTextToPaste: string
    screenshot: string
  }>
  firstWeekGrowthTactics: string[]
  commentingStrategy: string
  hashtagResearch: string[]
  monetisationPlan: string
}

export interface SocialPresenceResult {
  platformGuides: PlatformGuide[]
  launchSequence: Array<{
    day: number
    platform: string
    task: string
    timeRequired: string
    content?: string
  }>
  expectedFollowerGrowth: Record<string, string>
  expectedEngagementRate: string
  timeToFirstResults: string
}

export interface CompetitorSocialAnalysis {
  competitorStrengths: Record<string, string[]>
  contentGaps: string[]
  viralHooks: string[]
  adaptedContentPlan: object[]
}

// ─── Daily SMM Workflow ───────────────────────────────────────────────────────

export async function runDailySMMWorkflow(params: {
  businessProfileId: string
  userId: string
  date: string
  connectedPlatforms: string[]
  activeMissions: string[]
  locale: string
}): Promise<DailySMMWorkflowResult> {
  const { connectedPlatforms, date, locale } = params

  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: MAX_TOKENS.MEDIUM,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('medium'),
    tools: [WEB_SEARCH_TOOL],
    system: `You are ELEVO SMM™, an autonomous social media manager. You run the daily social media workflow for a business. Today is ${date}. Locale: ${locale}.
Search for trending topics relevant to the business, generate post ideas, and provide actionable insights.
Always return valid JSON.`,
    messages: [
      {
        role: 'user',
        content: `Run the daily SMM workflow for a business with these connected platforms: ${connectedPlatforms.join(', ')}.

Search for trending topics right now that would be relevant for a local business. Generate 3 post ideas per platform.

Return ONLY valid JSON:
{
  "trendsScanned": <number>,
  "contentGenerated": <number>,
  "postsScheduled": <number>,
  "competitorAlerts": ["<alert>"],
  "performanceInsights": ["<insight>"],
  "recommendedActions": ["<action>"],
  "creditsUsed": 2,
  "summary": "<one paragraph summary of what was done today>"
}`,
      },
    ],
  })

  const text = extractText(response)
  return parseJSON<DailySMMWorkflowResult>(text)
}

// ─── Create Social Presence From Scratch ─────────────────────────────────────

export async function createSocialPresenceFromScratch(params: {
  businessProfile: BusinessProfile
  platforms: string[]
  goal: string
  style: string
  locale: string
}): Promise<SocialPresenceResult> {
  const { businessProfile, platforms, goal, style, locale } = params

  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    tools: [WEB_SEARCH_TOOL],
    system: `You are ELEVO SMM™, an expert social media strategist. You create complete social media presences from scratch for local businesses. Locale: ${locale}.
Search for trending content strategies and hashtags for the business type. Provide extremely detailed, actionable guides including exact text to paste, URLs, and step-by-step Chrome instructions.
Always return valid JSON.`,
    messages: [
      {
        role: 'user',
        content: `Create a complete social media presence from scratch for this business:

Business: ${businessProfile.business_name}
Category: ${businessProfile.category}
City: ${businessProfile.city}
Services: ${businessProfile.services.join(', ')}
USPs: ${businessProfile.unique_selling_points.join(', ')}
Goal: ${goal}
Content Style: ${style}
Platforms: ${platforms.join(', ')}

Search for:
1. Trending hashtags for ${businessProfile.category} in ${businessProfile.city}
2. Top content strategies for ${style} style businesses
3. Best posting times for each platform in ${locale}

For each platform, create:
- Optimised username, bio, display name
- Profile image and cover image prompts (for Midjourney/DALL·E)
- 5 content pillars
- Posting schedule
- 7-day first week content calendar with full captions, hooks, hashtags
- Step-by-step Chrome guide with exact text to paste
- Growth tactics for week 1
- Commenting strategy
- 30 researched hashtags
- Monetisation plan

Return ONLY valid JSON matching this structure:
{
  "platformGuides": [
    {
      "platform": "<platform name>",
      "username": "<suggested handle>",
      "bio": "<complete bio text ready to paste>",
      "displayName": "<display name>",
      "profileImagePrompt": "<detailed Midjourney prompt>",
      "coverImagePrompt": "<detailed Midjourney prompt>",
      "contentPillars": ["<pillar 1>", "<pillar 2>", "<pillar 3>", "<pillar 4>", "<pillar 5>"],
      "postingSchedule": "<e.g. Mon/Wed/Fri at 9am and 7pm>",
      "firstWeekContent": [
        {
          "day": "Monday",
          "type": "Reel",
          "hook": "<first 3 seconds hook>",
          "caption": "<full caption ready to paste>",
          "hashtags": ["#tag1", "#tag2"],
          "vegaPrompt": "<optional video prompt for ELEVO Create>"
        }
      ],
      "chromeGuide": [
        {
          "step": 1,
          "action": "Open ${platforms[0]} and go to profile settings",
          "url": "https://instagram.com/accounts/edit/",
          "exactTextToPaste": "<exact text to paste in the field>",
          "screenshot": "Profile > Edit Profile > Bio field"
        }
      ],
      "firstWeekGrowthTactics": ["<tactic 1>", "<tactic 2>"],
      "commentingStrategy": "<detailed strategy>",
      "hashtagResearch": ["#hashtag1"],
      "monetisationPlan": "<how to monetise this platform>"
    }
  ],
  "launchSequence": [
    {
      "day": 1,
      "platform": "<platform>",
      "task": "<task description>",
      "timeRequired": "30 minutes",
      "content": "<optional content to post>"
    }
  ],
  "expectedFollowerGrowth": {
    "instagram": "100-300 followers in 30 days"
  },
  "expectedEngagementRate": "3-5%",
  "timeToFirstResults": "2-4 weeks"
}`,
      },
    ],
  })

  const text = extractText(response)
  return parseJSON<SocialPresenceResult>(text)
}

// ─── Analyse Competitor Social and Adapt ─────────────────────────────────────

export async function analyseCompetitorSocialAndAdapt(params: {
  businessProfile: BusinessProfile
  competitorHandles: string[]
  platforms: string[]
  locale: string
}): Promise<CompetitorSocialAnalysis> {
  const { businessProfile, competitorHandles, platforms, locale } = params

  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: MAX_TOKENS.MEDIUM,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('medium'),
    tools: [WEB_SEARCH_TOOL],
    system: `You are ELEVO SMM™, a competitive social media analyst. Search for competitor social profiles and analyse their content strategy. Locale: ${locale}.
Always return valid JSON.`,
    messages: [
      {
        role: 'user',
        content: `Analyse these competitor social media accounts and create an adapted content strategy:

Business: ${businessProfile.business_name} (${businessProfile.category})
Competitor handles: ${competitorHandles.join(', ')}
Platforms: ${platforms.join(', ')}

Search for each competitor's profile, their recent posts, engagement rates, and content style.

Return ONLY valid JSON:
{
  "competitorStrengths": {
    "<competitor handle>": ["<strength 1>", "<strength 2>"]
  },
  "contentGaps": ["<gap 1 — what competitors are missing that you can own>"],
  "viralHooks": ["<hook 1 that's performing well in your niche>"],
  "adaptedContentPlan": [
    {
      "week": 1,
      "theme": "<content theme>",
      "posts": [
        {
          "platform": "<platform>",
          "type": "<post type>",
          "hook": "<opening hook>",
          "angle": "<unique angle vs competitors>",
          "caption": "<full caption>"
        }
      ]
    }
  ]
}`,
      },
    ],
  })

  const text = extractText(response)
  return parseJSON<CompetitorSocialAnalysis>(text)
}
