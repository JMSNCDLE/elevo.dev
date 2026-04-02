'use client'

import createToolPage from '@/lib/tools/tool-page'
import { FileText, DollarSign, Clock, CheckSquare, User, Briefcase } from 'lucide-react'

export default createToolPage({
  title: 'Proposal Builder',
  subtitle: 'Generate professional business proposals — 1 credit per query',
  apiPath: '/api/tools/proposal-builder',
  iconColor: 'bg-violet-600',
  cursorColor: 'bg-violet-400',
  icon: FileText,
  greeting: "I'm the ELEVO Proposal Builder — I create professional business proposals that close deals. Tell me about the project, client, and your services, and I'll generate a complete proposal with executive summary, scope, timeline, pricing, and terms. Ready to win a deal?",
  upgradeCopy: 'Upgrade to Orbit (€49.99/mo) to unlock the Proposal Builder — generate professional business proposals with executive summaries, pricing tables, timelines, and terms.',
  quickActions: [
    { label: 'Full Proposal', prompt: 'Create a complete business proposal for a client. I\'ll describe the project and you generate everything: executive summary, scope, deliverables, timeline, pricing, terms, and next steps.', icon: FileText },
    { label: 'Pricing Table', prompt: 'Help me build a professional pricing table for my proposal. I need line items, quantities, rates, discounts, and totals formatted clearly.', icon: DollarSign },
    { label: 'Timeline', prompt: 'Create a project timeline with phases, milestones, and deliverable dates that I can include in my proposal.', icon: Clock },
    { label: 'Scope of Work', prompt: 'Write a detailed scope of work section for my proposal. Include what\'s included, what\'s excluded, and assumptions.', icon: CheckSquare },
    { label: 'Executive Summary', prompt: 'Write a compelling executive summary for my proposal that hooks the client and makes them want to read the rest.', icon: User },
    { label: 'Terms & Conditions', prompt: 'Generate standard terms and conditions for my business proposals: payment terms, revision policy, IP ownership, cancellation, and liability.', icon: Briefcase },
  ],
})
