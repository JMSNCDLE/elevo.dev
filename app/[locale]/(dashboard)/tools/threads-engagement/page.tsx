'use client'
import createToolPage from '@/lib/tools/tool-page'
import { TrendingUp, FileText, MessageSquare, Zap } from 'lucide-react'
export default createToolPage({ title: 'Engagement Booster', subtitle: 'Optimise posts for maximum engagement — 1 credit', apiPath: '/api/tools/threads-engagement', iconColor: 'bg-pink-600', cursorColor: 'bg-pink-400', icon: TrendingUp, greeting: "I'm the ELEVO Engagement Booster — paste your post and I'll optimise it for maximum engagement.", upgradeCopy: 'Upgrade to Launch (€39/mo) to unlock Engagement Booster.', quickActions: [
  { label: 'Optimise Post', prompt: 'Analyse and rewrite my post for maximum engagement. Show before/after.', icon: FileText },
  { label: 'Reply Templates', prompt: 'Create reply templates to boost engagement on my posts.', icon: MessageSquare },
  { label: 'Post-Publish Actions', prompt: 'What 5 actions should I take after publishing to maximise reach?', icon: Zap },
] })
