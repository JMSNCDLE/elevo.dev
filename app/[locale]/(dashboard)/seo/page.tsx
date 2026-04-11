'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, X, Loader2, Printer, Clock, ArrowLeft } from 'lucide-react'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import SEOAuditResults from '@/components/dashboard/SEOAuditResults'
import type { ComprehensiveAuditResult } from '@/lib/agents/seoAgent'

type Status = 'idle' | 'auditing' | 'done' | 'error'

interface AuditHistoryItem {
  id: string
  domain: string | null
  seo_score: number | null
  status: string
  audit_depth: string | null
  created_at: string
  overview?: ComprehensiveAuditResult['overview']
  keyword_analysis?: ComprehensiveAuditResult['keywords']
  technical_issues?: ComprehensiveAuditResult['technicalIssues']
  content_plan?: ComprehensiveAuditResult['contentPlan']
  competitor_data?: ComprehensiveAuditResult['competitors']
}

const COUNTRIES = [
  { code: 'us', label: 'United States' },
  { code: 'uk', label: 'United Kingdom' },
  { code: 'es', label: 'Spain' },
  { code: 'de', label: 'Germany' },
  { code: 'fr', label: 'France' },
  { code: 'au', label: 'Australia' },
  { code: 'ca', label: 'Canada' },
  { code: 'nl', label: 'Netherlands' },
  { code: 'ie', label: 'Ireland' },
]

const DEFAULT_KEYWORDS = [
  'AI for local business',
  'local business marketing software',
  'Google Business Profile tool',
]

export default function SEOPage() {
  const [domain, setDomain] = useState('elevo.dev')
  const [keywords, setKeywords] = useState<string[]>(DEFAULT_KEYWORDS)
  const [newKeyword, setNewKeyword] = useState('')
  const [competitors, setCompetitors] = useState('')
  const [locale, setLocale] = useState('en')
  const [country, setCountry] = useState('us')
  const [depth, setDepth] = useState<'quick' | 'full' | 'deep'>('quick')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ComprehensiveAuditResult | null>(null)
  const [history, setHistory] = useState<AuditHistoryItem[]>([])

  useEffect(() => {
    fetch('/api/seo/audits')
      .then(r => r.json())
      .then(d => { if (d.audits) setHistory(d.audits) })
      .catch(() => {})
  }, [])

  function addKeyword() {
    const kw = newKeyword.trim()
    if (kw && !keywords.includes(kw) && keywords.length < 10) {
      setKeywords(prev => [...prev, kw])
      setNewKeyword('')
    }
  }

  async function runAudit() {
    setStatus('auditing')
    setError(null)
    try {
      const competitorDomains = competitors.split(',').map(c => c.trim()).filter(Boolean).slice(0, 3)
      const res = await fetch('/api/seo/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, keywords, locale, targetCountry: country, competitorDomains, depth }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Audit failed')
      setResult(data.result)
      setStatus('done')
      // refresh history
      fetch('/api/seo/audits').then(r => r.json()).then(d => { if (d.audits) setHistory(d.audits) }).catch(() => {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audit failed')
      setStatus('error')
    }
  }

  function loadFromHistory(item: AuditHistoryItem) {
    if (item.status !== 'complete' || !item.overview) return
    setResult({
      overview: item.overview,
      keywords: item.keyword_analysis ?? [],
      relatedKeywords: [],
      technicalIssues: item.technical_issues ?? [],
      contentPlan: item.content_plan ?? [],
      competitors: item.competitor_data ?? [],
    })
    setDomain(item.domain ?? '')
    setStatus('done')
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-accent/15 border border-accent/30 rounded-2xl flex items-center justify-center">
            <Search className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">ELEVO Rank™</h1>
            <p className="text-sm text-dashMuted">Ahrefs-level SEO audit & content strategy</p>
          </div>
        </div>
        {status === 'done' && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-dashCard border border-dashSurface2 hover:bg-dashSurface2 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            Download PDF
          </button>
        )}
      </div>

      {/* Form */}
      {status === 'idle' && (
        <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-6 space-y-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-dashMuted mb-1.5">Website domain</label>
              <input
                value={domain}
                onChange={e => setDomain(e.target.value)}
                placeholder="yourbusiness.com"
                className="w-full bg-dashBg border border-dashSurface2 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dashMuted mb-1.5">Language</label>
              <select
                value={locale}
                onChange={e => setLocale(e.target.value)}
                className="w-full bg-dashBg border border-dashSurface2 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-dashMuted mb-1.5">Target country</label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full bg-dashBg border border-dashSurface2 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent"
              >
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-dashMuted mb-1.5">Competitor domains <span className="text-dashMuted/60">(max 3, comma-separated)</span></label>
              <input
                value={competitors}
                onChange={e => setCompetitors(e.target.value)}
                placeholder="competitor1.com, competitor2.com"
                className="w-full bg-dashBg border border-dashSurface2 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-dashMuted mb-2">Target keywords <span className="text-dashMuted/60">(max 10)</span></label>
            <div className="flex flex-wrap gap-2 mb-2">
              {keywords.map(kw => (
                <span key={kw} className="flex items-center gap-1.5 bg-accent/15 text-accent text-xs font-medium px-3 py-1.5 rounded-lg">
                  {kw}
                  <button onClick={() => setKeywords(prev => prev.filter(k => k !== kw))} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newKeyword}
                onChange={e => setNewKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                placeholder="Add keyword and press Enter"
                className="flex-1 bg-dashBg border border-dashSurface2 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent"
              />
              <button onClick={addKeyword} className="px-4 py-3 bg-accent hover:bg-accentLight text-white rounded-xl">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-dashMuted mb-2">Audit depth</label>
            <div className="grid grid-cols-3 gap-2">
              {(['quick', 'full', 'deep'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDepth(d)}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors capitalize ${
                    depth === d
                      ? 'border-accent bg-accent/15 text-white'
                      : 'border-dashSurface2 bg-dashBg text-dashMuted hover:text-white'
                  }`}
                >
                  {d === 'quick' ? '⚡ Quick scan' : d === 'full' ? '🔍 Full audit' : '🧠 Deep analysis'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-dashMuted mt-2">
              {depth === 'quick' && 'Fast overview — keywords, scores, top issues. Sonnet model.'}
              {depth === 'full' && 'Complete audit with full content plan and technical checks. Sonnet model.'}
              {depth === 'deep' && 'Premium analysis with Opus model — best for strategic decisions.'}
            </p>
          </div>

          <button
            onClick={runAudit}
            disabled={!domain || keywords.length === 0}
            className="w-full py-3.5 bg-accent hover:bg-accentLight disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
          >
            Run SEO Audit with ELEVO Rank →
          </button>
        </div>
      )}

      {/* Auditing */}
      {status === 'auditing' && (
        <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-12 flex flex-col items-center gap-4 mb-6">
          <AgentStatusIndicator status="thinking" agentName="ELEVO Rank" message="Crawling your site, researching keywords, and benchmarking competitors..." />
        </div>
      )}

      {/* Error */}
      {status === 'error' && error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-red-300 text-sm mb-6">
          {error}
          <button onClick={() => setStatus('idle')} className="ml-3 underline hover:text-white">Try again</button>
        </div>
      )}

      {/* Results */}
      {status === 'done' && result && (
        <div className="space-y-4">
          <button
            onClick={() => { setStatus('idle'); setResult(null) }}
            className="flex items-center gap-2 text-sm text-dashMuted hover:text-white print:hidden"
          >
            <ArrowLeft className="w-4 h-4" /> New audit
          </button>
          <SEOAuditResults result={result} />
        </div>
      )}

      {/* History */}
      {status === 'idle' && history.length > 0 && (
        <div className="bg-dashCard border border-dashSurface2 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-dashSurface2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-dashMuted" />
            <h2 className="text-sm font-semibold text-white">Your audits</h2>
            <span className="text-xs text-dashMuted">({history.length})</span>
          </div>
          <div className="divide-y divide-dashSurface2">
            {history.map(item => (
              <button
                key={item.id}
                onClick={() => loadFromHistory(item)}
                disabled={item.status !== 'complete'}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-dashSurface2/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div>
                    <p className="text-sm font-semibold text-white truncate">{item.domain ?? 'Unknown'}</p>
                    <p className="text-xs text-dashMuted">{new Date(item.created_at).toLocaleString('en-GB')} · {item.audit_depth}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {item.seo_score !== null && (
                    <span className="text-sm font-bold text-white tabular-nums">{item.seo_score}/100</span>
                  )}
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                    item.status === 'complete' ? 'text-green-400 bg-green-500/10' :
                    item.status === 'error' ? 'text-red-400 bg-red-500/10' :
                    'text-yellow-400 bg-yellow-500/10'
                  }`}>
                    {item.status === 'pending' && <Loader2 className="w-3 h-3 inline animate-spin mr-1" />}
                    {item.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
