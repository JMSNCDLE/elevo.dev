'use client'
import createToolPage from '@/lib/tools/tool-page'
import { Calendar, FileText, TrendingUp, Clock } from 'lucide-react'
export default createToolPage({ title: '30-Day Content Plan', subtitle: 'Complete Threads content calendar — 1 credit', apiPath: '/api/tools/threads-content-plan', iconColor: 'bg-orange-600', cursorColor: 'bg-orange-400', icon: Calendar, greeting: "I'm the ELEVO 30-Day Content Plan Agent — I create complete Threads content calendars. Tell me your niche and goals.", upgradeCopy: 'Upgrade to Orbit (€49.99/mo) to unlock Content Plan.', quickActions: [
  { label: 'Full Calendar', prompt: 'Create a 30-day Threads content calendar with topic, format, objective, and hook for each day.', icon: Calendar },
  { label: 'Weekly Strategy', prompt: 'Break down the content strategy week by week with themes and goals.', icon: FileText },
  { label: 'Viral Posts', prompt: 'Identify 4 high viral-potential posts and explain why they could go viral.', icon: TrendingUp },
  { label: 'Best Times', prompt: 'What are the best posting times for my niche on Threads?', icon: Clock },
] })
