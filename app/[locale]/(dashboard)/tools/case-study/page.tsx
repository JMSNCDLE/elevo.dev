'use client'
import createToolPage from '@/lib/tools/tool-page'
import { FileText, Award, Share2, Mail, Presentation } from 'lucide-react'
export default createToolPage({
  title: 'Case Study Builder',
  subtitle: 'Create compelling case studies that close deals — 1 credit',
  apiPath: '/api/tools/case-study',
  iconColor: 'bg-emerald-600',
  cursorColor: 'bg-emerald-400',
  icon: Award,
  greeting: "I'm the ELEVO Case Study Builder — I create case studies that prove your value and close deals. Tell me about a client success story.",
  upgradeCopy: 'Upgrade to Launch (€39/mo) to unlock the Case Study Builder.',
  quickActions: [
    { label: 'Full Case Study', prompt: 'Create a complete 800-1200 word case study. I will provide the client, challenge, solution, and results.', icon: FileText },
    { label: 'One-Pager', prompt: 'Create a condensed single-page case study with key stats highlighted.', icon: FileText },
    { label: 'Social Posts', prompt: 'Write 5 social media posts promoting my case study.', icon: Share2 },
    { label: 'Email Version', prompt: 'Format my case study as a nurture email.', icon: Mail },
    { label: 'Slide Deck', prompt: 'Create an 8-slide presentation outline from my case study.', icon: Presentation },
  ],
})
