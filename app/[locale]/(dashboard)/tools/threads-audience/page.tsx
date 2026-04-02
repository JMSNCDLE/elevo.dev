'use client'
import createToolPage from '@/lib/tools/tool-page'
import { Users, Target, Heart, MessageSquare } from 'lucide-react'
export default createToolPage({ title: 'Audience Analysis', subtitle: 'Deep audience insights for Threads — 1 credit', apiPath: '/api/tools/threads-audience', iconColor: 'bg-violet-600', cursorColor: 'bg-violet-400', icon: Users, greeting: "I'm the ELEVO Audience Analysis Agent — I create deep audience insights. Tell me about your niche and ideal customer.", upgradeCopy: 'Upgrade to Orbit (€49.99/mo) to unlock Audience Analysis.', quickActions: [
  { label: 'Full Analysis', prompt: 'Create a complete audience analysis. Deep avatar, struggles, desires, content angles, emotional triggers.', icon: Target },
  { label: 'Audience Avatar', prompt: 'Build a detailed audience avatar for my niche.', icon: Users },
  { label: 'Pain Points', prompt: 'List the top 10 struggles my audience faces, ranked by intensity.', icon: Heart },
  { label: 'Content Angles', prompt: 'Give me 15 content angles with examples that will resonate with my audience.', icon: MessageSquare },
] })
