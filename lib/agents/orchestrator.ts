import { getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON } from './client'
import type { GenerationInput, GenerationOutput, GrowthType } from './types'
import { runContentWriter } from './contentWriter'
import { runValidator } from './validator'

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export async function runOrchestrator(input: GenerationInput): Promise<GenerationOutput> {
  const client = getClient()

  // Get high-level strategy from Opus
  const strategyResponse = await client.messages.create({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    system: `You are the ELEVO AI Orchestrator. Your role is to analyse content generation requests and provide strategic direction for specialist agents. You deeply understand local business marketing, brand voice, and what makes content convert.`,
    messages: [
      {
        role: 'user',
        content: `Analyse this content request and provide strategic direction:

Business: ${input.businessProfile.business_name}
Category: ${input.businessProfile.category}
Location: ${input.businessProfile.city}, ${input.businessProfile.country}
Services: ${input.businessProfile.services.join(', ')}
USPs: ${input.businessProfile.unique_selling_points.join(', ')}
Tone: ${input.businessProfile.tone_of_voice}
Content Type: ${input.type}
Topic/Brief: ${input.topic || 'General brand content'}
${input.keyword ? `Target Keyword: ${input.keyword}` : ''}
${input.service ? `Featured Service: ${input.service}` : ''}
${input.goal ? `Goal: ${input.goal}` : ''}
${input.platform ? `Platform: ${input.platform}` : ''}

Provide a JSON strategy object:
{
  "angle": "the best content angle to take",
  "keyMessages": ["message 1", "message 2", "message 3"],
  "seoFocus": "primary SEO keyword to weave in naturally",
  "localHook": "local relevance hook to use",
  "ctaRecommendation": "specific CTA to include",
  "toneGuidance": "specific tone adjustments for this piece"
}`,
      },
    ],
  })

  let strategy: {
    angle: string
    keyMessages: string[]
    seoFocus: string
    localHook: string
    ctaRecommendation: string
    toneGuidance: string
  }

  try {
    strategy = parseJSON(extractText(strategyResponse))
  } catch {
    strategy = {
      angle: 'showcase expertise and local presence',
      keyMessages: ['Quality service', 'Local expertise', 'Customer satisfaction'],
      seoFocus: input.keyword || input.businessProfile.category,
      localHook: `Serving ${input.businessProfile.city}`,
      ctaRecommendation: 'Contact us today',
      toneGuidance: input.businessProfile.tone_of_voice,
    }
  }

  // Generate content with specialist
  const enrichedInput: GenerationInput = {
    ...input,
    angle: strategy.angle,
    topic: `${input.topic || ''} | Strategy: ${strategy.angle} | Key messages: ${strategy.keyMessages.join('; ')} | Local hook: ${strategy.localHook} | CTA: ${strategy.ctaRecommendation}`,
  }

  const output = await runContentWriter(enrichedInput)

  // Validate quality
  const validation = await runValidator(output, input.businessProfile)

  // Retry once if score too low
  if (validation.score < 60) {
    const retryInput: GenerationInput = {
      ...enrichedInput,
      topic: `${enrichedInput.topic} | IMPROVEMENT NEEDED: ${validation.issues.join('; ')}`,
    }
    const retryOutput = await runContentWriter(retryInput)
    return retryOutput
  }

  return output
}

// ─── Growth Orchestrator ──────────────────────────────────────────────────────

export async function classifyGrowthTask(
  type: GrowthType,
  businessProfile: { business_name: string; category: string; city: string }
): Promise<string> {
  return `${type} for ${businessProfile.business_name} (${businessProfile.category}) in ${businessProfile.city}`
}
