'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { DollarSign, TrendingUp, Users, Loader2, ArrowDown } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

const ADMIN_USER_ID = '5dc15dea-4633-441b-b37a-5406e7235114'
const PLAN_PRICES: Record<string, number> = { launch: 39, orbit: 79, galaxy: 149 }

export default function AdminRevenuePage() {
  const router = useRouter()
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [authed, setAuthed] = useState(false)
  const [stats, setStats] = useState<{ planCounts: Record<string, number>; paidUsers: number; monthlyRevenue: number; totalUsers: number } | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.id !== ADMIN_USER_ID) { router.push(`/${locale}/dashboard`); return }
      setAuthed(true)
      fetch('/api/admin/stats').then(r => r.json()).then(setStats)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!authed || !stats) return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>

  const arr = stats.monthlyRevenue * 12
  const arpu = stats.paidUsers > 0 ? Math.round(stats.monthlyRevenue / stats.paidUsers) : 0
  const conversionRate = stats.totalUsers > 0 ? ((stats.paidUsers / stats.totalUsers) * 100).toFixed(1) : '0'

  const plans = [
    { name: 'Launch', price: 39, count: stats.planCounts?.launch ?? 0, color: '#60A5FA' },
    { name: 'Orbit', price: 79, count: stats.planCounts?.orbit ?? 0, color: '#6366F1' },
    { name: 'Galaxy', price: 149, count: stats.planCounts?.galaxy ?? 0, color: '#A855F7' },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <DollarSign className="w-5 h-5 text-green-400" />
        <h1 className="text-xl font-bold text-white">Revenue</h1>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="MRR" value={`€${stats.monthlyRevenue.toLocaleString()}`} icon={DollarSign} color="text-green-400" />
        <MetricCard label="ARR" value={`€${arr.toLocaleString()}`} icon={TrendingUp} color="text-indigo-400" />
        <MetricCard label="ARPU" value={`€${arpu}`} icon={Users} color="text-blue-400" />
        <MetricCard label="Trial → Paid" value={`${conversionRate}%`} icon={ArrowDown} color="text-yellow-400" />
      </div>

      {/* Revenue by plan */}
      <div className="bg-dashCard border border-white/5 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-5">Revenue by Plan</h3>
        <div className="space-y-4">
          {plans.map(plan => {
            const revenue = plan.price * plan.count
            const pct = stats.monthlyRevenue > 0 ? (revenue / stats.monthlyRevenue) * 100 : 0
            return (
              <div key={plan.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color }} />
                    <span className="text-sm text-white font-medium">{plan.name}</span>
                    <span className="text-xs text-dashMuted">€{plan.price}/mo x {plan.count} users</span>
                  </div>
                  <span className="text-sm font-bold text-white">€{revenue.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: plan.color }} />
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-5 pt-4 border-t border-white/5 flex justify-between">
          <span className="text-sm text-dashMuted">Total MRR</span>
          <span className="text-lg font-bold text-green-400">€{stats.monthlyRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* Conversion funnel */}
      <div className="bg-dashCard border border-white/5 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Conversion Funnel</h3>
        <div className="flex items-center gap-4">
          {[
            { label: 'All Users', value: stats.totalUsers, color: '#6B7280' },
            { label: 'Paid Users', value: stats.paidUsers, color: '#22C55E' },
          ].map((step, i) => (
            <div key={step.label} className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {i > 0 && <span className="text-dashMuted text-xs">→</span>}
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: step.color }} />
                <span className="text-sm text-white">{step.label}</span>
              </div>
              <p className="text-3xl font-bold text-white">{step.value}</p>
            </div>
          ))}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-dashMuted text-xs">→</span>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="text-sm text-white">Conversion Rate</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{conversionRate}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-dashCard border border-white/5 rounded-xl p-5">
      <Icon className={`w-5 h-5 ${color} mb-3`} />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-dashMuted mt-1">{label}</p>
    </div>
  )
}
