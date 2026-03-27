import { createMessage, getClient, MODELS, MAX_TOKENS, WEB_SEARCH_TOOL, extractText, parseJSON } from './client'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface WebsiteAuditResult {
  domain: string
  score: number // 0–100
  issues: {
    type: string
    severity: 'high' | 'medium' | 'low'
    description: string
    recommendation: string
  }[]
  opportunities: string[]
  currentPerformance: {
    seo: number
    content: number
    conversion: number
    localSeo: number
  }
  summary: string
}

export interface WebsiteChange {
  id: string
  pageUrl: string
  changeType: 'headline' | 'cta' | 'content' | 'meta' | 'schema' | 'new-page'
  currentContent?: string
  proposedContent: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  estimatedImpact: string
}

// ─── System Prompt ─────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Wren, ELEVO AI's website editor agent. You help small businesses improve their websites with data-driven recommendations. You are precise, actionable, and focused on conversions and local SEO.

When auditing websites, you:
1. Assess SEO fundamentals (meta tags, headings, structured data)
2. Evaluate content quality and clarity
3. Review conversion optimisation (CTAs, forms, trust signals)
4. Check local SEO signals (NAP consistency, Google Business Profile alignment)
5. Identify quick wins and high-impact improvements

Always return valid JSON when asked. Be specific and actionable — vague advice wastes time.`

// ─── Audit Website ──────────────────────────────────────────────────────────

export async function auditWebsite(
  domain: string,
  businessProfile: Record<string, unknown>,
  locale: string
): Promise<WebsiteAuditResult> {
  const client = getClient()

  const prompt = `Audit the website for ${domain}.

Business context:
- Name: ${businessProfile.name}
- Category: ${businessProfile.category}
- Location: ${businessProfile.city}, ${businessProfile.country}
- Services: ${Array.isArray(businessProfile.services) ? (businessProfile.services as string[]).join(', ') : businessProfile.services}

Use web search to examine the website at ${domain} and analyse:
1. SEO performance (meta tags, headings, structured data, local signals)
2. Content quality and relevance
3. Conversion optimisation (CTAs, trust signals, contact forms)
4. Local SEO (NAP, Google Business alignment, location pages)

Return a JSON object matching this exact structure:
{
  "domain": "${domain}",
  "score": <0-100 overall score>,
  "issues": [
    {
      "type": "<type>",
      "severity": "<high|medium|low>",
      "description": "<what the issue is>",
      "recommendation": "<specific fix>"
    }
  ],
  "opportunities": ["<opportunity 1>", "<opportunity 2>"],
  "currentPerformance": {
    "seo": <0-100>,
    "content": <0-100>,
    "conversion": <0-100>,
    "localSeo": <0-100>
  },
  "summary": "<2-3 sentence executive summary>"
}

Language/locale context: ${locale}`

  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: { type: 'adaptive' },
    tools: [WEB_SEARCH_TOOL],
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = extractText(response)
  return parseJSON<WebsiteAuditResult>(text)
}

// ─── Generate Website Changes ───────────────────────────────────────────────

export async function generateWebsiteChanges(
  audit: WebsiteAuditResult,
  bp: Record<string, unknown>,
  priorities: string[],
  locale: string
): Promise<WebsiteChange[]> {
  const client = getClient()

  const prompt = `Based on this website audit, generate specific content changes to implement.

Audit results:
${JSON.stringify(audit, null, 2)}

Business profile:
- Name: ${bp.name}
- Services: ${Array.isArray(bp.services) ? (bp.services as string[]).join(', ') : bp.services}
- Location: ${bp.city}, ${bp.country}
- Unique selling points: ${Array.isArray(bp.unique_selling_points) ? (bp.unique_selling_points as string[]).join(', ') : bp.unique_selling_points}

Priority areas: ${priorities.join(', ')}

Generate 5-8 specific, implementable changes. Return a JSON array:
[
  {
    "id": "<unique-id>",
    "pageUrl": "<page path e.g. / or /services>",
    "changeType": "<headline|cta|content|meta|schema|new-page>",
    "currentContent": "<existing text if known>",
    "proposedContent": "<the exact new text to use>",
    "reason": "<why this change will help>",
    "priority": "<high|medium|low>",
    "estimatedImpact": "<expected improvement e.g. +15% CTR>"
  }
]

Locale: ${locale}`

  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: { type: 'adaptive' },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = extractText(response)
  return parseJSON<WebsiteChange[]>(text)
}

// ─── Generate Full Page Content ─────────────────────────────────────────────

export async function generatePageContent(
  pageType: 'home' | 'about' | 'services' | 'contact' | 'faq',
  bp: Record<string, unknown>,
  params: Record<string, string>,
  locale: string
): Promise<string> {
  const client = getClient()

  const prompt = `Generate complete ${pageType} page content for ${bp.name}.

Business:
- Name: ${bp.name}
- Category: ${bp.category}
- Location: ${bp.city}, ${bp.country}
- Services: ${Array.isArray(bp.services) ? (bp.services as string[]).join(', ') : bp.services}
- USPs: ${Array.isArray(bp.unique_selling_points) ? (bp.unique_selling_points as string[]).join(', ') : bp.unique_selling_points}
- Description: ${bp.description}

Additional parameters: ${JSON.stringify(params)}

Write compelling, conversion-focused copy for the ${pageType} page. Include:
- A strong headline
- Supporting subheadline
- Key body sections with clear headings
- Strong call-to-action
- Local SEO keywords naturally integrated

Format as clean HTML sections with semantic tags. Locale: ${locale}`

  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: { type: 'adaptive' },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  return extractText(response)
}
