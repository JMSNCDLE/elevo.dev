import type { BusinessProfile } from './types'
import { createMessage, MODELS, WEB_SEARCH_TOOL, extractText, parseJSON } from './client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreativeOutputType =
  | 'text_to_image'
  | 'text_to_video'
  | 'image_to_video'
  | 'text_to_speech'
  | 'speech_to_text'
  | 'image_edit'
  | 'brand_design'
  | 'social_graphic'
  | 'ad_creative'
  | 'logo_concept'
  | 'product_mockup'

export interface CreativeRequest {
  businessProfile: BusinessProfile
  outputType: CreativeOutputType
  description: string
  style?: string
  dimensions?: string
  brandColours?: string[]
  referenceUrl?: string
  platform?: string
  locale: string
}

export interface CreativeOutput {
  outputType: CreativeOutputType
  description: string
  prompts: {
    midjourney?: {
      prompt: string
      parameters: string
      negativePrompt: string
      tips: string
    }
    dalle3?: {
      prompt: string
      style: string
      quality: string
    }
    stableDiffusion?: {
      prompt: string
      negativePrompt: string
      cfgScale: number
      steps: number
      sampler: string
    }
    ideogram?: {
      prompt: string
      styleType: string
      aspectRatio: string
    }
    firefly?: {
      prompt: string
      contentType: string
      visualIntensity: number
    }
    soraV2?: {
      prompt: string
      duration: string
      aspectRatio: string
      resolution: string
      motionNotes: string
      tips: string
    }
    veo3?: {
      prompt: string
      duration: string
      aspectRatio: string
      cameraMotion: string
      lighting: string
      tips: string
    }
    kling3?: {
      prompt: string
      mode: string
      duration: string
      negativePrompt: string
      tips: string
    }
    runwayGen4?: {
      prompt: string
      cameraMotion: string
      duration: string
      tips: string
    }
    higgsfield?: {
      prompt: string
      style: string
      level: string
      cameraMotion: string
      lighting: string
      variations: string[]
      tips: string
    }
    pika?: {
      prompt: string
      motionStrength: number
      guidanceScale: number
      tips: string
    }
    elevenlabs?: {
      script: string
      voiceRecommendations: Array<{
        voiceId: string
        voiceName: string
        why: string
      }>
      stability: number
      similarityBoost: number
      style: number
      ssmlMarkup: string
    }
    openaiTTS?: {
      script: string
      voice: string
      speed: number
    }
    notebookLM?: {
      prompt: string
      format: string
    }
    canvaPrompt?: {
      description: string
      designType: string
      elements: string[]
      colourPalette: string[]
      typography: string
    }
    figmaPrompt?: {
      componentDescription: string
      designSystem: string
      constraints: string
    }
  }
  recommendedTools: Array<{
    rank: number
    tool: string
    why: string
    estimatedTime: string
    costEstimate: string
    bestFor: string
  }>
  brandConsistency: {
    coloursUsed: string[]
    fontSuggestions: string[]
    styleGuidance: string
    doNots: string[]
  }
  usageGuidance: {
    platform: string
    dimensions: string
    fileFormat: string
    maxFileSize: string
    notes: string
  }
  variations: Array<{
    direction: string
    keyChange: string
    promptModification: string
  }>
  creditCost: number
  estimatedProductionTime: string
}

// ─── Helper: which tools to include per output type ───────────────────────────

function toolsForOutputType(outputType: CreativeOutputType): string {
  switch (outputType) {
    case 'text_to_image':
    case 'image_edit':
    case 'logo_concept':
    case 'product_mockup':
      return 'midjourney, dalle3, stableDiffusion, ideogram, firefly, canvaPrompt'
    case 'text_to_video':
    case 'image_to_video':
      return 'soraV2, veo3, kling3, runwayGen4, higgsfield, pika'
    case 'text_to_speech':
    case 'speech_to_text':
      return 'elevenlabs, openaiTTS, notebookLM'
    case 'brand_design':
      return 'midjourney, dalle3, ideogram, firefly, canvaPrompt, figmaPrompt'
    case 'social_graphic':
    case 'ad_creative':
      return 'midjourney, dalle3, ideogram, canvaPrompt, figmaPrompt'
    default:
      return 'midjourney, dalle3, stableDiffusion, ideogram, canvaPrompt'
  }
}

// ─── generateCreativePrompts ──────────────────────────────────────────────────

export async function generateCreativePrompts(
  request: CreativeRequest,
  locale: string
): Promise<CreativeOutput> {
  const { businessProfile, outputType, description, style, dimensions, brandColours, referenceUrl, platform } = request

  const toolSet = toolsForOutputType(outputType)

  const systemPrompt = `You are ELEVO Create™ — the world's most advanced AI creative director for small businesses.
You know every major AI creative tool intimately: Midjourney, DALL·E 3, Stable Diffusion, Ideogram, Adobe Firefly,
Sora 2, Veo 3, Kling 3, Higgsfield, Runway Gen-4, Pika, ElevenLabs, OpenAI TTS, Canva, Figma, and NotebookLM.

Your job: given a business context and creative brief, generate PERFECT, production-ready prompts for every relevant AI tool.
The prompts must be specific, detailed, and immediately usable — not generic templates.
Always incorporate brand voice, local identity, and target audience into every prompt.

Output valid JSON only. No markdown fences, no explanation outside the JSON object.`

  const userMessage = `Business: ${businessProfile.business_name}
Category: ${businessProfile.category}
Location: ${businessProfile.city}, ${businessProfile.country}
Services: ${businessProfile.services.join(', ')}
Tone: ${businessProfile.tone_of_voice}
USPs: ${businessProfile.unique_selling_points.join(', ')}
Target audience: ${businessProfile.target_audience ?? 'local customers'}
${brandColours ? `Brand colours: ${brandColours.join(', ')}` : ''}
${businessProfile.description ? `Description: ${businessProfile.description}` : ''}

Creative request:
- Output type: ${outputType}
- Description: ${description}
${style ? `- Style: ${style}` : ''}
${dimensions ? `- Dimensions: ${dimensions}` : ''}
${platform ? `- Platform: ${platform}` : ''}
${referenceUrl ? `- Reference URL: ${referenceUrl}` : ''}

Generate prompts for these tools (only include in JSON the tools relevant for ${outputType}): ${toolSet}

Return a JSON object exactly matching this TypeScript interface (omit prompt keys not relevant to the output type):
{
  "outputType": "${outputType}",
  "description": "Brief creative direction summary",
  "prompts": {
    "midjourney": { "prompt": "...", "parameters": "--ar 16:9 --stylize 750 etc", "negativePrompt": "...", "tips": "..." },
    "dalle3": { "prompt": "...", "style": "vivid|natural", "quality": "hd|standard" },
    "stableDiffusion": { "prompt": "...", "negativePrompt": "...", "cfgScale": 7, "steps": 30, "sampler": "DPM++ 2M Karras" },
    "ideogram": { "prompt": "...", "styleType": "...", "aspectRatio": "..." },
    "firefly": { "prompt": "...", "contentType": "photo|graphic|art", "visualIntensity": 75 },
    "soraV2": { "prompt": "...", "duration": "5s", "aspectRatio": "16:9", "resolution": "1080p", "motionNotes": "...", "tips": "..." },
    "veo3": { "prompt": "...", "duration": "8s", "aspectRatio": "16:9", "cameraMotion": "...", "lighting": "...", "tips": "..." },
    "kling3": { "prompt": "...", "mode": "standard|pro", "duration": "5s", "negativePrompt": "...", "tips": "..." },
    "runwayGen4": { "prompt": "...", "cameraMotion": "...", "duration": "4s", "tips": "..." },
    "higgsfield": { "prompt": "...", "style": "...", "level": "low|medium|high", "cameraMotion": "...", "lighting": "...", "variations": ["variation1", "variation2"], "tips": "..." },
    "pika": { "prompt": "...", "motionStrength": 2, "guidanceScale": 12, "tips": "..." },
    "elevenlabs": { "script": "...", "voiceRecommendations": [{"voiceId": "...", "voiceName": "...", "why": "..."}], "stability": 0.7, "similarityBoost": 0.85, "style": 0.5, "ssmlMarkup": "..." },
    "openaiTTS": { "script": "...", "voice": "alloy|echo|fable|onyx|nova|shimmer", "speed": 1.0 },
    "notebookLM": { "prompt": "...", "format": "podcast|summary" },
    "canvaPrompt": { "description": "...", "designType": "...", "elements": ["..."], "colourPalette": ["#hex"], "typography": "..." },
    "figmaPrompt": { "componentDescription": "...", "designSystem": "...", "constraints": "..." }
  },
  "recommendedTools": [
    { "rank": 1, "tool": "ToolName", "why": "...", "estimatedTime": "2 minutes", "costEstimate": "Free / $0.04 per image", "bestFor": "..." }
  ],
  "brandConsistency": {
    "coloursUsed": ["#hex"],
    "fontSuggestions": ["Font name — use for headings"],
    "styleGuidance": "...",
    "doNots": ["Do not use...", "Avoid..."]
  },
  "usageGuidance": {
    "platform": "${platform ?? 'General'}",
    "dimensions": "${dimensions ?? '1920x1080'}",
    "fileFormat": "PNG|MP4|WAV",
    "maxFileSize": "10MB",
    "notes": "..."
  },
  "variations": [
    { "direction": "...", "keyChange": "...", "promptModification": "..." }
  ],
  "creditCost": 1,
  "estimatedProductionTime": "5-10 minutes"
}`

  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    betas: ['interleaved-thinking-2025-05-14'],
    effort: 'high',
    tools: [WEB_SEARCH_TOOL],
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const text = extractText(response)
  return parseJSON<CreativeOutput>(text)
}

// ─── generateBrandKit ─────────────────────────────────────────────────────────

export interface BrandKit {
  logoPrompts: Record<string, string>
  colourPalette: Array<{ hex: string; name: string; usage: string }>
  typographyPairing: { heading: string; body: string; accent: string }
  iconStyle: string
  photographyDirection: string
  videoStyle: string
  socialTemplateDescriptions: string[]
  brandVoice: string
  moodboardPrompts: string[]
}

export async function generateBrandKit(params: {
  businessProfile: BusinessProfile
  style: string
  targetAudience: string
  locale: string
}): Promise<BrandKit> {
  const { businessProfile, style, targetAudience } = params

  const systemPrompt = `You are ELEVO Create™ — expert brand designer and AI creative director.
Generate a complete, production-ready brand kit for a local business.
Output valid JSON only. No markdown fences.`

  const userMessage = `Business: ${businessProfile.business_name}
Category: ${businessProfile.category}
Location: ${businessProfile.city}, ${businessProfile.country}
Services: ${businessProfile.services.join(', ')}
USPs: ${businessProfile.unique_selling_points.join(', ')}
Tone: ${businessProfile.tone_of_voice}
Style preference: ${style}
Target audience: ${targetAudience}
${businessProfile.description ? `Description: ${businessProfile.description}` : ''}

Generate a complete brand kit as JSON:
{
  "logoPrompts": {
    "midjourney": "Complete Midjourney prompt for logo...",
    "dalle3": "Complete DALL·E 3 prompt for logo...",
    "ideogram": "Complete Ideogram prompt for logo (great for text in images)...",
    "firefly": "Adobe Firefly prompt...",
    "stableDiffusion": "Stable Diffusion prompt..."
  },
  "colourPalette": [
    { "hex": "#HEXCODE", "name": "Colour name", "usage": "Primary brand colour — use for CTAs, headings" },
    { "hex": "#HEXCODE", "name": "Colour name", "usage": "Secondary — use for backgrounds" },
    { "hex": "#HEXCODE", "name": "Colour name", "usage": "Accent — use for highlights" },
    { "hex": "#HEXCODE", "name": "Colour name", "usage": "Text — use for body copy" },
    { "hex": "#HEXCODE", "name": "Colour name", "usage": "Light — use for backgrounds" }
  ],
  "typographyPairing": {
    "heading": "Font name — why it fits and where to get it",
    "body": "Font name — why it fits and where to get it",
    "accent": "Font name — for pull quotes, CTAs"
  },
  "iconStyle": "Detailed description of icon style — line weight, style, corner radius, etc.",
  "photographyDirection": "Detailed photography art direction — lighting, composition, subjects, mood, colour grading",
  "videoStyle": "Video style direction — pacing, music genre, colour grade, motion graphics style",
  "socialTemplateDescriptions": [
    "Instagram post template description with layout and design direction",
    "Instagram Story template description",
    "Facebook post template description",
    "LinkedIn post template description",
    "TikTok video intro template description"
  ],
  "brandVoice": "Detailed brand voice guide — tone, vocabulary, dos and don'ts, example phrases",
  "moodboardPrompts": [
    "Midjourney prompt for moodboard image 1",
    "Midjourney prompt for moodboard image 2",
    "Midjourney prompt for moodboard image 3",
    "Midjourney prompt for moodboard image 4",
    "Midjourney prompt for moodboard image 5"
  ]
}`

  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    betas: ['interleaved-thinking-2025-05-14'],
    effort: 'high',
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const text = extractText(response)
  return parseJSON<BrandKit>(text)
}

// ─── generateSocialGraphic ────────────────────────────────────────────────────

export interface SocialGraphicResult {
  canvasLayout: string
  imagePrompt: string
  textOverlay: string
  colourScheme: string
  fontPairing: string
  allToolPrompts: Record<string, string>
}

export async function generateSocialGraphic(params: {
  businessProfile: BusinessProfile
  platform: string
  contentType: string
  topic: string
  copy?: string
  locale: string
}): Promise<SocialGraphicResult> {
  const { businessProfile, platform, contentType, topic, copy } = params

  const systemPrompt = `You are ELEVO Create™ — expert social media graphic designer.
Generate a complete social graphic brief with prompts for every major design AI tool.
Output valid JSON only. No markdown fences.`

  const userMessage = `Business: ${businessProfile.business_name}
Category: ${businessProfile.category}
Location: ${businessProfile.city}, ${businessProfile.country}
Tone: ${businessProfile.tone_of_voice}
USPs: ${businessProfile.unique_selling_points.join(', ')}

Social graphic request:
- Platform: ${platform}
- Content type: ${contentType}
- Topic: ${topic}
${copy ? `- Copy/text to include: ${copy}` : ''}

Return JSON:
{
  "canvasLayout": "Detailed layout description — where each element goes, hierarchy, spacing, proportions",
  "imagePrompt": "The primary AI image generation prompt (Midjourney style, highly detailed)",
  "textOverlay": "Exact text to overlay on the graphic with placement instructions",
  "colourScheme": "Primary + secondary + text colours with hex codes and usage",
  "fontPairing": "Heading font + body font with size recommendations",
  "allToolPrompts": {
    "midjourney": "Full Midjourney prompt with parameters",
    "dalle3": "Full DALL·E 3 prompt",
    "canva": "Canva design description and element instructions",
    "ideogram": "Ideogram prompt (good for text-in-image)",
    "adobe_firefly": "Adobe Firefly prompt",
    "stable_diffusion": "Stable Diffusion prompt with negative prompt"
  }
}`

  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: 5000,
    thinking: { type: 'adaptive' },
    betas: ['interleaved-thinking-2025-05-14'],
    effort: 'medium',
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const text = extractText(response)
  return parseJSON<SocialGraphicResult>(text)
}
