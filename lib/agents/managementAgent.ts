import { createMessage, getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON } from './client'
import type { BusinessProfile, HRDocument } from './types'

export type HRDocumentType =
  | 'job_description'
  | 'employment_contract_outline'
  | 'performance_review'
  | 'disciplinary_letter'
  | 'onboarding_checklist'
  | 'staff_handbook_section'
  | 'team_meeting_agenda'
  | 'redundancy_letter_outline'

export async function runManagementAgent(
  business: BusinessProfile,
  params: {
    documentType: HRDocumentType
    roleName?: string
    employeeName?: string
    specificContext: string
    companySize?: number
  }
): Promise<HRDocument> {
  const client = getClient()

  const docLabels: Record<HRDocumentType, string> = {
    job_description: 'Job Description',
    employment_contract_outline: 'Employment Contract Outline',
    performance_review: 'Performance Review',
    disciplinary_letter: 'Disciplinary Letter',
    onboarding_checklist: 'Onboarding Checklist',
    staff_handbook_section: 'Staff Handbook Section',
    team_meeting_agenda: 'Team Meeting Agenda',
    redundancy_letter_outline: 'Redundancy Letter Outline',
  }

  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    system: `You are ELEVO AI's HR & Management document expert for small businesses. You create professional, legally sensible (though not legally binding) HR and management documents tailored to small local businesses. You write clearly and practically, avoiding corporate jargon. Always note that users should seek legal advice for binding documents.`,
    messages: [
      {
        role: 'user',
        content: `Create a ${docLabels[params.documentType]} for ${business.business_name}.

Business context:
- Type: ${business.category}
- Location: ${business.city}, ${business.country}
- Team size: ${params.companySize || 'Small team'}

Document context:
- Role: ${params.roleName || 'Team member'}
${params.employeeName ? `- Employee name: ${params.employeeName}` : ''}
- Specific requirements: ${params.specificContext}

Return ONLY valid JSON:
{
  "documentType": "${docLabels[params.documentType]}",
  "title": "Document title",
  "sections": [
    { "heading": "Section heading", "content": "Section content" }
  ],
  "fullDocument": "Complete formatted document ready to use (use markdown). Include note at bottom that legal review is recommended."
}`,
      },
    ],
  })

  try {
    return parseJSON<HRDocument>(extractText(response))
  } catch {
    return {
      documentType: docLabels[params.documentType],
      title: `${docLabels[params.documentType]} — ${business.business_name}`,
      sections: [],
      fullDocument: extractText(response),
    }
  }
}
