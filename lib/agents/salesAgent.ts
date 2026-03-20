import { createMessage, getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON } from './client'
import type { BusinessProfile, SalesProposal } from './types'

export async function runSalesAgent(
  business: BusinessProfile,
  params: {
    clientName: string
    clientBusiness?: string
    projectBrief: string
    budget?: string
    timeline?: string
    services: string[]
  }
): Promise<SalesProposal> {
  const client = getClient()

  const response = await createMessage({
    model: MODELS.SPECIALIST,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    system: `You are ELEVO AI's Sales Proposal expert. You write compelling, professional proposals for local businesses that win clients. You know how to position value, overcome objections, and close deals. Every proposal should feel personal, professional, and persuasive — not generic.`,
    messages: [
      {
        role: 'user',
        content: `Write a professional sales proposal for ${business.business_name}.

Business details:
- Type: ${business.category}
- Location: ${business.city}, ${business.country}
- Services offered: ${business.services.join(', ')}
- USPs: ${business.unique_selling_points.join(', ')}
- Tone: ${business.tone_of_voice}

Proposal details:
- Client name: ${params.clientName}
- Client business: ${params.clientBusiness || 'Not specified'}
- Project brief: ${params.projectBrief}
- Services to include: ${params.services.join(', ')}
${params.budget ? `- Budget range: ${params.budget}` : ''}
${params.timeline ? `- Timeline: ${params.timeline}` : ''}

Return ONLY valid JSON:
{
  "executiveSummary": "2-3 sentence compelling summary",
  "problemStatement": "What problem/need this solves for the client",
  "proposedSolution": "Detailed solution paragraph",
  "deliverables": ["Deliverable 1", "Deliverable 2", "Deliverable 3"],
  "pricing": "Pricing structure and packages",
  "timeline": "Project timeline breakdown",
  "whyUs": "Why ${business.business_name} is the right choice",
  "nextSteps": "Clear next steps to move forward",
  "fullDocument": "Complete formatted proposal document (use markdown)"
}`,
      },
    ],
  })

  try {
    return parseJSON<SalesProposal>(extractText(response))
  } catch {
    const raw = extractText(response)
    return {
      executiveSummary: 'Proposal generated.',
      problemStatement: '',
      proposedSolution: raw.slice(0, 1000),
      deliverables: [],
      pricing: '',
      timeline: '',
      whyUs: '',
      nextSteps: '',
      fullDocument: raw,
    }
  }
}
