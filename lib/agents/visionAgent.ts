import { createMessage, buildThinkingConfig, parseJSON } from './client'
import type { BusinessProfile } from './types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type VisionImageType =
  | 'ad_creative'
  | 'social_graphic'
  | 'product_mockup'
  | 'brand_visual'
  | 'website_hero'
  | 'logo_concept'
  | 'restaurant_promo'
  | 'lifestyle_photo'

export interface VisionRequest {
  businessProfile: BusinessProfile
  imageType: VisionImageType
  description: string
  style: string
  platform?: string
  dimensions?: string
  brandColours?: string[]
  locale: string
}

export interface VisionOutput {
  imageType: string
  prompts: {
    midjourney: {
      prompt: string
      parameters: string
      negativePrompt: string
      tip: string
    }
    dalle3: {
      prompt: string
      quality: 'standard' | 'hd'
      style: 'natural' | 'vivid'
    }
    stableDiffusion: {
      prompt: string
      negativePrompt: string
      steps: number
      cfgScale: number
    }
    ideogram: {
      prompt: string
      styleType: string
      aspectRatio: string
    }
    adobeFirefly: {
      prompt: string
      contentType: string
    }
    canvaAI: {
      prompt: string
      designType: string
    }
  }
  recommendedPlatform: string
  recommendationReason: string
  variations: Array<{
    name: string
    promptModification: string
    useCase: string
  }>
  brandNotes: string
  colourGuidance: string
  styleGuidance: string
  dimensions: string
  fileFormat: string
  platformSpecificTips: string
}

// ─── Style & dimension maps ───────────────────────────────────────────────────

const DIMENSION_MAP: Record<string, string> = {
  Instagram: '1080x1080 (square) or 1080x1350 (portrait 4:5)',
  Facebook: '1200x630 (landscape)',
  Website: '1920x1080 (16:9) or 1200x800',
  Print: '3508x4961 (A4 at 300dpi)',
  TikTok: '1080x1920 (9:16 vertical)',
  YouTube: '2560x1440 (16:9)',
}

const STYLE_PROMPTS: Record<string, string> = {
  Photorealistic: 'photorealistic, DSLR quality, f/1.8 bokeh, professional photography, 8K resolution',
  Illustrated: 'digital illustration, flat design, vector art, clean lines, vibrant colors',
  Minimalist: 'minimalist, clean white space, simple composition, single focal point, elegant',
  Cinematic: 'cinematic, dramatic lighting, film grain, moody atmosphere, widescreen, movie poster quality',
  Abstract: 'abstract art, geometric shapes, fluid design, bold colors, artistic expression',
}

// ─── Main generator ───────────────────────────────────────────────────────────

export async function generateImagePrompts(
  request: VisionRequest,
  _locale: string
): Promise<VisionOutput> {
  const bp = request.businessProfile
  const style = request.style || 'Photorealistic'
  const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.Photorealistic
  const dimensions = request.dimensions || DIMENSION_MAP[request.platform || 'Instagram'] || '1080x1080'
  const brandColourStr = request.brandColours?.join(', ') || 'brand colors (indigo, white)'

  const prompt = `You are ELEVO Vision™ — Iris, the world's best AI image prompt engineer.

BUSINESS CONTEXT:
- Business: ${bp.business_name}
- Industry: ${bp.category}
- Location: ${bp.city}, ${bp.country}
- Services: ${bp.services.join(', ')}
- USPs: ${bp.unique_selling_points.join(', ')}
- Target Audience: ${bp.target_audience || 'General customers'}

IMAGE REQUEST:
- Type: ${request.imageType}
- Description: ${request.description}
- Style: ${style} — ${stylePrompt}
- Platform: ${request.platform || 'Instagram'}
- Dimensions: ${dimensions}
- Brand Colours: ${brandColourStr}

Generate highly specific, professional image prompts optimised for each AI platform. Each prompt should be actionable — someone should be able to copy it directly into the tool and get excellent results.

Return valid JSON only (no markdown fences):
{
  "imageType": "${request.imageType}",
  "prompts": {
    "midjourney": {
      "prompt": "Complete Midjourney prompt — describe the scene in detail, style, lighting, camera angle, mood. Do NOT include parameters here.",
      "parameters": "--ar 1:1 --v 6.1 --stylize 750 --quality 2 (adjust aspect ratio to ${dimensions.includes('1080') ? '1:1' : '16:9'})",
      "negativePrompt": "--no blurry, distorted, watermark, text, logo, bad anatomy, low quality",
      "tip": "Pro tip specific to Midjourney for this image type"
    },
    "dalle3": {
      "prompt": "Complete DALL-E 3 prompt — be descriptive and specific, include style, mood, and composition. DALL-E 3 responds well to detailed descriptions.",
      "quality": "hd",
      "style": "natural"
    },
    "stableDiffusion": {
      "prompt": "Complete SD prompt with trigger words, style tokens, and quality boosters like (masterpiece:1.2), (best quality:1.4), highly detailed",
      "negativePrompt": "blurry, bad anatomy, worst quality, low quality, watermark, signature, text, username",
      "steps": 30,
      "cfgScale": 7
    },
    "ideogram": {
      "prompt": "Complete Ideogram prompt — great for text in images. Include specific typography details if needed.",
      "styleType": "${style}",
      "aspectRatio": "ASPECT_1_1"
    },
    "adobeFirefly": {
      "prompt": "Complete Firefly prompt — optimised for commercial use, brand-safe output",
      "contentType": "${request.imageType.replace('_', ' ')}"
    },
    "canvaAI": {
      "prompt": "Complete Canva AI prompt — simple, clear description for Canva's AI generator",
      "designType": "${request.imageType === 'social_graphic' ? 'Social media post' : request.imageType.replace('_', ' ')}"
    }
  },
  "recommendedPlatform": "Best AI tool for this specific request",
  "recommendationReason": "Why this tool is best for this image type and style",
  "variations": [
    {
      "name": "Variation name",
      "promptModification": "How to modify the base prompt for this variation",
      "useCase": "When to use this variation"
    },
    {
      "name": "Variation 2",
      "promptModification": "Modification",
      "useCase": "Use case"
    },
    {
      "name": "Variation 3",
      "promptModification": "Modification",
      "useCase": "Use case"
    }
  ],
  "brandNotes": "Specific advice on incorporating ${bp.business_name}'s brand into this image",
  "colourGuidance": "Detailed colour recommendations and hex codes that work for this image type and brand",
  "styleGuidance": "Visual style direction, mood board suggestions, reference points",
  "dimensions": "${dimensions}",
  "fileFormat": "Best file format (JPEG/PNG/WebP/SVG) for this use case and why",
  "platformSpecificTips": "Specific tips for posting/using this image on ${request.platform || 'Instagram'}"
}`

  const response = await createMessage({
    model: 'claude-opus-4-6',
    max_tokens: 8000,
    thinking: buildThinkingConfig(),
    betas: ['interleaved-thinking-2025-05-14'],
    effort: 'high',
    messages: [{ role: 'user', content: prompt }],
  })

  let jsonText = ''
  for (const block of response.content) {
    if (block.type === 'text') {
      jsonText += block.text
    }
  }

  return parseJSON<VisionOutput>(jsonText)
}
