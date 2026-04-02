'use client'

import createToolPage from '@/lib/tools/tool-page'
import { TrendingDown, FileText, Layers, Zap, BarChart2, ListChecks } from 'lucide-react'

export default createToolPage({
  title: 'Cost Reducer',
  subtitle: 'Find savings across your business — 1 credit per query',
  apiPath: '/api/tools/cost-reducer',
  iconColor: 'bg-amber-600',
  cursorColor: 'bg-amber-400',
  icon: TrendingDown,
  greeting: "I'm the ELEVO Cost Reducer — I analyse your business expenses and find specific, actionable ways to cut costs. Tell me about your monthly expenses and I'll identify savings opportunities, tool consolidation, and automation possibilities. How much are you spending?",
  upgradeCopy: 'Upgrade to Orbit (€49.99/mo) to unlock the Cost Reducer — find hidden savings, consolidate tools, and automate expensive manual processes.',
  quickActions: [
    { label: 'Full Analysis', prompt: 'Analyse my business costs and generate a complete optimisation report. I\'ll list my monthly expenses by category.', icon: FileText },
    { label: 'Tool Consolidation', prompt: 'I use multiple software tools. Help me consolidate them into fewer, more cost-effective alternatives. I\'ll list my current stack.', icon: Layers },
    { label: 'Automation Audit', prompt: 'Identify manual processes in my business that can be automated. What am I doing by hand that AI or software could handle?', icon: Zap },
    { label: 'ROI Calculator', prompt: 'Calculate the projected savings if I implement cost reductions. Show me 3, 6, and 12-month projections.', icon: BarChart2 },
    { label: 'Industry Benchmarks', prompt: 'Compare my business spending to typical benchmarks in my industry. Where am I overspending compared to peers?', icon: BarChart2 },
    { label: 'Action Plan', prompt: 'Create a prioritised action plan for reducing costs. Rank by effort vs. impact — quick wins first.', icon: ListChecks },
  ],
})
