import { createMessage, getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON } from './client'

export interface FinancialData {
  rawData: string
  dataType: 'pl' | 'cashflow' | 'invoices' | 'bank_statement' | 'mixed'
  period: string
  currency: string
  businessName: string
  businessCategory: string
}

export interface FinancialReport {
  parsedSuccessfully: boolean
  dataQuality: 'high' | 'medium' | 'low'
  summary: {
    totalRevenue: number
    totalExpenses: number
    grossProfit: number
    grossMargin: number
    netProfit: number
    netMargin: number
    cashPosition: number
    burnRate?: number
    runway?: number
  }
  revenueBreakdown: Array<{
    category: string
    amount: number
    percentageOfTotal: number
    trend: 'growing' | 'stable' | 'declining'
  }>
  expenseBreakdown: Array<{
    category: string
    amount: number
    percentageOfRevenue: number
    flag: 'normal' | 'high' | 'very_high' | 'investigate'
    recommendation?: string
  }>
  healthScore: number
  healthRating: 'excellent' | 'healthy' | 'caution' | 'critical'
  alerts: Array<{
    severity: 'info' | 'warning' | 'critical'
    message: string
    action: string
  }>
  costSavingOpportunities: Array<{
    area: string
    estimatedSaving: number
    difficulty: 'easy' | 'medium' | 'hard'
    recommendation: string
  }>
  revenueGrowthOpportunities: Array<{
    opportunity: string
    estimatedUplift: string
    timeframe: string
    effort: 'low' | 'medium' | 'high'
  }>
  forecast: {
    nextMonth: { revenue: number; expenses: number; profit: number }
    nextQuarter: { revenue: number; expenses: number; profit: number }
    confidence: 'high' | 'medium' | 'low'
    assumptions: string[]
  }
  alternativeSolutions: Array<{
    currentSituation: string
    suggestedAlternative: string
    estimatedImpact: string
    category: 'cost_reduction' | 'revenue_growth' | 'efficiency' | 'risk_reduction'
  }>
  executiveSummary: string
}

export async function runFinancialIntelligence(data: FinancialData, locale: string): Promise<FinancialReport> {
  const client = getClient()

  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    system: `You are ELEVO AI's Financial Intelligence Officer — Flora. You are a senior CFO and financial analyst with deep expertise in small and medium business finance.

You can parse any financial format: P&L statements, cash flow reports, bank statements, invoice lists, Xero exports, QuickBooks exports, or plain text figures.

Your role is to:
1. Extract and compute all core financial metrics (revenue, expenses, gross profit, net profit, margins)
2. Break down revenue and expenses by category
3. Benchmark expense ratios against industry norms for ${data.businessCategory} businesses
4. Identify cash flow risks and opportunities
5. Surface specific cost-saving opportunities with realistic estimates
6. Find revenue growth levers that are achievable in this business's context
7. Generate a short-term forecast based on the data trends
8. Propose alternative solutions and approaches to current financial challenges
9. Produce a clear executive summary the business owner can act on

HEALTH SCORE GUIDE (0–100):
- 80–100: Excellent — strong margins, healthy cash, growing revenue
- 60–79: Healthy — solid fundamentals, minor areas to improve
- 40–59: Caution — warning signs present, action needed
- 0–39: Critical — urgent intervention required

EXPENSE BENCHMARKS (as % of revenue for ${data.businessCategory}):
- Staff/labour: 25–40% (flag if >45%)
- Materials/COGS: 20–40% (varies by sector)
- Marketing: 5–15% (flag if <3% or >20%)
- Rent/premises: 5–15% (flag if >20%)
- Software/subscriptions: <5% (flag if >8%)

Be specific and direct. Give the business owner clarity on exactly where they stand and what to do next.`,
    messages: [
      {
        role: 'user',
        content: `Analyse the financial data for ${data.businessName} (${data.businessCategory}).

Data type: ${data.dataType}
Period: ${data.period}
Currency: ${data.currency}

FINANCIAL DATA:
---
${data.rawData.slice(0, 5000)}
---
${data.rawData.length > 5000 ? `[Note: Data truncated from ${data.rawData.length} characters]` : ''}

Parse all figures, compute metrics, benchmark expenses, identify opportunities, and build a forecast.

Return ONLY valid JSON:
{
  "parsedSuccessfully": <boolean>,
  "dataQuality": "high|medium|low",
  "summary": {
    "totalRevenue": <number>,
    "totalExpenses": <number>,
    "grossProfit": <number>,
    "grossMargin": <number — percentage 0-100>,
    "netProfit": <number>,
    "netMargin": <number — percentage 0-100>,
    "cashPosition": <number — current cash or net cash flow>,
    "burnRate": <number or null — monthly burn if applicable>,
    "runway": <number or null — months of runway if applicable>
  },
  "revenueBreakdown": [
    {
      "category": "<revenue category>",
      "amount": <number>,
      "percentageOfTotal": <number>,
      "trend": "growing|stable|declining"
    }
  ],
  "expenseBreakdown": [
    {
      "category": "<expense category>",
      "amount": <number>,
      "percentageOfRevenue": <number>,
      "flag": "normal|high|very_high|investigate",
      "recommendation": "<optional specific action>"
    }
  ],
  "healthScore": <number 0-100>,
  "healthRating": "excellent|healthy|caution|critical",
  "alerts": [
    {
      "severity": "info|warning|critical",
      "message": "<specific alert>",
      "action": "<immediate action to take>"
    }
  ],
  "costSavingOpportunities": [
    {
      "area": "<area>",
      "estimatedSaving": <number per month in currency>,
      "difficulty": "easy|medium|hard",
      "recommendation": "<specific recommendation>"
    }
  ],
  "revenueGrowthOpportunities": [
    {
      "opportunity": "<opportunity>",
      "estimatedUplift": "<e.g. +€2,000/month or +15%>",
      "timeframe": "<e.g. 30 days, 3 months>",
      "effort": "low|medium|high"
    }
  ],
  "forecast": {
    "nextMonth": { "revenue": <number>, "expenses": <number>, "profit": <number> },
    "nextQuarter": { "revenue": <number>, "expenses": <number>, "profit": <number> },
    "confidence": "high|medium|low",
    "assumptions": ["<assumption 1>", "<assumption 2>"]
  },
  "alternativeSolutions": [
    {
      "currentSituation": "<what they currently do/have>",
      "suggestedAlternative": "<specific alternative>",
      "estimatedImpact": "<financial impact>",
      "category": "cost_reduction|revenue_growth|efficiency|risk_reduction"
    }
  ],
  "executiveSummary": "<3-4 paragraph summary of financial position, key findings, and top 3 actions>"
}`,
      },
    ],
  })

  try {
    return parseJSON<FinancialReport>(extractText(response))
  } catch {
    return {
      parsedSuccessfully: false,
      dataQuality: 'low',
      summary: {
        totalRevenue: 0,
        totalExpenses: 0,
        grossProfit: 0,
        grossMargin: 0,
        netProfit: 0,
        netMargin: 0,
        cashPosition: 0,
      },
      revenueBreakdown: [],
      expenseBreakdown: [],
      healthScore: 0,
      healthRating: 'critical',
      alerts: [
        {
          severity: 'critical',
          message: 'Financial data could not be parsed. Please check your input and try again.',
          action: 'Re-upload or re-paste your financial data in a cleaner format.',
        },
      ],
      costSavingOpportunities: [],
      revenueGrowthOpportunities: [],
      forecast: {
        nextMonth: { revenue: 0, expenses: 0, profit: 0 },
        nextQuarter: { revenue: 0, expenses: 0, profit: 0 },
        confidence: 'low',
        assumptions: [],
      },
      alternativeSolutions: [],
      executiveSummary: 'Unable to complete financial analysis. Please retry with valid financial data.',
    }
  }
}
