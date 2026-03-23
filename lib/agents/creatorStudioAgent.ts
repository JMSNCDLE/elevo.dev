// lib/agents/creatorStudioAgent.ts
// ELEVO Creator™ — Reel agent
// Optimises titles, generates thumbnail briefs, editing briefs, channel audits, and traffic strategies

import { createMessage, getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON, WEB_SEARCH_TOOL } from './client'

// Suppress unused import warning — getClient is used indirectly via createMessage
void getClient

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TitleOutput {
  titles: Array<{
    title: string
    viralityScore: number
    clickThroughRate: string
    seoStrength: string
    emotionalTrigger: string
    keywordDensity: string
    characterCount: number
    algorithm: {
      youtube: string
      tiktok: string
      instagram: string
    }
    aOrBTest: string
    improvement: string
  }>
  bestTitle: string
  avoidList: string[]
  topKeywords: string[]
  searchVolumeEstimate: string
}

export interface ThumbnailBrief {
  concepts: Array<{
    concept: string
    layout: string
    faceExpression?: string
    textOverlay: string
    textPosition: string
    colourScheme: string
    backgroundDescription: string
    emotionalImpact: string
    ctrPrediction: string
    midjourneyPrompt: string
    dallePrompt: string
    ideogramPrompt: string
    canvaInstructions: string
    fontStyle: string
    contrastLevel: string
    faceCropTip: string
  }>
  bestConcept: number
  abTestSuggestion: string
  whatMakesThumbsClick: string[]
  platformOptimisation: Record<string, {
    dimensions: string
    safezone: string
    algorithmTip: string
  }>
}

export interface VideoEditingBrief {
  platform: string
  totalDuration: string
  editStructure: Array<{
    timestamp: string
    section: string
    instruction: string
    bRollSuggestion: string
    transition: string
    audioNote: string
    textOverlay?: string
    effect?: string
  }>
  hookStrategy: {
    openingFrame: string
    openingText: string
    openingAudio: string
    hookType: string
    whyItWorks: string
  }
  pacingGuide: {
    cutFrequency: string
    slowMoMoments: string[]
    speedUpMoments: string[]
    musicBPMTarget: string
    energyArc: string
  }
  captionStyle: {
    font: string
    size: string
    position: string
    animation: string
    colour: string
    outline: boolean
    highlightKeywords: boolean
    platform: string
  }
  audioGuide: {
    musicMood: string
    recommendedTracks: string[]
    soundEffects: string[]
    voiceEffects: string[]
    volumeLevels: string
  }
  exportSettings: {
    resolution: string
    fps: number
    format: string
    bitrate: string
    aspectRatio: string
    colourSpace: string
  }
  capCutGuide: Array<{
    step: number
    action: string
    whereInApp: string
    tip: string
  }>
  proTips: string[]
}

export interface ChannelAudit {
  platform: string
  channelHandle: string
  performance: {
    estimatedSubscribers: string
    estimatedMonthlyViews: string
    avgViewDuration: string
    engagementRate: string
    uploadFrequency: string
    bestPerformingContent: string[]
    worstPerformingContent: string[]
  }
  contentStrategy: {
    currentPillars: string[]
    missingPillars: string[]
    titlePatterns: string[]
    thumbnailConsistency: string
    uploadSchedule: string
    bestUploadTimes: string[]
  }
  growthOpportunities: Array<{
    opportunity: string
    effort: string
    expectedImpact: string
    priority: number
  }>
  monetisationAnalysis: {
    isMonetised: boolean
    estimatedCPM: string
    estimatedMonthlyRevenue: string
    untappedRevenue: string[]
    sponsorshipValue: string
  }
  seoAudit: {
    keywordUsage: string
    descriptionOptimisation: string
    tagStrategy: string
    playlistStructure: string
    communityEngagement: string
  }
  competitorComparison: Array<{
    competitor: string
    theirAdvantage: string
    yourOpportunity: string
  }>
  thirtyDayGrowthPlan: Array<{
    week: number
    focus: string
    actions: string[]
    target: string
  }>
  contentCalendar: Array<{
    week: number
    videoIdeas: Array<{
      title: string
      titleViralityScore: number
      format: string
      hook: string
      estimatedViews: string
    }>
  }>
}

export interface TrafficStrategy {
  trafficSources: Record<string, string>
  searchOptimisation: string[]
  suggestedFeaturesFromAlgorithm: string[]
  endScreenStrategy: string
  cardStrategy: string
  playlistStrategy: string
  communityPostStrategy: string
  shortFormStrategy: string
  crossPlatformFunnel: string
  collaborationStrategy: string
  weeklyTrafficPlan: Array<{
    day: string
    action: string
    platform: string
    expectedImpact: string
  }>
}

// ─── Functions ────────────────────────────────────────────────────────────────

export async function optimiseTitle(params: {
  topic: string
  platform: string
  targetAudience: string
  niche: string
  currentTitle?: string
  locale: string
}): Promise<TitleOutput> {
  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    betas: ['interleaved-thinking-2025-05-14'],
    system: `You are ELEVO Creator™'s title optimisation specialist. You generate highly viral, high-CTR titles for video content. You understand YouTube, TikTok, and Instagram algorithms deeply. You know what makes people click — curiosity gaps, power words, emotional triggers, and search intent. You always return valid JSON only.`,
    messages: [
      {
        role: 'user',
        content: `Generate 5 optimised video titles for the following:

Topic: ${params.topic}
Platform: ${params.platform}
Target Audience: ${params.targetAudience}
Niche: ${params.niche}
${params.currentTitle ? `Current Title to Improve: ${params.currentTitle}` : ''}
Locale: ${params.locale}

For each title, analyse: virality score (0-100), estimated CTR, SEO strength, emotional trigger, keyword density, character count, and algorithm notes for YouTube/TikTok/Instagram. Identify the best title and what to avoid.

Return ONLY valid JSON:
{
  "titles": [
    {
      "title": "string",
      "viralityScore": 0-100,
      "clickThroughRate": "e.g. 8-12%",
      "seoStrength": "Strong|Medium|Weak",
      "emotionalTrigger": "e.g. Curiosity, Fear of Missing Out, Surprise",
      "keywordDensity": "e.g. High — 3 target keywords",
      "characterCount": 60,
      "algorithm": {
        "youtube": "How this performs on YouTube algorithm",
        "tiktok": "How this performs on TikTok algorithm",
        "instagram": "How this performs on Instagram algorithm"
      },
      "aOrBTest": "What to A/B test against this title",
      "improvement": "One specific improvement suggestion"
    }
  ],
  "bestTitle": "The exact best title string",
  "avoidList": ["Pattern or word to avoid 1", "Pattern or word to avoid 2"],
  "topKeywords": ["keyword1", "keyword2", "keyword3"],
  "searchVolumeEstimate": "Estimated monthly search volume range"
}`,
      },
    ],
  })

  try {
    const text = extractText(response)
    return parseJSON<TitleOutput>(text)
  } catch {
    return {
      titles: [],
      bestTitle: '',
      avoidList: [],
      topKeywords: [],
      searchVolumeEstimate: 'Unknown',
    }
  }
}

export async function generateThumbnailBrief(params: {
  videoTitle: string
  topic: string
  platform: string
  niche: string
  channelStyle?: string
  locale: string
}): Promise<ThumbnailBrief> {
  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    betas: ['interleaved-thinking-2025-05-14'],
    system: `You are ELEVO Creator™'s thumbnail design specialist. You understand exactly what makes thumbnails achieve high CTR on YouTube, TikTok, and Instagram. You are an expert in visual psychology, colour theory, typography, and face expression science. You generate highly actionable thumbnail concepts with exact AI image prompts. You always return valid JSON only.`,
    messages: [
      {
        role: 'user',
        content: `Generate 3 thumbnail concepts for:

Video Title: ${params.videoTitle}
Topic: ${params.topic}
Platform: ${params.platform}
Niche: ${params.niche}
${params.channelStyle ? `Channel Style: ${params.channelStyle}` : ''}
Locale: ${params.locale}

For each concept provide: layout description, face expression, text overlay, text position, colour scheme, background description, emotional impact, CTR prediction, and prompts for Midjourney, DALL·E 3, Ideogram, and Canva instructions.

Return ONLY valid JSON:
{
  "concepts": [
    {
      "concept": "Concept name/description",
      "layout": "Detailed layout description (left face, right text, etc.)",
      "faceExpression": "Specific expression if face is used",
      "textOverlay": "Exact text to overlay",
      "textPosition": "e.g. Top right, Bottom left",
      "colourScheme": "Primary, secondary, accent colours with hex codes",
      "backgroundDescription": "Background detail",
      "emotionalImpact": "What emotion this triggers in viewer",
      "ctrPrediction": "e.g. 8-11% — High",
      "midjourneyPrompt": "Full detailed Midjourney prompt",
      "dallePrompt": "Full DALL·E 3 prompt",
      "ideogramPrompt": "Full Ideogram prompt",
      "canvaInstructions": "Step-by-step Canva creation instructions",
      "fontStyle": "Font recommendations",
      "contrastLevel": "High/Medium contrast description",
      "faceCropTip": "How to crop/position face for maximum impact"
    }
  ],
  "bestConcept": 0,
  "abTestSuggestion": "Which two concepts to A/B test and why",
  "whatMakesThumbsClick": ["Insight 1", "Insight 2", "Insight 3"],
  "platformOptimisation": {
    "youtube": { "dimensions": "1280x720", "safezone": "Safe zone details", "algorithmTip": "YouTube specific tip" },
    "tiktok": { "dimensions": "1080x1920", "safezone": "Safe zone details", "algorithmTip": "TikTok specific tip" },
    "instagram": { "dimensions": "1080x1080", "safezone": "Safe zone details", "algorithmTip": "Instagram specific tip" }
  }
}`,
      },
    ],
  })

  try {
    const text = extractText(response)
    return parseJSON<ThumbnailBrief>(text)
  } catch {
    return {
      concepts: [],
      bestConcept: 0,
      abTestSuggestion: '',
      whatMakesThumbsClick: [],
      platformOptimisation: {},
    }
  }
}

export async function generateEditingBrief(params: {
  platform: string
  videoType: string
  duration: string
  niche: string
  viralGoal: string
  hasTranscript?: string
  locale: string
}): Promise<VideoEditingBrief> {
  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    betas: ['interleaved-thinking-2025-05-14'],
    system: `You are ELEVO Creator™'s video editing specialist. You know every editing technique, transition, effect, and pacing strategy that drives watch time on YouTube, TikTok, and Instagram. You write detailed editing briefs better than any editing software's AI guide. You provide specific CapCut step-by-step instructions. You always return valid JSON only.`,
    messages: [
      {
        role: 'user',
        content: `Generate a complete video editing brief for:

Platform: ${params.platform}
Video Type: ${params.videoType}
Duration: ${params.duration}
Niche: ${params.niche}
Viral Goal: ${params.viralGoal}
${params.hasTranscript ? `Transcript/Script excerpt: ${params.hasTranscript.slice(0, 500)}` : ''}
Locale: ${params.locale}

Create a full editing brief covering: timestamp-by-timestamp edit structure, hook strategy, pacing guide, caption style, audio guide, CapCut step-by-step guide, export settings, and pro tips.

Return ONLY valid JSON:
{
  "platform": "${params.platform}",
  "totalDuration": "${params.duration}",
  "editStructure": [
    {
      "timestamp": "0:00-0:03",
      "section": "Hook",
      "instruction": "Specific edit instruction",
      "bRollSuggestion": "B-roll to use here",
      "transition": "Cut/Jump cut/Zoom/Fade",
      "audioNote": "Music level, sound effect",
      "textOverlay": "Optional text overlay",
      "effect": "Optional effect (zoom in, speed ramp)"
    }
  ],
  "hookStrategy": {
    "openingFrame": "Exact visual for opening frame",
    "openingText": "Text on screen in first 2 seconds",
    "openingAudio": "Audio/music recommendation",
    "hookType": "Pattern interrupt/Question/Statement/Visual shock",
    "whyItWorks": "Psychology behind this hook"
  },
  "pacingGuide": {
    "cutFrequency": "e.g. Cut every 2-3 seconds in first 30 seconds",
    "slowMoMoments": ["Moment 1", "Moment 2"],
    "speedUpMoments": ["Moment 1", "Moment 2"],
    "musicBPMTarget": "e.g. 120-140 BPM",
    "energyArc": "How energy should build through the video"
  },
  "captionStyle": {
    "font": "Font name",
    "size": "Size recommendation",
    "position": "Bottom third/Centre",
    "animation": "Pop/Typewriter/Slide",
    "colour": "Colour with hex",
    "outline": true,
    "highlightKeywords": true,
    "platform": "${params.platform}"
  },
  "audioGuide": {
    "musicMood": "Mood description",
    "recommendedTracks": ["Track type 1", "Track type 2"],
    "soundEffects": ["Effect 1", "Effect 2"],
    "voiceEffects": ["Effect 1"],
    "volumeLevels": "Music at X%, voice at Y%, SFX at Z%"
  },
  "exportSettings": {
    "resolution": "1080p/4K",
    "fps": 30,
    "format": "MP4",
    "bitrate": "Mbps",
    "aspectRatio": "9:16 or 16:9",
    "colourSpace": "sRGB/Rec. 709"
  },
  "capCutGuide": [
    {
      "step": 1,
      "action": "Specific action",
      "whereInApp": "Tab/menu location in CapCut",
      "tip": "Pro tip for this step"
    }
  ],
  "proTips": ["Pro tip 1", "Pro tip 2", "Pro tip 3", "Pro tip 4", "Pro tip 5"]
}`,
      },
    ],
  })

  try {
    const text = extractText(response)
    return parseJSON<VideoEditingBrief>(text)
  } catch {
    return {
      platform: params.platform,
      totalDuration: params.duration,
      editStructure: [],
      hookStrategy: {
        openingFrame: '',
        openingText: '',
        openingAudio: '',
        hookType: '',
        whyItWorks: '',
      },
      pacingGuide: {
        cutFrequency: '',
        slowMoMoments: [],
        speedUpMoments: [],
        musicBPMTarget: '',
        energyArc: '',
      },
      captionStyle: {
        font: '',
        size: '',
        position: '',
        animation: '',
        colour: '',
        outline: true,
        highlightKeywords: true,
        platform: params.platform,
      },
      audioGuide: {
        musicMood: '',
        recommendedTracks: [],
        soundEffects: [],
        voiceEffects: [],
        volumeLevels: '',
      },
      exportSettings: {
        resolution: '1080p',
        fps: 30,
        format: 'MP4',
        bitrate: '8 Mbps',
        aspectRatio: '9:16',
        colourSpace: 'sRGB',
      },
      capCutGuide: [],
      proTips: [],
    }
  }
}

export async function auditChannel(params: {
  platform: string
  channelHandle: string
  niche: string
  goal: string
  locale: string
}): Promise<ChannelAudit> {
  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    betas: ['interleaved-thinking-2025-05-14'],
    tools: [WEB_SEARCH_TOOL],
    system: `You are ELEVO Creator™'s channel growth strategist. You audit YouTube, TikTok, and Instagram channels using real data and web research. You identify exactly why channels are or aren't growing and provide a concrete 30-day plan to fix it. You compare channels to their competitors. You always return valid JSON only.`,
    messages: [
      {
        role: 'user',
        content: `Audit the following creator channel:

Platform: ${params.platform}
Channel Handle: ${params.channelHandle}
Niche: ${params.niche}
Goal: ${params.goal}
Locale: ${params.locale}

Search the web for information about this channel. Analyse their performance, content strategy, growth opportunities, monetisation, SEO, and competitors. Build a 30-day growth plan and content calendar.

Return ONLY valid JSON:
{
  "platform": "${params.platform}",
  "channelHandle": "${params.channelHandle}",
  "performance": {
    "estimatedSubscribers": "e.g. 45,000",
    "estimatedMonthlyViews": "e.g. 380,000",
    "avgViewDuration": "e.g. 4:32",
    "engagementRate": "e.g. 6.2%",
    "uploadFrequency": "e.g. 2x per week",
    "bestPerformingContent": ["Content type 1", "Content type 2"],
    "worstPerformingContent": ["Content type 1"]
  },
  "contentStrategy": {
    "currentPillars": ["Pillar 1", "Pillar 2"],
    "missingPillars": ["Missing pillar 1", "Missing pillar 2"],
    "titlePatterns": ["Pattern 1", "Pattern 2"],
    "thumbnailConsistency": "Analysis of thumbnail consistency",
    "uploadSchedule": "Current upload schedule analysis",
    "bestUploadTimes": ["Thursday 6pm", "Sunday 10am"]
  },
  "growthOpportunities": [
    {
      "opportunity": "Specific opportunity description",
      "effort": "Low/Medium/High",
      "expectedImpact": "e.g. +15% monthly views",
      "priority": 1
    }
  ],
  "monetisationAnalysis": {
    "isMonetised": true,
    "estimatedCPM": "e.g. £3.50-£6.00",
    "estimatedMonthlyRevenue": "e.g. £1,200-£2,100",
    "untappedRevenue": ["Revenue stream 1", "Revenue stream 2"],
    "sponsorshipValue": "e.g. £500-£1,200 per integration"
  },
  "seoAudit": {
    "keywordUsage": "Analysis of keyword usage in titles/descriptions",
    "descriptionOptimisation": "Description quality analysis",
    "tagStrategy": "Tag strategy analysis",
    "playlistStructure": "Playlist organisation analysis",
    "communityEngagement": "Community engagement analysis"
  },
  "competitorComparison": [
    {
      "competitor": "Channel name",
      "theirAdvantage": "What they do better",
      "yourOpportunity": "How to beat them"
    }
  ],
  "thirtyDayGrowthPlan": [
    {
      "week": 1,
      "focus": "Week 1 focus area",
      "actions": ["Action 1", "Action 2", "Action 3"],
      "target": "Measurable target for the week"
    }
  ],
  "contentCalendar": [
    {
      "week": 1,
      "videoIdeas": [
        {
          "title": "Video title",
          "titleViralityScore": 75,
          "format": "Long-form/Short/Live",
          "hook": "Opening hook for this video",
          "estimatedViews": "e.g. 5,000-15,000"
        }
      ]
    }
  ]
}`,
      },
    ],
  })

  try {
    const text = extractText(response)
    return parseJSON<ChannelAudit>(text)
  } catch {
    return {
      platform: params.platform,
      channelHandle: params.channelHandle,
      performance: {
        estimatedSubscribers: 'Unknown',
        estimatedMonthlyViews: 'Unknown',
        avgViewDuration: 'Unknown',
        engagementRate: 'Unknown',
        uploadFrequency: 'Unknown',
        bestPerformingContent: [],
        worstPerformingContent: [],
      },
      contentStrategy: {
        currentPillars: [],
        missingPillars: [],
        titlePatterns: [],
        thumbnailConsistency: '',
        uploadSchedule: '',
        bestUploadTimes: [],
      },
      growthOpportunities: [],
      monetisationAnalysis: {
        isMonetised: false,
        estimatedCPM: 'Unknown',
        estimatedMonthlyRevenue: 'Unknown',
        untappedRevenue: [],
        sponsorshipValue: 'Unknown',
      },
      seoAudit: {
        keywordUsage: '',
        descriptionOptimisation: '',
        tagStrategy: '',
        playlistStructure: '',
        communityEngagement: '',
      },
      competitorComparison: [],
      thirtyDayGrowthPlan: [],
      contentCalendar: [],
    }
  }
}

export async function generateTrafficStrategy(params: {
  platform: string
  channelHandle: string
  recentVideos: Array<{ title: string; views: number; ctr: number; avgWatchTime: string }>
  goal: 'subscribers' | 'views' | 'revenue' | 'brand_deals'
  locale: string
}): Promise<TrafficStrategy> {
  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    betas: ['interleaved-thinking-2025-05-14'],
    tools: [WEB_SEARCH_TOOL],
    system: `You are ELEVO Creator™'s traffic and algorithm specialist. You decode exactly how YouTube, TikTok, and Instagram algorithms distribute content. You build weekly traffic action plans based on real performance data. You always return valid JSON only.`,
    messages: [
      {
        role: 'user',
        content: `Build a traffic strategy for:

Platform: ${params.platform}
Channel Handle: ${params.channelHandle}
Goal: ${params.goal}
Locale: ${params.locale}

Recent Videos Performance:
${params.recentVideos.map(v => `- "${v.title}": ${v.views.toLocaleString()} views, ${v.ctr}% CTR, ${v.avgWatchTime} avg watch time`).join('\n')}

Search for current algorithm updates and best practices for ${params.platform}. Build a comprehensive traffic strategy.

Return ONLY valid JSON:
{
  "trafficSources": {
    "search": "Strategy for search traffic",
    "suggested": "Strategy for suggested/browse traffic",
    "external": "Strategy for external traffic",
    "direct": "Strategy for direct/notification traffic",
    "shorts": "Strategy for Shorts traffic to long-form"
  },
  "searchOptimisation": ["SEO action 1", "SEO action 2", "SEO action 3", "SEO action 4"],
  "suggestedFeaturesFromAlgorithm": ["Feature 1 explanation", "Feature 2 explanation", "Feature 3 explanation"],
  "endScreenStrategy": "Detailed end screen strategy",
  "cardStrategy": "Detailed card strategy",
  "playlistStrategy": "Detailed playlist strategy",
  "communityPostStrategy": "Community post strategy for algorithm boost",
  "shortFormStrategy": "How to use Shorts/Reels to drive long-form traffic",
  "crossPlatformFunnel": "How to funnel traffic from other platforms",
  "collaborationStrategy": "Collaboration and cross-promotion strategy",
  "weeklyTrafficPlan": [
    {
      "day": "Monday",
      "action": "Specific action to take",
      "platform": "${params.platform}",
      "expectedImpact": "Expected traffic impact"
    }
  ]
}`,
      },
    ],
  })

  try {
    const text = extractText(response)
    return parseJSON<TrafficStrategy>(text)
  } catch {
    return {
      trafficSources: {},
      searchOptimisation: [],
      suggestedFeaturesFromAlgorithm: [],
      endScreenStrategy: '',
      cardStrategy: '',
      playlistStrategy: '',
      communityPostStrategy: '',
      shortFormStrategy: '',
      crossPlatformFunnel: '',
      collaborationStrategy: '',
      weeklyTrafficPlan: [],
    }
  }
}
