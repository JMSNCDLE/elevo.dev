'use client'

import createToolPage from '@/lib/tools/tool-page'
import { Search, FileText, TrendingUp, Users, BarChart2, Presentation } from 'lucide-react'

export default createToolPage({
  title: 'Researcher',
  subtitle: 'AI-powered market research on demand — 1 credit per query',
  apiPath: '/api/tools/researcher',
  iconColor: 'bg-sky-600',
  cursorColor: 'bg-sky-400',
  icon: Search,
  greeting: "I'm the ELEVO Researcher — I create structured research reports with market data, competitive analysis, and actionable recommendations. Tell me what you want to research and I'll deliver a comprehensive report. What topic should I investigate?",
  upgradeCopy: 'Upgrade to Orbit (€79/mo) to unlock the Researcher — get AI-powered market research with competitive analysis, opportunity mapping, and actionable recommendations.',
  quickActions: [
    { label: 'Full Report', prompt: 'Create a comprehensive research report on my industry. Include market overview, opportunities, competitive landscape, key data, and actionable recommendations.', icon: FileText },
    { label: 'Competitor Research', prompt: 'Research my top 5-10 competitors. Compare their offerings, pricing, strengths, weaknesses, and market positioning.', icon: Users },
    { label: 'Market Opportunity', prompt: 'Identify the top market opportunities in my industry. What gaps exist? What underserved segments can I target?', icon: TrendingUp },
    { label: 'Industry Benchmarks', prompt: 'What are the key benchmarks and statistics in my industry? Give me conversion rates, pricing data, growth rates, and customer behaviour stats.', icon: BarChart2 },
    { label: 'Turn into Presentation', prompt: 'Take the research and reformat it as a presentation: one slide per section, 3-5 bullets per slide, with speaker notes.', icon: Presentation },
    { label: 'Turn into Blog Post', prompt: 'Rewrite the research as a publishable 1500-word blog article with an intro hook, subheadings, and a strong conclusion.', icon: FileText },
  ],
})
