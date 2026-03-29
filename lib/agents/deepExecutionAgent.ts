import { createMessage, MODELS, extractText, parseJSON } from './client'

export interface DeepExecutionResult {
  sections: Array<{ title: string; content: string }>
  keyFindings: string[]
  recommendations: string[]
  downloadableContent: string
}

export async function runDeepExecution(params: {
  task: string
  businessProfile: Record<string, unknown>
  outputFormat: 'document' | 'presentation' | 'spreadsheet' | 'report'
  locale: string
}): Promise<DeepExecutionResult> {
  const { task, businessProfile, outputFormat, locale } = params

  const businessName = (businessProfile?.business_name as string) ?? 'the business'
  const industry = (businessProfile?.industry as string) ?? 'general'
  const location = (businessProfile?.location as string) ?? 'UK'

  const systemPrompt = `You are ELEVO Deep™ — the most powerful AI execution engine for complex business tasks.
You operate at the level of a McKinsey consultant, Goldman Sachs analyst, and Fortune 500 strategist combined.

Business: ${businessName}
Industry: ${industry}
Location: ${location}
Output format requested: ${outputFormat}
Locale: ${locale}

Execute the task with extreme thoroughness. Produce professional, actionable, and detailed output.
Structure your response as a complete ${outputFormat} with multiple sections.

Respond ONLY with JSON.`

  const prompt = `Execute this complex business task completely:

TASK: ${task}

Return a comprehensive JSON response:
{
  "sections": [
    { "title": "Section title", "content": "Detailed section content (multiple paragraphs, bullet points, data, analysis)" },
    { "title": "Section 2", "content": "..." }
  ],
  "keyFindings": ["Key finding 1", "Key finding 2", "Key finding 3", "Key finding 4", "Key finding 5"],
  "recommendations": ["Specific action 1", "Specific action 2", "Specific action 3", "Specific action 4", "Specific action 5"],
  "downloadableContent": "The full formatted text of the document ready for copy-paste or download (use markdown formatting)"
}

Include at least 5-8 sections. Each section should be substantive and professional.`

  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    betas: ['interleaved-thinking-2025-05-14'],
    messages: [{ role: 'user', content: prompt }],
    system: systemPrompt,
  })

  const text = extractText(response)
  try {
    return parseJSON<DeepExecutionResult>(text)
  } catch {
    return {
      sections: [{ title: 'Execution Complete', content: text }],
      keyFindings: ['Analysis complete — see full content above'],
      recommendations: ['Review the generated content and implement the recommendations'],
      downloadableContent: text,
    }
  }
}
