import { createMessage, buildThinkingConfig, parseJSON } from './client'
import type { BusinessProfile } from './types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DocumentType =
  | 'report'
  | 'proposal'
  | 'presentation'
  | 'spreadsheet'
  | 'business_plan'
  | 'invoice'
  | 'contract'
  | 'marketing_brief'
  | 'press_release'
  | 'email_sequence'

export interface DocumentRequest {
  businessProfile: BusinessProfile
  documentType: DocumentType
  title: string
  description: string
  audience?: string
  tone?: string
  includeSections?: string[]
  locale: string
}

export interface DocumentSection {
  heading: string
  content: string
  subsections?: Array<{ heading: string; content: string }>
  tableData?: Array<Record<string, string>>
  chartData?: object
}

export interface DocumentOutput {
  title: string
  documentType: DocumentType
  wordCount: number
  sections: DocumentSection[]
  markdownContent: string
  htmlContent: string
  presentationOutline: string
  downloadInstructions: {
    word: string
    googleDocs: string
    notion: string
    pdf: string
  }
  executiveSummary: string
  keyPoints: string[]
}

// ─── Document type descriptions ───────────────────────────────────────────────

const DOC_TYPE_DESCRIPTIONS: Record<DocumentType, string> = {
  report: 'A comprehensive analytical report with findings, data insights, and recommendations',
  proposal: 'A professional business proposal with problem statement, solution, pricing, and next steps',
  presentation: 'A slide-by-slide presentation deck with talking points and visual guidance',
  spreadsheet: 'A structured data template with headers, formulas guidance, and example rows',
  business_plan: 'A full business plan covering executive summary, market analysis, operations, financials',
  invoice: 'A professional invoice template with line items, payment terms, and branding',
  contract: 'A legally structured contract or agreement document with standard clauses',
  marketing_brief: 'A detailed marketing brief covering objectives, audience, messaging, and channels',
  press_release: 'A professionally formatted press release with headline, lede, body, and boilerplate',
  email_sequence: 'A multi-email sequence with subject lines, body copy, and send timing',
}

// ─── Main generator ───────────────────────────────────────────────────────────

export async function generateDocument(
  request: DocumentRequest,
  _locale: string
): Promise<DocumentOutput> {
  const bp = request.businessProfile
  const docDesc = DOC_TYPE_DESCRIPTIONS[request.documentType]
  const tone = request.tone || 'Professional'

  const prompt = `You are ELEVO Docs™ — Quill, the world's best business document generator.

BUSINESS CONTEXT:
- Business Name: ${bp.business_name}
- Category: ${bp.category}
- Location: ${bp.city}, ${bp.country}
- Services: ${bp.services.join(', ')}
- Unique Selling Points: ${bp.unique_selling_points.join(', ')}
- Target Audience: ${bp.target_audience || 'General business customers'}
- Tone of Voice: ${bp.tone_of_voice}

DOCUMENT REQUEST:
- Document Type: ${request.documentType} — ${docDesc}
- Title: ${request.title}
- Description/Purpose: ${request.description}
- Target Audience: ${request.audience || 'Business stakeholders'}
- Tone: ${tone}
${request.includeSections ? `- Required Sections: ${request.includeSections.join(', ')}` : ''}

Generate a complete, professional, ready-to-send document. Every section must have substantial, real content — not placeholder text. Write as if you are the business owner.

For a ${request.documentType}, include all standard sections appropriate for the document type. Make it thorough and specific to this business.

Return valid JSON only (no markdown fences) in exactly this structure:
{
  "title": "string",
  "executiveSummary": "2-3 paragraph executive summary or overview",
  "keyPoints": ["5-7 key points or highlights"],
  "sections": [
    {
      "heading": "Section Heading",
      "content": "Full paragraph content for this section — multiple paragraphs if needed",
      "subsections": [
        { "heading": "Subsection", "content": "Content" }
      ],
      "tableData": [
        { "Column1": "Value", "Column2": "Value" }
      ]
    }
  ],
  "presentationOutline": "For presentations: slide-by-slide breakdown (Slide 1: Title, Slide 2: ...). For other types: brief 3-4 line outline.",
  "downloadInstructions": {
    "word": "Step-by-step: 1) Copy the content below 2) Open Microsoft Word 3) Paste 4) Apply Heading styles from Format menu 5) Save as .docx",
    "googleDocs": "Step-by-step: 1) Go to docs.google.com 2) Create new document 3) Paste content 4) Use Format > Paragraph styles for headings 5) Share as needed",
    "notion": "Step-by-step: 1) Open Notion 2) Create new page 3) Type / to insert blocks 4) Use Heading 1/2/3 blocks 5) Paste each section",
    "pdf": "Step-by-step: 1) Open in Google Docs or Word 2) File > Print 3) Select 'Save as PDF' as printer 4) Download"
  }
}`

  const response = await createMessage({
    model: 'claude-opus-4-6',
    max_tokens: 12000,
    thinking: buildThinkingConfig(),
    betas: ['interleaved-thinking-2025-05-14'],
    effort: 'high',
    messages: [{ role: 'user', content: prompt }],
  })

  // Extract text content
  let jsonText = ''
  for (const block of response.content) {
    if (block.type === 'text') {
      jsonText += block.text
    }
  }

  const parsed = parseJSON<{
    title: string
    executiveSummary: string
    keyPoints: string[]
    sections: DocumentSection[]
    presentationOutline: string
    downloadInstructions: DocumentOutput['downloadInstructions']
  }>(jsonText)

  // Build markdown from sections
  const markdownContent = buildMarkdown(parsed.title, parsed.sections, parsed.executiveSummary)

  // Build HTML from sections
  const htmlContent = buildHTML(parsed.title, bp.business_name, parsed.sections, parsed.executiveSummary, tone)

  // Count words
  const wordCount = markdownContent.split(/\s+/).filter(Boolean).length

  return {
    title: parsed.title,
    documentType: request.documentType,
    wordCount,
    sections: parsed.sections,
    markdownContent,
    htmlContent,
    presentationOutline: parsed.presentationOutline,
    downloadInstructions: parsed.downloadInstructions,
    executiveSummary: parsed.executiveSummary,
    keyPoints: parsed.keyPoints,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildMarkdown(title: string, sections: DocumentSection[], summary: string): string {
  const lines: string[] = [`# ${title}`, '', `## Executive Summary`, '', summary, '']

  for (const section of sections) {
    lines.push(`## ${section.heading}`, '', section.content, '')

    if (section.tableData && section.tableData.length > 0) {
      const keys = Object.keys(section.tableData[0])
      lines.push('| ' + keys.join(' | ') + ' |')
      lines.push('| ' + keys.map(() => '---').join(' | ') + ' |')
      for (const row of section.tableData) {
        lines.push('| ' + keys.map(k => row[k] || '').join(' | ') + ' |')
      }
      lines.push('')
    }

    if (section.subsections) {
      for (const sub of section.subsections) {
        lines.push(`### ${sub.heading}`, '', sub.content, '')
      }
    }
  }

  return lines.join('\n')
}

function buildHTML(
  title: string,
  businessName: string,
  sections: DocumentSection[],
  summary: string,
  tone: string
): string {
  const sectionHtml = sections
    .map(s => {
      let html = `<section style="margin-bottom:2rem;">
      <h2 style="font-size:1.4rem;font-weight:700;color:#1a1a2e;border-bottom:2px solid #6366f1;padding-bottom:0.5rem;margin-bottom:1rem;">${s.heading}</h2>
      <p style="line-height:1.8;color:#374151;white-space:pre-line;">${s.content}</p>`

      if (s.tableData && s.tableData.length > 0) {
        const keys = Object.keys(s.tableData[0])
        html += `<table style="width:100%;border-collapse:collapse;margin-top:1rem;">
          <thead><tr>${keys.map(k => `<th style="background:#6366f1;color:#fff;padding:0.5rem 0.75rem;text-align:left;font-size:0.85rem;">${k}</th>`).join('')}</tr></thead>
          <tbody>${s.tableData.map((row, i) => `<tr style="background:${i % 2 === 0 ? '#f9fafb' : '#fff'};">${keys.map(k => `<td style="padding:0.5rem 0.75rem;border-bottom:1px solid #e5e7eb;font-size:0.85rem;color:#374151;">${row[k] || ''}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>`
      }

      if (s.subsections) {
        for (const sub of s.subsections) {
          html += `<div style="margin-top:1.25rem;">
            <h3 style="font-size:1.1rem;font-weight:600;color:#4338ca;margin-bottom:0.5rem;">${sub.heading}</h3>
            <p style="line-height:1.8;color:#374151;white-space:pre-line;">${sub.content}</p>
          </div>`
        }
      }

      html += `</section>`
      return html
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:800px;margin:0 auto;padding:2rem;background:#fff;color:#111827;">
  <header style="border-bottom:3px solid #6366f1;padding-bottom:1.5rem;margin-bottom:2rem;">
    <p style="font-size:0.8rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#6366f1;margin-bottom:0.5rem;">${businessName}</p>
    <h1 style="font-size:2rem;font-weight:800;color:#1a1a2e;margin:0 0 0.5rem 0;line-height:1.2;">${title}</h1>
    <p style="font-size:0.85rem;color:#6b7280;">Generated by ELEVO Docs™ · Tone: ${tone}</p>
  </header>
  <section style="background:#f5f3ff;border-left:4px solid #6366f1;padding:1.25rem 1.5rem;border-radius:0 0.5rem 0.5rem 0;margin-bottom:2rem;">
    <h2 style="font-size:1rem;font-weight:700;color:#4338ca;margin-bottom:0.75rem;text-transform:uppercase;letter-spacing:0.05em;">Executive Summary</h2>
    <p style="line-height:1.8;color:#374151;white-space:pre-line;">${summary}</p>
  </section>
  ${sectionHtml}
  <footer style="border-top:1px solid #e5e7eb;padding-top:1.5rem;margin-top:3rem;text-align:center;">
    <p style="font-size:0.75rem;color:#9ca3af;">Generated by ELEVO Docs™ for ${businessName} · elevo.dev</p>
  </footer>
</body>
</html>`
}
