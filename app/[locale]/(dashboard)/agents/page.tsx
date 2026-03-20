'use client'

import { useState, useEffect } from 'react'
import { Bot, Lock, ExternalLink, Search } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { AGENTS } from '@/lib/agents/agentPersonas'
import type { AgentPersona } from '@/lib/agents/agentPersonas'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const AGENT_ROUTES: Record<string, string> = {
  leo: '/roas',
  flora: '/finances',
  rex: '/inventory',
  maya: '/customer-trends',
  geo: '/google-optimisation',
  sol: '/dashboard/content/blog',
  val: '/dashboard/content/gbp-posts',
  nova: '/dashboard/growth/strategy',
  ava: '/dashboard/growth/sales',
  clio: '/dashboard/growth/campaigns',
  aria: '/dashboard/growth/research',
  zara: '/dashboard/growth/financial',
  finn: '/dashboard/growth/management',
  sage: '/dashboard/customers',
  echo: '/conversations',
  max: '/dashboard/advisor',
  iris: '/dashboard',
  hunter: '/dashboard/growth/research',
  hugo: '/alternatives',
}

const PLAN_ORDER = ['trial', 'launch', 'orbit', 'galaxy']

function planLabel(plan: string) {
  if (plan === 'trial') return 'Free'
  if (plan === 'launch') return 'Launch'
  if (plan === 'orbit') return 'Orbit+'
  return 'Galaxy'
}

function isAgentAvailable(agent: AgentPersona, userPlan: string): boolean {
  return agent.availableOn.includes(userPlan as never)
}

function minPlanRequired(agent: AgentPersona): string {
  const idx = Math.min(...agent.availableOn.map(p => PLAN_ORDER.indexOf(p)))
  return PLAN_ORDER[idx] ?? 'trial'
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

  const filtered = AGENTS.filter(agent => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      agent.name.toLowerCase().includes(q) ||
      agent.role.toLowerCase().includes(q) ||
      agent.description.toLowerCase().includes(q) ||
      agent.specialties.some(s => s.toLowerCase().includes(q))
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
            placeholder="Search agents by name, role or specialty…"
            className="w-full bg-dashCard border border-dashSurface2 rounded-xl pl-9 pr-4 py-2.5 text-sm text-dashText placeholder-dashMuted focus:outline-none focus:border-accent"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(agent => {
            const available = isAgentAvailable(agent, plan)
            const route = AGENT_ROUTES[agent.id]
            const href = route ? `/${locale}${route}` : null

            return (
              <div
                key={agent.id}
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
                      <p className="font-semibold text-dashText text-sm">{agent.name}</p>
                      <p className="text-xs text-dashMuted">{agent.role}</p>
                    </div>
                  </div>
                  {!available && (
                    <div className="flex items-center gap-1 bg-accent/10 text-accent text-xs px-2 py-0.5 rounded-full shrink-0">
                      <Lock size={10} />
                      {planLabel(minPlanRequired(agent))}+
                    </div>
                  )}
                  {available && agent.creditCost > 0 && (
                    <div className="text-xs text-dashMuted bg-dashSurface px-2 py-0.5 rounded-full shrink-0">
                      {agent.creditCost} cr
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-dashMuted leading-relaxed flex-1">{agent.description}</p>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1.5">
                  {agent.specialties.slice(0, 3).map(s => (
                    <span key={s} className="text-xs bg-dashSurface text-dashMuted px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>

                {/* CTA */}
                {href && available && (
                  <Link
                    href={href}
                    className="flex items-center justify-center gap-1.5 py-2 bg-accent/10 text-accent text-xs font-semibold rounded-lg hover:bg-accent/20 transition-colors"
                  >
                    Open {agent.name}
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
