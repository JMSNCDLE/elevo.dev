'use client'

import { useState, useEffect } from 'react'
import { Bot, Lock, ExternalLink, Search } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { AGENT_PERSONAS } from '@/lib/agents/agentPersonas'
import type { AgentPersona } from '@/lib/agents/agentPersonas'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const AGENT_ROUTES: Record<string, string> = {
  Leo: '/roas',
  Flora: '/finances',
  Rex: '/inventory',
  Maya: '/customer-trends',
  Geo: '/google-optimisation',
  Sol: '/dashboard/content/blog',
  Val: '/dashboard/content/gbp-posts',
  Nova: '/dashboard/growth/strategy',
  Ava: '/dashboard/growth/sales',
  Clio: '/dashboard/growth/campaigns',
  Aria: '/dashboard/growth/research',
  Zara: '/dashboard/growth/financial',
  Finn: '/dashboard/growth/management',
  Sage: '/dashboard/customers',
  Echo: '/conversations',
  Max: '/dashboard/advisor',
  Iris: '/dashboard',
  Hunter: '/dashboard/growth/research',
  Hugo: '/alternatives',
  Vega: '/video-studio',
  Rank: '/seo',
}

const PLAN_ORDER = ['trial', 'launch', 'orbit', 'galaxy']

function planLabel(plan: string) {
  if (plan === 'trial') return 'Free'
  if (plan === 'launch') return 'Launch'
  if (plan === 'orbit') return 'Orbit'
  return 'Galaxy'
}

function isAgentAvailable(agent: AgentPersona, userPlan: string): boolean {
  const agentIdx = PLAN_ORDER.indexOf(agent.availableFrom)
  const userIdx = PLAN_ORDER.indexOf(userPlan)
  return userIdx >= agentIdx
}

export default function AgentsPage() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'
  const [plan, setPlan] = useState<string>('trial')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: pr } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
      if (pr) setPlan(pr.plan)
    })
  }, [])

  const filtered = AGENT_PERSONAS.filter(agent => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      agent.characterName.toLowerCase().includes(q) ||
      agent.brandName.toLowerCase().includes(q) ||
      agent.description.toLowerCase().includes(q) ||
      agent.capabilities.some(s => s.toLowerCase().includes(q))
    )
  })

  return (
    <div className="min-h-screen bg-dashBg text-dashText">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <Bot size={18} className="text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-dashText">All Agents</h1>
              <p className="text-sm text-dashMuted">Your full team of AI specialists — each built for a specific job</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dashMuted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search agents by name, role or capability…"
            className="w-full bg-dashCard border border-dashSurface2 rounded-xl pl-9 pr-4 py-2.5 text-sm text-dashText placeholder-dashMuted focus:outline-none focus:border-accent"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(agent => {
            const available = isAgentAvailable(agent, plan)
            const route = AGENT_ROUTES[agent.characterName]
            const href = route ? `/${locale}${route}` : null

            return (
              <div
                key={agent.characterName}
                className={cn(
                  'bg-dashCard border rounded-2xl p-5 flex flex-col gap-3 transition-all',
                  available
                    ? 'border-dashSurface2 hover:border-accent/40'
                    : 'border-dashSurface2 opacity-60'
                )}
              >
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{agent.emoji}</span>
                    <div>
                      <p className="font-semibold text-dashText text-sm">{agent.brandName}™</p>
                      <p className="text-xs text-dashMuted">{agent.characterName} · {agent.tagline}</p>
                    </div>
                  </div>
                  {!available && (
                    <div className="flex items-center gap-1 bg-accent/10 text-accent text-xs px-2 py-0.5 rounded-full shrink-0">
                      <Lock size={10} />
                      {planLabel(agent.availableFrom)}+
                    </div>
                  )}
                  {available && agent.creditsPerUse > 0 && (
                    <div className="text-xs text-dashMuted bg-dashSurface px-2 py-0.5 rounded-full shrink-0">
                      {agent.creditsPerUse} cr
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-dashMuted leading-relaxed flex-1">{agent.description}</p>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-1.5">
                  {agent.capabilities.slice(0, 3).map(s => (
                    <span key={s} className="text-xs bg-dashSurface text-dashMuted px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>

                {/* CTA */}
                {href && available && (
                  <Link
                    href={href}
                    className="flex items-center justify-center gap-1.5 py-2 bg-accent/10 text-accent text-xs font-semibold rounded-lg hover:bg-accent/20 transition-colors"
                  >
                    Open {agent.characterName}
                    <ExternalLink size={11} />
                  </Link>
                )}
                {!available && (
                  <Link
                    href={`/${locale}/pricing`}
                    className="flex items-center justify-center gap-1.5 py-2 bg-dashSurface text-dashMuted text-xs font-semibold rounded-lg hover:text-dashText transition-colors"
                  >
                    <Lock size={11} />
                    Upgrade to unlock
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-dashMuted">
            <Bot size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No agents match &quot;{search}&quot;</p>
          </div>
        )}
      </div>
    </div>
  )
}
