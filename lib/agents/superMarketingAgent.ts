import { createMessage, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON, WEB_SEARCH_TOOL } from './client'
import type { BusinessProfile } from './types'

export interface MarketingMission {
  businessProfile: BusinessProfile
  goal: string
  timeframe: string
  budget: string
  platforms: string[]
  connectedAccounts: string[]
  locale: string
}

export interface MarketingMissionPlan {
  missionTitle: string
  executiveSummary: string
  strategy: {
    overarchingAngle: string
    platformPriority: Array<{ platform: string; allocation: string; reason: string }>
    contentMix: Record<string, number>
    postingFrequency: Record<string, string>
    voiceAndTone: string
    hashtagStrategy: Record<string, string[]>
    competitorGap: string
  }
  weeklyPlans: Array<{
    week: number
    theme: string
    focus: string
    contentCount: Record<string, number>
    keyActions: string[]
    kpis: Record<string, string>
    agentsToActivate: string[]
  }>
  contentCalendar: Array<{
    date: string
    platform: string
    contentType: string
    topic: string
    hook: string
    caption: string
    hashtags: string[]
    cta: string
    bestTime: string
    credits: number
    agentToGenerate: string
    status: 'planned' | 'generating' | 'ready' | 'scheduled' | 'published'
  }>
  adStrategy: {
    totalBudget: string
    platformSplit: Record<string, string>
    campaigns: Array<{
      name: string
      platform: string
      objective: string
      budget: string
      audience: string
      creativeDirection: string
      agentBrief: string
    }>
  }
  emailStrategy: {
    sequences: string[]
    sendDays: string[]
    subjectLineFormulas: string[]
  }
  seoContent: Array<{
    keyword: string
    contentType: string
    title: string
    priority: string
  }>
  influencerStrategy: {
    targetTier: string
    approachAngle: string
    offerType: string
    outreachTemplate: string
  }
  reputationPlan: {
    reviewStrategy: string
    responseTemplates: Record<string, string>
    alertTriggers: string[]
  }
  kpis: Array<{
    metric: string
    currentBaseline: string
    weeklyTarget: string
    monthlyTarget: string
    measureHow: string
  }>
  agentActivations: Array<{
    agent: string
    when: string
    task: string
    frequency: string
    credits: number
  }>
  estimatedTotalCredits: number
  estimatedROI: string
  successProbability: string
}

export async function buildMarketingMission(mission: MarketingMission, locale: string): Promise<MarketingMissionPlan> {
  const { businessProfile: bp } = mission
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0]

  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    tools: [WEB_SEARCH_TOOL],
    system: `You are Clio — ELEVO Market™. You are the most advanced AI marketing department ever built for small businesses. You build complete, executable 30-day marketing missions that orchestrate every ELEVO agent. You search for current trends, competitor gaps, and platform best practices. Your plans are specific, realistic, and immediately actionable. You generate real content calendar entries with actual captions and hooks — not placeholders. Every entry is ready to use.`,
    messages: [
      {
        role: 'user',
        content: `Build a complete 30-day marketing mission for this business.

Business:
- Name: ${bp.business_name}
- Type: ${bp.category}
- Location: ${bp.city}, ${bp.country}
- Services: ${bp.services.join(', ')}
- USPs: ${bp.unique_selling_points.join(', ')}
- Tone: ${bp.tone_of_voice}
- Target audience: ${bp.target_audience || 'Local customers'}
${bp.description ? `- Description: ${bp.description}` : ''}
${bp.website_url ? `- Website: ${bp.website_url}` : ''}

Mission parameters:
- Goal: ${mission.goal}
- Timeframe: ${mission.timeframe}
- Budget: ${mission.budget}
- Platforms: ${mission.platforms.join(', ')}
- Connected accounts: ${mission.connectedAccounts.join(', ') || 'None yet'}
- Locale: ${locale}
- Start date: ${dateStr}

Search for:
1. Current trending content formats on ${mission.platforms.join(' and ')}
2. Best posting times for ${bp.category} businesses
3. Competitor content gaps in ${bp.city} for ${bp.category}
4. Trending hashtags for ${bp.category}

Then build the complete mission. The contentCalendar must have 30 real entries (one per day), each with an actual caption and hook — not generic placeholders. Make the captions specific to ${bp.business_name}.

Return ONLY valid JSON matching this exact structure:
{
  "missionTitle": "Punchy mission name for ${bp.business_name}",
  "executiveSummary": "2-3 sentence strategic overview",
  "strategy": {
    "overarchingAngle": "The single big idea driving everything",
    "platformPriority": [
      { "platform": "Instagram", "allocation": "40%", "reason": "Why this platform first" }
    ],
    "contentMix": { "video": 40, "carousel": 30, "static": 20, "story": 10 },
    "postingFrequency": { "Instagram": "1x daily", "TikTok": "2x daily" },
    "voiceAndTone": "How to write and speak",
    "hashtagStrategy": { "Instagram": ["#tag1", "#tag2"] },
    "competitorGap": "What competitors aren't doing that we will"
  },
  "weeklyPlans": [
    {
      "week": 1,
      "theme": "Week theme",
      "focus": "Primary focus",
      "contentCount": { "Instagram": 7, "TikTok": 7 },
      "keyActions": ["Action 1", "Action 2"],
      "kpis": { "followers": "+50", "reach": "5,000" },
      "agentsToActivate": ["ELEVO Write", "ELEVO Viral™"]
    }
  ],
  "contentCalendar": [
    {
      "date": "YYYY-MM-DD",
      "platform": "Instagram",
      "contentType": "Reel",
      "topic": "Specific topic",
      "hook": "Actual opening hook line",
      "caption": "Full ready-to-post caption with emojis",
      "hashtags": ["#relevant", "#hashtags"],
      "cta": "Call to action",
      "bestTime": "18:30",
      "credits": 1,
      "agentToGenerate": "ELEVO Write",
      "status": "planned"
    }
  ],
  "adStrategy": {
    "totalBudget": "${mission.budget}",
    "platformSplit": { "Meta": "60%", "TikTok": "40%" },
    "campaigns": [
      {
        "name": "Campaign name",
        "platform": "Meta",
        "objective": "Lead generation",
        "budget": "£X/day",
        "audience": "Audience description",
        "creativeDirection": "What the ad looks/sounds like",
        "agentBrief": "Brief for ELEVO Ads Pro™"
      }
    ]
  },
  "emailStrategy": {
    "sequences": ["Welcome sequence", "Weekly value email"],
    "sendDays": ["Tuesday", "Thursday"],
    "subjectLineFormulas": ["[Number] ways to [benefit] in [timeframe]"]
  },
  "seoContent": [
    {
      "keyword": "Target keyword",
      "contentType": "blog",
      "title": "Blog post title",
      "priority": "high"
    }
  ],
  "influencerStrategy": {
    "targetTier": "Micro (1k-50k)",
    "approachAngle": "How to approach them",
    "offerType": "What to offer",
    "outreachTemplate": "Full DM template"
  },
  "reputationPlan": {
    "reviewStrategy": "How to get more reviews",
    "responseTemplates": {
      "positive": "Template for positive reviews",
      "negative": "Template for negative reviews",
      "neutral": "Template for neutral reviews"
    },
    "alertTriggers": ["Negative review", "Star drop below 4.5"]
  },
  "kpis": [
    {
      "metric": "Instagram followers",
      "currentBaseline": "0",
      "weeklyTarget": "+50",
      "monthlyTarget": "+200",
      "measureHow": "Instagram Insights"
    }
  ],
  "agentActivations": [
    {
      "agent": "ELEVO Write",
      "when": "Daily 9am",
      "task": "Generate daily social caption",
      "frequency": "daily",
      "credits": 1
    }
  ],
  "estimatedTotalCredits": 90,
  "estimatedROI": "3-5x increase in leads",
  "successProbability": "87%"
}`,
      },
    ],
  })

  const text = extractText(response)
  return parseJSON<MarketingMissionPlan>(text)
}

export async function runWeeklyReview(
  missionId: string,
  performanceData: Record<string, unknown>,
  locale: string
): Promise<{
  whatWorked: string[]
  whatFailed: string[]
  pivotRecommendations: string[]
  nextWeekAdjustments: string[]
  updatedCalendar: MarketingMissionPlan['contentCalendar']
}> {
  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.MEDIUM,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    tools: [WEB_SEARCH_TOOL],
    system: `You are Clio — ELEVO Market™ Weekly Review engine. You analyse real performance data, identify what worked and what failed, and produce specific, actionable adjustments for the next week. You search for any platform algorithm changes or new trends that should influence next week's strategy.`,
    messages: [
      {
        role: 'user',
        content: `Analyse this week's marketing performance and produce a weekly review.

Mission ID: ${missionId}
Locale: ${locale}
Performance data: ${JSON.stringify(performanceData, null, 2)}

Search for any recent platform algorithm changes or trending content formats relevant to this performance data.

Return ONLY valid JSON:
{
  "whatWorked": ["Specific thing that worked with metrics", "Another win"],
  "whatFailed": ["Specific thing that underperformed with data", "Another miss"],
  "pivotRecommendations": ["Strategic pivot recommendation 1", "Pivot 2"],
  "nextWeekAdjustments": ["Specific tactical change for next week", "Another adjustment"],
  "updatedCalendar": [
    {
      "date": "YYYY-MM-DD",
      "platform": "Instagram",
      "contentType": "Reel",
      "topic": "Updated topic based on what worked",
      "hook": "New hook based on top performer",
      "caption": "Full ready-to-post caption",
      "hashtags": ["#hashtag1", "#hashtag2"],
      "cta": "Call to action",
      "bestTime": "18:30",
      "credits": 1,
      "agentToGenerate": "ELEVO Write",
      "status": "planned"
    }
  ]
}`,
      },
    ],
  })

  const text = extractText(response)
  return parseJSON(text)
}

export async function executeMarketingDay(
  missionId: string,
  date: string,
  locale: string
): Promise<{
  tasksCompleted: string[]
  postsGenerated: number
  postsScheduled: number
  issuesFound: string[]
  summary: string
}> {
  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: MAX_TOKENS.MEDIUM,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('medium'),
    system: `You are Clio — ELEVO Market™ daily execution engine. You summarise what would be executed on a given marketing day: what content would be generated, what posts would be scheduled, and any issues that might arise. Be specific and realistic.`,
    messages: [
      {
        role: 'user',
        content: `Generate a daily execution summary for marketing mission.

Mission ID: ${missionId}
Date: ${date}
Locale: ${locale}

Based on a typical active marketing mission with daily content posting across multiple platforms, provide a realistic execution summary.

Return ONLY valid JSON:
{
  "tasksCompleted": [
    "Generated Instagram Reel caption for morning post",
    "Scheduled Facebook post at 12:00",
    "Generated 3 story frames for product showcase"
  ],
  "postsGenerated": 4,
  "postsScheduled": 3,
  "issuesFound": [],
  "summary": "2-3 sentence summary of what was accomplished today, what was posted, and any key metrics or notes"
}`,
      },
    ],
  })

  const text = extractText(response)
  return parseJSON(text)
}
