'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { TrendingUp, TrendingDown, ArrowUpRight, BarChart2, Upload, RefreshCw } from 'lucide-react'
import type { AnalyticsSummary, AdPerformanceSummary } from '@/lib/analytics'

const PERIODS = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
  { label: 'All time', value: 'all' },
]

const CHART_COLOR = '#6366F1'
const CHART_COLORS = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF']

function StatCard({
  label,
  value,
  change,
  prefix = '',
  suffix = '',
}: {
  label: string
  value: number
  change: number
  prefix?: string
  suffix?: string
}) {
  const isPositive = change >= 0
  return (
    <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
      <p className="text-xs text-dashMuted mb-1">{label}</p>
      <p className="text-2xl font-bold text-dashText">
        {prefix}{value.toLocaleString('en-GB', { maximumFractionDigits: 2 })}{suffix}
      </p>
      <div className={`flex items-center gap-1 mt-1 text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        <span>{Math.abs(change)}% vs previous period</span>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5 animate-pulse">
      <div className="h-3 bg-dashSurface2 rounded w-24 mb-2" />
      <div className="h-7 bg-dashSurface2 rounded w-32 mb-2" />
      <div className="h-3 bg-dashSurface2 rounded w-20" />
    </div>
  )
}

function ROASGauge({ roas }: { roas: number }) {
  const color = roas >= 4 ? '#22c55e' : roas >= 2 ? '#f59e0b' : '#ef4444'
  const label = roas >= 4 ? 'Excellent' : roas >= 2 ? 'Average' : 'Poor'
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center border-4 transition-all"
        style={{ borderColor: color }}
      >
        <div className="text-center">
          <p className="text-2xl font-black text-dashText">{roas.toFixed(2)}</p>
          <p className="text-xs text-dashMuted">ROAS</p>
        </div>
      </div>
      <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ color, backgroundColor: `${color}20` }}>
        {label}
      </span>
    </div>
  )
}

export default function AnalyticsPage() {
  const locale = useLocale()
  const [period, setPeriod] = useState('30d')
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [adSummary, setAdSummary] = useState<AdPerformanceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [adLoading, setAdLoading] = useState(true)
  const [businessProfileId, setBusinessProfileId] = useState<string | null>(null)
  const [isOrbit, setIsOrbit] = useState(false)

  // Get primary business profile + plan
  useEffect(() => {
    async function loadProfile() {
      try {
        const [bpRes, profileRes] = await Promise.all([
          fetch('/api/crm/contacts?limit=1'),
          fetch('/api/analytics/summary?period=30d'),
        ])
        // We don't need contacts data — just use summary to check auth
        if (bpRes.ok) {
          // Try to get bp from another source
        }
        // Fetch business profile via a different approach
        const r = await fetch(`/api/analytics/summary?period=${period}`)
        if (r.ok) {
          const d = await r.json()
          setSummary(d.summary)
        }
      } catch {
        // ignore
      }
    }
    loadProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchSummary = useCallback(async (p: string, bpId?: string | null) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ period: p })
      if (bpId) params.set('businessProfileId', bpId)
      const r = await fetch(`/api/analytics/summary?${params}`)
      if (r.ok) {
        const d = await r.json()
        setSummary(d.summary)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAds = useCallback(async (p: string, bpId?: string | null) => {
    if (!bpId) { setAdLoading(false); return }
    setAdLoading(true)
    try {
      const params = new URLSearchParams({ period: p, businessProfileId: bpId })
      const r = await fetch(`/api/analytics/ads?${params}`)
      if (r.ok) {
        const d = await r.json()
        setAdSummary(d.summary)
        setIsOrbit(true)
      } else if (r.status === 403) {
        setIsOrbit(false)
      }
    } finally {
      setAdLoading(false)
    }
  }, [])

  useEffect(() => {
    // Load initial data
    async function init() {
      setLoading(true)
      setAdLoading(true)
      try {
        const params = new URLSearchParams({ period })
        if (businessProfileId) params.set('businessProfileId', businessProfileId)
        const [summaryRes, adRes] = await Promise.all([
          fetch(`/api/analytics/summary?${params}`),
          businessProfileId ? fetch(`/api/analytics/ads?${params}`) : Promise.resolve(null),
        ])
        if (summaryRes.ok) setSummary((await summaryRes.json()).summary)
        if (adRes && adRes.ok) { setAdSummary((await adRes.json()).summary); setIsOrbit(true) }
        else if (adRes && adRes.status === 403) setIsOrbit(false)
      } finally {
        setLoading(false)
        setAdLoading(false)
      }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, businessProfileId])

  function handlePeriodChange(p: string) {
    setPeriod(p)
    fetchSummary(p, businessProfileId)
    fetchAds(p, businessProfileId)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dashText">Analytics</h1>
          <p className="text-dashMuted text-sm mt-0.5">Revenue, performance & ad intelligence</p>
        </div>
        <div className="flex gap-1 bg-dashCard rounded-lg border border-dashSurface2 p-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => handlePeriodChange(p.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                period === p.value
                  ? 'bg-accent text-white'
                  : 'text-dashMuted hover:text-dashText'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : summary ? (
          <>
            <StatCard
              label="Total Revenue"
              value={summary.totalRevenue}
              change={summary.revenueChange}
              prefix="£"
            />
            <StatCard
              label="Total Jobs"
              value={summary.totalJobs}
              change={summary.jobsChange}
            />
            <StatCard
              label="New Customers"
              value={summary.newCustomers}
              change={summary.customersChange}
            />
            <StatCard
              label="Avg Job Value"
              value={summary.avgJobValue}
              change={summary.avgJobValueChange}
              prefix="£"
            />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <p className="text-xs text-dashMuted mb-1">{['Total Revenue', 'Total Jobs', 'New Customers', 'Avg Job Value'][i]}</p>
              <p className="text-2xl font-bold text-dashText">—</p>
              <p className="text-xs text-dashMuted mt-1">No data yet</p>
            </div>
          ))
        )}
      </div>

      {/* Revenue Chart */}
      <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-dashText uppercase tracking-wide">Revenue over time</h2>
          <Link
            href={`/${locale}/dashboard/customers`}
            className="flex items-center gap-1 text-xs text-accent hover:underline"
          >
            Log revenue <ArrowUpRight size={12} />
          </Link>
        </div>
        {loading || !summary?.revenueByDay.length ? (
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <BarChart2 size={32} className="text-dashMuted mx-auto mb-2" />
              <p className="text-dashMuted text-sm">No revenue data yet</p>
              <p className="text-dashMuted text-xs mt-1">Log jobs in your CRM to see revenue trends</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={summary.revenueByDay} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#161F2E" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={(v: number) => `£${v}`} />
              <Tooltip
                contentStyle={{ background: '#1A2332', border: '1px solid #161F2E', borderRadius: 8, color: '#EEF2FF' }}
                formatter={(value: number, name: string) => [name === 'revenue' ? `£${value}` : value, name === 'revenue' ? 'Revenue' : 'Jobs']}
              />
              <Line type="monotone" dataKey="revenue" stroke={CHART_COLOR} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="jobs" stroke="#22c55e" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Agents + Features row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Agents */}
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
          <h2 className="text-sm font-semibold text-dashText uppercase tracking-wide mb-4">Top agents used</h2>
          {loading || !summary?.topAgentsUsed.length ? (
            <div className="text-center py-8">
              <p className="text-dashMuted text-sm">No agent usage data yet</p>
              <p className="text-dashMuted text-xs mt-1">Start using ELEVO agents to see stats here</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={summary.topAgentsUsed}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#161F2E" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis type="category" dataKey="agentName" tick={{ fill: '#94A3B8', fontSize: 11 }} width={50} />
                <Tooltip
                  contentStyle={{ background: '#1A2332', border: '1px solid #161F2E', borderRadius: 8, color: '#EEF2FF' }}
                />
                <Bar dataKey="uses" radius={[0, 4, 4, 0]}>
                  {summary.topAgentsUsed.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Features */}
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
          <h2 className="text-sm font-semibold text-dashText uppercase tracking-wide mb-4">Top features</h2>
          {loading || !summary?.topFeatures.length ? (
            <div className="text-center py-8">
              <p className="text-dashMuted text-sm">No feature usage data yet</p>
              <p className="text-dashMuted text-xs mt-1">Use content generators and growth tools to see stats</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(() => {
                const total = summary.topFeatures.reduce((s, f) => s + f.count, 0)
                return summary.topFeatures.map((f, i) => {
                  const pct = total > 0 ? Math.round((f.count / total) * 100) : 0
                  return (
                    <div key={f.feature}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-dashText capitalize">{f.feature.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-dashMuted">{f.count} uses ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-dashSurface rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Ad Performance */}
      <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-dashText uppercase tracking-wide">Ad performance</h2>
          {isOrbit && (
            <button className="flex items-center gap-1.5 text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg hover:bg-accent/20 transition-colors">
              <Upload size={12} />
              Import ad data
            </button>
          )}
        </div>

        {!isOrbit ? (
          <div className="text-center py-8">
            <p className="text-dashMuted text-sm mb-3">Ad Performance Intelligence requires the Orbit plan</p>
            <Link
              href={`/${locale}/pricing`}
              className="inline-flex items-center gap-1.5 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              <TrendingUp size={14} />
              Upgrade to Orbit
            </Link>
          </div>
        ) : adLoading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-dashMuted">
            <RefreshCw size={16} className="animate-spin" />
            <span className="text-sm">Loading ad data...</span>
          </div>
        ) : !adSummary || adSummary.totalSpend === 0 ? (
          <div className="text-center py-8">
            <p className="text-dashMuted text-sm mb-1">No ad data imported yet</p>
            <p className="text-dashMuted text-xs">Import your Google Ads or Meta Ads CSV to see ROAS, CPM, CTR and more</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ROAS + headline stats */}
            <div className="flex flex-wrap items-center gap-8">
              <ROASGauge roas={adSummary.overallROAS} />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                <div>
                  <p className="text-xs text-dashMuted mb-1">Total Spend</p>
                  <p className="text-lg font-bold text-dashText">£{adSummary.totalSpend.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-dashMuted mb-1">Total Revenue</p>
                  <p className="text-lg font-bold text-dashText">£{adSummary.totalRevenue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-dashMuted mb-1">Impressions</p>
                  <p className="text-lg font-bold text-dashText">{adSummary.totalImpressions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-dashMuted mb-1">Conversions</p>
                  <p className="text-lg font-bold text-dashText">{adSummary.totalConversions}</p>
                </div>
                <div>
                  <p className="text-xs text-dashMuted mb-1">Avg CPM</p>
                  <p className="text-lg font-bold text-dashText">£{adSummary.avgCPM.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-dashMuted mb-1">Avg CPC</p>
                  <p className="text-lg font-bold text-dashText">£{adSummary.avgCPC.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-dashMuted mb-1">Avg CTR</p>
                  <p className="text-lg font-bold text-dashText">{(adSummary.avgCTR * 100).toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-xs text-dashMuted mb-1">Clicks</p>
                  <p className="text-lg font-bold text-dashText">{adSummary.totalClicks.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* By Platform table */}
            {adSummary.byPlatform.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-dashMuted uppercase tracking-wider mb-3">By platform</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-dashSurface2">
                        {['Platform', 'Spend', 'Revenue', 'ROAS', 'Impressions', 'CPM', 'CTR'].map(h => (
                          <th key={h} className="text-left py-2 pr-4 text-dashMuted font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {adSummary.byPlatform.map(p => (
                        <tr key={p.platform} className="border-b border-dashSurface2/50">
                          <td className="py-2 pr-4 text-dashText font-medium">{p.platform}</td>
                          <td className="py-2 pr-4 text-dashText">£{p.spend.toFixed(2)}</td>
                          <td className="py-2 pr-4 text-dashText">£{p.revenue.toFixed(2)}</td>
                          <td className={`py-2 pr-4 font-bold ${p.roas >= 4 ? 'text-green-400' : p.roas >= 2 ? 'text-amber-400' : 'text-red-400'}`}>
                            {p.roas.toFixed(2)}x
                          </td>
                          <td className="py-2 pr-4 text-dashText">{p.impressions.toLocaleString()}</td>
                          <td className="py-2 pr-4 text-dashText">£{p.cpm.toFixed(2)}</td>
                          <td className="py-2 pr-4 text-dashText">{(p.ctr * 100).toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Spend/Revenue chart */}
            {adSummary.performanceByDay.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-dashMuted uppercase tracking-wider mb-3">Spend vs Revenue by day</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={adSummary.performanceByDay} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#161F2E" />
                    <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
                    <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} tickFormatter={(v: number) => `£${v}`} />
                    <Tooltip
                      contentStyle={{ background: '#1A2332', border: '1px solid #161F2E', borderRadius: 8, color: '#EEF2FF' }}
                    />
                    <Line type="monotone" dataKey="spend" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Spend" />
                    <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={1.5} dot={false} name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Website Traffic — Coming Soon */}
      <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
        <h2 className="text-sm font-semibold text-dashText uppercase tracking-wide mb-4">Website traffic</h2>
        <div className="text-center py-8">
          <p className="text-dashMuted text-sm">Website analytics coming soon</p>
          <p className="text-dashMuted text-xs mt-1">Connect your Google Analytics account to see page views, sessions, and traffic sources</p>
        </div>
      </div>
    </div>
  )
}
