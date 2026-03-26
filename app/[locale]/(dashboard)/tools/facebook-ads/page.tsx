'use client'

import createToolPage from '@/lib/tools/tool-page'
import { Monitor, FileText, Users, Target, BarChart2, Layers, Zap } from 'lucide-react'

export default createToolPage({
  title: 'Facebook Ads Machine',
  subtitle: 'Build high-converting Meta ad campaigns — 1 credit per query',
  apiPath: '/api/tools/facebook-ads',
  iconColor: 'bg-blue-600',
  cursorColor: 'bg-blue-400',
  icon: Monitor,
  greeting: "I'm the ELEVO Facebook Ads Machine — I build complete Meta ad campaigns that convert. I can create ad copy, target audiences, plan budgets, design A/B tests, and predict performance. What would you like to build?",
  upgradeCopy: 'Upgrade to Orbit (€79/mo) to unlock the Facebook Ads Machine — build complete Meta ad campaigns with AI-powered targeting, copy, and budget optimisation.',
  quickActions: [
    { label: 'Build Campaign', prompt: 'Build a complete Facebook ad campaign for my business. Include objective, audience, ad copy, budget, and A/B test plan.', icon: FileText },
    { label: 'Ad Copy', prompt: 'Write 5 high-converting Facebook ad copy variations for my business. Include headlines, primary text, descriptions, and CTAs.', icon: Zap },
    { label: 'Audience Builder', prompt: 'Create detailed audience targeting for my business: custom audiences, lookalike audiences, interest targeting, and exclusions.', icon: Users },
    { label: 'Budget Planner', prompt: 'Suggest an optimal budget allocation for my Facebook ads. I have €500/month. How should I split it across campaigns?', icon: BarChart2 },
    { label: 'A/B Test Plan', prompt: 'Create an A/B testing plan for my Facebook ads. What should I test first, and how should I structure the tests?', icon: Layers },
    { label: 'Local Business Ad', prompt: 'Create a "Local Business" ad campaign template for my business. Target people within 25km who match my customer profile.', icon: Target },
  ],
})
