'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, ChevronRight, Lock } from 'lucide-react'
import { useAgentSearch } from '@/hooks/useAgentSearch'
import { AGENT_PERSONAS, AgentPersona } from '@/lib/agents/agentPersonas'
import AgentDetailModal from './AgentDetailModal'

const PLAN_RANK: Record<string, number> = { trial: 0, launch: 1, orbit: 2, galaxy: 3, admin: 4 }

const AGENT_ROUTES: Record<string, string> = {
  'ELEVO Ads Pro': '/ads',
  'ELEVO Ads': '/roas',
  'ELEVO Rank': '/seo',
  'ELEVO Rank™': '/seo',
  'ELEVO Viral™': '/viral',
  'ELEVO Spy™': '/spy',
  'ELEVO Create™': '/create',
  'ELEVO Clip™': '/clip',
  'ELEVO Studio': '/video-studio',
  'ELEVO Drop™': '/drop',
  'ELEVO Market™': '/market',
  'ELEVO Creator™': '/creator',
  'ELEVO Deep™': '/deep',
  'ELEVO Write Pro™': '/write-pro',
  'ELEVO Route™': '/chat',
  'ELEVO Solve': '/dashboard/advisor',
  'ELEVO Live': '/chat',
  'ELEVO Connect': '/conversations',
  'ELEVO Flow': '/conversations',
  'ELEVO Insight': '/customer-trends',
  'ELEVO Social': '/smm',
  'ELEVO Profile': '/social',
  'ELEVO Local': '/google-optimisation',
  'ELEVO Switch': '/alternatives',
  'ELEVO Guard': '/settings/trademark',
  'ELEVO Write': '/dashboard/content/gbp-posts',
  'ELEVO Check': '/dashboard/content/gbp-posts',
  'ELEVO Sales': '/dashboard/growth/sales',
  'ELEVO Research': '/dashboard/growth/research',
  'ELEVO Strategy': '/dashboard/growth/strategy',
  'ELEVO Money': '/dashboard/growth/financial',
  'ELEVO People': '/dashboard/growth/management',
  'ELEVO Import': '/analytics',
  'ELEVO Intel': '/roas',
  'ELEVO Guide': '/onboarding',
  'ELEVO Site': '/website',
  'ELEVO PA™': '/admin/pa',
  'ELEVO CEO™': '/ceo',
  'ELEVO Stitch™': '/stitch',
}

function getRoute(agent: AgentPersona, locale: string): string {
  const route = AGENT_ROUTES[agent.brandName] ?? '/agents'
  return `/${locale}${route}`
}

interface AgentSearchProps {
  userPlan: string
  locale: string
}

export default function AgentSearch({ userPlan, locale }: AgentSearchProps) {
  const { isOpen, close } = useAgentSearch()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lockedAgent, setLockedAgent] = useState<AgentPersona | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const userRank = PLAN_RANK[userPlan] ?? 0

  const isAgentAvailable = useCallback((agent: AgentPersona): boolean => {
    const required = PLAN_RANK[agent.availableFrom] ?? 0
    return userRank >= required
  }, [userRank])

  const filtered = AGENT_PERSONAS.filter(agent => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      agent.brandName.toLowerCase().includes(q) ||
      agent.characterName.toLowerCase().includes(q) ||
      agent.tagline.toLowerCase().includes(q) ||
      agent.description.toLowerCase().includes(q) ||
      agent.capabilities.some(c => c.toLowerCase().includes(q))
    )
  }).sort((a, b) => {
    const aAvail = isAgentAvailable(a) ? 0 : 1
    const bAvail = isAgentAvailable(b) ? 0 : 1
    return aAvail - bAvail
  })

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleSelect = useCallback((agent: AgentPersona) => {
    if (isAgentAvailable(agent)) {
      const route = getRoute(agent, locale)
      router.push(route)
      close()
    } else {
      setLockedAgent(agent)
    }
  }, [isAgentAvailable, locale, router, close])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); return }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); return }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[selectedIndex]) handleSelect(filtered[selectedIndex])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, filtered, selectedIndex, close, handleSelect])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
        <div className="agent-search-overlay relative w-full max-w-xl bg-[#141B24] border border-[#1E2A3A] rounded-2xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1E2A3A]">
            <Search size={18} className="text-[#6B7280] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search ELEVO agents..."
              className="flex-1 bg-transparent text-[#EEF2FF] placeholder:text-[#6B7280] text-sm outline-none"
            />
            <button onClick={close} className="text-[#6B7280] hover:text-[#EEF2FF] transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-[#6B7280] text-sm">No agents found for &quot;{query}&quot;</div>
            ) : (
              <ul className="py-2">
                {filtered.map((agent, i) => {
                  const available = isAgentAvailable(agent)
                  const active = i === selectedIndex
                  return (
                    <li key={`${agent.brandName}-${i}`}>
                      <button
                        onMouseEnter={() => setSelectedIndex(i)}
                        onClick={() => handleSelect(agent)}
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                          active ? 'bg-[#6366F1]/10' : 'hover:bg-[#1A2332]'
                        }`}
                      >
                        <span className="text-xl shrink-0">{agent.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#EEF2FF] truncate">{agent.brandName}</span>
                            {available ? (
                              <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full shrink-0">Available</span>
                            ) : (
                              <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                <Lock size={9} />
                                {agent.availableFrom.charAt(0).toUpperCase() + agent.availableFrom.slice(1)}+
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#6B7280] truncate">{agent.tagline}</p>
                        </div>
                        <ChevronRight size={14} className={active ? 'text-[#6366F1]' : 'text-[#374151]'} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2.5 border-t border-[#1E2A3A] flex items-center gap-4 text-xs text-[#4B5563]">
            <span><kbd className="bg-[#0D1219] px-1.5 py-0.5 rounded border border-[#1E2A3A]">↑↓</kbd> navigate</span>
            <span><kbd className="bg-[#0D1219] px-1.5 py-0.5 rounded border border-[#1E2A3A]">↵</kbd> select</span>
            <span><kbd className="bg-[#0D1219] px-1.5 py-0.5 rounded border border-[#1E2A3A]">esc</kbd> close</span>
          </div>
        </div>
      </div>

      {lockedAgent && (
        <AgentDetailModal
          agent={lockedAgent}
          userPlan={userPlan}
          onClose={() => setLockedAgent(null)}
        />
      )}
    </>
  )
}
