import type { ToolDefinition } from './types'

export const generateDocumentTool: ToolDefinition = {
  name: 'generate_document',
  description: 'Generate a professional branded DOCX document. Use for reports, plans, proposals, contracts.',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Document title' },
      sections: {
        type: 'array',
        description: 'Document sections with optional headings and content',
      },
    },
    required: ['title', 'sections'],
  },
  sensitive: false,
  async execute(input) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev'}/api/documents/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) return { success: false, message: 'Document generation failed' }
    return { success: true, message: `Document "${input.title}" generated. Download ready.` }
  },
}
