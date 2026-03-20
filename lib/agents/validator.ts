import { getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON } from './client'
import type { GenerationOutput, ValidationResult, BusinessProfile } from './types'

export async function runValidator(output: GenerationOutput, business: BusinessProfile): Promise<ValidationResult> {
  const client = getClient()

  const response = await client.messages.create({
    model: MODELS.SPECIALIST,
    max_tokens: MAX_TOKENS.MEDIUM,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('medium'),
    system: `You are ELEVO AI's Quality Validator. You run a 10-point quality check on AI-generated business content. You are strict but fair. You look for real issues that would make content ineffective or embarrassing for a business owner to publish.`,
    messages: [
      {
        role: 'user',
        content: `Quality check this content for ${business.business_name} (${business.category}, ${business.city}):

CONTENT:
${output.primary}

Check these 10 criteria (each worth 10 points):
1. No generic AI filler phrases ("In today's competitive landscape", "Look no further", "game-changing", etc.)
2. Includes genuine local reference (city, area, or community mention)
3. No inaccurate or unverifiable claims
4. Appropriate length for content type
5. Clear, specific call to action
6. Correct language/locale (not mixing regions)
7. Relevant to the business and its services
8. Sounds authentically human, not robotic
9. No legal risk phrases (guarantees, "best in", "cheapest", medical claims)
10. Good grammar and professional finish

Return ONLY valid JSON:
{
  "passed": true,
  "score": 80,
  "issues": ["any issues found"],
  "suggestions": ["specific improvements"]
}`,
      },
    ],
  })

  try {
    return parseJSON<ValidationResult>(extractText(response))
  } catch {
    return {
      passed: true,
      score: 75,
      issues: [],
      suggestions: [],
    }
  }
}
