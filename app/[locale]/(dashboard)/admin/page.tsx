'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import {
  Users, DollarSign, Mail, Activity, TrendingUp,
  Play, FlaskConical, Heart, Bell, ArrowUpRight,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

const ADMIN_USER_ID = '5dc15dea-4633-441b-b37a-5406e7235114'

interface Stats {
  totalUsers: number
  activeTrials: number
  paidUsers: number
  totalGenerations: number
  monthlyRevenue: number
  planCounts: Record<string, number>
  recentSignups: Array<{ id: string; plan: string; created_at: string }>
}

export default function AdminPage() {
  const router = useRouter()
  const locale = useLocale()
  const supabase = createBrowserClient()

  const [authed, setAuthed] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [emailStats, setEmailStats] = useState({ today: 0, week: 0 })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.id !== ADMIN_USER_ID) {
        router.push(`/${locale}/dashboard`)
        return
      }
      setAuthed(true)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = useCallback(async () => {
    const [statsRes, emailsRes] = await Promise.all([
      fetch('/api/admin/stats'),
      fetch('/api/admin/emails?days=7'),
    ])
    if (statsRes.ok) setStats(await statsRes.json())
    if (emailsRes.ok) {
      const d = await emailsRes.json()
      setEmailStats({ today: d.stats?.today ?? 0, week: d.stats?.week ?? 0 })
    }
  }, [])

  useEffect(() => {
    if (authed) loadData()
  }, [authed, loadData])

  if (!authed || !stats) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{greeting}, James</h1>
          <p className="text-sm text-dashMuted mt-0.5">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/admin/testing`}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-dashMuted bg-dashCard border border-white/5 rounded-lg hover:text-white transition-colors"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Run Tests
          </Link>
          <Link
            href={`/${locale}/admin/health`}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-dashMuted bg-dashCard border border-white/5 rounded-lg hover:text-white transition-colors"
          >
            <Heart className="w-3.5 h-3.5" />
            Health
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={Users} label="Total Users" value={stats.totalUsers} sub={`${stats.activeTrials} on trial`} href={`/${locale}/admin/users`} />
        <SummaryCard icon={DollarSign} label="Monthly Revenue" value={`€${stats.monthlyRevenue.toLocaleString()}`} sub={`${stats.paidUsers} paid users`} href={`/${locale}/admin/revenue`} color="text-green-400" />
        <SummaryCard icon={Activity} label="Agent Calls" value={stats.totalGenerations.toLocaleString()} sub="total credits used" href={`/${locale}/admin/agents`} color="text-indigo-400" />
        <SummaryCard icon={Mail} label="Emails Today" value={emailStats.today} sub={`${emailStats.week} this week`} href={`/${locale}/admin/emails`} />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Plan breakdown */}
        <div className="bg-dashCard border border-white/5 rounded-xl p-5 lg:col-span-1">
          <h3 className="text-sm font-semibold text-white mb-4">Subscriptions</h3>
          <div className="space-y-3">
            {[
              { plan: 'Trial', count: stats.planCounts?.trial ?? stats.activeTrials, color: '#6B7280', price: 0 },
              { plan: 'Launch', count: stats.planCounts?.launch ?? 0, color: '#60A5FA', price: 39 },
              { plan: 'Orbit', count: stats.planCounts?.orbit ?? 0, color: '#6366F1', price: 79 },
              { plan: 'Galaxy', count: stats.planCounts?.galaxy ?? 0, color: '#A855F7', price: 149 },
            ].map(row => {
              const pct = stats.totalUsers > 0 ? (row.count / stats.totalUsers) * 100 : 0
              return (
                <div key={row.plan}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                      <span className="text-sm text-white">{row.plan}</span>
                      {row.price > 0 && <span className="text-[10px] text-dashMuted">€{row.price}/mo</span>}
                    </div>
                    <span className="text-sm font-medium text-white">{row.count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: row.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent signups */}
        <div className="bg-dashCard border border-white/5 rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Signups</h3>
            <Link href={`/${locale}/admin/users`} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {(stats.recentSignups || []).slice(0, 8).map(user => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-xs text-dashMuted font-medium">
                    {user.id.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-white font-mono">{user.id.slice(0, 8)}...</p>
                    <p className="text-[11px] text-dashMuted">
                      {new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <PlanBadge plan={user.plan} />
              </div>
            ))}
            {(!stats.recentSignups || stats.recentSignups.length === 0) && (
              <p className="text-sm text-dashMuted py-4 text-center">No signups yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Post Update', href: `/${locale}/admin/updates`, icon: Bell, color: 'text-yellow-400' },
          { label: 'Run QA Tests', href: `/${locale}/admin/testing`, icon: FlaskConical, color: 'text-orange-400' },
          { label: 'View Emails', href: `/${locale}/admin/emails`, icon: Mail, color: 'text-blue-400' },
          { label: 'Agent Monitor', href: `/${locale}/admin/agents`, icon: Play, color: 'text-green-400' },
        ].map(action => (
          <Link
            key={action.label}
            href={action.href}
            className="bg-dashCard border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors group"
          >
            <action.icon className={`w-5 h-5 ${action.color} mb-2`} />
            <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">{action.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, sub, href, color }: {
  icon: React.ElementType; label: string; value: string | number; sub: string; href: string; color?: string
}) {
  return (
    <Link href={href} className="bg-dashCard border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors group">
      <div className="flex items-center justify-between mb-3">
        <Icon className={`w-5 h-5 ${color ?? 'text-dashMuted'}`} />
        <TrendingUp className="w-3.5 h-3.5 text-dashMuted opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-dashMuted mt-1">{label}</p>
      <p className="text-[11px] text-dashMuted mt-0.5">{sub}</p>
    </Link>
  )
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    trial: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    launch: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    orbit: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    galaxy: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  }
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${styles[plan] ?? styles.trial}`}>
      {plan}
    </span>
  )
}
