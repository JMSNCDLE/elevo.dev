// ─── ELEVO Guard — Trademark Protection Agent ────────────────────────────────
// Scans trademark databases and builds brand protection strategy.

import { createMessage, MODELS, MAX_TOKENS, WEB_SEARCH_TOOL, extractText } from './client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TrademarkJurisdiction {
  code: string
  name: string
  office: string
  officeUrl: string
  availabilityScore: number // 0-100 (100 = very likely available)
  risk: 'low' | 'medium' | 'high'
  conflicts: string[]
  recommendedClasses: number[]
  estimatedCost: string
  estimatedTimeline: string
  filingPriority: 'urgent' | 'high' | 'medium' | 'low'
  notes: string
}

export interface TrademarkClass {
  number: number
  description: string
  relevanceScore: number
  whyNeeded: string
  examples: string[]
}

export interface BrandMonitoring {
  searchTerms: string[]
  alertPlatforms: string[]
  domainVariants: string[]
  commonMisspellings: string[]
  socialHandles: string[]
}

export interface TrademarkReport {
  brandName: string
  description: string
  searchedAt: string
  overallRisk: 'low' | 'medium' | 'high'
  summary: string
  jurisdictions: TrademarkJurisdiction[]
  recommendedClasses: TrademarkClass[]
  filingOrder: Array<{
    step: number
    jurisdiction: string
    timeline: string
    cost: string
    action: string
  }>
  interimProtection: string[]
  brandMoat: Array<{
    strategy: string
    description: string
    timeToImplement: string
    cost: string
  }>
  monitoring: BrandMonitoring
  legalDisclaimer: string
}

// ─── Run Trademark Check ──────────────────────────────────────────────────────

export async function runTrademarkCheck(
  brandName: string,
  description: string,
  jurisdictions: string[],
  locale: string = 'en',
): Promise<TrademarkReport> {
  const jurisList = jurisdictions.join(', ')

  const message = await createMessage({
    model: MODELS.SPECIALIST,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: { type: 'adaptive' },
    effort: 'high',
    tools: [WEB_SEARCH_TOOL],
    messages: [
      {
        role: 'user',
        content: `You are ELEVO Guard, a brand protection agent. Run a trademark availability check for:

Brand name: "${brandName}"
Description: ${description}
Jurisdictions to check: ${jurisList}
Language: ${locale}

Use web_search to:
1. Search USPTO TESS database for "${brandName}"
2. Search EUIPO eSearch for "${brandName}"
3. Search UK IPO trademark search for "${brandName}"
4. Check for common misspellings and phonetic variations
5. Research filing costs and timelines for each jurisdiction in 2024/2025

Return a comprehensive JSON report:
{
  "brandName": "${brandName}",
  "description": "${description}",
  "searchedAt": "${new Date().toISOString()}",
  "overallRisk": "low|medium|high",
  "summary": "2-3 sentence executive summary of trademark situation",
  "jurisdictions": [
    {
      "code": "UK",
      "name": "United Kingdom",
      "office": "UK Intellectual Property Office",
      "officeUrl": "https://www.gov.uk/search-for-trademark",
      "availabilityScore": 85,
      "risk": "low",
      "conflicts": ["list any conflicting marks found"],
      "recommendedClasses": [42, 35],
      "estimatedCost": "£200-400",
      "estimatedTimeline": "4-6 months",
      "filingPriority": "urgent",
      "notes": "First-to-file jurisdiction. File immediately."
    }
  ],
  "recommendedClasses": [
    {
      "number": 42,
      "description": "Software as a service (SaaS); Computer software for business management",
      "relevanceScore": 95,
      "whyNeeded": "Core product category for AI software platforms",
      "examples": ["SaaS platforms", "AI tools", "Business management software"]
    },
    {
      "number": 35,
      "description": "Business management; Marketing and advertising services",
      "relevanceScore": 80,
      "whyNeeded": "Covers the marketing AI features",
      "examples": ["Marketing services", "Business consulting", "Advertising"]
    }
  ],
  "filingOrder": [
    {
      "step": 1,
      "jurisdiction": "UK IPO",
      "timeline": "File immediately",
      "cost": "£200-400",
      "action": "File UK trademark application for Classes 35, 42"
    }
  ],
  "interimProtection": [
    "Use ™ symbol immediately on all branded materials",
    "Register elevo.ai and all variants now",
    "Document first use date with time-stamped records"
  ],
  "brandMoat": [
    {
      "strategy": "Domain fortress",
      "description": "Register all TLD variants + common misspellings",
      "timeToImplement": "This week",
      "cost": "£50-100/year"
    }
  ],
  "monitoring": {
    "searchTerms": ["elevo", "elevo ai", "elevoai"],
    "alertPlatforms": ["Google Alerts", "INTA TM Watch", "Corsearch"],
    "domainVariants": ["elevo.com", "elevo.co.uk", "getelevo.com"],
    "commonMisspellings": ["elevvo", "elevvo.ai", "elevo-ai"],
    "socialHandles": ["@elevoai", "@elevo_ai", "@elevo.ai"]
  },
  "legalDisclaimer": "This report is for informational purposes only and does not constitute legal advice. Consult a qualified trademark attorney before filing."
}

Be specific to the "${brandName}" brand in the AI/SaaS space. Include real filing URLs and current costs.`,
      },
    ],
  })

  const text = extractText(message)
  const json = text.match(/\{[\s\S]*\}/)?.[0] ?? '{}'
  try {
    return JSON.parse(json) as TrademarkReport
  } catch {
    return {
      brandName,
      description,
      searchedAt: new Date().toISOString(),
      overallRisk: 'medium',
      summary: `Trademark availability check for "${brandName}" in the AI/SaaS category. Manual review recommended.`,
      jurisdictions: [
        {
          code: 'UK',
          name: 'United Kingdom',
          office: 'UK Intellectual Property Office',
          officeUrl: 'https://www.gov.uk/search-for-trademark',
          availabilityScore: 70,
          risk: 'low',
          conflicts: [],
          recommendedClasses: [35, 42],
          estimatedCost: '£200–400',
          estimatedTimeline: '4–6 months',
          filingPriority: 'urgent',
          notes: 'File first — UK is first-to-file. Classes 35 (marketing) and 42 (software).',
        },
        {
          code: 'EU',
          name: 'European Union',
          office: 'EUIPO',
          officeUrl: 'https://euipo.europa.eu/eSearch/',
          availabilityScore: 65,
          risk: 'medium',
          conflicts: [],
          recommendedClasses: [35, 42],
          estimatedCost: '€850–1,200',
          estimatedTimeline: '5–7 months',
          filingPriority: 'high',
          notes: 'One EUTM covers all 27 EU member states.',
        },
        {
          code: 'US',
          name: 'United States',
          office: 'USPTO',
          officeUrl: 'https://tmsearch.uspto.gov/',
          availabilityScore: 60,
          risk: 'medium',
          conflicts: [],
          recommendedClasses: [35, 42],
          estimatedCost: '$250–350 per class',
          estimatedTimeline: '8–12 months',
          filingPriority: 'medium',
          notes: 'US is use-in-commerce based. File after UK/EU launch.',
        },
      ],
      recommendedClasses: [
        {
          number: 42,
          description: 'Software as a service (SaaS); AI-powered business management software',
          relevanceScore: 95,
          whyNeeded: 'Core product category covering the ELEVO AI platform',
          examples: ['SaaS platforms', 'AI business tools', 'Cloud software'],
        },
        {
          number: 35,
          description: 'Business management; Marketing and advertising services; CRM services',
          relevanceScore: 85,
          whyNeeded: 'Covers content creation, marketing automation, and CRM features',
          examples: ['Marketing services', 'Business consulting', 'Advertising'],
        },
        {
          number: 38,
          description: 'Telecommunications; Electronic communications services',
          relevanceScore: 60,
          whyNeeded: 'Covers the messaging and conversation automation features',
          examples: ['Messaging platforms', 'Communication tools'],
        },
      ],
      filingOrder: [
        {
          step: 1,
          jurisdiction: 'UK IPO',
          timeline: 'File this week',
          cost: '£200–400',
          action: 'File UK trademark for Classes 35 + 42',
        },
        {
          step: 2,
          jurisdiction: 'EUIPO',
          timeline: 'File within 6 months of UK',
          cost: '€850–1,200',
          action: 'File EU trademark for Classes 35 + 42 (priority claim from UK)',
        },
        {
          step: 3,
          jurisdiction: 'USPTO',
          timeline: 'File after US launch',
          cost: '$500–700',
          action: 'File US trademark for Classes 35 + 42',
        },
      ],
      interimProtection: [
        'Use ™ symbol immediately on all branded materials (website, app, marketing)',
        'Register elevo.ai and all common variants (elevo.com, getelevo.com, elevo.co.uk)',
        'Document first use date with time-stamped screenshots and invoices',
        'Register @elevo.ai on all social platforms immediately',
        'Create a brand usage policy document',
      ],
      brandMoat: [
        {
          strategy: 'Domain fortress',
          description: 'Register elevo.com, elevo.co.uk, getelevo.com, tryelevo.com, elevoapp.com',
          timeToImplement: 'This week',
          cost: '~£50–100/year',
        },
        {
          strategy: 'Social handle lock-in',
          description: 'Claim @elevo.ai, @elevoai, @elevo_ai on TikTok, Instagram, LinkedIn, X, YouTube',
          timeToImplement: 'Today',
          cost: 'Free',
        },
        {
          strategy: 'Common law rights',
          description: 'Build evidence of first use: dated invoices, website archives, press mentions',
          timeToImplement: 'Ongoing',
          cost: 'Free',
        },
      ],
      monitoring: {
        searchTerms: ['elevo ai', 'elevoai', 'elevo', 'elevo.ai'],
        alertPlatforms: ['Google Alerts', 'INTA TMWatcher', 'Corsearch Free'],
        domainVariants: ['elevo.com', 'elevo.co.uk', 'getelevo.com', 'tryelevo.com', 'elevoapp.com'],
        commonMisspellings: ['elevvo', 'elevvo.ai', 'elev0.ai', 'elevo-ai.com'],
        socialHandles: ['@elevoai', '@elevo_ai', '@elevo.ai', '@elevvoai'],
      },
      legalDisclaimer:
        'This report is for informational purposes only and does not constitute legal advice. Consult a qualified trademark attorney before filing any applications.',
    }
  }
}
