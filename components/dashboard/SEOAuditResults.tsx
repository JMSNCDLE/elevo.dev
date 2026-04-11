'use client'

import { useState } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, BookOpen, Target, TrendingUp, Shield, Zap, Smartphone, Award } from 'lucide-react'
import type { ComprehensiveAuditResult, KeywordAnalysisRow } from '@/lib/agents/seoAgent'

type Tab = 'overview' | 'keywords' | 'technical' | 'content' | 'competitors'

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Overview', icon: Award },
  { key: 'keywords', label: 'Keywords', icon: Target },
  { key: 'technical', label: 'Technical', icon: Shield },
  { key: 'content', label: 'Content Plan', icon: BookOpen },
  { key: 'competitors', label: 'Competitors', icon: TrendingUp },
]

function gradeColor(grade: string): string {
  return {
    A: 'text-green-400 bg-green-500/10 border-green-500/30',
    B: 'text-lime-400 bg-lime-500/10 border-lime-500/30',
    C: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    D: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    F: 'text-red-400 bg-red-500/10 border-red-500/30',
  }[grade] ?? 'text-white/60 bg-white/5 border-white/10'
}

function difficultyColor(d: number): string {
  if (d < 33) return 'bg-green-500'
  if (d < 66) return 'bg-yellow-500'
  return 'bg-red-500'
}

function intentBadge(intent: string): string {
  return {
    informational: 'text-blue-400 bg-blue-500/10',
    commercial: 'text-purple-400 bg-purple-500/10',
    transactional: 'text-green-400 bg-green-500/10',
    navigational: 'text-yellow-400 bg-yellow-500/10',
  }[intent] ?? 'text-white/60 bg-white/5'
}

function severityIcon(s: string) {
  if (s === 'critical') return <XCircle className="w-4 h-4 text-red-400 shrink-0" />
  if (s === 'warning') return <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
  return <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
}

export default function SEOAuditResults({ result }: { result: ComprehensiveAuditResult }) {
  const [tab, setTab] = useState<Tab>('overview')
  const { overview, keywords, relatedKeywords, technicalIssues, contentPlan, competitors } = result

  const critical = technicalIssues.filter(i => i.severity === 'critical').length
  const warning = technicalIssues.filter(i => i.severity === 'warning').length
  const passed = technicalIssues.filter(i => i.severity === 'passed').length

  return (
    <div className="space-y-6 print:bg-white print:text-black">
      {/* Tab bar */}
      <div className="flex gap-1 bg-dashCard border border-dashSurface2 rounded-xl p-1 overflow-x-auto print:hidden">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                tab === t.key ? 'bg-accent text-white' : 'text-dashMuted hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-4 print:block">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={`rounded-2xl p-5 border ${gradeColor(overview.grade)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wide">SEO Score</span>
                <Award className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black">{overview.seoScore}</span>
                <span className="text-2xl font-bold opacity-70">/100</span>
              </div>
              <p className="text-xs mt-1">Grade {overview.grade}</p>
            </div>

            <Kpi label="Technical Health" value={`${overview.technicalHealth}%`} icon={Shield} />
            <Kpi label="Content Score" value={`${overview.contentScore}/100`} icon={BookOpen} />
            <Kpi label="Backlink Authority" value={`${overview.backlinkScore}/100`} icon={TrendingUp} />
            <Kpi
              label="Page Speed"
              value={overview.pageSpeed}
              icon={Zap}
              valueClass={overview.pageSpeed === 'fast' ? 'text-green-400' : overview.pageSpeed === 'slow' ? 'text-red-400' : 'text-yellow-400'}
            />
            <Kpi
              label="Mobile Ready"
              value={overview.mobileReady ? 'Yes' : 'No'}
              icon={Smartphone}
              valueClass={overview.mobileReady ? 'text-green-400' : 'text-red-400'}
            />
          </div>

          <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2">Executive summary</h3>
            <p className="text-sm text-dashMuted leading-relaxed">{overview.summary}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-red-400">{critical}</p>
              <p className="text-xs text-dashMuted mt-1">Critical issues</p>
            </div>
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-yellow-400">{warning}</p>
              <p className="text-xs text-dashMuted mt-1">Warnings</p>
            </div>
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-green-400">{passed}</p>
              <p className="text-xs text-dashMuted mt-1">Passed checks</p>
            </div>
          </div>
        </div>
      )}

      {/* KEYWORDS */}
      {tab === 'keywords' && (
        <div className="space-y-4">
          <div className="bg-dashCard border border-dashSurface2 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-dashSurface2">
              <h3 className="text-sm font-semibold text-white">Target keywords ({keywords.length})</h3>
            </div>
            <div className="divide-y divide-dashSurface2">
              {keywords.map((kw: KeywordAnalysisRow) => (
                <div key={kw.keyword} className="px-5 py-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-3">
                    <p className="text-sm font-semibold text-white truncate">{kw.keyword}</p>
                    <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${intentBadge(kw.intent)}`}>
                      {kw.intent}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-dashMuted">Volume</p>
                    <p className="text-sm font-bold text-white tabular-nums">{kw.estimatedVolume.toLocaleString()}/mo</p>
                  </div>
                  <div className="md:col-span-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-dashMuted">Difficulty</span>
                      <span className="text-white font-bold tabular-nums">{kw.difficulty}</span>
                    </div>
                    <div className="h-1.5 bg-dashSurface2 rounded-full overflow-hidden">
                      <div className={`h-full ${difficultyColor(kw.difficulty)}`} style={{ width: `${kw.difficulty}%` }} />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-dashMuted">Ranking</p>
                    <p className="text-sm font-semibold text-white">{kw.currentRanking}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-dashMuted">Action</p>
                    <p className="text-sm font-semibold text-accent">{kw.suggestedAction}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {relatedKeywords.length > 0 && (
            <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Related long-tail opportunities</h3>
              <div className="flex flex-wrap gap-2">
                {relatedKeywords.map(rk => (
                  <span key={rk} className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full">{rk}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TECHNICAL */}
      {tab === 'technical' && (
        <div className="space-y-3">
          {(['critical', 'warning', 'passed'] as const).map(sev => {
            const items = technicalIssues.filter(i => i.severity === sev)
            if (items.length === 0) return null
            return (
              <div key={sev} className="bg-dashCard border border-dashSurface2 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-dashSurface2 flex items-center gap-2">
                  {severityIcon(sev)}
                  <h3 className="text-sm font-semibold text-white capitalize">{sev}</h3>
                  <span className="text-xs text-dashMuted">({items.length})</span>
                </div>
                <div className="divide-y divide-dashSurface2">
                  {items.map((issue, i) => (
                    <div key={i} className="px-5 py-4">
                      <div className="flex items-baseline justify-between gap-3 mb-1">
                        <p className="text-sm font-semibold text-white">{issue.title}</p>
                        <span className="text-[10px] uppercase tracking-wide text-dashMuted shrink-0">{issue.category}</span>
                      </div>
                      <p className="text-xs text-dashMuted mb-2">{issue.description}</p>
                      {issue.pageUrl && <p className="text-xs text-blue-400 font-mono mb-2">{issue.pageUrl}</p>}
                      {sev !== 'passed' && (
                        <p className="text-xs text-green-400">→ Fix: {issue.fix}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CONTENT PLAN */}
      {tab === 'content' && (
        <div className="bg-dashCard border border-dashSurface2 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-dashSurface2">
            <h3 className="text-sm font-semibold text-white">12-week content calendar</h3>
            <p className="text-xs text-dashMuted">{contentPlan.length} posts planned</p>
          </div>
          <div className="divide-y divide-dashSurface2">
            {contentPlan.map((item, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 border border-accent/30 rounded-xl flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] text-dashMuted">Week</span>
                  <span className="text-base font-black text-white">{item.week}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    {item.pillarPage && (
                      <span className="text-[10px] font-bold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded">PILLAR</span>
                    )}
                  </div>
                  <p className="text-xs text-dashMuted mt-0.5">
                    🎯 {item.targetKeyword} · 💪 {item.difficulty}/100 · {item.intent}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPETITORS */}
      {tab === 'competitors' && (
        <div className="space-y-4">
          {competitors.length === 0 ? (
            <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-8 text-center">
              <p className="text-sm text-dashMuted">No competitor data — add competitor domains in the form to see comparisons.</p>
            </div>
          ) : (
            competitors.map((comp, i) => (
              <div key={i} className="bg-dashCard border border-dashSurface2 rounded-2xl p-5">
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="text-base font-bold text-white">{comp.domain}</h3>
                  <div className="flex gap-3 text-xs text-dashMuted">
                    <span>DR <strong className="text-white">{comp.estimatedAuthority}</strong></span>
                    <span><strong className="text-white tabular-nums">{comp.estimatedKeywords.toLocaleString()}</strong> keywords</span>
                  </div>
                </div>
                {comp.topPages.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-dashMuted uppercase tracking-wide mb-1.5">Top pages</p>
                    <ul className="space-y-1">
                      {comp.topPages.map(p => (
                        <li key={p} className="text-xs text-blue-400 font-mono truncate">{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {comp.contentGaps.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-dashMuted uppercase tracking-wide mb-1.5">Content gaps</p>
                    <div className="flex flex-wrap gap-1.5">
                      {comp.contentGaps.map(g => (
                        <span key={g} className="text-xs bg-red-500/10 text-red-300 px-2 py-1 rounded">{g}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function Kpi({
  label, value, icon: Icon, valueClass = 'text-white',
}: { label: string; value: string | number; icon: React.ElementType; valueClass?: string }) {
  return (
    <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wide text-dashMuted">{label}</span>
        <Icon className="w-4 h-4 text-dashMuted" />
      </div>
      <p className={`text-3xl font-black tabular-nums capitalize ${valueClass}`}>{value}</p>
    </div>
  )
}
