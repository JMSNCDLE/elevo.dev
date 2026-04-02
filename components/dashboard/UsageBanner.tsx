'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function UsageBanner() {
  const [usage, setUsage] = useState<{ today: { requests: number; estimatedCostCents: number }; plan: string } | null>(null)

  useEffect(() => {
    fetch('/api/usage').then(r => r.ok ? r.json() : null).then(d => d && setUsage(d)).catch(() => {})
  }, [])

  if (!usage?.today) return null

  const { requests, estimatedCostCents } = usage.today
  // Show at 80%+ of typical daily request count
  const limits: Record<string, number> = { trial: 20, launch: 100, orbit: 300, galaxy: 1000 }
  const limit = limits[usage.plan] ?? 20
  if (requests < limit * 0.8) return null

  return (
    <div className="mx-6 mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2">
      <AlertTriangle size={14} className="text-amber-400 shrink-0" />
      <span className="text-xs text-dashText">
        You&apos;ve used {requests} of {limit} daily requests (est. €{(estimatedCostCents / 100).toFixed(2)}).
        Resets at midnight UTC.
      </span>
    </div>
  )
}
