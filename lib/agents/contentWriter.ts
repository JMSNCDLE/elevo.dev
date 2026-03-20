import { createMessage, getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON } from './client'
import type { GenerationInput, GenerationOutput, SEOScore } from './types'

export async function runContentWriter(input: GenerationInput): Promise<GenerationOutput> {
  const client = getClient()
  const bp = input.businessProfile

  const systemPrompt = `You are ELEVO AI's expert content writer, specialising in hyper-local business marketing for ${bp.business_name}, a ${bp.category} business in ${bp.city}, ${bp.country}.

Business context:
- Services: ${bp.services.join(', ')}
- USPs: ${bp.unique_selling_points.join(', ')}
- Tone of voice: ${bp.tone_of_voice}
- Website: ${bp.website_url || 'Not provided'}
- Target audience: ${bp.target_audience || 'Local customers'}

Rules:
- NEVER use generic filler phrases like "In today's competitive landscape" or "Look no further"
- ALWAYS include local references (city, area, neighbourhood where natural)
- Write in the business's tone of voice — authentically, not like an AI
- Include a clear, specific CTA
- Optimise naturally for the target keyword — do not keyword-stuff
- Write as if you ARE the business owner

Return ONLY valid JSON (no markdown fences):
{
  "primary": "main content piece (complete, publication-ready)",
  "alternatives": ["alternative version 1", "alternative version 2"],
  "seoScore": {
    "score": 75,
    "keywordPresence": true,
    "localRelevance": true,
    "ctaPresent": true,
    "lengthOk": true,
    "readabilityOk": true,
    "feedback": "Brief SEO feedback"
  },
  "wordCount": 120,
  "hashtags": ["#hashtag1", "#hashtag2"],
  "schemaJson": null
}`

  const userPrompt = buildUserPrompt(input)

  const response = await createMessage({
    model: MODELS.SPECIALIST,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const raw = extractText(response)

  try {
    const parsed = parseJSON<{
      primary: string
      alternatives: string[]
      seoScore: SEOScore
      wordCount: number
      hashtags?: string[]
      schemaJson?: string
    }>(raw)

    return {
      ...parsed,
      contentType: input.type,
    }
  } catch {
    // Fallback if JSON parsing fails
    return {
      primary: raw.slice(0, 2000),
      alternatives: [],
      seoScore: {
        score: 60,
        keywordPresence: false,
        localRelevance: true,
        ctaPresent: false,
        lengthOk: true,
        readabilityOk: true,
        feedback: 'Score estimated — parsing issue.',
      },
      wordCount: raw.split(' ').length,
      contentType: input.type,
    }
  }
}

function buildUserPrompt(input: GenerationInput): string {
  const bp = input.businessProfile

  switch (input.type) {
    case 'gbp_post':
      return `Write a Google Business Profile post for ${bp.business_name}.
Topic: ${input.topic || `Our ${input.service || bp.services[0]} service`}
${input.service ? `Featured service: ${input.service}` : ''}
${input.keyword ? `Target keyword: ${input.keyword}` : ''}
${input.season ? `Seasonal angle: ${input.season}` : ''}
Character limit: 1,500. Optimal: 150–300 words. Include a CTA and local reference.`

    case 'blog':
      return `Write a blog post for ${bp.business_name}'s website.
Topic: ${input.topic}
${input.keyword ? `Target keyword: ${input.keyword}` : ''}
${input.service ? `Featured service: ${input.service}` : ''}
Intent: ${input.intent || 'informational'}
Target word count: ${input.wordCount || 800} words.
Structure with H2/H3 headings. Include local references, expert insights, and a CTA.`

    case 'social_caption':
      return `Write a social media caption for ${bp.business_name} on ${input.platform || 'Instagram'}.
Topic: ${input.topic}
${input.angle ? `Angle: ${input.angle}` : ''}
${input.service ? `Featured service: ${input.service}` : ''}
${input.includeHashtags ? 'Include 10–15 relevant hashtags.' : 'No hashtags needed.'}
Caption must be engaging, authentic, and platform-appropriate.`

    case 'review_response':
      return `Write a professional, warm response to this customer review for ${bp.business_name}.
Star rating: ${input.starRating || 5}/5
Reviewer name: ${input.reviewerName || 'Customer'}
Review content: "${input.reviewText || 'Great service, highly recommend!'}"
Response should be personal, grateful, mention the service, include the business name, and end with an invitation to return.`

    case 'email':
      return `Write an email for ${bp.business_name}.
Goal: ${input.goal || 'newsletter'}
Topic/Subject: ${input.topic}
${input.offer ? `Special offer: ${input.offer}` : ''}
${input.service ? `Featured service: ${input.service}` : ''}
Include: compelling subject line, personable opening, clear body, strong CTA. Format as JSON with subject and body fields within the primary field.`

    case 'seo':
      return `Write SEO-optimised website copy for ${bp.business_name}.
Page type: ${input.schemaType || 'Service page'}
Target keyword: ${input.keyword || input.service || bp.services[0]}
Page URL: ${input.pageUrl || bp.website_url || ''}
Page title: ${input.pageTitle || ''}
Write meta title, meta description, H1, and 3 content paragraphs. Optimise naturally.`

    case 'repurposed':
      return `Repurpose the following content for ${bp.business_name}:
Source: ${input.topic}
Target format: ${input.goal || 'social_caption'}
Adapt the core message for the new format while keeping the brand voice.`

    default:
      return `Create high-quality ${input.type} content for ${bp.business_name}. Topic: ${input.topic || 'Brand showcase'}`
  }
}
