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
    system: `You are ELEVO Update™ — Pulse, the AI landscape monitor for ELEVO AI. Your job is to scan the internet weekly and identify new AI models, tools, and trends that are relevant to ELEVO AI — an AI SaaS platform for local businesses in the UK. ELEVO uses Claude models (Opus and Sonnet) for all its agents. You assess threats from competitors (Jasper, Copy.ai, Writesonic, GrowthBar, Surfer SEO, SEMrush, HubSpot AI, Mailchimp, etc.) and recommend what ELEVO should build next to stay ahead. Return comprehensive JSON with no placeholders.`,
    messages: [
      {
        role: 'user',
        content: `Perform a full AI landscape scan for ELEVO AI today.

ELEVO AI is a UK-based AI SaaS for local businesses. It uses Claude Opus 4-6 and Sonnet 4-6 for all 25+ agents covering content, growth, intelligence, media, customers, and ecommerce.

Current ELEVO agents use these models:
- Orchestrator / Problem Solver / Dropshipping / Spy / Viral: claude-opus-4-6
- All other agents: claude-sonnet-4-6

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
