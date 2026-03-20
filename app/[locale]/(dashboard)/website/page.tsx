'use client'

import { useState, useEffect } from 'react'
import { Globe, Loader2, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Wand2 } from 'lucide-react'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import { useLocale } from 'next-intl'
import type { WebsiteAuditResult, WebsiteChange } from '@/lib/agents/websiteEditorAgent'

interface Profile {
  plan: string
  id: string
}

interface BusinessProfile {
  id: string
  name: string
}

export default function WebsitePage() {
  const locale = useLocale()
  const [plan, setPlan] = useState('trial')
  const [businessProfileId, setBusinessProfileId] = useState<string | null>(null)
  const [domain, setDomain] = useState('')
  const [auditing, setAuditing] = useState(false)
  const [generatingChanges, setGeneratingChanges] = useState(false)
  const [audit, setAudit] = useState<WebsiteAuditResult | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [changes, setChanges] = useState<WebsiteChange[]>([])
  const [error, setError] = useState<string | null>(null)
  const [expandedIssues, setExpandedIssues] = useState(false)
  const [dismissedChanges, setDismissedChanges] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, bpRes] = await Promise.all([
          fetch('/api/auth/me').catch(() => null),
          fetch('/api/business-profile').catch(() => null),
        ])
        if (profileRes?.ok) {
          const pd: Profile = await profileRes.json()
          setPlan(pd.plan)
        }
        if (bpRes?.ok) {
          const bd: BusinessProfile = await bpRes.json()
          setBusinessProfileId(bd.id)
        }
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [])

  if (plan !== 'galaxy') {
    return <UpgradePrompt locale={locale} feature="Website Editor (Wren)" />
  }

  async function handleAudit() {
    if (!domain || !businessProfileId) return
    setAuditing(true)
    setError(null)
    setAudit(null)
    setChanges([])

    try {
      const r = await fetch('/api/website/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, businessProfileId, locale }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? 'Audit failed')
      setAudit(d.audit)
      setSessionId(d.sessionId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Audit failed')
    } finally {
      setAuditing(false)
    }
  }

  async function handleGenerateChanges() {
    if (!audit || !sessionId) return
    setGeneratingChanges(true)
    setError(null)

    try {
      const r = await fetch('/api/website/changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, audit, priorities: ['seo', 'conversion', 'local-seo'], locale }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? 'Failed to generate changes')
      setChanges(d.changes)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate changes')
    } finally {
      setGeneratingChanges(false)
    }
  }

  function getScoreColor(score: number) {
    if (score >= 70) return 'text-green-400'
    if (score >= 50) return 'text-amber-400'
    return 'text-red-400'
  }

  function getSeverityColor(severity: string) {
    if (severity === 'high') return 'bg-red-500/10 text-red-400 border-red-500/20'
    if (severity === 'medium') return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
          <Globe size={20} className="text-accent" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-dashText">Website Editor</h1>
            <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">Wren</span>
          </div>
          <p className="text-dashMuted text-sm">AI-powered website analysis and content recommendations</p>
        </div>
      </div>

      {/* Domain Input */}
      <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-5 mb-6">
        <label className="block text-sm font-medium text-dashText mb-2">Website Domain</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder="https://yourbusiness.com"
            className="flex-1 bg-dashSurface border border-dashSurface2 rounded-lg px-4 py-2.5 text-dashText text-sm focus:outline-none focus:border-accent/50"
          />
          <button
            onClick={handleAudit}
            disabled={auditing || !domain}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white font-semibold text-sm rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {auditing ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
            {auditing ? 'Auditing...' : 'Audit Website'}
          </button>
        </div>
      </div>

      {auditing && (
        <div className="mb-6">
          <AgentStatusIndicator agentName="Wren" status="analyzing" message="Analysing your website..." />
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Audit Results */}
      {audit && (
        <div className="space-y-5 mb-6">
          {/* Score */}
          <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-dashText">Overall Score</h2>
              <span className={`text-3xl font-bold ${getScoreColor(audit.score)}`}>{audit.score}/100</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(audit.currentPerformance).map(([key, val]) => (
                <div key={key} className="bg-dashSurface rounded-lg p-3">
                  <p className="text-xs text-dashMuted mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-dashCard rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${val >= 70 ? 'bg-green-500' : val >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${val}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${getScoreColor(val)}`}>{val}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-dashMuted mt-4">{audit.summary}</p>
          </div>

          {/* Issues */}
          <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-5">
            <button
              className="flex items-center justify-between w-full"
              onClick={() => setExpandedIssues(!expandedIssues)}
            >
              <h2 className="text-sm font-semibold text-dashText">
                Issues ({audit.issues.length})
              </h2>
              {expandedIssues ? <ChevronUp size={16} className="text-dashMuted" /> : <ChevronDown size={16} className="text-dashMuted" />}
            </button>

            {expandedIssues && (
              <div className="mt-4 space-y-3">
                {audit.issues.map((issue, i) => (
                  <div key={i} className={`border rounded-xl p-4 ${getSeverityColor(issue.severity)}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wide">{issue.severity}</span>
                      <span className="text-xs opacity-70">{issue.type}</span>
                    </div>
                    <p className="text-sm font-medium mb-1">{issue.description}</p>
                    <p className="text-xs opacity-80">{issue.recommendation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Opportunities */}
          {audit.opportunities.length > 0 && (
            <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-dashText mb-3">Opportunities</h2>
              <ul className="space-y-2">
                {audit.opportunities.map((opp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-dashMuted">
                    <CheckCircle size={14} className="text-green-400 mt-0.5 shrink-0" />
                    {opp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Generate Changes */}
          <button
            onClick={handleGenerateChanges}
            disabled={generatingChanges}
            className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accentLight transition-colors disabled:opacity-50"
          >
            {generatingChanges ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
            {generatingChanges ? 'Generating changes...' : 'Generate Content Changes'}
          </button>
        </div>
      )}

      {generatingChanges && (
        <div className="mb-6">
          <AgentStatusIndicator agentName="Wren" status="writing" message="Creating content recommendations..." />
        </div>
      )}

      {/* Changes */}
      {changes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-dashText">Recommended Changes ({changes.filter(c => !dismissedChanges.has(c.id)).length})</h2>
          {changes
            .filter(c => !dismissedChanges.has(c.id))
            .map(change => (
              <div key={change.id} className="bg-dashCard border border-dashSurface2 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium mr-2 ${
                      change.priority === 'high'
                        ? 'bg-red-500/10 text-red-400'
                        : change.priority === 'medium'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {change.priority}
                    </span>
                    <span className="text-xs text-dashMuted">{change.changeType} · {change.pageUrl}</span>
                  </div>
                  <button
                    onClick={() => setDismissedChanges(prev => new Set([...prev, change.id]))}
                    className="text-xs text-dashMuted hover:text-dashText"
                  >
                    Dismiss
                  </button>
                </div>

                {change.currentContent && (
                  <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 mb-2">
                    <p className="text-xs text-dashMuted mb-1">Current</p>
                    <p className="text-sm text-dashText">{change.currentContent}</p>
                  </div>
                )}

                <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-3 mb-3">
                  <p className="text-xs text-dashMuted mb-1">Proposed</p>
                  <p className="text-sm text-dashText">{change.proposedContent}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-dashMuted">
                  <span>{change.reason}</span>
                  <span className="text-green-400 font-medium">{change.estimatedImpact}</span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
