'use client'

import { useLocale } from 'next-intl'

import { useState, useEffect } from 'react'
import {
  Loader2,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import { cn } from '@/lib/utils'
import type { BusinessProfile } from '@/lib/agents/types'
import type { CustomerTrendsReport } from '@/lib/agents/customerTrendsAgent'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'

function segmentColor(name: string) {
  const lower = name.toLowerCase()
  if (lower.includes('vip') || lower.includes('champion')) return 'border-yellow-500/40 bg-yellow-500/5'
  if (lower.includes('active') || lower.includes('loyal') || lower.includes('regular')) return 'border-green-500/40 bg-green-500/5'
  if (lower.includes('at-risk') || lower.includes('at_risk') || lower.includes('risk') || lower.includes('churn')) return 'border-red-500/40 bg-red-500/5'
  if (lower.includes('lapsed') || lower.includes('lost')) return 'border-orange-500/40 bg-orange-500/5'
  return 'border-dashSurface2 bg-dashSurface'
}

function segmentTextColor(name: string) {
  const lower = name.toLowerCase()
  if (lower.includes('vip') || lower.includes('champion')) return 'text-yellow-400'
  if (lower.includes('active') || lower.includes('loyal') || lower.includes('regular')) return 'text-green-400'
  if (lower.includes('at-risk') || lower.includes('at_risk') || lower.includes('risk') || lower.includes('churn')) return 'text-red-400'
  if (lower.includes('lapsed') || lower.includes('lost')) return 'text-orange-400'
  return 'text-accent'
}

function directionIcon(direction: string) {
  if (direction === 'increasing') return <TrendingUp size={14} className="text-green-400" />
  if (direction === 'decreasing') return <TrendingDown size={14} className="text-red-400" />
  return <Minus size={14} className="text-dashMuted" />
}

function contentTypeToRoute(contentType: string, locale: string) {
  const lower = contentType.toLowerCase()
  if (lower.includes('email')) return `/${locale}/dashboard/content/email`
  if (lower.includes('social')) return `/${locale}/dashboard/content/social`
  if (lower.includes('gbp') || lower.includes('google')) return `/${locale}/dashboard/content/gbp-posts`
  if (lower.includes('blog')) return `/${locale}/dashboard/content/blog`
  if (lower.includes('seo')) return `/${locale}/dashboard/content/seo`
  if (lower.includes('review')) return `/${locale}/dashboard/content/reviews`
  return `/${locale}/dashboard/content/social`
}

export default function CustomerTrendsPage({}: {  }) {
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [plan, setPlan] = useState<string>('trial')
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [report, setReport] = useState<CustomerTrendsReport | null>(null)
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
      if (prof) setPlan(prof.plan)
      if (bpData) setBp(bpData as BusinessProfile)
    }
    load()
  }, [])

  if (plan === 'trial' || plan === 'launch') {
    return <UpgradePrompt locale={locale} feature="Customer Trends" />
  }

  const handleAnalyse = async () => {
    if (!bp) return
    setStatus('thinking')
    setReport(null)
    setError('')
    try {
      const res = await fetch(`/api/customer-trends?businessProfileId=${bp.id}`)
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

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Users size={22} className="text-accent" />
          <h1 className="text-2xl font-bold text-dashText">Customer Trends</h1>
        </div>
        <p className="text-dashMuted text-sm">Analysed by Maya, your Customer Trends Analyst</p>
      </div>

      {/* Analyse Button Card (shown when no report) */}
      {!report && (
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mb-4">
            <Users size={28} className="text-accent" />
          </div>
          <h2 className="text-lg font-semibold text-dashText mb-2">Let Maya analyse your customers</h2>
          <p className="text-dashMuted text-sm max-w-md mb-6">
            Maya will analyse your customer data from the CRM — segmenting, identifying churn risks, spotting trends, and building you a personalised content calendar.
          </p>
          <div className="flex flex-col items-center gap-3">
            <AgentStatusIndicator status={status} />
            <button
              onClick={handleAnalyse}
              disabled={!bp || status === 'thinking' || status === 'generating'}
              className="px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-h-[44px]"
            >
              {(status === 'thinking' || status === 'generating') && <Loader2 size={15} className="animate-spin" />}
              Analyse My Customers →
            </button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        </div>
      )}

      {/* Results */}
      {report && (
        <div className="space-y-6">
          {/* Re-analyse button */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-dashMuted">{report.totalCustomers} customers analysed</p>
            <button
              onClick={handleAnalyse}
              disabled={status === 'thinking' || status === 'generating'}
              className="px-3 py-2 text-xs bg-dashSurface border border-dashSurface2 text-dashMuted hover:text-dashText rounded-lg transition-colors min-h-[44px]"
            >
              Re-analyse
            </button>
          </div>

          {/* Churn Risk Banner */}
          {report.churnRisk.highRisk > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-400">
                    {report.churnRisk.highRisk} customers at churn risk —{' '}
                    £{report.churnRisk.estimatedRevenueLost.toLocaleString()} potential revenue loss
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs font-semibold text-dashMuted uppercase tracking-wide mb-2">Top Churn Reasons</p>
                  <ul className="space-y-1">
                    {report.churnRisk.topChurnReasons.map((r, i) => (
                      <li key={i} className="text-xs text-dashMuted flex items-start gap-1.5">
                        <span className="text-red-400 mt-0.5 shrink-0">•</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-dashMuted uppercase tracking-wide mb-2">Retention Actions</p>
                  <ul className="space-y-1">
                    {report.churnRisk.retentionActions.map((a, i) => (
                      <li key={i} className="text-xs text-dashMuted flex items-start gap-1.5">
                        <span className="text-green-400 mt-0.5 shrink-0">→</span>{a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Customer Segments */}
          {report.segments.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-dashText mb-3">Customer Segments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.segments.map((seg, i) => (
                  <div key={i} className={cn('rounded-xl border p-5', segmentColor(seg.name))}>
                    <div className="flex items-start justify-between mb-2">
                      <span className={cn('text-sm font-semibold', segmentTextColor(seg.name))}>{seg.name}</span>
                      <div className="text-right">
                        <p className="text-sm font-bold text-dashText">{seg.size}</p>
                        <p className="text-xs text-dashMuted">{seg.percentageOfBase.toFixed(1)}% of base</p>
                      </div>
                    </div>
                    <p className="text-xs text-dashMuted mb-3">Avg value: £{seg.averageValue.toLocaleString()}</p>
                    {seg.characteristics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {seg.characteristics.map((c, j) => (
                          <span key={j} className="text-xs bg-dashSurface text-dashMuted px-2 py-0.5 rounded">{c}</span>
                        ))}
                      </div>
                    )}
                    <div className="space-y-1.5 border-t border-dashSurface2/50 pt-3">
                      <p className="text-xs text-dashText">
                        <span className="text-dashMuted font-medium">Action: </span>{seg.recommendedAction}
                      </p>
                      <p className="text-xs text-dashMuted">
                        <span className="font-medium text-dashMuted">Content: </span>{seg.contentStrategy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Behaviour Trends */}
          {report.behaviorTrends.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-dashText mb-3">Behaviour Trends</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.behaviorTrends.map((trend, i) => (
                  <div key={i} className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {directionIcon(trend.direction)}
                      <span className="text-sm font-medium text-dashText">{trend.trend}</span>
                    </div>
                    <p className="text-xs text-dashMuted mb-2">{trend.insight}</p>
                    <p className="text-xs text-accent">{trend.actionableRecommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seasonal Calendar */}
          {report.seasonalPatterns.length > 0 && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <h2 className="text-sm font-semibold text-dashText mb-4 flex items-center gap-2">
                <Calendar size={15} className="text-accent" />
                Seasonal Patterns
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {report.seasonalPatterns.map((pat, i) => (
                  <div key={i} className="bg-dashSurface rounded-lg p-4 border border-dashSurface2">
                    <p className="text-sm font-semibold text-dashText mb-2">{pat.period}</p>
                    {pat.peakDemand.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-green-400 font-medium mb-1">Peak</p>
                        {pat.peakDemand.map((d, j) => (
                          <span key={j} className="text-xs text-dashMuted mr-2">• {d}</span>
                        ))}
                      </div>
                    )}
                    {pat.slowPeriod.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-amber-400 font-medium mb-1">Slow</p>
                        {pat.slowPeriod.map((d, j) => (
                          <span key={j} className="text-xs text-dashMuted mr-2">• {d}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-accent mt-2">{pat.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lifetime Value */}
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
            <h2 className="text-sm font-semibold text-dashText mb-4">Lifetime Value Analysis</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-dashSurface rounded-lg p-4 border border-dashSurface2">
                <p className="text-xs text-dashMuted mb-1">Average LTV</p>
                <p className="text-xl font-bold text-dashText">£{report.lifetimeValueAnalysis.averageLTV.toLocaleString()}</p>
              </div>
              <div className="bg-dashSurface rounded-lg p-4 border border-dashSurface2">
                <p className="text-xs text-dashMuted mb-1">Top Segment LTV</p>
                <p className="text-xl font-bold text-accent">£{report.lifetimeValueAnalysis.topSegmentLTV.toLocaleString()}</p>
              </div>
              <div className="bg-dashSurface rounded-lg p-4 border border-dashSurface2 sm:col-span-1">
                <p className="text-xs text-dashMuted mb-1">Growth Opportunity</p>
                <p className="text-sm text-dashText">{report.lifetimeValueAnalysis.ltvGrowthOpportunity}</p>
              </div>
            </div>
          </div>

          {/* Content Calendar */}
          {report.contentCalendarSuggestions.length > 0 && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <h2 className="text-sm font-semibold text-dashText mb-4">Content Calendar</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dashSurface2">
                      {['Week', 'Segment', 'Type', 'Topic', 'Rationale', ''].map(h => (
                        <th key={h} className="text-left text-xs text-dashMuted font-medium pb-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.contentCalendarSuggestions.map((item, i) => (
                      <tr key={i} className="border-t border-dashSurface2">
                        <td className="py-3 pr-4 text-xs text-dashMuted whitespace-nowrap">{item.week}</td>
                        <td className="py-3 pr-4 text-xs text-accent">{item.targetSegment}</td>
                        <td className="py-3 pr-4 text-xs text-dashMuted whitespace-nowrap">{item.contentType}</td>
                        <td className="py-3 pr-4 text-xs text-dashText">{item.topic}</td>
                        <td className="py-3 pr-4 text-xs text-dashMuted">{item.rationale}</td>
                        <td className="py-3">
                          <Link
                            href={contentTypeToRoute(item.contentType, locale)}
                            className="flex items-center gap-1 text-xs text-accent hover:underline whitespace-nowrap"
                          >
                            Generate <ExternalLink size={11} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* External Trends */}
          {report.externalTrends.length > 0 && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <h2 className="text-sm font-semibold text-dashText mb-3 flex items-center gap-2">
                <TrendingUp size={15} className="text-accent" />
                External Market Trends
              </h2>
              <ul className="space-y-2">
                {report.externalTrends.map((trend, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-dashMuted">
                    <span className="text-accent mt-0.5 shrink-0">•</span>
                    {trend}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
