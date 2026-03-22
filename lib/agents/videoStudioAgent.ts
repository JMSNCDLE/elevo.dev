// ─── Video Studio Agent (Vega — expanded) ────────────────────────────────────
// Arcads + Creatify + ElevenLabs + Higgsfield — all in one.

import { createMessage, MODELS, MAX_TOKENS } from './client'
import type { BusinessProfile } from './types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AvatarAdResult {
  hook: string
  script: string
  onScreenText: string[]
  avatarDirection: string
  backgroundSuggestion: string
  musicMood: string
  elevenLabsVoicePrompt: string
  dIdPrompt: string
  heygenPrompt: string
  capcut_template: string
  estimatedCTR: string
  whyThisWorks: string
}

export interface ProductVideoResult {
  scrapedHighlights: string[]
  videoStructure: Array<{
    second: string
    visual: string
    text: string
    voiceover: string
  }>
  fullScript: string
  elevenLabsPrompt: string
  higgsfieldScenes: string[]
  musicRecommendation: string
  callToAction: string
  adCopyVariations: string[]
  landingPageSuggestions: string[]
}

export interface VoiceoverResult {
  script: string
  ssmlMarkup: string
  voiceRecommendations: Array<{
    voiceId: string
    voiceName: string
    why: string
    sampleText: string
  }>
  elevenLabsSettings: {
    stability: number
    similarityBoost: number
    style: number
    speakerBoost: boolean
  }
  musicBed: string
  pacing: string
  pauseMarkers: string
}

// ─── Avatar Ad (Arcads-style) ─────────────────────────────────────────────────

export async function generateAvatarAdScript(params: {
  businessProfile: BusinessProfile
  productOrService: string
  painPoint: string
  platform: string
  duration: '15s' | '30s' | '60s'
  tone: 'conversational' | 'energetic' | 'authoritative' | 'friendly'
  locale: string
}): Promise<AvatarAdResult> {
  const { businessProfile: bp, productOrService, painPoint, platform, duration, tone, locale } = params

  const wordCount = duration === '15s' ? '35-40' : duration === '30s' ? '75-85' : '150-165'

  const message = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: { type: 'adaptive' },
    effort: 'high',
    messages: [
      {
        role: 'user',
        content: `You are Vega, ELEVO's AI Video Studio agent. Create a complete Arcads-style avatar ad script package.

Business: ${bp.business_name} (${bp.category})
Location: ${bp.city}, ${bp.country}
Product/Service: ${productOrService}
Pain Point addressed: ${painPoint}
Platform: ${platform}
Duration: ${duration} (${wordCount} words)
Tone: ${tone}
Language: ${locale}
USPs: ${bp.unique_selling_points?.join(', ') ?? 'N/A'}
Target audience: ${bp.target_audience ?? 'local customers'}

Return a JSON object with these exact fields:
{
  "hook": "First 3 seconds — must stop scroll, create pattern interrupt",
  "script": "Full word-for-word script with [PAUSE 0.5s], [EMPHASIS], [GESTURE: point] markers",
  "onScreenText": ["array of text overlays", "each timed to script moments"],
  "avatarDirection": "Detailed direction for avatar gestures, expressions, eye contact, movement",
  "backgroundSuggestion": "Background scene description for D-ID or HeyGen",
  "musicMood": "Specific music mood and BPM for background track",
  "elevenLabsVoicePrompt": "Exact ElevenLabs voice settings and what to paste in the prompt field",
  "dIdPrompt": "Full D-ID avatar generation prompt including presenter description",
  "heygenPrompt": "Full HeyGen avatar generation prompt with avatar style and scene",
  "capcut_template": "CapCut template instructions: cuts, transitions, text animations",
  "estimatedCTR": "Predicted CTR based on hook strength and platform (e.g. '3.2-4.5%')",
  "whyThisWorks": "2-3 sentences explaining the psychological hooks used"
}`,
      },
    ],
  })

  const raw = message.content.find(b => b.type === 'text')?.text ?? '{}'
  const json = raw.match(/\{[\s\S]*\}/)?.[0] ?? raw
  return JSON.parse(json) as AvatarAdResult
}

// ─── Product URL to Video (Creatify-style) ────────────────────────────────────

export async function generateProductVideoFromUrl(params: {
  productUrl: string
  businessProfile: BusinessProfile
  platform: string
  objective: 'sales' | 'awareness' | 'traffic'
  locale: string
}): Promise<ProductVideoResult> {
  const { productUrl, businessProfile: bp, platform, objective, locale } = params

  const message = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: { type: 'adaptive' },
    effort: 'high',
    messages: [
      {
        role: 'user',
        content: `You are Vega, ELEVO's AI Video Studio agent. Create a complete Creatify-style product video package from a URL.

Business: ${bp.business_name} (${bp.category})
Product URL: ${productUrl}
Platform: ${platform}
Objective: ${objective}
Language: ${locale}

Since you cannot browse the URL, use the business context to infer what the page likely contains and build the best possible video structure.

Return a JSON object:
{
  "scrapedHighlights": ["key product/service benefits you extracted or inferred from URL and business context"],
  "videoStructure": [
    { "second": "0-3", "visual": "Opening scene description", "text": "On-screen text", "voiceover": "What's said" },
    { "second": "3-8", "visual": "...", "text": "...", "voiceover": "..." },
    { "second": "8-20", "visual": "...", "text": "...", "voiceover": "..." },
    { "second": "20-28", "visual": "...", "text": "...", "voiceover": "..." },
    { "second": "28-30", "visual": "CTA scene", "text": "CTA text", "voiceover": "CTA script" }
  ],
  "fullScript": "Complete narration script for the full video",
  "elevenLabsPrompt": "Exact prompt for ElevenLabs voice generation",
  "higgsfieldScenes": ["scene 1 for Higgsfield prompt", "scene 2", "scene 3"],
  "musicRecommendation": "Specific music genre, mood, BPM for this video",
  "callToAction": "Primary CTA text and suggested button/link",
  "adCopyVariations": ["headline variation 1", "headline variation 2", "headline variation 3"],
  "landingPageSuggestions": ["improvement 1 for conversion", "improvement 2"]
}`,
      },
    ],
  })

  const raw = message.content.find(b => b.type === 'text')?.text ?? '{}'
  const json = raw.match(/\{[\s\S]*\}/)?.[0] ?? raw
  return JSON.parse(json) as ProductVideoResult
}

// ─── Voiceover Script (ElevenLabs-style) ─────────────────────────────────────

export async function generateVoiceoverScript(params: {
  businessProfile: BusinessProfile
  content: string
  voiceStyle: string
  emotion: 'excited' | 'calm' | 'urgent' | 'warm' | 'professional'
  language: string
  platform: string
}): Promise<VoiceoverResult> {
  const { businessProfile: bp, content, voiceStyle, emotion, language, platform } = params

  const message = await createMessage({
    model: MODELS.SPECIALIST,
    max_tokens: MAX_TOKENS.MEDIUM,
    thinking: { type: 'adaptive' },
    effort: 'medium',
    messages: [
      {
        role: 'user',
        content: `You are Vega, ELEVO's AI Video Studio agent. Optimise this content for text-to-speech voiceover.

Business: ${bp.business_name} (${bp.category})
Content: ${content}
Voice style: ${voiceStyle}
Emotion: ${emotion}
Language: ${language}
Platform: ${platform}

Return a JSON object:
{
  "script": "TTS-optimised script (short sentences, natural rhythm, no symbols that confuse TTS)",
  "ssmlMarkup": "Full SSML version with <break>, <prosody rate>, <emphasis> tags for ElevenLabs",
  "voiceRecommendations": [
    { "voiceId": "EXAVITQu4vr4xnSDxMaL", "voiceName": "Sarah", "why": "Why this voice works", "sampleText": "Sample sentence in this voice style" },
    { "voiceId": "onwK4e9ZLuTAKqWW03F9", "voiceName": "Daniel", "why": "Why this voice works", "sampleText": "Sample sentence" },
    { "voiceId": "XB0fDUnXU5powFXDhCwa", "voiceName": "Charlotte", "why": "Why this voice works", "sampleText": "Sample sentence" }
  ],
  "elevenLabsSettings": {
    "stability": 0.5,
    "similarityBoost": 0.75,
    "style": 0.5,
    "speakerBoost": true
  },
  "musicBed": "Specific background music recommendation: genre, mood, volume level behind voice",
  "pacing": "Fast/Medium/Slow — with specific guidance on where to speed up or slow down",
  "pauseMarkers": "Where to add pauses in the script for maximum impact"
}`,
      },
    ],
  })

  const raw = message.content.find(b => b.type === 'text')?.text ?? '{}'
  const json = raw.match(/\{[\s\S]*\}/)?.[0] ?? raw
  return JSON.parse(json) as VoiceoverResult
}
