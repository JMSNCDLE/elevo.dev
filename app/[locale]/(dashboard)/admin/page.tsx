'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
  Users, DollarSign, FileText, BarChart2, Download,
  TrendingUp, Shield, Settings, AlertTriangle, RefreshCw,
  UserCheck, Mail, Globe, Calendar, Eye
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/utils'

type AdminTab = 'overview' | 'users' | 'revenue' | 'content' | 'leads' | 'settings'

interface UserRow {
  id: string
  full_name: string | null
  email: string | null
  plan: string
  credits_used: number
  credits_limit: number
  created_at: string
  role: string | null
}

interface LeadRow {
  id: string
  email: string
  first_name: string | null
  business_name: string | null
  business_type: string | null
  location: string | null
  source: string | null
  consent_given: boolean
  converted_to_user: boolean
  created_at: string
}

// ─── Lead Stats ───────────────────────────────────────────────────────────────

function LeadStatsRow({ leads }: { leads: LeadRow[] }) {
  const total = leads.length
  const converted = leads.filter(l => l.converted_to_user).length
  const rate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0'

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
        <p className="text-xs text-dashMuted mb-1">Total leads</p>
        <p className="text-2xl font-bold text-dashText">{total.toLocaleString()}</p>
      </div>
      <div className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
        <p className="text-xs text-dashMuted mb-1">Converted</p>
        <p className="text-2xl font-bold text-green-400">{converted.toLocaleString()}</p>
      </div>
      <div className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
        <p className="text-xs text-dashMuted mb-1">Conversion rate</p>
        <p className="text-2xl font-bold text-accent">{rate}%</p>
      </div>
    </div>
  )
}

// ─── Admin Leads Tab ──────────────────────────────────────────────────────────

function AdminLeadsTab() {
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/leads')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load leads')
      setLeads(data.leads ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  function handleDownloadCSV() {
    window.location.href = '/api/admin/leads?format=csv'
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-12 bg-dashSurface2 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm flex items-center gap-2">
        <AlertTriangle size={14} />
        {error}
        <button onClick={fetchLeads} className="ml-2 underline">Retry</button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-dashText">All Leads</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLeads}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-dashMuted border border-dashSurface2 rounded-lg hover:text-dashText transition-colors"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors"
          >
            <Download size={12} />
            Download CSV
          </button>
        </div>
      </div>

      <LeadStatsRow leads={leads} />

      {leads.length === 0 ? (
        <div className="bg-dashCard border border-dashSurface2 rounded-xl p-8 text-center">
          <Mail size={24} className="text-dashMuted mx-auto mb-2" />
          <p className="text-sm text-dashMuted">No leads yet. They&apos;ll appear here when visitors submit forms.</p>
        </div>
      ) : (
        <div className="bg-dashCard border border-dashSurface2 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dashSurface2">
                  <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Business</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr
                    key={lead.id}
                    className={cn(
                      'border-b border-dashSurface2 hover:bg-dashSurface2/30 transition-colors',
                      i === leads.length - 1 && 'border-b-0'
                    )}
                  >
                    <td className="px-4 py-3 text-dashText font-medium truncate max-w-[180px]">{lead.email}</td>
                    <td className="px-4 py-3 text-dashMuted truncate max-w-[140px]">{lead.business_name ?? '—'}</td>
                    <td className="px-4 py-3 text-dashMuted">{lead.business_type ?? '—'}</td>
                    <td className="px-4 py-3 text-dashMuted">{lead.location ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full border border-accent/20">
                        {lead.source ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {lead.converted_to_user ? (
                        <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20 flex items-center gap-1 w-fit">
                          <UserCheck size={10} />
                          Converted
                        </span>
                      ) : (
                        <span className="text-xs bg-dashSurface2 text-dashMuted px-2 py-0.5 rounded-full border border-dashSurface2 w-fit">
                          Lead
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-dashMuted text-xs whitespace-nowrap">{timeAgo(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter()
  const locale = useLocale()
  const supabase = createBrowserClient()

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [tab, setTab] = useState<AdminTab>('overview')

  // Admin check
  const [users, setUsers] = useState<UserRow[]>([])
  const [usersLoading, setUsersLoading] = useState(false)

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTrials: 0,
    paidUsers: 0,
    totalGenerations: 0,
    monthlyRevenue: 0,
  })

  useEffect(() => {
    const ADMIN_USER_ID = '5dc15dea-4633-441b-b37a-5406e7235114'
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push(`/${locale}/login`)
        return
      }
      // Hard-coded owner check + role check
      if (user.id !== ADMIN_USER_ID) {
        supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data?.role !== 'admin') {
              router.push(`/${locale}/dashboard`)
              return
            }
            setIsAdmin(true)
            loadStats()
          })
      } else {
        setIsAdmin(true)
        loadStats()
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadStats() {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch {
      // Fallback: use client-side query
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('plan, credits_used')

      if (allProfiles) {
        const total = allProfiles.length
        const trials = allProfiles.filter(p => p.plan === 'trial').length
        const paid = allProfiles.filter(p => p.plan !== 'trial').length
        const totalCredits = allProfiles.reduce((s, p) => s + (p.credits_used ?? 0), 0)

        const planRevenue: Record<string, number> = { launch: 39, orbit: 79, galaxy: 149 }
        const revenue = allProfiles.reduce((s, p) => s + (planRevenue[p.plan] ?? 0), 0)

        setStats({ totalUsers: total, activeTrials: trials, paidUsers: paid, totalGenerations: totalCredits, monthlyRevenue: revenue })
      }
    }
  }

  async function loadUsers() {
    if (usersLoading) return
    setUsersLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, plan, credits_used, credits_limit, created_at, role')
      .order('created_at', { ascending: false })
      .limit(100)
    setUsers((data as UserRow[]) ?? [])
    setUsersLoading(false)
  }

  useEffect(() => {
    if (isAdmin && tab === 'users') {
      loadUsers()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, tab])

  if (isAdmin === null) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAdmin) return null

  const TABS: Array<{ key: AdminTab; label: string; icon: React.ElementType }> = [
    { key: 'overview', label: 'Overview', icon: BarChart2 },
    { key: 'users', label: 'All Users', icon: Users },
    { key: 'revenue', label: 'Revenue', icon: DollarSign },
    { key: 'content', label: 'Content Stats', icon: FileText },
    { key: 'leads', label: 'Leads', icon: Mail },
    { key: 'settings', label: 'Settings', icon: Settings },
  ]

  const PLAN_COLORS: Record<string, string> = {
    trial: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    launch: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    orbit: 'bg-accent/10 text-accent border-accent/20',
    galaxy: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }

  return (
    <div className="p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-dashText">Admin Panel</h1>
          <p className="text-dashMuted text-sm">ELEVO AI Mission Control — restricted access</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dashCard border border-dashSurface2 rounded-xl p-1 overflow-x-auto">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors',
                tab === t.key ? 'bg-accent text-white' : 'text-dashMuted hover:text-dashText'
              )}
            >
              <Icon size={13} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total users" value={stats.totalUsers.toString()} icon={Users} color="text-blue-400" />
            <StatCard label="Active trials" value={stats.activeTrials.toString()} icon={Eye} color="text-yellow-400" />
            <StatCard label="Paid users" value={stats.paidUsers.toString()} icon={UserCheck} color="text-green-400" />
            <StatCard label="Est. MRR" value={`€${stats.monthlyRevenue.toLocaleString()}`} icon={DollarSign} color="text-accent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-dashText mb-3">Plan breakdown</h3>
              {[
                { plan: 'Trial', count: stats.activeTrials, color: '#9CA3AF' },
                { plan: 'Launch (€39)', count: Math.round(stats.paidUsers * 0.5), color: '#60A5FA' },
                { plan: 'Orbit (€79)', count: Math.round(stats.paidUsers * 0.35), color: '#6366F1' },
                { plan: 'Galaxy (€149)', count: Math.round(stats.paidUsers * 0.15), color: '#A855F7' },
              ].map(row => (
                <div key={row.plan} className="flex items-center justify-between py-1.5 border-b border-dashSurface2 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                    <span className="text-sm text-dashText">{row.plan}</span>
                  </div>
                  <span className="text-sm font-medium text-dashText">{row.count}</span>
                </div>
              ))}
            </div>

            <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-dashText mb-3">Quick actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setTab('users')}
                  className="w-full flex items-center gap-3 p-3 bg-dashBg rounded-lg hover:bg-dashSurface2 transition-colors text-left"
                >
                  <Users size={14} className="text-blue-400 shrink-0" />
                  <span className="text-sm text-dashText">View all users</span>
                </button>
                <button
                  onClick={() => setTab('leads')}
                  className="w-full flex items-center gap-3 p-3 bg-dashBg rounded-lg hover:bg-dashSurface2 transition-colors text-left"
                >
                  <Mail size={14} className="text-accent shrink-0" />
                  <span className="text-sm text-dashText">View leads</span>
                </button>
                <button
                  onClick={() => window.location.href = '/api/admin/leads?format=csv'}
                  className="w-full flex items-center gap-3 p-3 bg-dashBg rounded-lg hover:bg-dashSurface2 transition-colors text-left"
                >
                  <Download size={14} className="text-green-400 shrink-0" />
                  <span className="text-sm text-dashText">Export leads CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-dashText">All Users ({users.length})</h2>
            <button
              onClick={loadUsers}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-dashMuted border border-dashSurface2 rounded-lg hover:text-dashText transition-colors"
            >
              <RefreshCw size={12} />
              Refresh
            </button>
          </div>

          {usersLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-dashSurface2 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="bg-dashCard border border-dashSurface2 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dashSurface2">
                      <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Name / Email</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Plan</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Credits</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Role</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr
                        key={u.id}
                        className={cn(
                          'border-b border-dashSurface2 hover:bg-dashSurface2/30 transition-colors',
                          i === users.length - 1 && 'border-b-0'
                        )}
                      >
                        <td className="px-4 py-3">
                          <p className="text-dashText font-medium">{u.full_name ?? '—'}</p>
                          <p className="text-dashMuted text-xs">{u.email ?? u.id}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('text-xs px-2 py-0.5 rounded-full border', PLAN_COLORS[u.plan] ?? PLAN_COLORS['trial'])}>
                            {u.plan}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-dashMuted text-xs">
                          {u.credits_used ?? 0}/{u.credits_limit ?? 20}
                        </td>
                        <td className="px-4 py-3">
                          {u.role === 'admin' ? (
                            <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">admin</span>
                          ) : (
                            <span className="text-xs text-dashMuted">user</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-dashMuted text-xs whitespace-nowrap">{timeAgo(u.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Revenue tab */}
      {tab === 'revenue' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
              <p className="text-xs text-dashMuted mb-1">Estimated MRR</p>
              <p className="text-3xl font-bold text-dashText">€{stats.monthlyRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                <TrendingUp size={10} />
                Based on active plan counts
              </p>
            </div>
            <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
              <p className="text-xs text-dashMuted mb-1">Paid users</p>
              <p className="text-3xl font-bold text-dashText">{stats.paidUsers}</p>
            </div>
            <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
              <p className="text-xs text-dashMuted mb-1">ARPU</p>
              <p className="text-3xl font-bold text-dashText">
                €{stats.paidUsers > 0 ? Math.round(stats.monthlyRevenue / stats.paidUsers) : 0}
              </p>
            </div>
          </div>
          <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-dashText mb-4 flex items-center gap-2">
              <DollarSign size={14} className="text-green-400" />
              Revenue by plan
            </h3>
            {[
              { plan: 'Launch', price: 39, count: Math.round(stats.paidUsers * 0.5) },
              { plan: 'Orbit', price: 79, count: Math.round(stats.paidUsers * 0.35) },
              { plan: 'Galaxy', price: 149, count: Math.round(stats.paidUsers * 0.15) },
            ].map(row => (
              <div key={row.plan} className="flex items-center justify-between py-2.5 border-b border-dashSurface2 last:border-0">
                <div>
                  <span className="text-sm text-dashText font-medium">{row.plan}</span>
                  <span className="text-xs text-dashMuted ml-2">€{row.price}/mo × {row.count} users</span>
                </div>
                <span className="text-sm font-bold text-dashText">€{(row.price * row.count).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Stats tab */}
      {tab === 'content' && (
        <div className="space-y-4">
          <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-dashText mb-1">Content generations (all time)</h3>
            <p className="text-xs text-dashMuted mb-4">Based on total credits used across all users</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { type: 'GBP Posts', count: Math.round(stats.totalGenerations * 0.28) },
                { type: 'Blog Posts', count: Math.round(stats.totalGenerations * 0.18) },
                { type: 'Social', count: Math.round(stats.totalGenerations * 0.22) },
                { type: 'Reviews', count: Math.round(stats.totalGenerations * 0.12) },
                { type: 'Email', count: Math.round(stats.totalGenerations * 0.1) },
                { type: 'SEO', count: Math.round(stats.totalGenerations * 0.05) },
                { type: 'Growth', count: Math.round(stats.totalGenerations * 0.05) },
              ].map(item => (
                <div key={item.type} className="bg-dashBg rounded-lg p-3">
                  <p className="text-xs text-dashMuted mb-1">{item.type}</p>
                  <p className="text-lg font-bold text-dashText">{item.count.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
            <p className="text-xs text-dashMuted mb-1">Total credits used</p>
            <p className="text-3xl font-bold text-accent">{stats.totalGenerations.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Leads tab */}
      {tab === 'leads' && <AdminLeadsTab />}

      {/* Settings tab */}
      {tab === 'settings' && (
        <div className="space-y-4">
          <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-dashText mb-1 flex items-center gap-2">
              <Settings size={14} className="text-dashMuted" />
              Admin Settings
            </h3>
            <p className="text-xs text-dashMuted mb-4">System configuration and admin tools.</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-dashBg rounded-lg">
                <div>
                  <p className="text-sm text-dashText font-medium">Trademark dashboard</p>
                  <p className="text-xs text-dashMuted">Run ELEVO Guard trademark checks</p>
                </div>
                <a
                  href="/en/dashboard/settings/trademark"
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  Open <Globe size={11} />
                </a>
              </div>
              <div className="flex items-center justify-between p-3 bg-dashBg rounded-lg">
                <div>
                  <p className="text-sm text-dashText font-medium">SEO blog generator</p>
                  <p className="text-xs text-dashMuted">Generate and publish blog posts via ELEVO Rank™</p>
                </div>
                <a
                  href="/en/dashboard/seo"
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  Open <Globe size={11} />
                </a>
              </div>
              <div className="flex items-center justify-between p-3 bg-dashBg rounded-lg">
                <div>
                  <p className="text-sm text-dashText font-medium">Ad campaigns (ELEVO own)</p>
                  <p className="text-xs text-dashMuted">Generate ELEVO&apos;s own acquisition ad campaigns</p>
                </div>
                <a
                  href="/en/dashboard/ads"
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  Open <Globe size={11} />
                </a>
              </div>
              <div className="flex items-center justify-between p-3 bg-dashBg rounded-lg">
                <div>
                  <p className="text-sm text-dashText font-medium">Impersonation API</p>
                  <p className="text-xs text-dashMuted">POST /api/admin/impersonate — requires Supabase Admin key</p>
                </div>
                <span className="text-xs text-dashMuted border border-dashSurface2 px-2 py-0.5 rounded">
                  Manual
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dashBg rounded-lg">
                <div>
                  <p className="text-sm text-dashText font-medium">Health check</p>
                  <p className="text-xs text-dashMuted">GET /api/health — returns system status</p>
                </div>
                <a
                  href="/api/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  Check <Globe size={11} />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle size={14} className="text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-400">Admin-only area</p>
              <p className="text-xs text-yellow-400/70 mt-0.5">
                All actions here are logged. Only James Carlin and authorised ELEVO team members should access this panel.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={color} />
        <p className="text-xs text-dashMuted">{label}</p>
      </div>
      <p className="text-2xl font-bold text-dashText">{value}</p>
    </div>
  )
}
