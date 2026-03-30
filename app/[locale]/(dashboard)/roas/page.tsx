'use client'

import { useLocale } from 'next-intl'

import { useState, useEffect } from 'react'
import { Loader2, TrendingUp, TrendingDown, AlertTriangle, PlusCircle, Trash2, BarChart3, Minus } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { ADMIN_IDS } from '@/lib/admin'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import { cn } from '@/lib/utils'
import type { BusinessProfile } from '@/lib/agents/types'
import type { ROASReport } from '@/lib/agents/roasAgent'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'

interface Campaign {
  name: string
  platform: 'google' | 'meta' | 'tiktok' | 'instagram' | 'email' | 'other'
  spend: string
  revenue: string
  period: string
}

const PLATFORMS = ['google', 'meta', 'tiktok', 'instagram', 'email', 'other'] as const
const CURRENCIES = ['GBP', 'USD', 'EUR'] as const
const CURRENCY_SYMBOLS: Record<string, string> = { GBP: '£', USD: '$', EUR: '€' }

function emptyRow(): Campaign {
  return { name: '', platform: 'google', spend: '', revenue: '', period: '' }
}

function roasColor(rating: string) {
  if (rating === 'excellent') return 'text-green-400'
  if (rating === 'good') return 'text-amber-400'
  return 'text-red-400'
}

function roasBgColor(rating: string) {
  if (rating === 'excellent') return 'border-green-500 text-green-400'
  if (rating === 'good') return 'border-amber-500 text-amber-400'
  return 'border-red-500 text-red-400'
}

function budgetChangeBadge(change: string) {
  if (change === 'increase') return 'bg-green-500/10 text-green-400 border border-green-500/20'
  if (change === 'decrease') return 'bg-red-500/10 text-red-400 border border-red-500/20'
  if (change === 'pause') return 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
  return 'bg-dashSurface text-dashMuted border border-dashSurface2'
}

function effortBadge(effort: string) {
  if (effort === 'low') return 'bg-green-500/10 text-green-400'
  if (effort === 'medium') return 'bg-amber-500/10 text-amber-400'
  return 'bg-red-500/10 text-red-400'
}

export default function ROASPage({}: {  }) {
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [plan, setPlan] = useState<string>('trial')
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([emptyRow()])
  const [currency, setCurrency] = useState<string>('GBP')
  const [report, setReport] = useState<ROASReport | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: prof }, { data: bpData }] = await Promise.all([
        supabase.from('profiles').select('plan').eq('id', user.id).single(),
        supabase.from('business_profiles').select('*').eq('user_id', user.id).eq('is_primary', true).single(),
      ])
      if (prof) setPlan(ADMIN_IDS.includes(user.id) ? 'galaxy' : prof.plan)
      if (bpData) setBp(bpData as BusinessProfile)
    }
    load()
  }, [])

  if (plan === 'trial' || plan === 'launch') {
    return <UpgradePrompt locale={locale} feature="ROAS Dashboard" />
  }

  const sym = CURRENCY_SYMBOLS[currency] || '£'

  const updateRow = (i: number, field: keyof Campaign, value: string) => {
    setCampaigns(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row))
  }

  const addRow = () => setCampaigns(prev => [...prev, emptyRow()])

  const removeRow = (i: number) => {
    if (campaigns.length === 1) return
    setCampaigns(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleGenerate = async () => {
    if (!bp) return
    const valid = campaigns.filter(c => c.name.trim() && c.spend && c.revenue)
    if (valid.length === 0) return
    setStatus('thinking')
    setReport(null)
    setError('')
    try {
      const res = await fetch('/api/roas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfileId: bp.id,
          campaigns: valid.map(c => ({
            ...c,
            spend: parseFloat(c.spend) || 0,
            revenue: parseFloat(c.revenue) || 0,
          })),
          currency,
          locale: locale,
        }),
      })
      setStatus('generating')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setReport(data.result)
      setStatus('done')
    } catch {
      setStatus('error')
      setError('Analysis failed. Please try again.')
    }
  }

  const immediateActions = report?.actionPlan.filter(a => a.priority === 'immediate') ?? []
  const weekActions = report?.actionPlan.filter(a => a.priority === 'this_week') ?? []
  const monthActions = report?.actionPlan.filter(a => a.priority === 'this_month') ?? []

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={22} className="text-accent" />
          <h1 className="text-2xl font-bold text-dashText">ROAS Dashboard</h1>
        </div>
        <p className="text-dashMuted text-sm">Return on Ad Spend — analysed by Leo, your advertising analyst</p>
      </div>

      {/* Campaign Input Table */}
      <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-semibold text-dashText">Your Ad Campaigns</h2>
          <div className="flex items-center gap-2">
            <label className="text-xs text-dashMuted">Currency:</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="bg-dashSurface border border-dashSurface2 rounded-lg px-2 py-1.5 text-xs text-dashText focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dashSurface2">
                <th className="text-left text-xs text-dashMuted font-medium pb-2 pr-3">Campaign Name</th>
                <th className="text-left text-xs text-dashMuted font-medium pb-2 pr-3">Platform</th>
                <th className="text-left text-xs text-dashMuted font-medium pb-2 pr-3">Spend ({sym})</th>
                <th className="text-left text-xs text-dashMuted font-medium pb-2 pr-3">Revenue ({sym})</th>
                <th className="text-left text-xs text-dashMuted font-medium pb-2 pr-3">Period</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-dashSurface2">
              {campaigns.map((row, i) => (
                <tr key={i}>
                  <td className="py-2 pr-3">
                    <input
                      type="text"
                      value={row.name}
                      onChange={e => updateRow(i, 'name', e.target.value)}
                      placeholder="e.g. Google Search — Plumbers"
                      className="w-full min-w-[160px] bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-xs text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <select
                      value={row.platform}
                      onChange={e => updateRow(i, 'platform', e.target.value)}
                      className="bg-dashSurface border border-dashSurface2 rounded-lg px-2 py-2 text-xs text-dashText focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px] capitalize"
                    >
                      {PLATFORMS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    </select>
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="number"
                      value={row.spend}
                      onChange={e => updateRow(i, 'spend', e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-24 bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-xs text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="number"
                      value={row.revenue}
                      onChange={e => updateRow(i, 'revenue', e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-24 bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-xs text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="text"
                      value={row.period}
                      onChange={e => updateRow(i, 'period', e.target.value)}
                      placeholder="e.g. March 2026"
                      className="w-32 bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-xs text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
                    />
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => removeRow(i)}
                      disabled={campaigns.length === 1}
                      className="p-2 text-dashMuted hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-dashSurface2">
          <button
            onClick={addRow}
            className="flex items-center gap-1.5 text-xs text-accent hover:text-dashText transition-colors min-h-[44px]"
          >
            <PlusCircle size={14} />
            Add Campaign
          </button>
          <div className="flex items-center gap-3">
            <AgentStatusIndicator status={status} />
            <button
              onClick={handleGenerate}
              disabled={!bp || campaigns.every(c => !c.name.trim()) || status === 'thinking' || status === 'generating'}
              className="px-4 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-h-[44px]"
            >
              {(status === 'thinking' || status === 'generating') && <Loader2 size={15} className="animate-spin" />}
              Analyse ROAS →
            </button>
          </div>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {/* Results */}
      {report && (
        <div className="space-y-6">
          {/* Overall ROAS Circle */}
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-8 flex flex-col items-center text-center">
            <div className={cn(
              'w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center mb-4',
              roasBgColor(report.overallROASRating)
            )}>
              <span className={cn('text-4xl font-bold', roasColor(report.overallROASRating))}>
                {report.overallROAS.toFixed(1)}x
              </span>
              <span className="text-xs text-dashMuted mt-1">Overall ROAS</span>
            </div>
            <p className="text-dashMuted text-sm mb-1">
              {sym}{report.totalSpend.toLocaleString()} spent → {sym}{report.totalRevenue.toLocaleString()} returned
            </p>
            <p className="text-dashText text-sm font-medium">
              Net ROI: {sym}{report.netROI.toLocaleString()}
            </p>
          </div>

          {/* Key Insight */}
          <div className="bg-dashCard rounded-xl border-l-4 border-accent p-5">
            <p className="text-xs text-accent uppercase tracking-wide font-semibold mb-1">Key Insight</p>
            <p className="text-dashText text-sm">{report.keyInsight}</p>
          </div>

          {/* Channel Breakdown */}
          {report.byChannel.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-dashText mb-3">Channel Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.byChannel.map((ch, i) => (
                  <div key={i} className="bg-dashCard rounded-xl border border-dashSurface2 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-dashText capitalize">{ch.platform}</span>
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', roasBgColor(ch.roasRating))}>
                          {ch.roasRating.charAt(0).toUpperCase() + ch.roasRating.slice(1)}
                        </span>
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', budgetChangeBadge(ch.budgetChange))}>
                          {ch.budgetChange}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-dashMuted">Spend</p>
                        <p className="text-sm font-medium text-dashText">{sym}{ch.spend.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-dashMuted">Revenue</p>
                        <p className="text-sm font-medium text-dashText">{sym}{ch.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-dashMuted">ROAS</p>
                        <p className={cn('text-sm font-bold', roasColor(ch.roasRating))}>{ch.roas.toFixed(1)}x</p>
                      </div>
                    </div>
                    <p className="text-xs text-dashMuted border-t border-dashSurface2 pt-3">{ch.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Plan */}
          {report.actionPlan.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-dashText mb-3">Action Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Immediate', items: immediateActions, color: 'text-red-400 border-red-500/30' },
                  { label: 'This Week', items: weekActions, color: 'text-amber-400 border-amber-500/30' },
                  { label: 'This Month', items: monthActions, color: 'text-blue-400 border-blue-500/30' },
                ].map(col => (
                  <div key={col.label} className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
                    <p className={cn('text-xs font-semibold uppercase tracking-wide mb-3', col.color.split(' ')[0])}>{col.label}</p>
                    <div className="space-y-3">
                      {col.items.length === 0 ? (
                        <p className="text-xs text-dashMuted">No actions in this timeframe</p>
                      ) : col.items.map((item, i) => (
                        <div key={i} className="border-t border-dashSurface2 pt-3 first:border-0 first:pt-0">
                          <p className="text-xs text-dashText mb-1">{item.action}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-accent">{item.expectedROASImprovement}</span>
                            <span className={cn('text-xs px-1.5 py-0.5 rounded', effortBadge(item.effort))}>
                              {item.effort} effort
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wasted Spend */}
          {report.wastedSpend > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-400">Estimated Wasted Spend</p>
                <p className="text-dashText text-sm mt-0.5">
                  {sym}{report.wastedSpend.toLocaleString()} is being spent on campaigns with a ROAS below break-even (2:1). Reallocate this budget to your top-performing channels.
                </p>
              </div>
            </div>
          )}

          {/* Industry Benchmarks */}
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
            <h2 className="text-sm font-semibold text-dashText mb-3">Industry Benchmarks</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div>
                <p className="text-xs text-dashMuted mb-0.5">Industry Average ROAS</p>
                <p className="text-xl font-bold text-dashText">{report.benchmarks.industryAverageROAS}x</p>
              </div>
              <div>
                <p className="text-xs text-dashMuted mb-0.5">Your ROAS vs Industry</p>
                <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full capitalize', {
                  'bg-green-500/10 text-green-400': report.benchmarks.yourROASVsIndustry === 'above',
                  'bg-amber-500/10 text-amber-400': report.benchmarks.yourROASVsIndustry === 'at',
                  'bg-red-500/10 text-red-400': report.benchmarks.yourROASVsIndustry === 'below',
                })}>
                  {report.benchmarks.yourROASVsIndustry === 'above' && <TrendingUp size={11} className="inline mr-1" />}
                  {report.benchmarks.yourROASVsIndustry === 'below' && <TrendingDown size={11} className="inline mr-1" />}
                  {report.benchmarks.yourROASVsIndustry === 'at' && <Minus size={11} className="inline mr-1" />}
                  {report.benchmarks.yourROASVsIndustry} industry average
                </span>
              </div>
            </div>
            <p className="text-xs text-dashMuted mt-3">{report.benchmarks.interpretation}</p>
          </div>
        </div>
      )}
    </div>
  )
}
