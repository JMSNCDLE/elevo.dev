// ─── ELEVO Rank — SEO Agent ───────────────────────────────────────────────────
// Uses claude-sonnet-4-6 + web_search, effort "high"

import { createMessage, MODELS, MAX_TOKENS, WEB_SEARCH_TOOL, extractText } from './client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SEOAuditResult {
  targetKeywords: string[]
  currentRankings: Record<string, string>
  competitorDomains: string[]
  contentGaps: string[]
  technicalIssues: string[]
  backlinkOpportunities: string[]
  localSEOScore: number
  recommendations: Array<{
    priority: 'critical' | 'high' | 'medium'
    action: string
    expectedImpact: string
    timeToSeeResults: string
  }>
  blogTopics: Array<{
    title: string
    targetKeyword: string
    searchVolume: string
    difficulty: string
    outline: string[]
  }>
}

export interface SEOBlogPost {
  title: string
  metaTitle: string
  metaDescription: string
  slug: string
  content: string
  internalLinks: string[]
  faqSection: Array<{ question: string; answer: string }>
  schemaMarkup: string
  wordCount: number
  readingTime: string
}

// ─── SEO Audit ────────────────────────────────────────────────────────────────

export async function runSEOAudit(
  domain: string,
  targetKeywords: string[],
  locale: string
): Promise<SEOAuditResult> {
  const message = await createMessage({
    model: MODELS.SPECIALIST,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: { type: 'adaptive' },
    effort: 'high',
    tools: [WEB_SEARCH_TOOL],
    messages: [
      {
        role: 'user',
        content: `You are ELEVO Rank, an expert SEO strategist. Run a comprehensive SEO audit for ${domain}.

Target keywords: ${targetKeywords.join(', ')}
Locale: ${locale}

Use web_search to:
1. Search for "${targetKeywords[0]}" and note top 5 results
2. Search for "site:${domain}" to understand current content
3. Search for main competitors in the ${locale === 'es' ? 'Spanish' : 'UK/global'} market
4. Check what content gaps exist

Return a JSON object:
{
  "targetKeywords": ${JSON.stringify(targetKeywords)},
  "currentRankings": { "keyword": "estimated position or 'not ranking'" },
  "competitorDomains": ["domain1.com", "domain2.com"],
  "contentGaps": ["topic competitor ranks for that domain doesn't cover"],
  "technicalIssues": ["issue 1", "issue 2"],
  "backlinkOpportunities": ["site 1 to get backlink from", "directory 2"],
  "localSEOScore": 65,
  "recommendations": [
    { "priority": "critical", "action": "Add FAQ schema to pricing page", "expectedImpact": "+15% CTR", "timeToSeeResults": "2-4 weeks" }
  ],
  "blogTopics": [
    { "title": "How AI is changing local business marketing in 2025", "targetKeyword": "AI for local business", "searchVolume": "8,100/mo", "difficulty": "Medium", "outline": ["Introduction", "The problem with traditional marketing", "How AI solves it", "Case study", "FAQ"] }
  ]
}`,
      },
    ],
  })

  const text = extractText(message)
  const json = text.match(/\{[\s\S]*\}/)?.[0] ?? '{}'
  try {
    return JSON.parse(json) as SEOAuditResult
  } catch {
    return {
      targetKeywords,
      currentRankings: {},
      competitorDomains: [],
      contentGaps: [],
      technicalIssues: ['Could not complete automated audit — provide domain access'],
      backlinkOpportunities: [],
      localSEOScore: 0,
      recommendations: [],
      blogTopics: [],
    }
  }
}

// ─── Blog Post Generator ──────────────────────────────────────────────────────

export async function generateSEOBlogPost(
  topic: string,
  targetKeyword: string,
  businessContext: string,
  locale: string
): Promise<SEOBlogPost> {
  const message = await createMessage({
    model: MODELS.SPECIALIST,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: { type: 'adaptive' },
    effort: 'high',
    tools: [WEB_SEARCH_TOOL],
    messages: [
      {
        role: 'user',
        content: `You are ELEVO Rank. Write a comprehensive SEO-optimised blog post for ELEVO AI's website.

Topic: ${topic}
Target keyword: "${targetKeyword}"
Business context: ${businessContext}
Language: ${locale}

Use web_search to research current content ranking for "${targetKeyword}" to identify what comprehensive coverage requires.

Write a complete, original 1,500-2,000 word article that:
- Uses the target keyword in H1, first paragraph, and 2-3 subheadings naturally
- Covers the topic more comprehensively than existing results
- Includes practical examples specific to local businesses
- Has strong E-E-A-T signals (expert insights, concrete data)
- Ends with a clear CTA to try ELEVO AI free

Return JSON:
{
  "title": "H1 title with keyword",
  "metaTitle": "60-char SEO title | ELEVO AI",
  "metaDescription": "155-char meta description with keyword and CTA",
  "slug": "url-slug-with-keyword",
  "content": "Full markdown article with proper ## headings, **bold**, bullet points",
  "internalLinks": ["/pricing", "/en/signup"],
  "faqSection": [
    { "question": "FAQ question with keyword", "answer": "Detailed answer" }
  ],
  "schemaMarkup": "{ JSON-LD Article schema as string }",
  "wordCount": 1800,
  "readingTime": "7 min read"
}`,
      },
    ],
  })

  const text = extractText(message)
  const json = text.match(/\{[\s\S]*\}/)?.[0] ?? '{}'
  try {
    return JSON.parse(json) as SEOBlogPost
  } catch {
    return {
      title: topic,
      metaTitle: `${topic} | ELEVO AI`,
      metaDescription: `Learn about ${targetKeyword} with ELEVO AI.`,
      slug: targetKeyword.toLowerCase().replace(/\s+/g, '-'),
      content: text,
      internalLinks: ['/pricing'],
      faqSection: [],
      schemaMarkup: '{}',
      wordCount: 1000,
      readingTime: '4 min read',
    }
  }
}
