'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, Rocket, ArrowRight } from 'lucide-react'
import type { ReturnBriefing } from '@/lib/agents/projectMemoryAgent'

interface ReturnBriefingProps {
  briefing: ReturnBriefing
  userName: string
}

export default function ReturnBriefingComponent({ briefing, userName }: ReturnBriefingProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-[#1A2332] border border-[#6366F1]/20 rounded-2xl p-6 mb-6 relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 text-[#6B7280] hover:text-[#EEF2FF] transition-colors"
      >
        <X size={16} />
      </button>

      {/* Greeting */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-[#6366F1]/10 rounded-xl flex items-center justify-center shrink-0">
          <Rocket size={18} className="text-[#6366F1]" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#EEF2FF]">Welcome back, {userName}!</h3>
          <p className="text-sm text-[#9CA3AF] mt-0.5">{briefing.greeting}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Where we left off */}
        <div className="bg-[#141B24] rounded-xl p-4 border border-[#1E2A3A]">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Where You Left Off</p>
          <p className="text-sm text-[#EEF2FF] leading-relaxed">{briefing.whereWeLeftOff}</p>
        </div>

        {/* What happened */}
        <div className="bg-[#141B24] rounded-xl p-4 border border-[#1E2A3A]">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">While You Were Away</p>
          <p className="text-sm text-[#EEF2FF] leading-relaxed">{briefing.whatHappened}</p>
        </div>
      </div>

      {/* Recommended action */}
      <div className="bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-xl p-4 mb-4">
        <p className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-1">Recommended Next Action</p>
        <p className="text-sm text-[#EEF2FF]">{briefing.nextRecommendedAction}</p>
      </div>

      {/* Quick links */}
      {briefing.quickLinks && briefing.quickLinks.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            {briefing.quickLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#141B24] hover:bg-[#1E2A3A] border border-[#1E2A3A] hover:border-[#6366F1]/30 rounded-lg text-sm text-[#EEF2FF] transition-all group"
                title={link.reason}
              >
                {link.label}
                <ArrowRight size={12} className="text-[#6366F1] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
