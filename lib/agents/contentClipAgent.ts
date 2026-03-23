import { createMessage, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON, WEB_SEARCH_TOOL } from './client'
import type { BusinessProfile } from './types'

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ClipInput {
  sourceUrl?: string
  transcript?: string
  videoTitle?: string
  businessProfile: BusinessProfile
  targetPlatforms: string[]
  clipCount: number
  locale: string
}

export interface ClipOutput {
  sourceTitle: string
  sourceDuration: string
  clips: Array<{
    clipNumber: number
    title: string
    startTime: string
    endTime: string
    duration: string
    viralPotential: 'medium' | 'high' | 'explosive'
    viralReason: string
    emotionalHook: string
    platforms: Record<string, {
      hook: string
      caption: string
      hashtags: string[]
      cta: string
      subtitleStyle: string
      thumbnailDescription: string
    }>
    editingNotes: string
    musicSuggestion: string
    transitions: string
    enhancementPrompts: {
      bRollSuggestion: string
      overlayGraphic: string
      titleCardDesign: string
    }
  }>
  overallStrategy: string
  repurposingPlan: string
  postingSchedule: Array<{ clip: number; platform: string; day: string; time: string }>
}

// ─── fetchYouTubeTranscript ───────────────────────────────────────────────────

export async function fetchYouTubeTranscript(
  url: string
): Promise<{ transcript: string; title: string; duration: string }> {
  // Extract video ID
  let videoId: string | null = null
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) {
      videoId = parsed.pathname.slice(1)
    } else {
      videoId = parsed.searchParams.get('v')
    }
  } catch {
    throw new Error('Invalid YouTube URL')
  }

  if (!videoId) throw new Error('Could not extract YouTube video ID from URL')

  // Fetch the watch page and look for ytInitialData captions
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  let html: string
  try {
    const res = await fetch(watchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ELEVO-Clip/1.0)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    html = await res.text()
  } catch (err) {
    throw new Error('Transcript not available for this video. Please paste the transcript manually.')
  }

  // Try to extract title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/)
  const title = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : 'Unknown title'

  // Look for caption tracks in ytInitialPlayerResponse
  // Use a non-dotall approach to avoid ES2018 regex flag requirement
  const captionsIndex = html.indexOf('"captionTracks"')
  let captionsMatch: RegExpMatchArray | null = null
  if (captionsIndex !== -1) {
    const snippet = html.slice(captionsIndex, captionsIndex + 8000)
    captionsMatch = snippet.match(/"captionTracks"\s*:\s*(\[[\s\S]*?\])/)
  }
  if (!captionsMatch) {
    throw new Error('Transcript not available for this video. Please paste the transcript manually.')
  }

  let captionUrl: string | null = null
  try {
    const tracks = JSON.parse(captionsMatch[1]) as Array<{ baseUrl?: string; languageCode?: string }>
    // Prefer English, fall back to first available
    const enTrack = tracks.find(t => t.languageCode === 'en') || tracks[0]
    captionUrl = enTrack?.baseUrl ?? null
  } catch {
    throw new Error('Transcript not available for this video. Please paste the transcript manually.')
  }

  if (!captionUrl) {
    throw new Error('Transcript not available for this video. Please paste the transcript manually.')
  }

  // Fetch the caption XML
  let captionXml: string
  try {
    const res = await fetch(captionUrl)
    if (!res.ok) throw new Error(`Caption fetch failed: ${res.status}`)
    captionXml = await res.text()
  } catch {
    throw new Error('Transcript not available for this video. Please paste the transcript manually.')
  }

  // Parse XML to plain text
  const lines = captionXml.match(/<text[^>]*>([^<]*)<\/text>/g) ?? []
  const transcript = lines
    .map(line => {
      const m = line.match(/<text[^>]*>([^<]*)<\/text>/)
      return m ? m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"') : ''
    })
    .filter(Boolean)
    .join(' ')

  // Try to get duration from ytInitialData
  const durationMatch = html.match(/"lengthSeconds"\s*:\s*"(\d+)"/)
  let duration = 'Unknown'
  if (durationMatch) {
    const secs = parseInt(durationMatch[1], 10)
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    duration = `${mins}:${String(s).padStart(2, '0')}`
  }

  if (!transcript) {
    throw new Error('Transcript not available for this video. Please paste the transcript manually.')
  }

  return { transcript, title, duration }
}

// ─── clipContent ──────────────────────────────────────────────────────────────

export async function clipContent(
  input: ClipInput,
  locale: string
): Promise<ClipOutput> {
  const { businessProfile, targetPlatforms, clipCount } = input

  const sourceInfo = input.transcript
    ? `Transcript:\n${input.transcript.slice(0, 8000)}`
    : input.sourceUrl
    ? `Source URL: ${input.sourceUrl}`
    : 'No source provided'

  const videoTitle = input.videoTitle || 'Untitled video'

  const response = await createMessage({
    model: MODELS.SPECIALIST,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    tools: [WEB_SEARCH_TOOL],
    system: `You are ELEVO Clip™ — Snap, the content repurposing expert. You identify the most viral-worthy moments in long-form content and transform them into short-form clips optimised for TikTok, Instagram Reels, YouTube Shorts, and LinkedIn. You understand the psychology of viral content: pattern interrupts, emotional hooks, surprising statements, and scroll-stopping moments. You always write in the brand's voice and maximise viral potential. Return thorough JSON with no placeholders.`,
    messages: [
      {
        role: 'user',
        content: `Identify the best ${clipCount} clips from this content and create complete repurposing packages.

Video title: ${videoTitle}
Business: ${businessProfile.business_name}
Industry: ${businessProfile.category}
Brand tone: ${businessProfile.tone_of_voice}
Target platforms: ${targetPlatforms.join(', ')}
Locale: ${locale}

${sourceInfo}

For each clip, provide:
1. The exact timestamp/location in the content
2. Why this moment is viral-worthy
3. Platform-specific content for: ${targetPlatforms.join(', ')}
4. Editing and production notes

Return ONLY valid JSON:
{
  "sourceTitle": "${videoTitle}",
  "sourceDuration": "estimated total duration",
  "clips": [
    {
      "clipNumber": 1,
      "title": "clip title",
      "startTime": "0:45",
      "endTime": "1:15",
      "duration": "30 seconds",
      "viralPotential": "explosive",
      "viralReason": "why this will go viral",
      "emotionalHook": "the emotion or curiosity this triggers",
      "platforms": {
        "tiktok": {
          "hook": "first 3 seconds hook text",
          "caption": "full TikTok caption",
          "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
          "cta": "call to action",
          "subtitleStyle": "subtitle styling recommendation",
          "thumbnailDescription": "thumbnail visual description"
        },
        "instagram": {
          "hook": "hook",
          "caption": "caption",
          "hashtags": ["#tag1", "#tag2"],
          "cta": "cta",
          "subtitleStyle": "style",
          "thumbnailDescription": "thumbnail"
        }
      },
      "editingNotes": "specific editing instructions",
      "musicSuggestion": "music style and specific track recommendations",
      "transitions": "transition recommendations",
      "enhancementPrompts": {
        "bRollSuggestion": "b-roll footage suggestion",
        "overlayGraphic": "graphic overlay description",
        "titleCardDesign": "title card design prompt for ELEVO Create™"
      }
    }
  ],
  "overallStrategy": "overall repurposing strategy for this content",
  "repurposingPlan": "how to maximise reach from this single piece of content",
  "postingSchedule": [
    {"clip": 1, "platform": "tiktok", "day": "Monday", "time": "7pm"},
    {"clip": 1, "platform": "instagram", "day": "Tuesday", "time": "12pm"}
  ]
}`,
      },
    ],
  })

  try {
    return parseJSON<ClipOutput>(extractText(response))
  } catch {
    return {
      sourceTitle: videoTitle,
      sourceDuration: 'Unknown',
      clips: [],
      overallStrategy: extractText(response).slice(0, 500),
      repurposingPlan: '',
      postingSchedule: [],
    }
  }
}
