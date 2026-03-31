'use client'

import { useLocale } from 'next-intl'

import { useState, useEffect } from 'react'
import {
  Loader2,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  DollarSign,
  BarChart2,
  ArrowUpRight,
  Lightbulb,
  XCircle,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { ADMIN_IDS } from '@/lib/admin'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import { cn } from '@/lib/utils'
import type { BusinessProfile } from '@/lib/agents/types'
import type { FinancialReport } from '@/lib/agents/financeAgent'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'
type DataType = 'pl' | 'cashflow' | 'invoices' | 'bank_statement' | 'mixed'

const CURRENCIES = ['GBP', 'USD', 'EUR'] as const
const CURRENCY_SYMBOLS: Record<string, string> = { GBP: '€', USD: '$', EUR: '€' }

const DATA_TYPES: { value: DataType; label: string }[] = [
  { value: 'pl', label: 'P&L' },
  { value: 'cashflow', label: 'Cash Flow' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'mixed', label: 'Mixed' },
]

function healthScoreColors(rating: string) {
  if (rating === 'excellent') return { border: 'border-green-500', text: 'text-green-400', bg: 'bg-green-500/10' }
  if (rating === 'healthy') return { border: 'border-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10' }
  if (rating === 'caution') return { border: 'border-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10' }
  return { border: 'border-red-500', text: 'text-red-400', bg: 'bg-red-500/10' }
}

function alertIcon(severity: string) {
  if (severity === 'critical') return <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
  if (severity === 'warning') return <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
  return <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
}

function alertStyles(severity: string) {
  if (severity === 'critical') return 'bg-red-500/10 border-red-500/30'
  if (severity === 'warning') return 'bg-amber-500/10 border-amber-500/30'
  return 'bg-blue-500/10 border-blue-500/30'
}

function effortBadge(effort: string) {
  if (effort === 'easy' || effort === 'low') return 'bg-green-500/10 text-green-400'
  if (effort === 'medium') return 'bg-amber-500/10 text-amber-400'
  return 'bg-red-500/10 text-red-400'
}

function categoryBadge(category: string) {
  const map: Record<string, string> = {
    cost_reduction: 'bg-red-500/10 text-red-400',
    revenue_growth: 'bg-green-500/10 text-green-400',
    efficiency: 'bg-blue-500/10 text-blue-400',
    risk_reduction: 'bg-amber-500/10 text-amber-400',
  }
  return map[category] ?? 'bg-dashSurface text-dashMuted'
}

function categoryLabel(category: string) {
  const map: Record<string, string> = {
    cost_reduction: 'Cost Reduction',
    revenue_growth: 'Revenue Growth',
    efficiency: 'Efficiency',
    risk_reduction: 'Risk Reduction',
  }
  return map[category] ?? category
}

function fmt(sym: string, value: number) {
  return `${sym}${value.toLocaleString()}`
}

export default function FinancesPage({}: {  }) {
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [plan, setPlan] = useState<string>('trial')
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [rawData, setRawData] = useState('')
  const [dataType, setDataType] = useState<DataType>('pl')
  const [period, setPeriod] = useState('')
  const [currency, setCurrency] = useState('GBP')
  const [report, setReport] = useState<FinancialReport | null>(null)
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
    return <UpgradePrompt locale={locale} feature="Financial Intelligence" />
  }

  const sym = CURRENCY_SYMBOLS[currency] || '€'

  const handleAnalyse = async () => {
    if (!bp || !rawData.trim()) return
    setStatus('thinking')
    setReport(null)
    setError('')
    try {
      const res = await fetch('/api/finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfileId: bp.id,
          rawData,
          dataType,
          period,
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

  const colors = report ? healthScoreColors(report.healthRating) : { border: '', text: '', bg: '' }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={22} className="text-accent" />
          <h1 className="text-2xl font-bold text-dashText">Financial Intelligence</h1>
        </div>
        <p className="text-dashMuted text-sm">Analysed by Flora, your Financial Intelligence Officer</p>
      </div>

      {/* Data Input Card */}
      <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 mb-6">
        <h2 className="text-sm font-semibold text-dashText mb-4">Your Financial Data</h2>

        <textarea
          value={rawData}
          onChange={e => setRawData(e.target.value)}
          placeholder="Paste your P&L, bank statement, invoice list, or spreadsheet rows here..."
          className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-4 py-3 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          style={{ minHeight: '120px' }}
        />

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          {/* Data type pills */}
          <div className="flex flex-wrap gap-2">
            {DATA_TYPES.map(dt => (
              <button
                key={dt.value}
                onClick={() => setDataType(dt.value)}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-medium border transition-colors min-h-[44px]',
                  dataType === dt.value
                    ? 'bg-accent border-accent text-white'
                    : 'bg-dashSurface border-dashSurface2 text-dashMuted hover:text-dashText'
                )}
              >
                {dt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          {/* Period */}
          <input
            type="text"
            value={period}
            onChange={e => setPeriod(e.target.value)}
            placeholder="e.g. March 2026 or Q1 2026"
            className="flex-1 bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
          />
          {/* Currency */}
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
          >
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-dashSurface2">
          <AgentStatusIndicator status={status} />
          <button
            onClick={handleAnalyse}
            disabled={!bp || !rawData.trim() || status === 'thinking' || status === 'generating'}
            className="px-4 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-h-[44px]"
          >
            {(status === 'thinking' || status === 'generating') && <Loader2 size={15} className="animate-spin" />}
            Analyse Finances →
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {/* Results */}
      {report && (
        <div className="space-y-6">
          {/* Health Score Circle */}
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-8 flex flex-col items-center text-center">
            <div className={cn('w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center mb-4', colors.border)}>
              <span className={cn('text-4xl font-bold', colors.text)}>{report.healthScore}</span>
              <span className="text-xs text-dashMuted mt-1">/ 100</span>
            </div>
            <span className={cn('text-xs font-semibold px-3 py-1 rounded-full capitalize mb-3', colors.bg, colors.text)}>
              {report.healthRating}
            </span>
            <p className="text-dashMuted text-sm max-w-xl">{report.executiveSummary}</p>
          </div>

          {/* Alerts */}
          {report.alerts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-dashText">Alerts</h2>
              {report.alerts.map((alert, i) => (
                <div key={i} className={cn('rounded-xl border p-4 flex items-start gap-3', alertStyles(alert.severity))}>
                  {alertIcon(alert.severity)}
                  <div>
                    <p className="text-sm text-dashText font-medium">{alert.message}</p>
                    <p className="text-xs text-dashMuted mt-1">{alert.action}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary Cards */}
          <div>
            <h2 className="text-sm font-semibold text-dashText mb-3">Financial Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Revenue', value: fmt(sym, report.summary.totalRevenue), icon: <TrendingUp size={16} className="text-green-400" /> },
                { label: 'Expenses', value: fmt(sym, report.summary.totalExpenses), icon: <DollarSign size={16} className="text-red-400" /> },
                { label: 'Net Profit', value: fmt(sym, report.summary.netProfit), icon: <ArrowUpRight size={16} className="text-accent" /> },
                { label: 'Net Margin', value: `${report.summary.netMargin.toFixed(1)}%`, icon: <BarChart2 size={16} className="text-blue-400" /> },
              ].map(card => (
                <div key={card.label} className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {card.icon}
                    <p className="text-xs text-dashMuted">{card.label}</p>
                  </div>
                  <p className="text-xl font-bold text-dashText">{card.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Saving Opportunities */}
          {report.costSavingOpportunities.length > 0 && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <h2 className="text-sm font-semibold text-dashText mb-4">Cost Saving Opportunities</h2>
              <div className="space-y-3">
                {[...report.costSavingOpportunities]
                  .sort((a, b) => b.estimatedSaving - a.estimatedSaving)
                  .map((opp, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-dashSurface2 pt-3 first:border-0 first:pt-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-medium text-dashText">{opp.area}</span>
                          <span className={cn('text-xs px-2 py-0.5 rounded capitalize', effortBadge(opp.difficulty))}>
                            {opp.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-dashMuted">{opp.recommendation}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-green-400">{fmt(sym, opp.estimatedSaving)}/mo</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Revenue Growth Opportunities */}
          {report.revenueGrowthOpportunities.length > 0 && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <h2 className="text-sm font-semibold text-dashText mb-4">Revenue Growth Opportunities</h2>
              <div className="space-y-3">
                {report.revenueGrowthOpportunities.map((opp, i) => (
                  <div key={i} className="border-t border-dashSurface2 pt-3 first:border-0 first:pt-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm text-dashText font-medium mb-1">{opp.opportunity}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-dashMuted">{opp.timeframe}</span>
                          <span className={cn('text-xs px-2 py-0.5 rounded capitalize', effortBadge(opp.effort))}>
                            {opp.effort} effort
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-accent shrink-0">{opp.estimatedUplift}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forecast */}
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-dashText">Forecast</h2>
              <span className={cn('text-xs px-2 py-0.5 rounded capitalize', {
                'bg-green-500/10 text-green-400': report.forecast.confidence === 'high',
                'bg-amber-500/10 text-amber-400': report.forecast.confidence === 'medium',
                'bg-red-500/10 text-red-400': report.forecast.confidence === 'low',
              })}>
                {report.forecast.confidence} confidence
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dashSurface2">
                    <th className="text-left text-xs text-dashMuted font-medium pb-2 pr-4">Period</th>
                    <th className="text-right text-xs text-dashMuted font-medium pb-2 pr-4">Revenue</th>
                    <th className="text-right text-xs text-dashMuted font-medium pb-2 pr-4">Expenses</th>
                    <th className="text-right text-xs text-dashMuted font-medium pb-2">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Next Month', data: report.forecast.nextMonth },
                    { label: 'Next Quarter', data: report.forecast.nextQuarter },
                  ].map(row => (
                    <tr key={row.label} className="border-t border-dashSurface2">
                      <td className="py-2 pr-4 text-dashMuted text-xs">{row.label}</td>
                      <td className="py-2 pr-4 text-right text-dashText">{fmt(sym, row.data.revenue)}</td>
                      <td className="py-2 pr-4 text-right text-dashText">{fmt(sym, row.data.expenses)}</td>
                      <td className={cn('py-2 text-right font-semibold', row.data.profit >= 0 ? 'text-green-400' : 'text-red-400')}>
                        {fmt(sym, row.data.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {report.forecast.assumptions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-dashSurface2">
                <p className="text-xs text-dashMuted font-medium mb-1">Assumptions:</p>
                <ul className="space-y-0.5">
                  {report.forecast.assumptions.map((a, i) => (
                    <li key={i} className="text-xs text-dashMuted flex items-start gap-1.5">
                      <span className="text-accent mt-0.5">•</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Alternative Solutions */}
          {report.alternativeSolutions.length > 0 && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <h2 className="text-sm font-semibold text-dashText mb-4">Alternative Solutions</h2>
              <div className="space-y-4">
                {report.alternativeSolutions.map((sol, i) => (
                  <div key={i} className="border-t border-dashSurface2 pt-4 first:border-0 first:pt-0">
                    <div className="flex items-start gap-3">
                      <Lightbulb size={16} className="text-accent mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={cn('text-xs px-2 py-0.5 rounded', categoryBadge(sol.category))}>
                            {categoryLabel(sol.category)}
                          </span>
                          <span className="text-xs font-bold text-accent">{sol.estimatedImpact}</span>
                        </div>
                        <p className="text-xs text-dashMuted mb-1">
                          <span className="font-medium text-dashText">Current: </span>{sol.currentSituation}
                        </p>
                        <p className="text-xs text-dashMuted">
                          <span className="font-medium text-dashText">Alternative: </span>{sol.suggestedAlternative}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
