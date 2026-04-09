'use client'

import createToolPage from '@/lib/tools/tool-page'
import { Phone, FileText, Shield, MessageSquare, Target, Voicemail } from 'lucide-react'

export default createToolPage({
  title: 'Cold Call Script Generator',
  subtitle: 'AI-powered call scripts that close deals — 1 credit per query',
  apiPath: '/api/tools/cold-call',
  iconColor: 'bg-red-600',
  cursorColor: 'bg-red-400',
  icon: Phone,
  greeting: "I'm the ELEVO Cold Call Script Generator — I create complete cold call scripts with opening hooks, qualifying questions, objection handling, and closing techniques. Tell me what you're selling and who you're calling, and I'll write a script you can use today.",
  upgradeCopy: 'Upgrade to Orbit (€79/mo) to unlock the Cold Call Script Generator — get AI-written call scripts with objection handling, qualifying questions, and voicemail scripts.',
  quickActions: [
    { label: 'Full Script', prompt: 'Create a complete cold call script for my business. Include opening hook, value prop, qualifying questions, objection handling for 5 common objections, closing, and voicemail script.', icon: FileText },
    { label: 'Objection Handling', prompt: 'Give me responses to the 10 most common cold call objections: no budget, no time, not interested, already have a solution, send me info, need to think, wrong person, call back later, too expensive, happy with current provider.', icon: Shield },
    { label: 'Opening Hooks', prompt: 'Generate 10 different cold call opening hooks I can test. Each should be a pattern interrupt that gets past "I\'m not interested" in the first 10 seconds.', icon: MessageSquare },
    { label: 'Qualifying Questions', prompt: 'Create a set of 8 qualifying questions for my cold calls that help me determine if the prospect is a good fit — without sounding like an interrogation.', icon: Target },
    { label: 'Voicemail Scripts', prompt: 'Write 5 different voicemail scripts (20 seconds each) that maximise callback rates. Include curiosity hooks and clear CTAs.', icon: Voicemail },
  ],
})
