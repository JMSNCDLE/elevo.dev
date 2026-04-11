// ─── ELEVO Rank — SEO Agent ───────────────────────────────────────────────────
// Uses claude-sonnet-4-6 + web_search

import { createMessage, MODELS, MAX_TOKENS, WEB_SEARCH_TOOL, extractText } from './client'

// ─── Ahrefs-inspired comprehensive audit types ───────────────────────────────

export type AuditDepth = 'quick' | 'full' | 'deep'
export type IssueSeverity = 'critical' | 'warning' | 'passed'
export type KeywordIntent = 'informational' | 'commercial' | 'transactional' | 'navigational'

export interface ComprehensiveAuditOverview {
  seoScore: number          // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  technicalHealth: number   // 0-100
  contentScore: number      // 0-100
  backlinkScore: number     // 0-100
  pageSpeed: 'fast' | 'medium' | 'slow'
  mobileReady: boolean
  summary: string
}

export interface KeywordAnalysisRow {
  keyword: string
  estimatedVolume: number   // monthly searches
  difficulty: number        // 0-100
  intent: KeywordIntent
  currentRanking: string    // "5" | "Not ranked" | "Top 3" | etc
  opportunityScore: number  // 0-100
  suggestedAction: string
}

export interface TechnicalIssue {
  severity: IssueSeverity
  category: string
  title: string
  pageUrl?: string
  description: string
  fix: string
}

export interface ContentPlanItem {
  week: number
  title: string
  targetKeyword: string
  difficulty: number
  intent: KeywordIntent
  pillarPage: boolean
}

export interface CompetitorRow {
  domain: string
  estimatedAuthority: number
  estimatedKeywords: number
  topPages: string[]
  contentGaps: string[]
}

export interface ComprehensiveAuditResult {
  overview: ComprehensiveAuditOverview
  keywords: KeywordAnalysisRow[]
  relatedKeywords: string[]
  technicalIssues: TechnicalIssue[]
  contentPlan: ContentPlanItem[]
  competitors: CompetitorRow[]
}

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
    model: MODELS.AGENT,
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

// ─── Comprehensive Ahrefs-inspired audit ─────────────────────────────────────

export async function runComprehensiveAudit(args: {
  domain: string
  keywords: string[]
  competitorDomains: string[]
  targetCountry: string
  locale: string
  depth: AuditDepth
}): Promise<ComprehensiveAuditResult> {
  const { domain, keywords, competitorDomains, targetCountry, locale, depth } = args

  // Use Opus only for "deep" depth, sonnet otherwise (per user rule)
  const model = depth === 'deep' ? MODELS.ORCHESTRATOR : MODELS.AGENT

  const message = await createMessage({
    model,
    max_tokens: MAX_TOKENS.HIGH,
    tools: [WEB_SEARCH_TOOL],
    messages: [
      {
        role: 'user',
        content: `You are ELEVO Rank™ — a senior SEO strategist running an Ahrefs-level comprehensive audit.

Domain: ${domain}
Target country: ${targetCountry}
Locale: ${locale}
Audit depth: ${depth}
Target keywords (${keywords.length}): ${keywords.join(', ')}
${competitorDomains.length ? `Competitor domains (${competitorDomains.length}): ${competitorDomains.join(', ')}` : 'No competitors provided.'}

Use web_search to:
1. Search each target keyword in google.${targetCountry === 'us' ? 'com' : targetCountry} and note top 10 results
2. Search "site:${domain}" to map indexed pages
3. ${competitorDomains.length ? `For each competitor: site:<competitor> + check homepage + identify their top organic keywords and content gaps vs ${domain}` : 'Identify the top 3 most likely competitors in this niche'}
4. Estimate search volume + keyword difficulty based on top-ranking pages and competition

Return ONLY valid JSON matching this exact TypeScript shape (no markdown fences, no commentary):

{
  "overview": {
    "seoScore": <0-100>,
    "grade": "A" | "B" | "C" | "D" | "F",
    "technicalHealth": <0-100>,
    "contentScore": <0-100>,
    "backlinkScore": <0-100>,
    "pageSpeed": "fast" | "medium" | "slow",
    "mobileReady": <boolean>,
    "summary": "<2-3 sentence executive summary>"
  },
  "keywords": [
    {
      "keyword": "<keyword>",
      "estimatedVolume": <number, monthly searches>,
      "difficulty": <0-100>,
      "intent": "informational" | "commercial" | "transactional" | "navigational",
      "currentRanking": "<position string or 'Not ranked'>",
      "opportunityScore": <0-100, computed as (volume * (100 - difficulty)) / volume_max * 100>,
      "suggestedAction": "Create page" | "Optimize existing" | "Build backlinks" | "Already ranking"
    }
  ],
  "relatedKeywords": ["<10 long-tail keywords>"],
  "technicalIssues": [
    {
      "severity": "critical" | "warning" | "passed",
      "category": "<e.g. Meta tags / Crawlability / Performance / Mobile / Schema>",
      "title": "<short issue title>",
      "pageUrl": "<optional page URL>",
      "description": "<what the issue is>",
      "fix": "<concrete fix recommendation>"
    }
  ],
  "contentPlan": [
    {
      "week": <1-12>,
      "title": "<blog post title>",
      "targetKeyword": "<keyword>",
      "difficulty": <0-100>,
      "intent": "informational" | "commercial" | "transactional" | "navigational",
      "pillarPage": <boolean>
    }
  ],
  "competitors": [
    {
      "domain": "<competitor.com>",
      "estimatedAuthority": <0-100>,
      "estimatedKeywords": <number>,
      "topPages": ["<url1>", "<url2>", "<url3>"],
      "contentGaps": ["<keyword they rank for that ${domain} doesn't>"]
    }
  ]
}

Requirements:
- "keywords" must contain one row per provided target keyword (${keywords.length} rows)
- "relatedKeywords" must contain exactly 10 long-tail suggestions
- "technicalIssues" must contain at least 8 entries mixing critical/warning/passed
- "contentPlan" must cover 12 weeks (one row per week minimum)
- "competitors" must contain ${competitorDomains.length || 3} rows
- Be realistic with volumes and difficulty — don't fabricate impossibly high numbers`,
      },
    ],
  })

  const text = extractText(message)
  const json = text.match(/\{[\s\S]*\}/)?.[0] ?? '{}'
  try {
    const parsed = JSON.parse(json) as ComprehensiveAuditResult
    // Defensive defaults so the UI never crashes on a bad response
    return {
      overview: parsed.overview ?? {
        seoScore: 0, grade: 'F', technicalHealth: 0, contentScore: 0,
        backlinkScore: 0, pageSpeed: 'medium', mobileReady: true,
        summary: 'Audit incomplete — try again',
      },
      keywords: parsed.keywords ?? [],
      relatedKeywords: parsed.relatedKeywords ?? [],
      technicalIssues: parsed.technicalIssues ?? [],
      contentPlan: parsed.contentPlan ?? [],
      competitors: parsed.competitors ?? [],
    }
  } catch {
    return {
      overview: {
        seoScore: 0, grade: 'F', technicalHealth: 0, contentScore: 0,
        backlinkScore: 0, pageSpeed: 'medium', mobileReady: true,
        summary: 'Audit could not be parsed — try again',
      },
      keywords: [],
      relatedKeywords: [],
      technicalIssues: [],
      contentPlan: [],
      competitors: [],
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
    model: MODELS.AGENT,
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
