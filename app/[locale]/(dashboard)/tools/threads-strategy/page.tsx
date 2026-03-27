'use client'
import createToolPage from '@/lib/tools/tool-page'
import { TrendingUp, FileText, Users, Hash, BarChart2 } from 'lucide-react'
export default createToolPage({ title: 'Threads Strategy', subtitle: 'Complete Threads growth strategy — 1 credit', apiPath: '/api/tools/threads-strategy', iconColor: 'bg-black', cursorColor: 'bg-gray-400', icon: TrendingUp, greeting: "I'm the ELEVO Threads Strategy Agent — I build complete growth strategies for Threads. Tell me about your niche and goals.", upgradeCopy: 'Upgrade to Orbit (€79/mo) to unlock Threads Strategy.', quickActions: [
  { label: 'Full Strategy', prompt: 'Create a complete Threads growth strategy for my business. Include niche positioning, content pillars, posting frequency, and growth projections.', icon: FileText },
  { label: 'Content Pillars', prompt: 'Define 3-5 content pillars for my Threads account with examples of each.', icon: Users },
  { label: 'Hashtag Strategy', prompt: 'Create a ranked list of 20 hashtags for my Threads niche.', icon: Hash },
  { label: 'Growth Timeline', prompt: 'Project my Threads growth over 3/6/12 months with milestones.', icon: BarChart2 },
] })
