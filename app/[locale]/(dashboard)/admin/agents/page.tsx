'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Bot, Loader2, BarChart2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

const ADMIN_USER_ID = '5dc15dea-4633-441b-b37a-5406e7235114'

const AGENT_LABELS: Record<string, string> = {
  gbp_post: 'GBP Posts (Rise)',
  blog: 'Blog (Ink)',
  social: 'Social (Pulse)',
  review_response: 'Reviews (Echo)',
  email: 'Email (Spark)',
  seo: 'SEO Copy (Rank)',
  sales: 'Sales (Blade)',
  research: 'Research (Scout)',
  strategy: 'Strategy (Atlas)',
  financial: 'Finance (Flora)',
  management: 'HR (Quinn)',
  campaigns: 'Campaigns (Blaze)',
  problem_solver: 'Advisor (Max)',
}

export default function AdminAgentsPage() {
  const router = useRouter()
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [authed, setAuthed] = useState(false)
  const [agentUsage, setAgentUsage] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.id !== ADMIN_USER_ID) { router.push(`/${locale}/dashboard`); return }
      setAuthed(true)
      fetch('/api/admin/stats').then(r => r.json()).then(data => {
        setAgentUsage(data.agentUsage ?? {})
        setLoading(false)
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!authed) return <div className="p-6 flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>

  const sorted = Object.entries(agentUsage).sort((a, b) => b[1] - a[1])
  const total = sorted.reduce((s, [, v]) => s + v, 0)
  const maxCount = sorted.length > 0 ? sorted[0][1] : 1

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="w-5 h-5 text-indigo-400" />
        <h1 className="text-xl font-bold text-white">Agent Activity</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-dashCard border border-white/5 rounded-xl p-5">
          <p className="text-xs text-dashMuted mb-1">Total Agent Calls</p>
          <p className="text-3xl font-bold text-white">{total.toLocaleString()}</p>
        </div>
        <div className="bg-dashCard border border-white/5 rounded-xl p-5">
          <p className="text-xs text-dashMuted mb-1">Unique Agent Types</p>
          <p className="text-3xl font-bold text-white">{sorted.length}</p>
        </div>
        <div className="bg-dashCard border border-white/5 rounded-xl p-5">
          <p className="text-xs text-dashMuted mb-1">Most Used</p>
          <p className="text-xl font-bold text-indigo-400">{sorted[0] ? (AGENT_LABELS[sorted[0][0]] ?? sorted[0][0]) : '—'}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
      ) : sorted.length === 0 ? (
        <div className="bg-dashCard border border-white/5 rounded-xl p-12 text-center">
          <BarChart2 className="w-12 h-12 text-dashMuted mx-auto mb-4" />
          <p className="text-dashMuted text-sm">No agent usage data yet.</p>
        </div>
      ) : (
        <div className="bg-dashCard border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-5">Usage by Agent</h3>
          <div className="space-y-3">
            {sorted.map(([type, count]) => {
              const pct = (count / maxCount) * 100
              const label = AGENT_LABELS[type] ?? type
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-dashMuted">{total > 0 ? ((count / total) * 100).toFixed(0) : 0}%</span>
                      <span className="text-sm font-bold text-white w-12 text-right">{count}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
