import { createMessage, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON, WEB_SEARCH_TOOL } from './client'

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface AILandscapeReport {
  newModels: Array<{
    name: string
    company: string
    releaseDate: string
    capabilities: string[]
    relevanceToELEVO: string
    priority: 'immediate' | 'soon' | 'monitor'
    integrationSuggestion: string
  }>
  newTools: Array<{
    name: string
    category: string
    whatItDoes: string
    shouldELEVOIntegrate: boolean
    reason: string
    competitorUsing: boolean
  }>
  marketTrends: Array<{
    trend: string
    momentum: 'rising' | 'peak' | 'declining'
    opportunityForELEVO: string
    urgency: string
  }>
  competitorUpdates: Array<{
    competitor: string
    update: string
    threat: 'low' | 'medium' | 'high'
    response: string
  }>
  recommendedPhase: {
    title: string
    priority: 'urgent' | 'high' | 'medium'
    features: string[]
    reason: string
    estimatedImpact: string
  }
  agentModelUpdates: Array<{
    agentName: string
    currentModel: string
    recommendedModel: string
    reason: string
    performanceGain: string
  }>
  summary: string
  weeklyScore: number
}

// ─── scanAILandscape ──────────────────────────────────────────────────────────

export async function scanAILandscape(locale: string): Promise<AILandscapeReport> {
  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    tools: [WEB_SEARCH_TOOL],
    system: `You are ELEVO Update™ — Pulse, the AI landscape monitor for ELEVO AI. Your job is to scan the internet weekly and identify new AI models, tools, and trends that are relevant to ELEVO AI — a UK-based AI SaaS platform for local businesses with 60+ AI agents across 11 pillars.

ELEVO uses Claude models (claude-opus-4-6 for premium agents, claude-sonnet-4-6 for standard agents). The platform runs on Next.js 15, Supabase, Stripe, and Vercel Pro.

Current capabilities: content generation, enterprise CRM with deal pipeline, AI image generation (Replicate/Flux Pro/SDXL), AI video generation (Runway ML), dropshipping (CJDropshipping), clip bot (20+ clips/video), competitor intelligence, voice agents (ElevenLabs/Vapi), QA testing bots (Playwright, 264 automated checks), self-updating agent system, Telegram bot with 13+ commands, 28+ Vercel crons.

Connected MCPs/integrations: HubSpot, QuickBooks, Gmail, Supabase, Cloudflare, Figma, Fantastical, Google Workspace, Resend.

Pricing: Launch €39/mo (500 credits), Orbit €79/mo (1,500 credits), Galaxy €149/mo (5,000 credits) — all with 7-day free trial.

Product Hunt launch: April 28, 2026.

You assess threats from competitors (Jasper, Copy.ai, Writesonic, GrowthBar, Surfer SEO, SEMrush, HubSpot AI, Mailchimp, Canva, Buffer, etc.) and recommend what ELEVO should build next to stay ahead. Return comprehensive JSON with no placeholders.`,
    messages: [
      {
        role: 'user',
        content: `Perform a full AI landscape scan for ELEVO AI today.

ELEVO AI is a UK-based AI SaaS for local businesses with 60+ AI agents across 11 pillars (visibility, growth, customers, intelligence, media, ecommerce, support, marketing, admin, design, tools).

Current ELEVO agents use these models:
- Premium agents (Market, CEO, ROAS, Finance, Solve, Create, Spy, Viral, Prospect, Drop, Update, Deep): claude-opus-4-6
- All other agents: claude-sonnet-4-6

Enterprise features: AI image generation (Replicate/Flux Pro), AI video generation (Runway ML), dropshipping (CJDropshipping), clip bot, enterprise CRM, voice agents (ElevenLabs/Vapi), QA testing bots, self-updating agents, Telegram bot (13+ commands), competitor pricing database.
Connected MCPs: HubSpot, QuickBooks, Gmail, Supabase, Cloudflare, Figma, Fantastical.
Product Hunt launch: April 28, 2026.

Search the web for:
1. New AI model releases from Anthropic, OpenAI, Google, Meta, Mistral, Cohere (last 30 days)
2. New AI tools that could compete with or complement ELEVO (last 30 days)
3. Trending topics in AI for small business / local business / SaaS
4. Updates from ELEVO's competitors: Jasper, Copy.ai, Writesonic, Surfer SEO, GrowthBar, HubSpot AI
5. What AI features are businesses paying most for right now

Then analyse and return ONLY valid JSON:
{
  "newModels": [
    {
      "name": "model name",
      "company": "company",
      "releaseDate": "date or 'recent'",
      "capabilities": ["capability 1", "capability 2"],
      "relevanceToELEVO": "why this matters for ELEVO",
      "priority": "immediate|soon|monitor",
      "integrationSuggestion": "how ELEVO could use this"
    }
  ],
  "newTools": [
    {
      "name": "tool name",
      "category": "category",
      "whatItDoes": "description",
      "shouldELEVOIntegrate": true,
      "reason": "why or why not",
      "competitorUsing": false
    }
  ],
  "marketTrends": [
    {
      "trend": "trend name",
      "momentum": "rising|peak|declining",
      "opportunityForELEVO": "specific opportunity",
      "urgency": "urgency level and why"
    }
  ],
  "competitorUpdates": [
    {
      "competitor": "competitor name",
      "update": "what they launched or changed",
      "threat": "low|medium|high",
      "response": "how ELEVO should respond"
    }
  ],
  "recommendedPhase": {
    "title": "Phase 16: [Name]",
    "priority": "urgent|high|medium",
    "features": ["feature 1", "feature 2", "feature 3"],
    "reason": "why this is the next priority",
    "estimatedImpact": "expected impact on ELEVO growth"
  },
  "agentModelUpdates": [
    {
      "agentName": "agent name",
      "currentModel": "current model",
      "recommendedModel": "recommended model",
      "reason": "why to upgrade",
      "performanceGain": "expected improvement"
    }
  ],
  "summary": "2-3 sentence executive summary of the AI landscape this week",
  "weeklyScore": 75
}`,
      },
    ],
  })

  try {
    return parseJSON<AILandscapeReport>(extractText(response))
  } catch {
    const raw = extractText(response)
    return {
      newModels: [],
      newTools: [],
      marketTrends: [],
      competitorUpdates: [],
      recommendedPhase: {
        title: 'Phase 16: TBD',
        priority: 'medium',
        features: [],
        reason: 'Analysis pending',
        estimatedImpact: 'Unknown',
      },
      agentModelUpdates: [],
      summary: raw.slice(0, 300),
      weeklyScore: 50,
    }
  }
}
