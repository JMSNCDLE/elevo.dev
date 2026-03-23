'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  RefreshCw, Loader2, Zap, TrendingUp, AlertTriangle,
  Bot, ChevronRight, Star, CheckCircle2, Clock, BarChart2,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { AILandscapeReport } from '@/lib/agents/aiUpdateAgent'
import { AGENT_PERSONAS } from '@/lib/agents/agentPersonas'

type Status = 'idle' | 'scanning' | 'done' | 'error'

const PRIORITY_CONFIG = {
  immediate: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Immediate' },
  soon: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Soon' },
  monitor: { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Monitor' },
}

const URGENCY_CONFIG = {
  urgent: { color: 'text-red-400', label: 'URGENT' },
  high: { color: 'text-orange-400', label: 'HIGH' },
  medium: { color: 'text-yellow-400', label: 'MEDIUM' },
}

const THREAT_CONFIG = {
  low: { color: 'text-green-400', label: 'Low' },
  medium: { color: 'text-yellow-400', label: 'Medium' },
  high: { color: 'text-red-400', label: 'High' },
}

const MOMENTUM_CONFIG = {
  rising: { color: 'text-green-400', emoji: '📈' },
  peak: { color: 'text-amber-400', emoji: '🏔️' },
  declining: { color: 'text-red-400', emoji: '📉' },
}

export default function AdminUpdatesPage() {
  const locale = useLocale()
  const router = useRouter()
  const supabase = createBrowserClient()
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<AILandscapeReport | null>(null)
  const [activeTab, setActiveTab] = useState<'models' | 'tools' | 'trends' | 'competitors' | 'phase' | 'agents'>('models')

  const checkAdmin = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push(`/${locale}/login`); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
      router.push(`/${locale}/dashboard`)
    }
  }, [supabase, router, locale])

  useEffect(() => {
    checkAdmin()
  }, [checkAdmin])

  async function runScan() {
    setStatus('scanning')
    setError(null)
    try {
      const res = await fetch('/api/admin/updates/scan', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Scan failed')
      setReport(data)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed')
      setStatus('error')
    }
  }

  const TABS = [
    { id: 'models', label: 'New Models', count: report?.newModels.length },
    { id: 'tools', label: 'New Tools', count: report?.newTools.length },
    { id: 'trends', label: 'Market Trends', count: report?.marketTrends.length },
    { id: 'competitors', label: 'Competitors', count: report?.competitorUpdates.length },
    { id: 'phase', label: 'Next Phase', count: null },
    { id: 'agents', label: 'Agent Upgrades', count: report?.agentModelUpdates.length },
  ]

  return (
    <div className="min-h-screen bg-dashBg">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <RefreshCw size={20} className="text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-dashText">ELEVO Update™</h1>
              <p className="text-sm text-dashMuted">Pulse — Always the most advanced AI on the market</p>
            </div>
          </div>
          <button
            onClick={runScan}
            disabled={status === 'scanning'}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight disabled:opacity-50 transition-colors"
          >
            {status === 'scanning' ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {status === 'scanning' ? 'Scanning AI landscape...' : 'Run Weekly Scan →'}
          </button>
        </div>

        {status === 'scanning' && (
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-8 text-center">
            <Loader2 size={32} className="animate-spin text-accent mx-auto mb-3" />
            <p className="text-dashText font-medium">Scanning AI landscape...</p>
            <p className="text-sm text-dashMuted mt-1">Checking Anthropic, OpenAI, Google, Meta releases · Monitoring Jasper, Copy.ai, HubSpot AI · Analysing market trends</p>
          </div>
        )}

        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400 mb-4">{error}</div>}

        {report && (
          <div className="space-y-6">
            {/* Summary card */}
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-dashText">Weekly AI Landscape Summary</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-dashMuted">Score:</span>
                  <span className={cn('text-2xl font-black', report.weeklyScore >= 70 ? 'text-red-400' : report.weeklyScore >= 40 ? 'text-amber-400' : 'text-green-400')}>
                    {report.weeklyScore}
                  </span>
                  <span className="text-xs text-dashMuted">/100</span>
                </div>
              </div>
              <p className="text-sm text-dashMuted">{report.summary}</p>
              <div className="grid grid-cols-4 gap-3 mt-4">
                <div className="bg-dashSurface2/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-dashText">{report.newModels.length}</p>
                  <p className="text-xs text-dashMuted">New Models</p>
                </div>
                <div className="bg-dashSurface2/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-dashText">{report.newTools.length}</p>
                  <p className="text-xs text-dashMuted">New Tools</p>
                </div>
                <div className="bg-dashSurface2/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-dashText">{report.marketTrends.length}</p>
                  <p className="text-xs text-dashMuted">Market Trends</p>
                </div>
                <div className="bg-dashSurface2/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-dashText">{report.competitorUpdates.length}</p>
                  <p className="text-xs text-dashMuted">Competitor Moves</p>
                </div>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex gap-1 bg-dashSurface rounded-xl p-1 w-fit flex-wrap">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as typeof activeTab)}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', activeTab === t.id ? 'bg-accent text-white' : 'text-dashMuted hover:text-dashText')}
                >
                  {t.label}
                  {t.count !== null && t.count !== undefined && (
                    <span className={cn('text-xs px-1.5 py-0.5 rounded-full', activeTab === t.id ? 'bg-white/20' : 'bg-dashSurface2')}>{t.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* New Models */}
            {activeTab === 'models' && (
              <div className="space-y-3">
                {report.newModels.length === 0 && <p className="text-dashMuted text-sm text-center py-8">No new model releases found this week.</p>}
                {report.newModels.map((model, i) => {
                  const pc = PRIORITY_CONFIG[model.priority]
                  return (
                    <div key={i} className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="font-semibold text-dashText">{model.name}</h3>
                          <p className="text-xs text-dashMuted">{model.company} · {model.releaseDate}</p>
                        </div>
                        <span className={cn('text-xs font-semibold px-2 py-1 rounded-full shrink-0', pc.color, pc.bg)}>{pc.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {model.capabilities.map((cap, j) => (
                          <span key={j} className="text-xs bg-dashSurface2 text-dashMuted px-2 py-0.5 rounded-full">{cap}</span>
                        ))}
                      </div>
                      <p className="text-xs text-dashMuted mb-2">{model.relevanceToELEVO}</p>
                      <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                        <p className="text-xs font-semibold text-accent mb-1">Integration Suggestion</p>
                        <p className="text-xs text-dashText">{model.integrationSuggestion}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* New Tools */}
            {activeTab === 'tools' && (
              <div className="space-y-3">
                {report.newTools.length === 0 && <p className="text-dashMuted text-sm text-center py-8">No significant new tools found this week.</p>}
                {report.newTools.map((tool, i) => (
                  <div key={i} className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold text-dashText">{tool.name}</h3>
                        <p className="text-xs text-dashMuted">{tool.category}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {tool.competitorUsing && <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Competitor using</span>}
                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', tool.shouldELEVOIntegrate ? 'text-green-400 bg-green-500/10' : 'text-dashMuted bg-dashSurface2')}>
                          {tool.shouldELEVOIntegrate ? '✓ Integrate' : 'Skip'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-dashText mb-2">{tool.whatItDoes}</p>
                    <p className="text-xs text-dashMuted">{tool.reason}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Market Trends */}
            {activeTab === 'trends' && (
              <div className="space-y-3">
                {report.marketTrends.map((trend, i) => {
                  const mc = MOMENTUM_CONFIG[trend.momentum]
                  return (
                    <div key={i} className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-dashText">{mc.emoji} {trend.trend}</h3>
                        <span className={cn('text-xs font-semibold shrink-0', mc.color)}>{trend.momentum.charAt(0).toUpperCase() + trend.momentum.slice(1)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-dashSurface2/50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-dashMuted mb-1">Opportunity for ELEVO</p>
                          <p className="text-xs text-dashText">{trend.opportunityForELEVO}</p>
                        </div>
                        <div className="bg-dashSurface2/50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-dashMuted mb-1">Urgency</p>
                          <p className="text-xs text-dashText">{trend.urgency}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Competitors */}
            {activeTab === 'competitors' && (
              <div className="space-y-3">
                {report.competitorUpdates.map((comp, i) => {
                  const tc = THREAT_CONFIG[comp.threat]
                  return (
                    <div key={i} className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-dashText">{comp.competitor}</h3>
                        <span className={cn('text-xs font-semibold shrink-0', tc.color)}>Threat: {tc.label}</span>
                      </div>
                      <p className="text-xs text-dashText mb-3">{comp.update}</p>
                      <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                        <p className="text-xs font-semibold text-accent mb-1">ELEVO Response</p>
                        <p className="text-xs text-dashText">{comp.response}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Recommended Next Phase */}
            {activeTab === 'phase' && (
              <div className="space-y-4">
                <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-dashText">{report.recommendedPhase.title}</h3>
                      <p className="text-sm text-dashMuted mt-1">Recommended next development phase</p>
                    </div>
                    {report.recommendedPhase.priority in URGENCY_CONFIG && (
                      <span className={cn('text-sm font-bold shrink-0', URGENCY_CONFIG[report.recommendedPhase.priority as keyof typeof URGENCY_CONFIG].color)}>
                        {URGENCY_CONFIG[report.recommendedPhase.priority as keyof typeof URGENCY_CONFIG].label}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-dashMuted mb-2">Features to build</p>
                      <ul className="space-y-2">
                        {report.recommendedPhase.features.map((f, i) => (
                          <li key={i} className="text-sm text-dashText flex items-start gap-2">
                            <ChevronRight size={14} className="text-accent mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-dashSurface2/50 rounded-lg p-3">
                        <p className="text-xs text-dashMuted mb-1">Reason</p>
                        <p className="text-xs text-dashText">{report.recommendedPhase.reason}</p>
                      </div>
                      <div className="bg-dashSurface2/50 rounded-lg p-3">
                        <p className="text-xs text-dashMuted mb-1">Estimated Impact</p>
                        <p className="text-xs text-dashText">{report.recommendedPhase.estimatedImpact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Agent Model Checker */}
            {activeTab === 'agents' && (
              <div className="space-y-4">
                <p className="text-sm text-dashMuted">Current ELEVO agents and Pulse's upgrade recommendations.</p>
                <div className="bg-dashCard rounded-xl border border-dashSurface2 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dashSurface2">
                        <th className="text-left text-xs text-dashMuted px-4 py-3">Agent</th>
                        <th className="text-left text-xs text-dashMuted px-4 py-3">Current Model</th>
                        <th className="text-left text-xs text-dashMuted px-4 py-3">Recommended</th>
                        <th className="text-left text-xs text-dashMuted px-4 py-3">Performance Gain</th>
                      </tr>
                    </thead>
                    <tbody>
                      {AGENT_PERSONAS.map((agent, i) => {
                        // Determine current model
                        const currentModel = ['Max', 'Drake', 'Pulse', 'Guard'].includes(agent.characterName)
                          ? 'claude-opus-4-6'
                          : 'claude-sonnet-4-6'

                        // Look for a recommendation in the report
                        const rec = report.agentModelUpdates.find(r =>
                          r.agentName.toLowerCase().includes(agent.characterName.toLowerCase()) ||
                          r.agentName.toLowerCase().includes(agent.brandName.toLowerCase())
                        )

                        return (
                          <tr key={i} className="border-b border-dashSurface2/50 last:border-0">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span>{agent.emoji}</span>
                                <div>
                                  <p className="text-xs font-medium text-dashText">{agent.brandName}</p>
                                  <p className="text-xs text-dashMuted">{agent.characterName}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-dashText font-mono">{rec?.currentModel ?? currentModel}</span>
                            </td>
                            <td className="px-4 py-3">
                              {rec ? (
                                <span className={cn('text-xs font-mono', rec.recommendedModel !== (rec.currentModel ?? currentModel) ? 'text-green-400' : 'text-dashMuted')}>
                                  {rec.recommendedModel}
                                </span>
                              ) : (
                                <span className="text-xs text-dashMuted">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-dashMuted">{rec?.performanceGain ?? '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {status === 'idle' && !report && (
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-8 text-center">
            <RefreshCw size={40} className="text-accent/40 mx-auto mb-3" />
            <p className="text-dashText font-medium mb-2">No scan data yet</p>
            <p className="text-sm text-dashMuted">Click &quot;Run Weekly Scan&quot; to analyse the AI landscape and get recommendations for the next ELEVO phase.</p>
          </div>
        )}
      </div>
    </div>
  )
}
