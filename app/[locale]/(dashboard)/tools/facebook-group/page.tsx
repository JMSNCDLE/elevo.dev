'use client'

import createToolPage from '@/lib/tools/tool-page'
import { Users2, TrendingUp, MessageSquare, Calendar, UserPlus, Shield, DollarSign } from 'lucide-react'

export default createToolPage({
  title: 'Facebook Group Machine',
  subtitle: 'Grow and monetise your Facebook group — 1 credit per query',
  apiPath: '/api/tools/facebook-group',
  iconColor: 'bg-blue-500',
  cursorColor: 'bg-blue-400',
  icon: Users2,
  greeting: "I'm the ELEVO Facebook Group Machine — I help you grow, engage, and monetise Facebook groups. I create growth strategies, engagement posts, lead capture systems, content calendars, and monetisation plans. What would you like to build?",
  upgradeCopy: 'Upgrade to Orbit (€79/mo) to unlock the Facebook Group Machine — grow and monetise your Facebook group with AI-powered strategies, content, and automation.',
  quickActions: [
    { label: 'Growth Strategy', prompt: 'Create a Facebook group growth strategy for my business. Include organic tactics, cross-promotion, and member activation plan.', icon: TrendingUp },
    { label: 'Engagement Posts', prompt: 'Generate 10 high-engagement post templates for my Facebook group. Include questions, polls, value posts, and discussion starters.', icon: MessageSquare },
    { label: 'Lead Capture', prompt: 'Design a lead capture system for my Facebook group. Include membership questions, lead magnet delivery, and pinned post funnel.', icon: UserPlus },
    { label: 'Content Calendar', prompt: 'Build a 30-day content calendar for my Facebook group with daily themes and specific post ideas.', icon: Calendar },
    { label: 'Welcome Sequence', prompt: 'Create a welcome message sequence for new group members. Include 3 messages over their first week to engage and convert them.', icon: Shield },
    { label: 'Monetisation', prompt: 'Build a monetisation strategy for my Facebook group. Include free-to-paid funnel, launch sequence, and pricing strategy.', icon: DollarSign },
  ],
})
