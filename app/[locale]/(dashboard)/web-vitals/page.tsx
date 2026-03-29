'use client'

import { useState, useEffect, useCallback } from 'react'
import { Activity, RefreshCw, Loader2, Monitor, Smartphone, Globe } from 'lucide-react'

interface MetricSummary {
  p75: number
  median: number
  count: number
  rating: string
}

interface PageBreakdown {
  url: string
  metrics: Record<string, number>
}

const METRIC_INFO: Record<string, { label: string; unit: string; good: number; poor: number; description: string; tip: string }> = {
  LCP: { label: 'Largest Contentful Paint', unit: 'ms', good: 2500, poor: 4000, description: 'How fast the main content loads', tip: 'Optimise images, use next/image, preload fonts, reduce server response time' },
  CLS: { label: 'Cumulative Layout Shift', unit: '', good: 0.1, poor: 0.25, description: 'How much the layout shifts during load', tip: 'Set explicit width/height on images, avoid inserting content above existing content' },
  TTFB: { label: 'Time to First Byte', unit: 'ms', good: 800, poor: 1800, description: 'How fast the server responds', tip: 'Use edge functions, enable caching, optimise database queries, use CDN' },
  INP: { label: 'Interaction to Next Paint', unit: 'ms', good: 200, poor: 500, description: 'How responsive the page feels during use', tip: 'Break up long tasks, use web workers, optimise event handlers' },
}

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const info = METRIC_INFO[name]
  if (!info) return 'good'
  if (value <= info.good) return 'good'
  if (value <= info.poor) return 'needs-improvement'
  return 'poor'
}

const RATING_STYLES = {
  good: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', label: 'Good' },
  'needs-improvement': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', label: 'Needs Work' },
  poor: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'Poor' },
}

export default function WebVitalsPage() {
  const [summary, setSummary] = useState<Record<string, MetricSummary>>({})
  const [pages, setPages] = useState<PageBreakdown[]>([])
  const [totalSamples, setTotalSamples] = useState(0)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/web-vitals?days=${days}`)
      if (res.ok) {
        const data = await res.json()
        setSummary(data.summary ?? {})
        setPages(data.pages ?? [])
        setTotalSamples(data.totalSamples ?? 0)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [days])

  useEffect(() => { loadData() }, [loadData])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Core Web Vitals</h1>
            <p className="text-sm text-dashMuted">Real user performance data — {totalSamples} samples</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={days} onChange={e => setDays(Number(e.target.value))}
            className="bg-dashCard border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={loadData} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-dashMuted border border-white/5 rounded-lg hover:text-white transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /></div>
      ) : Object.keys(summary).length === 0 ? (
        <div className="bg-dashCard border border-white/5 rounded-xl p-12 text-center">
          <Activity className="w-12 h-12 text-dashMuted mx-auto mb-4" />
          <p className="text-dashMuted text-sm mb-2">No Web Vitals data yet.</p>
          <p className="text-dashMuted text-xs">Data is collected automatically as users browse your site.</p>
        </div>
      ) : (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {['LCP', 'CLS', 'TTFB', 'INP'].map(name => {
              const data = summary[name]
              if (!data) return (
                <div key={name} className="bg-dashCard border border-white/5 rounded-xl p-4">
                  <p className="text-xs text-dashMuted mb-1">{METRIC_INFO[name]?.label ?? name}</p>
                  <p className="text-lg font-bold text-dashMuted">—</p>
                </div>
              )
              const rating = getRating(name, data.p75)
              const style = RATING_STYLES[rating]
              const unit = METRIC_INFO[name]?.unit ?? ''
              return (
                <div key={name} className={`bg-dashCard border rounded-xl p-4 ${style.border}`}>
                  <p className="text-xs text-dashMuted mb-1">{METRIC_INFO[name]?.label ?? name}</p>
                  <p className={`text-2xl font-bold ${style.text}`}>
                    {name === 'CLS' ? data.p75.toFixed(3) : Math.round(data.p75)}{unit && <span className="text-sm font-normal text-dashMuted ml-1">{unit}</span>}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                      {style.label}
                    </span>
                    <span className="text-[10px] text-dashMuted">{data.count} samples</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Recommendations */}
          {Object.entries(summary).filter(([name, data]) => getRating(name, data.p75) !== 'good').length > 0 && (
            <div className="bg-dashCard border border-yellow-500/10 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Recommendations</h3>
              <div className="space-y-2">
                {Object.entries(summary).filter(([name, data]) => getRating(name, data.p75) !== 'good').map(([name]) => (
                  <div key={name} className="flex items-start gap-2 text-sm">
                    <span className="text-yellow-400 shrink-0 mt-0.5">*</span>
                    <div>
                      <span className="text-white font-medium">{name}:</span>{' '}
                      <span className="text-dashMuted">{METRIC_INFO[name]?.tip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Per-page breakdown */}
          {pages.length > 0 && (
            <div className="bg-dashCard border border-white/5 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-white/5">
                <h3 className="text-sm font-semibold text-white">Per-Page Performance (p75)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Page</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-dashMuted">LCP</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-dashMuted">CLS</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-dashMuted">INP</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-dashMuted">TTFB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.slice(0, 15).map(page => (
                      <tr key={page.url} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-white font-mono text-xs truncate max-w-[250px]">
                          <Globe className="w-3 h-3 inline mr-1.5 text-dashMuted" />
                          {page.url}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <MetricBadge name="LCP" value={page.metrics.LCP} unit="ms" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <MetricBadge name="CLS" value={page.metrics.CLS} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <MetricBadge name="INP" value={page.metrics.INP} unit="ms" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <MetricBadge name="TTFB" value={page.metrics.TTFB} unit="ms" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function MetricBadge({ name, value, unit }: { name: string; value?: number; unit?: string }) {
  if (value === undefined) return <span className="text-xs text-dashMuted">—</span>
  const rating = getRating(name, value)
  const style = RATING_STYLES[rating]
  const display = name === 'CLS' ? value.toFixed(3) : Math.round(value)
  return (
    <span className={`text-xs font-mono ${style.text}`}>
      {display}{unit ? <span className="text-dashMuted">{unit}</span> : ''}
    </span>
  )
}
