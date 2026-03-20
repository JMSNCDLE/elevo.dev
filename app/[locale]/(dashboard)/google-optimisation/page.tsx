'use client'

import { useState, useEffect } from 'react'
import {
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  Star,
  Copy,
  Check,
  MapPin,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import { cn } from '@/lib/utils'
import type { BusinessProfile } from '@/lib/agents/types'
import type { GoogleOptReport } from '@/lib/agents/googleOptAgent'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'

const COMPLETENESS_FIELDS: Array<{ key: keyof GoogleOptReport['completenessAudit']; label: string; fixRoute?: string }> = [
  { key: 'businessName', label: 'Business Name' },
  { key: 'category', label: 'Category' },
  { key: 'address', label: 'Address' },
  { key: 'phone', label: 'Phone Number' },
  { key: 'website', label: 'Website' },
  { key: 'hours', label: 'Opening Hours' },
  { key: 'description', label: 'Description', fixRoute: '/dashboard/content/gbp-posts' },
  { key: 'attributes', label: 'Attributes' },
  { key: 'products', label: 'Products' },
  { key: 'services', label: 'Services' },
  { key: 'q_and_a', label: 'Q&A' },
  { key: 'bookingLink', label: 'Booking Link' },
]

function gbpScoreColor(score: number) {
  if (score > 75) return { border: 'border-green-500', text: 'text-green-400' }
  if (score >= 50) return { border: 'border-amber-500', text: 'text-amber-400' }
  return { border: 'border-red-500', text: 'text-red-400' }
}

function statusBadge(status: string) {
  if (status === 'optimised') return 'bg-green-500/10 text-green-400'
  if (status === 'needs_work') return 'bg-amber-500/10 text-amber-400'
  return 'bg-red-500/10 text-red-400'
}

function impactBadge(impact: string) {
  if (impact === 'high') return 'bg-red-500/10 text-red-400'
  if (impact === 'medium') return 'bg-amber-500/10 text-amber-400'
  return 'bg-blue-500/10 text-blue-400'
}

function positionBadge(pos: string) {
  if (pos === 'in_pack') return 'bg-green-500/10 text-green-400'
  if (pos === 'near_pack') return 'bg-amber-500/10 text-amber-400'
  return 'bg-red-500/10 text-red-400'
}

function positionLabel(pos: string) {
  if (pos === 'in_pack') return 'In Pack'
  if (pos === 'near_pack') return 'Near Pack'
  return 'Not Ranking'
}

function getFieldValue(audit: GoogleOptReport['completenessAudit'], key: keyof GoogleOptReport['completenessAudit']): boolean {
  const val = audit[key]
  if (typeof val === 'boolean') return val
  if (typeof val === 'object' && val !== null && 'hasPhotos' in val) return val.hasPhotos
  return false
}

function getFieldFixRoute(key: string) {
  if (key === 'description') return '/dashboard/content/gbp-posts'
  if (key === 'q_and_a') return '/dashboard/content/reviews'
  if (key === 'website') return '/dashboard/content/seo'
  return null
}

export default function GoogleOptimisationPage({ params }: { params: { locale: string } }) {
  const supabase = createBrowserClient()
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [report, setReport] = useState<GoogleOptReport | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: bpData } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single()
      if (bpData) setBp(bpData as BusinessProfile)
    }
    load()
  }, [])

  const handleAnalyse = async () => {
    if (!bp) return
    setStatus('thinking')
    setReport(null)
    setError('')
    try {
      const res = await fetch(`/api/google-optimisation?businessProfileId=${bp.id}`)
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

  const handleCopyTemplate = async () => {
    if (!report?.reviewStrategy.reviewRequestTemplate) return
    await navigator.clipboard.writeText(report.reviewStrategy.reviewRequestTemplate)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const colors = report ? gbpScoreColor(report.gbpScore) : { border: '', text: '' }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Search size={22} className="text-accent" />
          <h1 className="text-2xl font-bold text-dashText">Google Optimisation</h1>
        </div>
        <p className="text-dashMuted text-sm">Analysed by Geo, your Google &amp; Local Search Expert</p>
      </div>

      {/* Analyse Button (shown when no report) */}
      {!report && (
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mb-4">
            <MapPin size={28} className="text-accent" />
          </div>
          <h2 className="text-lg font-semibold text-dashText mb-2">Analyse My Google Presence</h2>
          <p className="text-dashMuted text-sm max-w-md mb-6">
            Geo will assess your GBP completeness, local pack ranking, and build you a 30-day optimisation plan to rank higher in Google Maps and local search.
          </p>
          <div className="flex flex-col items-center gap-3">
            <AgentStatusIndicator status={status} />
            <button
              onClick={handleAnalyse}
              disabled={!bp || status === 'thinking' || status === 'generating'}
              className="px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-h-[44px]"
            >
              {(status === 'thinking' || status === 'generating') && <Loader2 size={15} className="animate-spin" />}
              Analyse My Google Presence →
            </button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        </div>
      )}

      {/* Results */}
      {report && (
        <div className="space-y-6">
          {/* Re-analyse button */}
          <div className="flex justify-end">
            <button
              onClick={handleAnalyse}
              disabled={status === 'thinking' || status === 'generating'}
              className="px-3 py-2 text-xs bg-dashSurface border border-dashSurface2 text-dashMuted hover:text-dashText rounded-lg transition-colors min-h-[44px]"
            >
              Re-analyse
            </button>
          </div>

          {/* GBP Score Circle */}
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-8 flex flex-col items-center text-center">
            <div className={cn('w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center mb-4', colors.border)}>
              <span className={cn('text-4xl font-bold', colors.text)}>{report.gbpScore}</span>
              <span className="text-xs text-dashMuted mt-1">/ 100</span>
            </div>
            <p className="text-sm font-medium text-dashText">Google Business Profile Score</p>
            <p className="text-xs text-dashMuted mt-1 max-w-xl">{report.executiveSummary}</p>
          </div>

          {/* Completeness Checklist */}
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
            <h2 className="text-sm font-semibold text-dashText mb-4">GBP Completeness Checklist</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {COMPLETENESS_FIELDS.map(field => {
                const isComplete = getFieldValue(report.completenessAudit, field.key)
                const fixRoute = getFieldFixRoute(field.key as string)
                return (
                  <div
                    key={field.key as string}
                    className={cn(
                      'rounded-lg p-3 flex items-center gap-2 border',
                      isComplete ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'
                    )}
                  >
                    {isComplete
                      ? <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                      : <XCircle size={14} className="text-red-400 shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-dashText truncate">{field.label}</p>
                      {!isComplete && fixRoute && (
                        <Link
                          href={`/${params.locale}${fixRoute}`}
                          className="text-xs text-accent hover:underline flex items-center gap-0.5 mt-0.5"
                        >
                          Fix <ExternalLink size={9} />
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
              {/* Photos special case */}
              <div
                className={cn(
                  'rounded-lg p-3 flex items-center gap-2 border',
                  report.completenessAudit.photos.hasPhotos && !report.completenessAudit.photos.needsMore
                    ? 'border-green-500/20 bg-green-500/5'
                    : report.completenessAudit.photos.hasPhotos
                    ? 'border-amber-500/20 bg-amber-500/5'
                    : 'border-red-500/20 bg-red-500/5'
                )}
              >
                {report.completenessAudit.photos.hasPhotos && !report.completenessAudit.photos.needsMore
                  ? <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                  : report.completenessAudit.photos.hasPhotos
                  ? <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                  : <XCircle size={14} className="text-red-400 shrink-0" />
                }
                <p className="text-xs text-dashText">
                  Photos{report.completenessAudit.photos.photoCount !== undefined
                    ? ` (${report.completenessAudit.photos.photoCount})`
                    : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Ranking Factors */}
          {report.rankingFactors.length > 0 && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <h2 className="text-sm font-semibold text-dashText mb-4">Ranking Factors</h2>
              <div className="space-y-3">
                {[...report.rankingFactors]
                  .sort((a, b) => {
                    const ord = { high: 0, medium: 1, low: 2 }
                    return (ord[a.impact] ?? 1) - (ord[b.impact] ?? 1)
                  })
                  .map((factor, i) => (
                    <div key={i} className="flex items-start gap-3 border-t border-dashSurface2 pt-3 first:border-0 first:pt-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-medium text-dashText">{factor.factor}</span>
                          <span className={cn('text-xs px-2 py-0.5 rounded capitalize', statusBadge(factor.status))}>
                            {factor.status.replace('_', ' ')}
                          </span>
                          <span className={cn('text-xs px-2 py-0.5 rounded capitalize', impactBadge(factor.impact))}>
                            {factor.impact} impact
                          </span>
                        </div>
                        <p className="text-xs text-dashMuted">{factor.action}</p>
                      </div>
                      {factor.contentToCreate && (
                        <Link
                          href={`/${params.locale}/dashboard/content/gbp-posts`}
                          className="shrink-0 flex items-center gap-1 text-xs text-accent hover:underline whitespace-nowrap"
                        >
                          Create with ELEVO <ExternalLink size={10} />
                        </Link>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Review Strategy */}
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
            <h2 className="text-sm font-semibold text-dashText mb-4 flex items-center gap-2">
              <Star size={15} className="text-accent" />
              Review Strategy
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-dashSurface rounded-lg p-3 border border-dashSurface2">
                <p className="text-xs text-dashMuted mb-1">Current Velocity</p>
                <p className="text-sm font-medium text-dashText">{report.reviewStrategy.currentVelocity}</p>
              </div>
              <div className="bg-dashSurface rounded-lg p-3 border border-dashSurface2">
                <p className="text-xs text-dashMuted mb-1">Target Velocity</p>
                <p className="text-sm font-medium text-accent">{report.reviewStrategy.targetVelocity}</p>
              </div>
              <div className="bg-dashSurface rounded-lg p-3 border border-dashSurface2">
                <p className="text-xs text-dashMuted mb-1">Response Rate</p>
                <p className="text-sm font-medium text-dashText">{report.reviewStrategy.responseRate}</p>
              </div>
            </div>
            {report.reviewStrategy.actions.length > 0 && (
              <ul className="space-y-1 mb-4">
                {report.reviewStrategy.actions.map((a, i) => (
                  <li key={i} className="text-xs text-dashMuted flex items-start gap-1.5">
                    <span className="text-accent mt-0.5 shrink-0">→</span>{a}
                  </li>
                ))}
              </ul>
            )}
            {report.reviewStrategy.reviewRequestTemplate && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-dashMuted uppercase tracking-wide">Review Request Template</p>
                  <button
                    onClick={handleCopyTemplate}
                    className="flex items-center gap-1 text-xs text-dashMuted hover:text-dashText transition-colors min-h-[44px] px-2"
                  >
                    {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={report.reviewStrategy.reviewRequestTemplate}
                  className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-3 text-xs text-dashText resize-none focus:outline-none"
                  rows={4}
                />
              </div>
            )}
          </div>

          {/* Local Pack Opportunities */}
          {report.localPackOpportunities.length > 0 && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <h2 className="text-sm font-semibold text-dashText mb-4">Local Pack Opportunities</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dashSurface2">
                      {['Keyword', 'Est. Search Volume', 'Position', 'Action to Improve'].map(h => (
                        <th key={h} className="text-left text-xs text-dashMuted font-medium pb-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.localPackOpportunities.map((opp, i) => (
                      <tr key={i} className="border-t border-dashSurface2">
                        <td className="py-3 pr-4 text-xs text-dashText font-medium">{opp.keyword}</td>
                        <td className="py-3 pr-4 text-xs text-dashMuted">{opp.estimatedSearchVolume}</td>
                        <td className="py-3 pr-4">
                          <span className={cn('text-xs px-2 py-0.5 rounded', positionBadge(opp.currentPosition))}>
                            {positionLabel(opp.currentPosition)}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-dashMuted">{opp.actionToImprove}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 30-Day Plan */}
          {report.thirtyDayPlan.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-dashText mb-3">30-Day Plan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {report.thirtyDayPlan.map((week, i) => (
                  <div key={i} className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
                    <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-3">Week {week.week}</p>
                    <ul className="space-y-2 mb-3">
                      {week.actions.map((action, j) => (
                        <li key={j} className="text-xs text-dashMuted flex items-start gap-1.5">
                          <span className="text-accent mt-0.5 shrink-0">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-dashSurface2 pt-2">
                      <p className="text-xs text-dashText font-medium">{week.expectedImpact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Google Posts Strategy */}
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
            <h2 className="text-sm font-semibold text-dashText mb-4">Google Posts Strategy</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-dashMuted mb-1">Recommended Frequency</p>
                <p className="text-sm font-medium text-dashText">{report.googlePostsStrategy.recommendedFrequency}</p>
              </div>
              <div>
                <p className="text-xs text-dashMuted mb-1">Best Types</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {report.googlePostsStrategy.bestTypes.map((type, i) => (
                    <span key={i} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">{type}</span>
                  ))}
                </div>
              </div>
            </div>
            {report.googlePostsStrategy.nextPostSuggestion && (
              <div className="bg-dashSurface rounded-lg p-4 border border-dashSurface2 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-dashMuted font-medium mb-1">Next Post Suggestion</p>
                  <p className="text-sm text-dashText">{report.googlePostsStrategy.nextPostSuggestion}</p>
                </div>
                <Link
                  href={`/${params.locale}/dashboard/content/gbp-posts`}
                  className="shrink-0 flex items-center gap-1 text-xs bg-accent text-white px-3 py-2 rounded-lg hover:bg-accentLight transition-colors min-h-[44px]"
                >
                  Generate Post <ExternalLink size={10} />
                </Link>
              </div>
            )}
          </div>

          {/* AI Search Optimisation */}
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
            <h2 className="text-sm font-semibold text-dashText mb-1 flex items-center gap-2">
              <Zap size={15} className="text-accent" />
              AI Search Optimisation
            </h2>
            <p className="text-xs text-dashMuted mb-4">
              Visibility: <span className={cn('font-medium capitalize', {
                'text-green-400': report.aiSearchOptimisation.currentAIVisibility === 'high',
                'text-amber-400': report.aiSearchOptimisation.currentAIVisibility === 'medium',
                'text-red-400': report.aiSearchOptimisation.currentAIVisibility === 'low',
                'text-dashMuted': report.aiSearchOptimisation.currentAIVisibility === 'unknown',
              })}>
                {report.aiSearchOptimisation.currentAIVisibility}
              </span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold text-dashMuted uppercase tracking-wide mb-2">Content Structure</p>
                <ul className="space-y-1">
                  {report.aiSearchOptimisation.contentStructureRecommendations.map((r, i) => (
                    <li key={i} className="text-xs text-dashMuted flex items-start gap-1.5">
                      <span className="text-accent mt-0.5 shrink-0">•</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-dashMuted uppercase tracking-wide mb-2">FAQ Topics</p>
                <ul className="space-y-1">
                  {report.aiSearchOptimisation.faqTopics.map((topic, i) => (
                    <li key={i} className="text-xs text-dashMuted flex items-start gap-1.5">
                      <span className="text-accent mt-0.5 shrink-0">•</span>{topic}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-dashMuted uppercase tracking-wide mb-2">Schema to Add</p>
                <div className="flex flex-wrap gap-1">
                  {report.aiSearchOptimisation.schemaToAdd.map((schema, i) => (
                    <span key={i} className="text-xs bg-dashSurface border border-dashSurface2 text-dashMuted px-2 py-0.5 rounded">
                      {schema}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Competitor Insights */}
          {report.competitorGBPInsights.length > 0 && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <h2 className="text-sm font-semibold text-dashText mb-4">Competitor Insights</h2>
              <div className="space-y-4">
                {report.competitorGBPInsights.map((insight, i) => (
                  <div key={i} className="border-t border-dashSurface2 pt-4 first:border-0 first:pt-0">
                    <p className="text-sm font-medium text-dashText mb-3">{insight.competitorType}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-red-400 font-medium mb-1">Their Strengths</p>
                        <ul className="space-y-1">
                          {insight.theirStrengths.map((s, j) => (
                            <li key={j} className="text-xs text-dashMuted flex items-start gap-1.5">
                              <span className="text-red-400 mt-0.5 shrink-0">•</span>{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs text-green-400 font-medium mb-1">Your Advantage</p>
                        <ul className="space-y-1">
                          {insight.yourAdvantage.map((a, j) => (
                            <li key={j} className="text-xs text-dashMuted flex items-start gap-1.5">
                              <span className="text-green-400 mt-0.5 shrink-0">→</span>{a}
                            </li>
                          ))}
                        </ul>
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
