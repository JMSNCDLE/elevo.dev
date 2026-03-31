'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'
import {
  Store, Loader2, TrendingUp, TrendingDown, ShoppingBag,
  DollarSign, Users, BarChart2, RefreshCw, AlertTriangle,
  ExternalLink, Package, Calendar,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { createBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type Status = 'idle' | 'connecting' | 'loading' | 'done' | 'error'

const PLATFORM_TABS = [
  { id: 'shopify', label: 'Shopify', color: '#96BF48' },
  { id: 'woocommerce', label: 'WooCommerce', color: '#7F54B3' },
  { id: 'wix', label: 'Wix', color: '#0C6EFC' },
  { id: 'squarespace', label: 'Squarespace', color: '#111' },
]

const CHART_COLOR = '#6366F1'
const PIE_COLORS = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF']

interface StoreAnalytics {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  conversionRate: number
  topProducts: Array<{ title: string; revenue: number; orders: number }>
  trafficSources: Record<string, number>
  abandonedCheckouts: number
  refundRate: number
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>
}

function StatCard({ label, value, prefix = '', suffix = '', trend }: { label: string; value: string | number; prefix?: string; suffix?: string; trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
      <p className="text-xs text-dashMuted mb-1">{label}</p>
      <p className="text-2xl font-bold text-dashText">{prefix}{typeof value === 'number' ? value.toLocaleString('en-GB', { maximumFractionDigits: 2 }) : value}{suffix}</p>
      {trend && (
        <div className={cn('flex items-center gap-1 mt-1 text-xs', trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-dashMuted')}>
          {trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : null}
          <span>{trend === 'up' ? 'Good performance' : trend === 'down' ? 'Needs attention' : 'Within range'}</span>
        </div>
      )}
    </div>
  )
}

export default function StorePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [integration, setIntegration] = useState<{ id: string; platform: string; store_url: string } | null>(null)
  const [analytics, setAnalytics] = useState<StoreAnalytics | null>(null)
  const [platform, setPlatform] = useState('shopify')
  const [storeUrl, setStoreUrl] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [businessProfileId, setBusinessProfileId] = useState('')
  const [businessProfiles, setBusinessProfiles] = useState<Array<{ id: string; business_name: string }>>([])
  const [period, setPeriod] = useState('30d')

  const fetchIntegration = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [intRes, bpRes] = await Promise.all([
      supabase.from('store_integrations').select('*').eq('user_id', user.id).eq('is_active', true).order('connected_at', { ascending: false }).limit(1).single(),
      supabase.from('business_profiles').select('id, business_name').eq('user_id', user.id),
    ])
    if (intRes.data) {
      setIntegration(intRes.data)
      loadAnalytics(intRes.data.id)
    }
    setBusinessProfiles(bpRes.data ?? [])
    if (bpRes.data?.[0]) setBusinessProfileId(bpRes.data[0].id)
  }, [supabase])

  useEffect(() => {
    fetchIntegration()
  }, [fetchIntegration])

  async function loadAnalytics(integrationId: string) {
    setStatus('loading')
    setError(null)
    try {
      const res = await fetch(`/api/store/analytics?integrationId=${integrationId}&period=${period}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load analytics')
      setAnalytics(data.analytics)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
      setStatus('error')
    }
  }

  async function handleConnect() {
    if (!storeUrl || !accessToken) return
    setStatus('connecting')
    setError(null)
    try {
      const res = await fetch('/api/store/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          storeUrl,
          accessToken,
          businessProfileId: businessProfileId || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Connection failed')
      setIntegration(data.integration)
      loadAnalytics(data.integration.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
      setStatus('error')
    }
  }

  const trafficData = analytics
    ? Object.entries(analytics.trafficSources).map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }))
    : []

  return (
    <div className="min-h-screen bg-dashBg">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <Store size={20} className="text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-dashText">Store Analytics</h1>
              <p className="text-sm text-dashMuted">Connect your store and get Shopify-level analytics</p>
            </div>
          </div>
          {integration && analytics && (
            <button
              onClick={() => loadAnalytics(integration.id)}
              disabled={status === 'loading'}
              className="flex items-center gap-2 px-4 py-2 bg-dashCard border border-dashSurface2 rounded-lg text-sm text-dashText hover:bg-dashSurface2 transition-colors"
            >
              <RefreshCw size={14} className={cn(status === 'loading' ? 'animate-spin' : '')} />
              Sync Now
            </button>
          )}
        </div>

        {/* Connect Store */}
        {!integration && (
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
            <h2 className="text-base font-semibold text-dashText mb-4">Connect Your Store</h2>

            {/* Platform tabs */}
            <div className="flex gap-2 mb-6">
              {PLATFORM_TABS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', platform === p.id ? 'bg-accent text-white' : 'bg-dashSurface2 text-dashMuted hover:text-dashText')}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {platform === 'shopify' ? (
              <div className="space-y-4">
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 text-sm text-dashMuted">
                  <p className="font-semibold text-dashText mb-1">How to get your Shopify access token:</p>
                  <ol className="space-y-1 text-xs">
                    <li>1. Go to your Shopify Admin → Settings → Apps</li>
                    <li>2. Click &quot;Develop apps&quot; → Create an app</li>
                    <li>3. Under API credentials → Configure Admin API access</li>
                    <li>4. Enable: Orders (read), Products (read/write), Reports (read)</li>
                    <li>5. Install the app and copy the Admin API access token</li>
                  </ol>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-dashMuted block mb-1.5">Store Domain</label>
                    <input
                      value={storeUrl}
                      onChange={e => setStoreUrl(e.target.value)}
                      placeholder="your-store.myshopify.com"
                      className="w-full bg-dashSurface2 border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-dashMuted block mb-1.5">Access Token</label>
                    <input
                      type="password"
                      value={accessToken}
                      onChange={e => setAccessToken(e.target.value)}
                      placeholder="shpat_..."
                      className="w-full bg-dashSurface2 border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {businessProfiles.length > 0 && (
                  <div>
                    <label className="text-xs text-dashMuted block mb-1.5">Link to Business Profile (optional)</label>
                    <select
                      value={businessProfileId}
                      onChange={e => setBusinessProfileId(e.target.value)}
                      className="w-full max-w-sm bg-dashSurface2 border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
                    >
                      <option value="">None</option>
                      {businessProfiles.map(bp => <option key={bp.id} value={bp.id}>{bp.business_name}</option>)}
                    </select>
                  </div>
                )}

                {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">{error}</div>}

                <button
                  onClick={handleConnect}
                  disabled={status === 'connecting' || !storeUrl || !accessToken}
                  className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight disabled:opacity-50 transition-colors"
                >
                  {status === 'connecting' ? <Loader2 size={16} className="animate-spin" /> : <Store size={16} />}
                  {status === 'connecting' ? 'Connecting...' : 'Connect Store →'}
                </button>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-dashMuted text-sm">
                  {platform.charAt(0).toUpperCase() + platform.slice(1)} integration coming soon.
                  <br />Shopify is currently supported.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Dashboard */}
        {integration && (
          <>
            {/* Period selector */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs text-dashMuted">Period:</span>
              {[
                { label: '7 days', value: '7d' },
                { label: '30 days', value: '30d' },
                { label: '90 days', value: '90d' },
              ].map(p => (
                <button
                  key={p.value}
                  onClick={() => { setPeriod(p.value); loadAnalytics(integration.id) }}
                  className={cn('px-3 py-1 rounded-lg text-xs font-medium transition-colors', period === p.value ? 'bg-accent text-white' : 'bg-dashCard border border-dashSurface2 text-dashMuted hover:text-dashText')}
                >
                  {p.label}
                </button>
              ))}
              <span className="text-xs text-dashMuted ml-2">
                Connected: <span className="text-dashText">{integration.store_url}</span>
              </span>
            </div>

            {status === 'loading' && (
              <div className="flex items-center gap-3 py-8 justify-center">
                <Loader2 size={20} className="animate-spin text-accent" />
                <p className="text-dashMuted text-sm">Fetching analytics from Shopify...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">{error}</div>
            )}

            {analytics && status === 'done' && (
              <div className="space-y-6">
                {/* Stat cards */}
                <div className="grid grid-cols-4 gap-4">
                  <StatCard label="Total Revenue" value={analytics.totalRevenue} prefix="€" trend="up" />
                  <StatCard label="Total Orders" value={analytics.totalOrders} trend="up" />
                  <StatCard label="Avg Order Value" value={analytics.avgOrderValue} prefix="€" trend="neutral" />
                  <StatCard label="Conversion Rate" value={analytics.conversionRate} suffix="%" trend={analytics.conversionRate >= 2 ? 'up' : 'down'} />
                </div>

                {/* Abandoned checkouts alert */}
                {analytics.abandonedCheckouts > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle size={16} className="text-amber-400 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-400">{analytics.abandonedCheckouts} abandoned checkouts</p>
                      <p className="text-xs text-dashMuted">Consider setting up an abandoned cart recovery email sequence in ELEVO Viral™.</p>
                    </div>
                  </div>
                )}

                {/* Revenue chart */}
                <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
                  <h3 className="text-sm font-semibold text-dashText mb-4">Revenue Over Time</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={analytics.revenueByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1A2332" />
                      <XAxis dataKey="date" stroke="#4B5563" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                      <YAxis stroke="#4B5563" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: '#141B24', border: '1px solid #1A2332', borderRadius: 8, color: '#EEF2FF' }}
                        formatter={(v: number) => [`€${v.toFixed(2)}`, 'Revenue']}
                      />
                      <Line type="monotone" dataKey="revenue" stroke={CHART_COLOR} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Top products */}
                  <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
                    <h3 className="text-sm font-semibold text-dashText mb-4">Top Products</h3>
                    <div className="space-y-2">
                      {analytics.topProducts.slice(0, 8).map((p, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <p className="text-xs text-dashText truncate max-w-[200px]">{p.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-dashMuted">{p.orders} orders</span>
                            <span className="text-xs font-semibold text-green-400">€{p.revenue.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                      {analytics.topProducts.length === 0 && <p className="text-xs text-dashMuted">No product data yet</p>}
                    </div>
                  </div>

                  {/* Traffic sources */}
                  <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
                    <h3 className="text-sm font-semibold text-dashText mb-4">Traffic Sources</h3>
                    <div className="flex items-center gap-4">
                      <PieChart width={120} height={120}>
                        <Pie data={trafficData} cx={55} cy={55} innerRadius={35} outerRadius={55} dataKey="value" stroke="none">
                          {trafficData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                      <div className="space-y-2">
                        {trafficData.map((d, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                            <span className="text-xs text-dashMuted capitalize">{d.name}</span>
                            <span className="text-xs font-semibold text-dashText ml-auto">{d.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ELEVO Insights */}
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-dashText mb-3">ELEVO Insights</h3>
                  <div className="space-y-2 text-xs text-dashMuted">
                    {analytics.avgOrderValue < 30 && (
                      <p>• Your average order value is low. Consider adding product bundles or upsells to increase AOV above €50.</p>
                    )}
                    {analytics.refundRate > 5 && (
                      <p>• Your refund rate of {analytics.refundRate}% is above average. Review product quality and descriptions to set better expectations.</p>
                    )}
                    {analytics.abandonedCheckouts > 5 && (
                      <p>• You have {analytics.abandonedCheckouts} abandoned checkouts. An automated email sequence could recover 10–15% of these.</p>
                    )}
                    {analytics.conversionRate < 2 && (
                      <p>• Your conversion rate is below industry average (2–4%). A/B test product images and add more social proof.</p>
                    )}
                    <p>• Top revenue driver: {analytics.topProducts[0]?.title ?? 'N/A'}. Consider scaling ads for this product with ELEVO Ads Pro™.</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
