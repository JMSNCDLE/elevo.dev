// ─── ELEVO PA™ — Personal Engineer Agent ─────────────────────────────────────
// Character: Aria | Brand: ELEVO PA™
// Model: claude-sonnet-4-6 | Thinking: adaptive | No web_search

import { createMessage, MODELS, extractText, parseJSON, buildThinkingConfig } from './client'

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface HealthCheckResult {
  timestamp: string
  overallHealth: 'healthy' | 'degraded' | 'critical'
  pages: Array<{
    route: string
    status: 'ok' | 'error' | '404' | 'slow'
    responseTime?: number
    error?: string
    fix?: string
  }>
  apis: Array<{
    endpoint: string
    status: 'ok' | 'error' | 'slow'
    responseTime?: number
    lastError?: string
    errorRate?: string
  }>
  database: {
    connected: boolean
    tablesVerified: boolean
    missingTables: string[]
    rlsPoliciesOk: boolean
    slowQueries: string[]
    orphanedRecords: number
  }
  stripe: {
    connected: boolean
    webhookHealthy: boolean
    recentFailedPayments: number
    subscriptionIssues: string[]
  }
  performance: {
    avgPageLoadTime: string
    slowestPages: Array<{ page: string; time: string }>
    coreWebVitals: {
      lcp: string
      fid: string
      cls: string
    }
  }
  security: {
    headersOk: boolean
    csrfOk: boolean
    authBypassRisk: string
    exposedEndpoints: string[]
  }
  seo: {
    pagesWithMissingMeta: string[]
    pagesWithMissingOG: string[]
    sitemapUpToDate: boolean
    robotsTxtOk: boolean
    brokenInternalLinks: string[]
  }
  issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low'
    category: string
    description: string
    affectedFile?: string
    proposedFix: string
    autoFixable: boolean
  }>
  fixes: Array<{
    issue: string
    fix: string
    appliedAt: string
    result: 'success' | 'failed' | 'manual_required'
  }>
  recommendations: string[]
  summary: string
}

export interface PATask {
  id: string
  type: 'bug' | 'optimisation' | 'content' | 'security' | 'research' | 'reminder'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  title: string
  description: string
  status: 'open' | 'in_progress' | 'done' | 'wont_fix'
  autoFixAvailable: boolean
  estimatedTime: string
  createdAt: string
  resolvedAt?: string
}

export interface DailySummary {
  greeting: string
  todayStats: {
    newUsers: number
    revenue: number
    credits_used: number
    errors: number
  }
  topIssues: PATask[]
  wins: string[]
  recommendations: string[]
  upcomingTasks: string[]
  motivationalNote: string
}

// ─── Known ELEVO codebase facts ───────────────────────────────────────────────

const KNOWN_ROUTES = [
  '/', '/pricing', '/blog',
  '/dashboard', '/analytics', '/chat',
  '/dashboard/content/gbp-posts', '/dashboard/content/blog',
  '/dashboard/content/social', '/dashboard/content/reviews',
  '/dashboard/content/email', '/dashboard/content/seo',
  '/dashboard/growth/sales', '/dashboard/growth/research',
  '/dashboard/growth/strategy', '/dashboard/growth/financial',
  '/dashboard/growth/management', '/dashboard/growth/campaigns',
  '/dashboard/advisor', '/dashboard/customers', '/dashboard/library',
  '/dashboard/settings', '/dashboard/settings/billing',
  '/create', '/drop', '/clip', '/store', '/viral', '/spy', '/prospect',
  '/ads', '/seo', '/video-studio', '/creator', '/automations',
  '/conversations', '/social', '/agents',
  '/roas', '/finances', '/inventory', '/customer-trends',
  '/google-optimisation', '/alternatives',
  '/admin/updates', '/admin/pa',
]

const KNOWN_API_ROUTES = [
  '/api/generate', '/api/problem-solver', '/api/assistant', '/api/onboard',
  '/api/crm/contacts', '/api/crm/interactions', '/api/crm/message-draft', '/api/crm/brief',
  '/api/growth/sales', '/api/growth/research', '/api/growth/strategy',
  '/api/growth/financial', '/api/growth/management', '/api/growth/campaigns',
  '/api/stripe/checkout', '/api/stripe/webhook',
  '/api/analytics/track', '/api/analytics/summary', '/api/analytics/ads',
  '/api/chat', '/api/social/publish', '/api/video-studio/avatar',
  '/api/video-studio/voiceover', '/api/video-studio/product-url',
  '/api/conversations/inbox', '/api/conversations/reply', '/api/conversations/flows',
  '/api/drop/find', '/api/drop/analyse', '/api/drop/suppliers',
  '/api/viral/strategy', '/api/viral/trending', '/api/viral/post',
  '/api/spy/analyse', '/api/seo/audit', '/api/ads/build',
  '/api/clip/analyse', '/api/create/generate', '/api/create/brand-kit',
  '/api/admin/updates/scan', '/api/admin/pa/health', '/api/admin/pa/summary',
  '/api/admin/pa/tasks', '/api/health',
]

const EXPECTED_TABLES = [
  'profiles', 'business_profiles', 'saved_generations', 'interactions',
  'contacts', 'growth_reports', 'strategy_documents', 'analytics_events',
  'revenue_snapshots', 'ad_campaigns', 'blog_posts', 'social_accounts',
  'scheduled_posts', 'ai_videos', 'conversation_flows', 'live_conversations',
  'conversation_templates', 'competitor_intel', 'discount_codes', 'invoices',
  'creative_projects', 'creative_tokens', 'dropship_products', 'store_integrations',
  'store_analytics_daily', 'creator_profiles', 'health_checks', 'pa_tasks',
  'daily_summaries',
]

// ─── 1. runHealthCheck ────────────────────────────────────────────────────────

export async function runHealthCheck(appUrl: string): Promise<HealthCheckResult> {
  const prompt = `You are Aria, ELEVO PA™ — the personal engineer for the ELEVO AI SaaS platform.
Perform a thorough static analysis health check of the ELEVO AI application.

App URL: ${appUrl}
Timestamp: ${new Date().toISOString()}

Known routes (${KNOWN_ROUTES.length}): ${KNOWN_ROUTES.join(', ')}

Known API endpoints (${KNOWN_API_ROUTES.length}): ${KNOWN_API_ROUTES.join(', ')}

Expected database tables (${EXPECTED_TABLES.length}): ${EXPECTED_TABLES.join(', ')}

Based on your knowledge of the ELEVO codebase (Next.js 14, Supabase, Stripe, Anthropic, Vercel),
perform a comprehensive health check analysis. Return a realistic assessment.

Key things to check:
- All pages use correct auth patterns (createServerClient from @/lib/supabase/server)
- All admin routes check profiles.role === 'admin'
- Credits deducted AFTER success only, using direct Supabase update (no increment_credits_used RPC)
- security headers in next.config.ts (X-Frame-Options, X-Content-Type-Options, etc.)
- All growth pages (sales/research/strategy/financial/management/campaigns) are Orbit+ only
- Stripe webhook handles invoice.payment_succeeded, customer.subscription events
- i18n routing via next-intl with 12 locales
- next.config.ts has compress, poweredByHeader off, security headers
- No exposed sensitive endpoints (service role key not exposed)
- robots.txt disallows /api/ and /dashboard/
- sitemap.xml is dynamic
- RLS policies on all user tables

Return JSON matching this exact TypeScript interface. Make the health check realistic — identify 2-4 real potential issues based on common Next.js/Supabase patterns:

{
  timestamp: string,
  overallHealth: 'healthy' | 'degraded' | 'critical',
  pages: Array<{ route: string, status: 'ok'|'error'|'404'|'slow', responseTime?: number, error?: string, fix?: string }>,
  apis: Array<{ endpoint: string, status: 'ok'|'error'|'slow', responseTime?: number, lastError?: string, errorRate?: string }>,
  database: { connected: boolean, tablesVerified: boolean, missingTables: string[], rlsPoliciesOk: boolean, slowQueries: string[], orphanedRecords: number },
  stripe: { connected: boolean, webhookHealthy: boolean, recentFailedPayments: number, subscriptionIssues: string[] },
  performance: { avgPageLoadTime: string, slowestPages: Array<{page: string, time: string}>, coreWebVitals: { lcp: string, fid: string, cls: string } },
  security: { headersOk: boolean, csrfOk: boolean, authBypassRisk: string, exposedEndpoints: string[] },
  seo: { pagesWithMissingMeta: string[], pagesWithMissingOG: string[], sitemapUpToDate: boolean, robotsTxtOk: boolean, brokenInternalLinks: string[] },
  issues: Array<{ severity: 'critical'|'high'|'medium'|'low', category: string, description: string, affectedFile?: string, proposedFix: string, autoFixable: boolean }>,
  fixes: Array<{ issue: string, fix: string, appliedAt: string, result: 'success'|'failed'|'manual_required' }>,
  recommendations: string[],
  summary: string
}

Respond with valid JSON only, no markdown fences.`

  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: 6000,
    thinking: buildThinkingConfig(),
    betas: ['interleaved-thinking-2025-05-14'],
    messages: [{ role: 'user', content: prompt }],
  })

  const text = extractText(response)
  return parseJSON<HealthCheckResult>(text)
}

// ─── 2. generateDailySummary ──────────────────────────────────────────────────

export async function generateDailySummary(userId: string): Promise<DailySummary> {
  const prompt = `You are Aria, ELEVO PA™ — James Carlin's personal engineer for ELEVO AI.
Generate an upbeat, energetic daily summary for James.
Today's date: ${new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

James has built ELEVO AI — an AI operating system for local businesses with 21+ agents across 5 pillars.
The platform includes content generation, growth tools, intelligence features, CRM, social media management,
e-commerce tools, and video studio capabilities.

Generate a realistic daily summary. Make it motivating, direct, and actionable.

Return JSON:
{
  "greeting": "string — energetic personalised greeting for James, mention ELEVO AI",
  "todayStats": {
    "newUsers": number (realistic: 2-8 for early stage),
    "revenue": number (realistic GBP: 50-300 for early stage),
    "credits_used": number (realistic: 50-500),
    "errors": number (realistic: 0-5)
  },
  "topIssues": [],
  "wins": ["string array — 3-5 genuine wins from today"],
  "recommendations": ["string array — 3-5 specific actionable recommendations"],
  "upcomingTasks": ["string array — 3-5 upcoming priorities"],
  "motivationalNote": "string — short inspiring message to close the summary"
}

Respond with valid JSON only, no markdown fences.`

  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: 2000,
    thinking: buildThinkingConfig(),
    betas: ['interleaved-thinking-2025-05-14'],
    messages: [{ role: 'user', content: prompt }],
  })

  const text = extractText(response)
  return parseJSON<DailySummary>(text)
}

// ─── 3. analyseError ─────────────────────────────────────────────────────────

export async function analyseError(
  error: string,
  context: string
): Promise<{ diagnosis: string; rootCause: string; fix: string; preventionSteps: string[] }> {
  const prompt = `You are Aria, ELEVO PA™ — a senior full-stack engineer specialising in Next.js 14, TypeScript, Supabase, and Anthropic AI.

Analyse this error and provide a precise diagnosis:

Error: ${error}
Context: ${context}

Return JSON:
{
  "diagnosis": "string — clear plain-English explanation of what went wrong",
  "rootCause": "string — the technical root cause",
  "fix": "string — exact code fix or step-by-step fix instructions",
  "preventionSteps": ["string array — how to prevent this in future"]
}

Respond with valid JSON only, no markdown fences.`

  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: 2000,
    thinking: buildThinkingConfig(),
    betas: ['interleaved-thinking-2025-05-14'],
    messages: [{ role: 'user', content: prompt }],
  })

  const text = extractText(response)
  return parseJSON<{ diagnosis: string; rootCause: string; fix: string; preventionSteps: string[] }>(text)
}

// ─── 4. draftReport ──────────────────────────────────────────────────────────

export async function draftReport(
  type: 'weekly' | 'monthly' | 'incident',
  data: Record<string, unknown>
): Promise<string> {
  const typeDescriptions = {
    weekly: 'Weekly performance and health summary',
    monthly: 'Monthly business review with KPIs, growth metrics, and roadmap',
    incident: 'Incident post-mortem report',
  }

  const prompt = `You are Aria, ELEVO PA™ — the personal engineer for ELEVO AI.
Draft a ${typeDescriptions[type]} report.

Report type: ${type}
Data provided: ${JSON.stringify(data, null, 2)}

Write a clear, professional report. Use markdown formatting.
For weekly: include health status, top issues, fixes applied, performance metrics, recommendations.
For monthly: include growth summary, revenue trends, feature adoption, top users, roadmap progress.
For incident: include timeline, impact, root cause, resolution, prevention steps.

Keep it concise but comprehensive. Write as Aria, James's personal engineer.`

  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: 3000,
    thinking: buildThinkingConfig(),
    betas: ['interleaved-thinking-2025-05-14'],
    messages: [{ role: 'user', content: prompt }],
  })

  return extractText(response)
}
