'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search, TrendingUp, AlertTriangle, CheckCircle2,
  Loader2, Plus, X, ChevronRight, Globe, BookOpen
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import ActionExplanation from '@/components/shared/ActionExplanation'
import CopyButton from '@/components/shared/CopyButton'
import { cn } from '@/lib/utils'
import type { SEOAuditResult } from '@/lib/agents/seoAgent'

type Status = 'idle' | 'auditing' | 'done' | 'error'

const PRIORITY_COLOR = {
  critical: 'text-red-400 bg-red-500/10',
  high: 'text-orange-400 bg-orange-500/10',
  medium: 'text-yellow-400 bg-yellow-500/10',
}

const DEFAULT_KEYWORDS = [
  'AI for local business',
  'local business marketing software',
  'ROAS tool small business',
  'Google Business Profile tool',
  'AI CRM local business',
]

export default function SEOPage() {
  const supabase = createBrowserClient()
  const [domain, setDomain] = useState('elevo.ai')
  const [keywords, setKeywords] = useState<string[]>(DEFAULT_KEYWORDS)
  const [newKeyword, setNewKeyword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SEOAuditResult | null>(null)
  const [locale, setLocale] = useState('en')
  const [activeTab, setActiveTab] = useState<'issues' | 'gaps' | 'topics' | 'backlinks' | 'plan'>('issues')

  async function runAudit() {
    setStatus('auditing')
    setError(null)
    try {
      const res = await fetch('/api/seo/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, keywords, locale }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Audit failed')
      setResult(data.result)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audit failed')
      setStatus('error')
    }
  }

  function addKeyword() {
    const kw = newKeyword.trim()
    if (kw && !keywords.includes(kw) && keywords.length < 10) {
      setKeywords(prev => [...prev, kw])
      setNewKeyword('')
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
          <Search size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-dashText">ELEVO Rank™</h1>
          <p className="text-dashMuted text-sm">SEO audit and content strategy for your website</p>
        </div>
      </div>

      {/* Setup form */}
      {status === 'idle' && (
        <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-xs text-dashMuted mb-1">Website domain</label>
            <input value={domain} onChange={e => setDomain(e.target.value)}
              className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
              placeholder="yourbusiness.com" />
          </div>

          <div>
            <label className="block text-xs text-dashMuted mb-1">Language</label>
            <select value={locale} onChange={e => setLocale(e.target.value)}
              className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-dashMuted mb-2">Target keywords (max 10)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {keywords.map(kw => (
                <span key={kw} className="flex items-center gap-1.5 bg-accent/10 text-accent text-xs px-2.5 py-1 rounded-lg">
                  {kw}
                  <button onClick={() => setKeywords(prev => prev.filter(k => k !== kw))}>
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newKeyword} onChange={e => setNewKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addKeyword()}
                className="flex-1 bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
                placeholder="Add keyword and press Enter" />
              <button onClick={addKeyword}
                className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 text-sm">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <button onClick={runAudit}
            className="w-full py-2.5 bg-accent text-white font-medium rounded-lg hover:bg-accent/90 transition-colors">
            Run SEO Audit with ELEVO Rank →
          </button>
        </div>
      )}

      {/* Auditing */}
      {status === 'auditing' && (
        <div className="bg-dashCard border border-dashSurface2 rounded-xl p-8 flex flex-col items-center gap-4">
          <AgentStatusIndicator status="thinking" agentName="ELEVO Rank" message="Analysing your SEO with live web research..." />
        </div>
      )}

      {/* Error */}
      {status === 'error' && error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
          <button onClick={() => setStatus('idle')} className="ml-3 underline">Try again</button>
        </div>
      )}

      {/* Results */}
      {status === 'done' && result && (
        <div className="space-y-4">
          {/* Score + summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-dashCard border border-dashSurface2 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-dashText">{result.localSEOScore}</p>
              <p className="text-xs text-dashMuted mt-1">SEO Score</p>
            </div>
            <div className="bg-dashCard border border-dashSurface2 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-red-400">{result.technicalIssues.length}</p>
              <p className="text-xs text-dashMuted mt-1">Technical Issues</p>
            </div>
            <div className="bg-dashCard border border-dashSurface2 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{result.blogTopics.length}</p>
              <p className="text-xs text-dashMuted mt-1">Blog Opportunities</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-dashCard border border-dashSurface2 rounded-xl p-1 overflow-x-auto">
            {(['issues', 'gaps', 'topics', 'backlinks', 'plan'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn('px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-colors', activeTab === tab ? 'bg-accent text-white' : 'text-dashMuted hover:text-dashText')}>
                {tab === 'issues' ? 'Technical Issues' : tab === 'gaps' ? 'Content Gaps' : tab === 'topics' ? 'Blog Topics' : tab === 'backlinks' ? 'Backlinks' : '30-Day Plan'}
              </button>
            ))}
          </div>

          <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5 space-y-3">
            {activeTab === 'issues' && (
              result.technicalIssues.length === 0 ? (
                <div className="flex items-center gap-2 text-green-400 text-sm"><CheckCircle2 size={16} /> No technical issues found</div>
              ) : (
                result.technicalIssues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle size={14} className="text-orange-400 mt-0.5 shrink-0" />
                    <span className="text-dashMuted">{issue}</span>
                  </div>
                ))
              )
            )}

            {activeTab === 'gaps' && (
              result.contentGaps.length === 0 ? (
                <p className="text-dashMuted text-sm">No major content gaps found.</p>
              ) : (
                result.contentGaps.map((gap, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <ChevronRight size={14} className="text-accent mt-0.5 shrink-0" />
                    <span className="text-dashMuted">{gap}</span>
                  </div>
                ))
              )
            )}

            {activeTab === 'topics' && (
              <div className="space-y-4">
                {result.blogTopics.map((topic, i) => (
                  <div key={i} className="bg-dashBg rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-dashText">{topic.title}</h3>
                      <CopyButton text={topic.title} />
                    </div>
                    <div className="flex gap-3 text-xs text-dashMuted">
                      <span>🔍 {topic.targetKeyword}</span>
                      <span>📊 {topic.searchVolume}</span>
                      <span>💪 {topic.difficulty}</span>
                    </div>
                    <div className="space-y-1">
                      {topic.outline.map((section, j) => (
                        <p key={j} className="text-xs text-dashMuted">· {section}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'backlinks' && (
              result.backlinkOpportunities.length === 0 ? (
                <p className="text-dashMuted text-sm">No backlink opportunities found.</p>
              ) : (
                result.backlinkOpportunities.map((opp, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Globe size={14} className="text-blue-400 mt-0.5 shrink-0" />
                    <span className="text-dashMuted">{opp}</span>
                  </div>
                ))
              )
            )}

            {activeTab === 'plan' && (
              <div className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className={cn('rounded-lg p-3', PRIORITY_COLOR[rec.priority])}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('text-xs font-semibold uppercase', PRIORITY_COLOR[rec.priority].split(' ')[0])}>
                        {rec.priority}
                      </span>
                      <span className="text-xs text-dashMuted">{rec.timeToSeeResults}</span>
                    </div>
                    <p className="text-sm font-medium text-dashText">{rec.action}</p>
                    <p className="text-xs text-dashMuted mt-1">Expected impact: {rec.expectedImpact}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ActionExplanation
            title="Your SEO audit is complete"
            description="Start with the critical issues, then create blog posts for the top 3 keyword opportunities. Consistent publishing is the fastest path to ranking."
          />

          <button onClick={() => { setStatus('idle'); setResult(null) }} className="text-sm text-dashMuted hover:text-dashText">
            ← Run new audit
          </button>
        </div>
      )}
    </div>
  )
}
