'use client'

import createToolPage from '@/lib/tools/tool-page'
import { Mail, FileText, Users, Repeat, User, Zap } from 'lucide-react'

export default createToolPage({
  title: 'Cold Email Machine',
  subtitle: 'Generate complete cold email sequences — 1 credit per query',
  apiPath: '/api/tools/cold-email',
  iconColor: 'bg-emerald-600',
  cursorColor: 'bg-emerald-400',
  icon: Mail,
  greeting: "I'm the ELEVO Cold Email Machine — I create complete cold email sequences that get replies. Tell me about your target audience and I'll generate a 3-5 email drip sequence with subject lines, A/B variants, and personalisation points. What would you like to sell?",
  upgradeCopy: 'Upgrade to Orbit (€49.99/mo) to unlock the Cold Email Machine — generate complete cold email sequences with A/B variants, personalisation, and optimal send timing.',
  quickActions: [
    { label: 'Full Sequence', prompt: 'Create a complete 5-email cold outreach sequence for my business. Include subject lines, body, CTA, and send timing for each email.', icon: FileText },
    { label: 'Personalise', prompt: 'I want to personalise my cold emails for a specific prospect. Help me research and rewrite my sequence for a company in my target market.', icon: User },
    { label: 'A/B Variants', prompt: 'Generate A/B test variants for my cold email sequence. Give me 2 versions of each email with different subject lines and opening hooks.', icon: Repeat },
    { label: 'Follow-Up Only', prompt: 'Write 3 follow-up emails for prospects who opened but didn\'t reply to my first email. Make them progressively more direct.', icon: Mail },
    { label: 'Book Meeting', prompt: 'Create a cold email sequence specifically designed to book a 15-minute discovery call. Focus on curiosity and value, not hard selling.', icon: Users },
    { label: 'Re-Engage', prompt: 'Write a re-engagement email sequence for leads who went cold 30+ days ago. Win them back with a new angle.', icon: Zap },
  ],
})
