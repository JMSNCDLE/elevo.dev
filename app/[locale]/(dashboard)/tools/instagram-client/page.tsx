'use client'

import createToolPage from '@/lib/tools/tool-page'
import { Camera, MessageSquare, Users, TrendingUp, Hash, User, Film } from 'lucide-react'

export default createToolPage({
  title: 'Instagram Client Machine',
  subtitle: 'Turn followers into paying clients — 1 credit per query',
  apiPath: '/api/tools/instagram-client',
  iconColor: 'bg-gradient-to-br from-purple-600 to-pink-500',
  cursorColor: 'bg-pink-400',
  icon: Camera,
  greeting: "I'm the ELEVO Instagram Client Machine — I help you turn followers into paying clients. I create DM scripts, lead generation strategies, content plans, hashtag research, bio optimisation, and story selling sequences. What would you like to work on?",
  upgradeCopy: 'Upgrade to Orbit (€49.99/mo) to unlock the Instagram Client Machine — turn your followers into paying clients with AI-powered DM scripts, content strategies, and conversion funnels.',
  quickActions: [
    { label: 'DM Scripts', prompt: 'Write warm and cold DM outreach scripts for acquiring clients on Instagram. Include opener, value pitch, and CTA.', icon: MessageSquare },
    { label: 'Lead Strategy', prompt: 'Create a complete Instagram lead generation strategy for my business. Include content types, posting schedule, and conversion funnel.', icon: Users },
    { label: 'Content Plan', prompt: 'Build a 30-day Instagram content plan focused on attracting clients. Include post types (carousel, reel, story), hooks, and CTAs.', icon: TrendingUp },
    { label: 'Hashtag Research', prompt: 'Research the best hashtags for my business on Instagram. Give me 30 hashtags in 3 tiers: niche, medium, and trending.', icon: Hash },
    { label: 'Bio Optimizer', prompt: 'Optimise my Instagram bio for conversions. Use the formula: Who I help + What I do + CTA + Social proof.', icon: User },
    { label: 'Story Sequence', prompt: 'Create a 7-day story selling sequence to promote my service. Include polls, questions, CTAs, and the final pitch.', icon: Film },
  ],
})
