import { getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON, WEB_SEARCH_TOOL } from './client'
import type { BusinessProfile } from './types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AlternativeRequest {
  situation: string
  category: 'software' | 'supplier' | 'marketing' | 'staffing' | 'process' | 'general'
  currentCost?: number
  businessProfile: BusinessProfile
  locale: string
}

export interface AlternativesReport {
  problemSummary: string
  rootCause: string
  alternatives: Array<{
    name: string
    type: string
    estimatedCost: string
    estimatedSaving: string
    pros: string[]
    cons: string[]
    implementationEffort: 'easy' | 'medium' | 'hard'
    timeToSwitch: string
    verdict: string
    actionLink?: string
  }>
  recommendation: {
    topPick: string
    rationale: string
    migrationPlan: string[]
  }
  costSavingSummary: {
    currentAnnualCost: number
    recommendedAnnualCost: number
    annualSaving: number
  }
  quickWin: string
}

// ─── Agent ────────────────────────────────────────────────────────────────────

export async function findAlternatives(request: AlternativeRequest): Promise<AlternativesReport> {
  const client = getClient()

  const response = await client.messages.create({
    model: MODELS.SPECIALIST,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    tools: [WEB_SEARCH_TOOL],
    system: `You are ELEVO AI's Alternative Solutions Finder — Hugo. You are an expert business consultant who specialises in helping small and medium businesses find better, cheaper, or more effective alternatives to their current tools, suppliers, processes, and approaches.

Your role is to:
1. Understand the root cause of the current problem or cost
2. Search the web for real, currently available alternatives with accurate pricing
3. Evaluate each alternative specifically for a ${request.businessProfile.category} business in ${request.businessProfile.country}
4. Give honest pros and cons — don't just recommend whatever is cheapest
5. Build a practical migration plan the business owner can follow
6. Surface one immediate quick win they can act on today

CATEGORY FOCUS — ${request.category}:
${request.category === 'software' ? '- Compare SaaS tools, lifetime deals, open source options, and free tiers\n- Include integration considerations and data migration effort' : ''}
${request.category === 'supplier' ? '- Search for trade directories, wholesale platforms, and direct manufacturer options\n- Consider minimum order quantities, payment terms, and reliability' : ''}
${request.category === 'marketing' ? '- Compare agencies, freelancers, in-house, and AI-powered tools\n- Include realistic ROI expectations for a local SME' : ''}
${request.category === 'staffing' ? '- Consider freelancers, part-time, agencies, automation, and outsourcing\n- Include employment law implications and hidden costs' : ''}
${request.category === 'process' ? '- Look for automation tools, workflow software, and established methodologies\n- Estimate time saved per week and its monetary value' : ''}
${request.category === 'general' ? '- Research all relevant angles: tools, processes, partners, strategies' : ''}

Always be specific. Name real products, services, companies, and prices. Never give vague advice.
Locale: ${request.locale}`,
    messages: [
      {
        role: 'user',
        content: `Find alternatives for ${request.businessProfile.business_name} (${request.businessProfile.category}).
Location: ${request.businessProfile.city}, ${request.businessProfile.country}

SITUATION:
${request.situation}

Category: ${request.category}
${request.currentCost ? `Current cost: ${request.businessProfile.country === 'United Kingdom' ? '£' : '$'}${request.currentCost} per month` : ''}

Search the web for real, currently available alternatives. Find actual products, services, or approaches with real pricing. Evaluate each one specifically for a ${request.businessProfile.category} business.

Return ONLY valid JSON:
{
  "problemSummary": "<1-2 sentence clear statement of the problem>",
  "rootCause": "<the underlying cause — not just the surface symptom>",
  "alternatives": [
    {
      "name": "<specific product, service, or approach name>",
      "type": "<e.g. SaaS Tool, Freelancer, Open Source, Process Change, Supplier>",
      "estimatedCost": "<specific pricing, e.g. £29/month or Free>",
      "estimatedSaving": "<saving vs current situation, e.g. £150/month or 5 hours/week>",
      "pros": ["<specific pro 1>", "<specific pro 2>", "<specific pro 3>"],
      "cons": ["<specific con 1>", "<specific con 2>"],
      "implementationEffort": "easy|medium|hard",
      "timeToSwitch": "<realistic timeframe, e.g. 1 day, 1 week, 1 month>",
      "verdict": "<1 sentence honest verdict — who is this best for?>",
      "actionLink": "<URL if known, otherwise omit>"
    }
  ],
  "recommendation": {
    "topPick": "<name of best alternative>",
    "rationale": "<why this is the best choice for this specific business>",
    "migrationPlan": ["<step 1>", "<step 2>", "<step 3>", "<step 4>"]
  },
  "costSavingSummary": {
    "currentAnnualCost": <number — current annual cost>,
    "recommendedAnnualCost": <number — annual cost with top pick>,
    "annualSaving": <number — annual saving>
  },
  "quickWin": "<one thing they can do today, right now, to start improving the situation>"
}`,
      },
    ],
  })

  try {
    return parseJSON<AlternativesReport>(extractText(response))
  } catch {
    return {
      problemSummary: 'Analysis failed. Please try again.',
      rootCause: '',
      alternatives: [],
      recommendation: {
        topPick: '',
        rationale: '',
        migrationPlan: [],
      },
      costSavingSummary: {
        currentAnnualCost: 0,
        recommendedAnnualCost: 0,
        annualSaving: 0,
      },
      quickWin: '',
    }
  }
}
