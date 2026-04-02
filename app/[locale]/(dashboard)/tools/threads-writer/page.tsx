'use client'
import createToolPage from '@/lib/tools/tool-page'
import { PenLine, FileText, Zap, MessageSquare } from 'lucide-react'
export default createToolPage({ title: 'Thread Writer', subtitle: 'Write viral long-form threads — 1 credit', apiPath: '/api/tools/threads-writer', iconColor: 'bg-indigo-600', cursorColor: 'bg-indigo-400', icon: PenLine, greeting: "I'm the ELEVO Thread Writer — I write viral threads ready to publish. Give me a topic and I'll create a complete thread.", upgradeCopy: 'Upgrade to Launch (€29.99/mo) to unlock Thread Writer.', quickActions: [
  { label: 'Write Thread', prompt: 'Write a complete viral thread on my topic. Include opening hook, value content, and CTA close.', icon: FileText },
  { label: 'Alt Hooks', prompt: 'Give me 3 alternative opening hooks for my thread topic.', icon: Zap },
  { label: 'Engagement Qs', prompt: 'Write engagement questions I can post as replies to boost my thread.', icon: MessageSquare },
] })
