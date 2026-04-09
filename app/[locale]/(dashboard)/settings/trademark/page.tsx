'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'
import {
  Shield, Loader2, Globe, AlertTriangle, CheckCircle, ExternalLink,
  ChevronRight, Copy, Check, Info
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import ActionExplanation from '@/components/shared/ActionExplanation'
import CopyButton from '@/components/shared/CopyButton'
import { cn } from '@/lib/utils'
import type { TrademarkReport, TrademarkJurisdiction } from '@/lib/agents/trademarkAgent'

type Status = 'idle' | 'generating' | 'done' | 'error'
type Tab = 'jurisdictions' | 'classes' | 'filing' | 'protection' | 'monitoring'

const JURISDICTIONS = [
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'EU', name: 'European Union', flag: '🇪🇺' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
]

const RISK_COLORS: Record<string, string> = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-500/10 text-red-400 border-red-500/30',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  low: 'bg-dashBg text-dashMuted border-dashSurface2',
}

export default function TrademarkPage() {
  const locale = useLocale()
  const supabase = createBrowserClient()

  const [brandName, setBrandName] = useState('ELEVO AI')
  const [description, setDescription] = useState('AI-powered business management platform with 60+ AI agents for local businesses')
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>(['UK', 'EU', 'US'])
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<TrademarkReport | null>(null)
  const [tab, setTab] = useState<Tab>('jurisdictions')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('role').eq('id', user.id).single().then(({ data }) => {
        setIsAdmin(data?.role === 'admin')
      })
    })
  }, [supabase])

  const toggleJurisdiction = (code: string) => {
    setSelectedJurisdictions(prev =>
      prev.includes(code) ? prev.filter(j => j !== code) : [...prev, code]
    )
  }

  async function runCheck() {
    setStatus('generating')
    setError(null)
    try {
      const res = await fetch('/api/trademark/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName, description, jurisdictions: selectedJurisdictions, locale }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Check failed')
      setReport(data.report)
      setStatus('done')
      setTab('jurisdictions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check failed')
      setStatus('error')
    }
  }

  const ScoreBar = ({ score }: { score: number }) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-dashSurface2 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', score >= 70 ? 'bg-green-400' : score >= 40 ? 'bg-yellow-400' : 'bg-red-400')}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={cn('text-xs font-bold w-8 text-right', score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400')}>
        {score}%
      </span>
    </div>
  )

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-dashText">ELEVO Guard™</h1>
          <p className="text-dashMuted text-sm">Trademark availability scanner + brand protection strategy. Admin only.</p>
        </div>
      </div>

      {!isAdmin && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={16} className="text-yellow-400 shrink-0" />
          <p className="text-sm text-yellow-400">ELEVO Guard is available to administrators only. Contact James to run a trademark check.</p>
        </div>
      )}

      {/* Form */}
      {status === 'idle' && isAdmin && (
        <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-xs text-dashMuted mb-1.5">Brand Name</label>
            <input
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
              className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
              placeholder="e.g. ELEVO AI"
            />
          </div>
          <div>
            <label className="block text-xs text-dashMuted mb-1.5">Brand Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent resize-none"
              placeholder="Describe what the brand covers..."
            />
          </div>
          <div>
            <label className="block text-xs text-dashMuted mb-2">Jurisdictions</label>
            <div className="flex gap-2 flex-wrap">
              {JURISDICTIONS.map(j => (
                <button
                  key={j.code}
                  onClick={() => toggleJurisdiction(j.code)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                    selectedJurisdictions.includes(j.code)
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-dashSurface2 text-dashMuted hover:border-accent/40'
                  )}
                >
                  <span>{j.flag}</span>
                  {j.name}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={runCheck}
            disabled={!brandName || selectedJurisdictions.length === 0}
            className="w-full py-2.5 bg-accent text-white font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            Run ELEVO Guard Trademark Check →
          </button>
        </div>
      )}

      {status === 'generating' && (
        <div className="bg-dashCard border border-dashSurface2 rounded-xl p-8 flex flex-col items-center gap-4">
          <AgentStatusIndicator status="thinking" agentName="ELEVO Guard" message="Searching trademark databases across all jurisdictions..." />
        </div>
      )}

      {status === 'error' && error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
          <button onClick={() => setStatus('idle')} className="ml-3 underline">Try again</button>
        </div>
      )}

      {status === 'done' && report && (
        <div className="space-y-4">
          {/* Summary card */}
          <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-lg font-bold text-dashText">{report.brandName}</p>
                <p className="text-xs text-dashMuted mt-0.5">{report.description}</p>
              </div>
              <div className={cn('px-3 py-1.5 rounded-lg border text-xs font-bold uppercase', PRIORITY_COLORS[report.overallRisk === 'low' ? 'low' : report.overallRisk === 'high' ? 'urgent' : 'medium'])}>
                {report.overallRisk} risk
              </div>
            </div>
            <p className="text-sm text-dashMuted">{report.summary}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-dashCard border border-dashSurface2 rounded-xl p-1 overflow-x-auto">
            {([
              { key: 'jurisdictions', label: 'Jurisdictions' },
              { key: 'classes', label: 'Classes' },
              { key: 'filing', label: 'Filing Order' },
              { key: 'protection', label: 'Brand Moat' },
              { key: 'monitoring', label: 'Monitoring' },
            ] as Array<{ key: Tab; label: string }>).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn('px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors', tab === t.key ? 'bg-accent text-white' : 'text-dashMuted hover:text-dashText')}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5 space-y-4">
            {tab === 'jurisdictions' && (
              <div className="space-y-3">
                {report.jurisdictions.map(j => (
                  <div key={j.code} className="bg-dashBg rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-dashText">{j.name}</span>
                        <span className={cn('text-xs font-medium', RISK_COLORS[j.risk])}>
                          {j.risk} risk
                        </span>
                        <span className={cn('text-xs px-2 py-0.5 rounded border', PRIORITY_COLORS[j.filingPriority])}>
                          {j.filingPriority}
                        </span>
                      </div>
                      <a
                        href={j.officeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-accent hover:underline"
                      >
                        Search {j.office.split(' ').slice(-1)} <ExternalLink size={10} />
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-dashMuted mb-1">Availability score</p>
                      <ScoreBar score={j.availabilityScore} />
                    </div>
                    {j.conflicts.length > 0 && (
                      <div>
                        <p className="text-xs text-red-400 font-medium mb-1">⚠ Potential conflicts</p>
                        {j.conflicts.map((c, i) => (
                          <p key={i} className="text-xs text-dashMuted">• {c}</p>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-4 text-xs text-dashMuted">
                      <span>💰 {j.estimatedCost}</span>
                      <span>⏱ {j.estimatedTimeline}</span>
                      <span>Classes: {j.recommendedClasses.join(', ')}</span>
                    </div>
                    {j.notes && <p className="text-xs text-dashMuted italic">{j.notes}</p>}
                  </div>
                ))}
              </div>
            )}

            {tab === 'classes' && (
              <div className="space-y-3">
                {report.recommendedClasses.map(cls => (
                  <div key={cls.number} className="bg-dashBg rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-accent">Class {cls.number}</span>
                      <div className="flex-1 h-1 bg-dashSurface2 rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${cls.relevanceScore}%` }} />
                      </div>
                      <span className="text-xs text-dashMuted">{cls.relevanceScore}% relevant</span>
                    </div>
                    <p className="text-sm text-dashText">{cls.description}</p>
                    <p className="text-xs text-dashMuted">{cls.whyNeeded}</p>
                    <div className="flex gap-2 flex-wrap">
                      {cls.examples.map((ex, i) => (
                        <span key={i} className="text-xs bg-dashCard text-dashMuted px-2 py-0.5 rounded border border-dashSurface2">{ex}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'filing' && (
              <div className="space-y-3">
                {report.filingOrder.map(step => (
                  <div key={step.step} className="bg-dashBg rounded-lg p-4 flex items-start gap-4">
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-accent">{step.step}</span>
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-semibold text-dashText">{step.jurisdiction}</p>
                      <p className="text-xs text-dashMuted">{step.action}</p>
                      <div className="flex gap-4 text-xs text-dashMuted pt-1">
                        <span>⏱ {step.timeline}</span>
                        <span>💰 {step.cost}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {report.interimProtection.length > 0 && (
                  <div className="bg-dashBg rounded-lg p-4">
                    <p className="text-xs font-medium text-dashMuted mb-2">Interim Protection (do these NOW)</p>
                    {report.interimProtection.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1.5">
                        <CheckCircle size={12} className="text-green-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-dashText">{item}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'protection' && (
              <div className="space-y-3">
                {report.brandMoat.map((m, i) => (
                  <div key={i} className="bg-dashBg rounded-lg p-4 space-y-1.5">
                    <p className="text-sm font-semibold text-dashText">{m.strategy}</p>
                    <p className="text-xs text-dashMuted">{m.description}</p>
                    <div className="flex gap-4 text-xs text-dashMuted pt-1">
                      <span>⏱ {m.timeToImplement}</span>
                      <span>💰 {m.cost}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'monitoring' && (
              <div className="space-y-4">
                {[
                  { label: 'Search Terms to Monitor', items: report.monitoring.searchTerms },
                  { label: 'Monitoring Platforms', items: report.monitoring.alertPlatforms },
                  { label: 'Domain Variants to Register', items: report.monitoring.domainVariants },
                  { label: 'Common Misspellings', items: report.monitoring.commonMisspellings },
                  { label: 'Social Handles to Claim', items: report.monitoring.socialHandles },
                ].map(group => (
                  <div key={group.label}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-dashMuted">{group.label}</p>
                      <CopyButton text={group.items.join('\n')} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map(item => (
                        <span key={item} className="text-xs bg-dashBg text-dashMuted px-2 py-0.5 rounded border border-dashSurface2">{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {report.legalDisclaimer && (
            <div className="flex items-start gap-2 bg-dashCard border border-dashSurface2 rounded-xl p-4">
              <Info size={14} className="text-dashMuted shrink-0 mt-0.5" />
              <p className="text-xs text-dashMuted">{report.legalDisclaimer}</p>
            </div>
          )}

          <ActionExplanation
            title="ELEVO Guard report complete"
            description="File in the order shown in the Filing tab. Use ™ symbol immediately. Register all domain variants this week."
          />

          <button onClick={() => { setStatus('idle'); setReport(null) }} className="text-sm text-dashMuted hover:text-dashText">
            ← Run another check
          </button>
        </div>
      )}
    </div>
  )
}
