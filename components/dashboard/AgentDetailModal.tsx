'use client'

import { X, Lock, Rocket } from 'lucide-react'
import Link from 'next/link'
import type { AgentPersona } from '@/lib/agents/agentPersonas'

interface AgentDetailModalProps {
  agent: AgentPersona
  userPlan: string
  onClose: () => void
}

const PLAN_LABELS: Record<string, string> = {
  trial: 'Free Trial',
  launch: 'Launch (€39/mo)',
  orbit: 'Orbit (€79/mo)',
  galaxy: 'Galaxy (€149/mo)',
  admin: 'Admin',
}

export default function AgentDetailModal({ agent, userPlan, onClose }: AgentDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A2332] border border-[#1E2A3A] rounded-2xl p-6 max-w-md w-full shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6B7280] hover:text-[#EEF2FF] transition-colors"
        >
          <X size={18} />
        </button>

        {/* Agent header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 bg-[#6366F1]/10 rounded-2xl flex items-center justify-center text-2xl shrink-0">
            {agent.emoji}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#EEF2FF]">{agent.brandName}</h2>
            <p className="text-sm text-[#6B7280]">{agent.tagline}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[#9CA3AF] mb-5 leading-relaxed">{agent.description}</p>

        {/* Capabilities */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Capabilities</p>
          <div className="flex flex-wrap gap-2">
            {agent.capabilities.map((cap) => (
              <span
                key={cap}
                className="text-xs bg-[#141B24] text-[#9CA3AF] px-2.5 py-1 rounded-lg border border-[#1E2A3A]"
              >
                {cap}
              </span>
            ))}
          </div>
        </div>

        {/* Plan info */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={14} className="text-amber-400" />
            <p className="text-sm font-medium text-amber-400">Plan Required</p>
          </div>
          <p className="text-sm text-[#9CA3AF]">
            You&apos;re on <span className="text-[#EEF2FF] font-medium">{PLAN_LABELS[userPlan] ?? userPlan}</span>.
            This agent requires <span className="text-amber-400 font-medium">{PLAN_LABELS[agent.availableFrom] ?? agent.availableFrom}</span>.
          </p>
          {agent.creditsPerUse > 0 && (
            <p className="text-xs text-[#6B7280] mt-1">{agent.creditsPerUse} credit{agent.creditsPerUse > 1 ? 's' : ''} per use</p>
          )}
        </div>

        {/* CTA */}
        <Link
          href="/pricing"
          className="flex items-center justify-center gap-2 w-full py-3 bg-[#6366F1] hover:bg-[#5254CC] text-white font-semibold rounded-xl transition-colors text-sm"
          onClick={onClose}
        >
          <Rocket size={15} />
          Upgrade plan →
        </Link>
      </div>
    </div>
  )
}
