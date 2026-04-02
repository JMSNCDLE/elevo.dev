'use client'
import createToolPage from '@/lib/tools/tool-page'
import { Zap, FileText, MessageSquare, Target } from 'lucide-react'
export default createToolPage({ title: 'Hook Generator', subtitle: 'Scroll-stopping hooks for Threads — 1 credit', apiPath: '/api/tools/threads-hooks', iconColor: 'bg-red-600', cursorColor: 'bg-red-400', icon: Zap, greeting: "I'm the ELEVO Hook Generator — I create scroll-stopping hooks. Tell me your topic and target emotion.", upgradeCopy: 'Upgrade to Launch (€29.99/mo) to unlock Hook Generator.', quickActions: [
  { label: '20 Hooks', prompt: 'Generate 20 scroll-stopping hooks for my topic with format labels.', icon: FileText },
  { label: 'Top 5 Ranked', prompt: 'Give me your top 5 hooks ranked with reasoning for why they work.', icon: Target },
  { label: 'Pattern Interrupts', prompt: 'Write 10 pattern interrupt opening lines for Threads.', icon: Zap },
  { label: 'Reply Hooks', prompt: 'Create 5 hooks optimised to generate replies and comments.', icon: MessageSquare },
] })
