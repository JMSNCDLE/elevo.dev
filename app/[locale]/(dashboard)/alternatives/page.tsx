'use client'

import { useLocale } from 'next-intl'

import { useState, useEffect } from 'react'
import { Loader2, Zap, TrendingDown, AlertCircle, ChevronRight, ExternalLink, CheckCircle2, XCircle, Clock, Wrench } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import CopyButton from '@/components/shared/CopyButton'
import { cn } from '@/lib/utils'
import type { BusinessProfile } from '@/lib/agents/types'
import type { AlternativesReport } from '@/lib/agents/alternativesAgent'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'
type Category = 'software' | 'supplier' | 'marketing' | 'staffing' | 'process' | 'general'

const CATEGORIES: Array<{ value: Category; label: string }> = [
  { value: 'software', label: 'Software' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'staffing', label: 'Staffing' },
  { value: 'process', label: 'Process' },
  { value: 'general', label: 'General' },
]

const EFFORT_CONFIG: Record<string, { label: string; color: string }> = {
  easy: { label: 'Easy', color: 'text-green-400 bg-green-400/10' },
  medium: { label: 'Medium', color: 'text-amber-400 bg-amber-400/10' },
  hard: { label: 'Hard', color: 'text-red-400 bg-red-400/10' },
}

export default function AlternativesPage({}: {  }) {
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [plan, setPlan] = useState<string>('trial')
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [situation, setSituation] = useState('')
  const [category, setCategory] = useState<Category>('general')
  const [currentCost, setCurrentCost] = useState<string>('')
  const [report, setReport] = useState<AlternativesReport | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: prof }, { data: bpData }] = await Promise.all([
        supabase.from('profiles').select('plan').eq('id', user.id).single(),
        supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_primary', true)
          .single(),
      ])
      if (prof) setPlan(prof.plan)
      if (bpData) setBp(bpData as BusinessProfile)
    })()
  }, [])

  const handleFind = async () => {
    if (!bp || !situation.trim()) return
    setStatus('thinking')
    setReport(null)
    setError(null)
    try {
      const res = await fetch('/api/alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfileId: bp.id,
          situation,
          category,
          currentCost: currentCost ? parseFloat(currentCost) : undefined,
          locale: locale,
        }),
      })
      setStatus('generating')
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      setReport(data.result)
      setStatus('done')
    } catch {
      setStatus('error')
      setError('Hugo ran into an issue. Please try again.')
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dashText">Alternative Solutions</h1>
        <p className="text-dashMuted text-sm mt-1">
          Hugo finds better tools, suppliers, and strategies for your business
        </p>
      </div>

      {/* Input Card */}
      <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 mb-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-dashMuted mb-1.5">
            What&apos;s not working or too expensive? <span className="text-red-400">*</span>
          </label>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            rows={4}
            placeholder="Describe what's not working or too expensive... e.g. Our current booking software costs £180/month but we only use 20% of the features. It's slow and support is terrible."
            className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted resize-none focus:outline-none focus:ring-2 focus:ring-accent min-h-[100px]"
          />
        </div>

        {/* Category Chips */}
        <div>
          <label className="block text-sm font-medium text-dashMuted mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[36px]',
                  category === cat.value
                    ? 'bg-accent text-white'
                    : 'bg-dashSurface border border-dashSurface2 text-dashMuted hover:text-dashText hover:border-accent/40'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional cost */}
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-dashMuted mb-1.5">
            Current monthly cost (£) <span className="text-dashMuted text-xs">(optional)</span>
          </label>
          <input
            type="number"
            value={currentCost}
            onChange={(e) => setCurrentCost(e.target.value)}
            placeholder="e.g. 180"
            min="0"
            className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-1">
          <AgentStatusIndicator status={status} />
          <button
            onClick={handleFind}
            disabled={!situation.trim() || status === 'thinking' || status === 'generating' || !bp}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {(status === 'thinking' || status === 'generating') && (
              <Loader2 size={15} className="animate-spin" />
            )}
            Find Alternatives →
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {report && (
        <div className="space-y-6">
          {/* Problem Summary */}
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
            <h2 className="text-sm font-semibold text-dashText mb-3 flex items-center gap-2">
              <AlertCircle size={15} className="text-amber-400" />
              Problem Summary
            </h2>
            <p className="text-dashText text-sm mb-3">{report.problemSummary}</p>
            {report.rootCause && (
              <div className="bg-amber-400/5 border border-amber-400/20 rounded-lg px-4 py-3">
                <p className="text-xs font-semibold text-amber-400 mb-1">Root Cause</p>
                <p className="text-sm text-dashMuted">{report.rootCause}</p>
              </div>
            )}
          </div>

          {/* Alternatives Grid */}
          {report.alternatives.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-dashText mb-3">
                {report.alternatives.length} Alternative{report.alternatives.length !== 1 ? 's' : ''} Found
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.alternatives.map((alt, i) => {
                  const effortConfig = EFFORT_CONFIG[alt.implementationEffort] || EFFORT_CONFIG.medium
                  return (
                    <div
                      key={i}
                      className="bg-dashCard rounded-xl border border-dashSurface2 p-5 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-dashText">{alt.name}</p>
                          <p className="text-xs text-dashMuted mt-0.5">{alt.type}</p>
                        </div>
                        <span
                          className={cn(
                            'text-xs font-medium px-2.5 py-1 rounded-full shrink-0',
                            effortConfig.color
                          )}
                        >
                          {effortConfig.label}
                        </span>
                      </div>

                      <div className="flex gap-4 text-sm">
                        <div>
                          <p className="text-xs text-dashMuted mb-0.5">Cost</p>
                          <p className="font-medium text-dashText">{alt.estimatedCost}</p>
                        </div>
                        {alt.estimatedSaving && (
                          <div>
                            <p className="text-xs text-dashMuted mb-0.5">Saving</p>
                            <p className="font-medium text-green-400">{alt.estimatedSaving}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-dashMuted mb-0.5">Time to Switch</p>
                          <p className="font-medium text-dashText flex items-center gap-1">
                            <Clock size={11} />
                            {alt.timeToSwitch}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {alt.pros.length > 0 && (
                          <div className="space-y-1">
                            {alt.pros.slice(0, 3).map((pro, j) => (
                              <div key={j} className="flex items-start gap-1.5 text-xs text-dashMuted">
                                <CheckCircle2 size={11} className="text-green-400 mt-0.5 shrink-0" />
                                <span>{pro}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {alt.cons.length > 0 && (
                          <div className="space-y-1">
                            {alt.cons.slice(0, 3).map((con, j) => (
                              <div key={j} className="flex items-start gap-1.5 text-xs text-dashMuted">
                                <XCircle size={11} className="text-red-400 mt-0.5 shrink-0" />
                                <span>{con}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-dashMuted italic">{alt.verdict}</p>

                      {alt.actionLink && (
                        <a
                          href={alt.actionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accentLight transition-colors"
                        >
                          Learn more <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recommendation */}
          {report.recommendation.topPick && (
            <div className="bg-dashCard rounded-xl border-2 border-accent/40 p-6 space-y-4">
              <h2 className="text-sm font-semibold text-accent flex items-center gap-2">
                <ChevronRight size={15} />
                Top Recommendation
              </h2>
              <div>
                <p className="text-lg font-bold text-dashText">{report.recommendation.topPick}</p>
                <p className="text-sm text-dashMuted mt-1">{report.recommendation.rationale}</p>
              </div>
              {report.recommendation.migrationPlan.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-dashMuted uppercase tracking-wide mb-2">
                    Migration Plan
                  </p>
                  <ol className="space-y-2">
                    {report.recommendation.migrationPlan.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-dashText">
                        <span className="w-5 h-5 bg-accent/20 text-accent rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Cost Saving Summary */}
          {(report.costSavingSummary.currentAnnualCost > 0 ||
            report.costSavingSummary.annualSaving > 0) && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
              <h2 className="text-sm font-semibold text-dashText mb-4 flex items-center gap-2">
                <TrendingDown size={15} className="text-green-400" />
                Cost Saving Summary
              </h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-dashSurface rounded-lg p-4">
                  <p className="text-xs text-dashMuted mb-1">Current (Annual)</p>
                  <p className="text-xl font-bold text-dashText">
                    £{report.costSavingSummary.currentAnnualCost.toLocaleString()}
                  </p>
                </div>
                <div className="bg-dashSurface rounded-lg p-4">
                  <p className="text-xs text-dashMuted mb-1">Recommended (Annual)</p>
                  <p className="text-xl font-bold text-dashText">
                    £{report.costSavingSummary.recommendedAnnualCost.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-400/5 border border-green-400/20 rounded-lg p-4">
                  <p className="text-xs text-dashMuted mb-1">Annual Saving</p>
                  <p className="text-xl font-bold text-green-400">
                    £{report.costSavingSummary.annualSaving.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Win */}
          {report.quickWin && (
            <div className="bg-accent/10 border border-accent/30 rounded-xl p-5 flex items-start gap-3">
              <Zap size={18} className="text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-accent mb-1">Quick Win — Act Today</p>
                <p className="text-sm text-dashText">{report.quickWin}</p>
              </div>
              <div className="ml-auto shrink-0">
                <CopyButton text={report.quickWin} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
