export interface PlanConfig {
  id: string
  name: string
  badge: string | null
  highlight?: boolean
  prices: {
    gbp: number
    usd: number
    eur: number
  }
  annualPrices: {
    gbp: number
    usd: number
    eur: number
  }
  credits: number
  features: string[]
  priceIds: {
    gbp: string
    usd: string
    eur: string
    gbpAnnual: string
    usdAnnual: string
    eurAnnual: string
  }
}

export const PLANS: PlanConfig[] = [
  {
    id: 'launch',
    name: 'Launch',
    badge: null,
    prices: { gbp: 39, usd: 49, eur: 45 },
    annualPrices: { gbp: 390, usd: 490, eur: 450 },
    credits: 100,
    features: [
      'Google Business Profile posts',
      'Blog posts & review responses',
      'Social captions',
      'SEO strategy',
      'CRM (up to 100 contacts)',
    ],
    priceIds: {
      gbp: process.env.STRIPE_LAUNCH_GBP_ID || '',
      usd: process.env.STRIPE_LAUNCH_USD_ID || '',
      eur: process.env.STRIPE_LAUNCH_EUR_ID || '',
      gbpAnnual: process.env.STRIPE_LAUNCH_GBP_ANNUAL_ID || '',
      usdAnnual: process.env.STRIPE_LAUNCH_USD_ANNUAL_ID || '',
      eurAnnual: process.env.STRIPE_LAUNCH_EUR_ANNUAL_ID || '',
    },
  },
  {
    id: 'orbit',
    name: 'Orbit',
    badge: 'Most Popular',
    highlight: true,
    prices: { gbp: 79, usd: 99, eur: 89 },
    annualPrices: { gbp: 790, usd: 990, eur: 890 },
    credits: 300,
    features: [
      'Everything in Launch',
      'Sales & Proposals AI',
      'Market Research agent',
      'Strategy + SWOT analysis',
      'Financial Health reports',
      'Management & HR docs',
      'Campaign planning',
      'Unlimited contacts',
    ],
    priceIds: {
      gbp: process.env.STRIPE_ORBIT_GBP_ID || '',
      usd: process.env.STRIPE_ORBIT_USD_ID || '',
      eur: process.env.STRIPE_ORBIT_EUR_ID || '',
      gbpAnnual: process.env.STRIPE_ORBIT_GBP_ANNUAL_ID || '',
      usdAnnual: process.env.STRIPE_ORBIT_USD_ANNUAL_ID || '',
      eurAnnual: process.env.STRIPE_ORBIT_EUR_ANNUAL_ID || '',
    },
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    badge: 'Best Value',
    prices: { gbp: 149, usd: 199, eur: 169 },
    annualPrices: { gbp: 1490, usd: 1990, eur: 1690 },
    credits: 999,
    features: [
      'Everything in Orbit',
      'Unlimited credits',
      'Team members (up to 5)',
      'Priority support',
      'White-label reports',
      'API access',
    ],
    priceIds: {
      gbp: process.env.STRIPE_GALAXY_GBP_ID || '',
      usd: process.env.STRIPE_GALAXY_USD_ID || '',
      eur: process.env.STRIPE_GALAXY_EUR_ID || '',
      gbpAnnual: process.env.STRIPE_GALAXY_GBP_ANNUAL_ID || '',
      usdAnnual: process.env.STRIPE_GALAXY_USD_ANNUAL_ID || '',
      eurAnnual: process.env.STRIPE_GALAXY_EUR_ANNUAL_ID || '',
    },
  },
]

export function getPlanById(id: string): PlanConfig | undefined {
  return PLANS.find(p => p.id === id)
}

export function getPriceId(planId: string, currency: string, annual = false): string {
  const plan = getPlanById(planId)
  if (!plan) return ''
  if (annual) {
    const key = `${currency}Annual` as keyof typeof plan.priceIds
    return plan.priceIds[key] || ''
  }
  return plan.priceIds[currency as keyof typeof plan.priceIds] || ''
}

export function isGrowthPlan(plan: string): boolean {
  return plan === 'orbit' || plan === 'galaxy'
}

export function canAccessGrowth(plan: string): boolean {
  return isGrowthPlan(plan)
}
