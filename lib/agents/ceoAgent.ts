import { createMessage, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON, WEB_SEARCH_TOOL } from './client'
import type { BusinessProfile } from './types'

// ─── Return Types ───────────────────────────────────────────────────────────

export interface CEOSessionResponse {
  situationAnalysis: string
  optionsAnalysed: Array<{
    option: string
    pros: string[]
    cons: string[]
    risk: 'low' | 'medium' | 'high'
    reward: 'low' | 'medium' | 'high'
  }>
  recommendation: string
  actionPlan: Array<{
    action: string
    owner: string
    deadline: string
    kpi: string
  }>
  risks: Array<{
    risk: string
    mitigation: string
  }>
  boardSummary: string
  followUpQuestions: string[]
}

export interface GrowthStrategyResponse {
  growthLevers: Array<{
    lever: string
    description: string
    timeToImpact: string
    estimatedRevenue: string
  }>
  priorityMatrix: Array<{
    initiative: string
    effort: 'low' | 'medium' | 'high'
    impact: 'low' | 'medium' | 'high'
    priority: 'now' | 'next' | 'later' | 'never'
  }>
  quarterlyMilestones: Array<{
    quarter: string
    milestone: string
    target: string
    keyActions: string[]
  }>
  hiringPlan: Array<{
    role: string
    when: string
    rationale: string
    estimatedCost: string
  }>
  financialProjections: Array<{
    month: string
    mrr: number
    cumulativeRevenue: number
    keyDriver: string
  }>
}

export interface InvestorPitchResponse {
  pitchDeckOutline: Array<{
    slide: number
    title: string
    content: string
    keyPoints: string[]
  }>
  keyMetrics: Array<{
    metric: string
    value: string
    benchmark: string
    story: string
  }>
  investorNarrative: string
  objectionHandlers: Array<{
    objection: string
    response: string
  }>
  termSheetGuidance: {
    valuation: string
    dilution: string
    keyTerms: string[]
    redFlags: string[]
    negotiationTips: string[]
  }
}

export interface QuickDecisionResponse {
  recommendation: string
  reasoning: string
  risks: string[]
  nextStep: string
}

// ─── Decision Types ──────────────────────────────────────────────────────────

export type DecisionType =
  | 'pricing'
  | 'hiring'
  | 'pivot'
  | 'fundraising'
  | 'partnership'
  | 'market_entry'
  | 'cost_cutting'
  | 'exit_strategy'

// ─── Agent Functions ─────────────────────────────────────────────────────────

/**
 * Full CEO advisory session for a major business decision
 */
export async function runCEOSession(
  businessProfile: BusinessProfile,
  question: string,
  context: string,
  decisionType: DecisionType,
  locale = 'en'
): Promise<CEOSessionResponse> {
  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('max'),
    tools: [WEB_SEARCH_TOOL],
    system: `You are the ELEVO CEO™ — an elite AI C-suite executive and strategic advisor. You have the combined expertise of a Fortune 500 CEO, McKinsey partner, Goldman Sachs banker, and serial entrepreneur.

You advise small and medium business owners on the most important decisions they'll ever make. You are direct, data-driven, and deeply practical. You cut through noise and give the decision-maker exactly what they need to act with confidence.

Your analysis is always:
- Grounded in real market data and research
- Tailored precisely to this business and its context
- Actionable with clear next steps and owners
- Honest about risks and downsides
- Structured for board-level presentation

Decision type being analysed: ${decisionType.replace('_', ' ').toUpperCase()}
Business locale: ${locale}`,
    messages: [
      {
        role: 'user',
        content: `Business: ${businessProfile.business_name}
Category: ${businessProfile.category}
Location: ${businessProfile.city}, ${businessProfile.country}
Services: ${businessProfile.services.join(', ')}
USPs: ${businessProfile.unique_selling_points.join(', ')}
${businessProfile.description ? `Description: ${businessProfile.description}` : ''}

QUESTION / DECISION:
${question}

ADDITIONAL CONTEXT:
${context}

Conduct a thorough CEO-level analysis. Use web search to find relevant market data, benchmarks, and competitive intelligence where helpful.

Return ONLY valid JSON matching this exact structure:
{
  "situationAnalysis": "2-3 paragraph deep analysis of the situation, market context, and what's really at stake",
  "optionsAnalysed": [
    {
      "option": "Option name",
      "pros": ["pro1", "pro2", "pro3"],
      "cons": ["con1", "con2"],
      "risk": "low|medium|high",
      "reward": "low|medium|high"
    }
  ],
  "recommendation": "Your single clear recommendation with rationale (2-3 paragraphs)",
  "actionPlan": [
    {
      "action": "Specific action to take",
      "owner": "Who does this (founder/team/outsource)",
      "deadline": "e.g. Week 1, Month 1",
      "kpi": "How to measure success"
    }
  ],
  "risks": [
    {
      "risk": "Specific risk",
      "mitigation": "How to mitigate it"
    }
  ],
  "boardSummary": "Executive summary suitable for a board meeting (150-200 words)",
  "followUpQuestions": ["Question 1", "Question 2", "Question 3"]
}`,
      },
    ],
  })

  return parseJSON<CEOSessionResponse>(extractText(response))
}

/**
 * Full growth strategy from current MRR to target MRR
 */
export async function generateGrowthStrategy(
  businessProfile: BusinessProfile,
  currentMRR: number,
  targetMRR: number,
  timeframe: string,
  locale = 'en'
): Promise<GrowthStrategyResponse> {
  const multiplier = targetMRR / (currentMRR || 1)

  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('max'),
    tools: [WEB_SEARCH_TOOL],
    system: `You are the ELEVO CEO™ Growth Strategist. You build battle-tested growth strategies for local and SME businesses. You combine growth hacking, product strategy, sales methodology, and financial modelling.

Business locale: ${locale}`,
    messages: [
      {
        role: 'user',
        content: `Business: ${businessProfile.business_name}
Category: ${businessProfile.category}
Location: ${businessProfile.city}, ${businessProfile.country}
Services: ${businessProfile.services.join(', ')}
Current MRR: £${currentMRR.toLocaleString()}
Target MRR: £${targetMRR.toLocaleString()} (${multiplier.toFixed(1)}× growth)
Timeframe: ${timeframe}

Build a comprehensive growth strategy to achieve this target. Research market benchmarks and growth tactics for this business category.

Return ONLY valid JSON:
{
  "growthLevers": [
    {
      "lever": "Growth lever name",
      "description": "How it works for this business",
      "timeToImpact": "e.g. 30 days, 90 days",
      "estimatedRevenue": "e.g. +£2,000/mo"
    }
  ],
  "priorityMatrix": [
    {
      "initiative": "Initiative name",
      "effort": "low|medium|high",
      "impact": "low|medium|high",
      "priority": "now|next|later|never"
    }
  ],
  "quarterlyMilestones": [
    {
      "quarter": "Q1 2026",
      "milestone": "Milestone description",
      "target": "e.g. £X MRR",
      "keyActions": ["action1", "action2"]
    }
  ],
  "hiringPlan": [
    {
      "role": "Role title",
      "when": "e.g. Month 3",
      "rationale": "Why this role at this point",
      "estimatedCost": "e.g. £3,000/mo"
    }
  ],
  "financialProjections": [
    {
      "month": "Month 1",
      "mrr": 5000,
      "cumulativeRevenue": 5000,
      "keyDriver": "What drives this month's growth"
    }
  ]
}`,
      },
    ],
  })

  return parseJSON<GrowthStrategyResponse>(extractText(response))
}

/**
 * Full investor pitch preparation
 */
export async function prepareInvestorPitch(
  businessProfile: BusinessProfile,
  stage: string,
  askAmount: string,
  locale = 'en'
): Promise<InvestorPitchResponse> {
  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    tools: [WEB_SEARCH_TOOL],
    system: `You are the ELEVO CEO™ Investor Relations expert. You've helped dozens of companies raise from angels, VCs, and strategic investors. You know exactly what investors look for at each stage and how to position a business for maximum investment attractiveness.

Business locale: ${locale}
Investment stage: ${stage}`,
    messages: [
      {
        role: 'user',
        content: `Business: ${businessProfile.business_name}
Category: ${businessProfile.category}
Location: ${businessProfile.city}, ${businessProfile.country}
Services: ${businessProfile.services.join(', ')}
USPs: ${businessProfile.unique_selling_points.join(', ')}
${businessProfile.description ? `Description: ${businessProfile.description}` : ''}
Stage: ${stage}
Ask Amount: ${askAmount}

Build a complete investor pitch preparation. Research comparable companies and typical valuations for this stage and sector.

Return ONLY valid JSON:
{
  "pitchDeckOutline": [
    {
      "slide": 1,
      "title": "Slide title",
      "content": "What this slide covers",
      "keyPoints": ["point1", "point2", "point3"]
    }
  ],
  "keyMetrics": [
    {
      "metric": "Metric name",
      "value": "Current value",
      "benchmark": "Industry benchmark",
      "story": "How to present this metric compellingly"
    }
  ],
  "investorNarrative": "The compelling story to tell investors (3-4 paragraphs)",
  "objectionHandlers": [
    {
      "objection": "Common investor objection",
      "response": "How to handle it confidently"
    }
  ],
  "termSheetGuidance": {
    "valuation": "Recommended valuation range with justification",
    "dilution": "Acceptable dilution percentage",
    "keyTerms": ["term1", "term2"],
    "redFlags": ["red flag to avoid in term sheets"],
    "negotiationTips": ["tip1", "tip2"]
  }
}`,
      },
    ],
  })

  return parseJSON<InvestorPitchResponse>(extractText(response))
}

/**
 * Quick daily decision — 2 credits, fast response
 */
export async function adviseDailyDecision(
  question: string,
  context: string,
  locale = 'en'
): Promise<QuickDecisionResponse> {
  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.LOW,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('medium'),
    system: `You are the ELEVO CEO™ daily advisor. Give fast, direct, actionable advice on day-to-day business decisions. Be concise but insightful. Locale: ${locale}`,
    messages: [
      {
        role: 'user',
        content: `Question: ${question}
Context: ${context}

Return ONLY valid JSON:
{
  "recommendation": "Clear single recommendation",
  "reasoning": "Why this is the right move (2-3 sentences)",
  "risks": ["risk1", "risk2"],
  "nextStep": "The single most important next action to take today"
}`,
      },
    ],
  })

  return parseJSON<QuickDecisionResponse>(extractText(response))
}
