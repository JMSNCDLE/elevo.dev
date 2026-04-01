'use client'

import { useState, useEffect } from 'react'
import { Zap, Clock, CheckSquare, Users, FileText, TrendingUp } from 'lucide-react'

interface Metrics {
  summary: {
    totalAgentRuns: number
    tasksCreated: number
    contactsSaved: number
    contentGenerated: number
    timeSavedHours: number
    estimatedValueEur: number
  }
  agentBreakdown: Array<{ agent: string; count: number }>
}

export default function MetricsWidget() {
  const [data, setData] = useState<Metrics | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/metrics')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setData(d))
      .catch(() => {})
  }, [])

  if (!data || data.summary.totalAgentRuns === 0) {
    return (
      <div className="bg-dashCard border border-dashSurface2 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Zap size={20} className="text-accent" />
          <h3 className="text-sm font-semibold text-dashText">ELEVO Activity</h3>
        </div>
        <p className="text-sm text-dashMuted">
          ELEVO hasn&apos;t done anything for you yet! Try asking Aria to create a marketing plan, or use the Content Writer to draft a blog post.
        </p>
      </div>
    )
  }

  const { summary } = data
  const cards = [
    { label: 'Agent runs', value: summary.totalAgentRuns, icon: Zap, color: 'text-accent' },
    { label: 'Hours saved', value: summary.timeSavedHours, icon: Clock, color: 'text-green-400' },
    { label: 'Tasks created', value: summary.tasksCreated, icon: CheckSquare, color: 'text-amber-400' },
    { label: 'Contacts', value: summary.contactsSaved, icon: Users, color: 'text-blue-400' },
    { label: 'Content', value: summary.contentGenerated, icon: FileText, color: 'text-purple-400' },
    { label: 'Value (€)', value: `€${summary.estimatedValueEur}`, icon: TrendingUp, color: 'text-emerald-400' },
  ]

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={16} className="text-accent" />
        <h3 className="text-sm font-semibold text-dashText uppercase tracking-wide">Last 30 days</h3>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {cards.map(c => (
          <div key={c.label} className="bg-dashCard border border-dashSurface2 rounded-lg p-3 text-center">
            <c.icon size={14} className={`${c.color} mx-auto mb-1`} />
            <p className="text-lg font-bold text-dashText">{c.value}</p>
            <p className="text-[10px] text-dashMuted">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
