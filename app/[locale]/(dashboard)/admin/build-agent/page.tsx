'use client'

import { useState, useEffect } from 'react'
import { Shield, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Clock, Loader2 } from 'lucide-react'

interface Issue {
  type: string
  severity: string
  name: string
  url?: string
  expected?: number
  actual?: number
  status?: number
  error?: string
}

interface Report {
  timestamp: string
  total_checks: number
  passed: number
  failed: number
  issues: Issue[]
  results: Array<{ name: string; url: string; status: number; passed: boolean }>
}

interface BuildReport {
  id: string
  report: Report
  fix_plan: string | null
  issues_count: number
  critical_count: number
  resolved: boolean
  created_at: string
}

const SEVERITY_CONFIG = {
  critical: { color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: XCircle },
  high: { color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', icon: AlertTriangle },
  medium: { color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: AlertTriangle },
  low: { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: Clock },
}

export default function BuildAgentPage() {
  const [reports, setReports] = useState<BuildReport[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [liveResult, setLiveResult] = useState<{ status: string; summary: string; issues: Issue[]; fix_plan?: string } | null>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    try {
      const res = await fetch('/api/admin/build-reports')
      if (res.ok) {
        const data = await res.json()
        setReports(data.reports || [])
      }
    } catch {
      // Reports endpoint may not exist yet
    } finally {
      setLoading(false)
    }
  }

  async function runNow() {
    setRunning(true)
    setLiveResult(null)
    try {
      const res = await fetch('/api/agents/daily-build', { method: 'POST' })
      const data = await res.json()
      setLiveResult(data)
      fetchReports()
    } catch (err) {
      setLiveResult({ status: 'error', summary: 'Failed to run build agent', issues: [] })
    } finally {
      setRunning(false)
    }
  }

  const latest = reports[0]

  return (
    <div className="min-h-screen bg-dashBg p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-dashText">Build Agent</h1>
              <p className="text-sm text-dashMuted">Autonomous daily health checks &amp; QA</p>
            </div>
          </div>
          <button
            onClick={runNow}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {running ? 'Running...' : 'Run Now'}
          </button>
        </div>

        {/* Live Result */}
        {liveResult && (
          <div className={`rounded-xl border p-5 mb-6 ${
            liveResult.status === 'all_clear'
              ? 'bg-green-500/10 border-green-500/20'
              : liveResult.status === 'error'
              ? 'bg-red-500/10 border-red-500/20'
              : 'bg-orange-500/10 border-orange-500/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {liveResult.status === 'all_clear' ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              )}
              <span className="font-semibold text-dashText">{liveResult.summary}</span>
            </div>

            {liveResult.issues.length > 0 && (
              <div className="mt-3 space-y-2">
                {liveResult.issues.map((issue, i) => {
                  const config = SEVERITY_CONFIG[issue.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.medium
                  return (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${config.color}`}>
                        {issue.severity.toUpperCase()}
                      </span>
                      <span className="text-dashMuted">{issue.name}</span>
                      <span className="text-dashMuted/60">— {issue.type}</span>
                      {issue.url && (
                        <a href={issue.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline text-xs ml-auto">
                          Open &rarr;
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {liveResult.fix_plan && (
              <div className="mt-4 p-4 bg-dashCard rounded-lg border border-white/5">
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">AI Fix Plan</p>
                <pre className="text-sm text-dashMuted whitespace-pre-wrap leading-relaxed">{liveResult.fix_plan}</pre>
              </div>
            )}
          </div>
        )}

        {/* Latest Report Summary */}
        {latest && !liveResult && (
          <div className={`rounded-xl border p-5 mb-6 ${
            latest.critical_count > 0
              ? 'bg-red-500/10 border-red-500/20'
              : latest.issues_count > 0
              ? 'bg-yellow-500/10 border-yellow-500/20'
              : 'bg-green-500/10 border-green-500/20'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {latest.issues_count === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : latest.critical_count > 0 ? (
                <XCircle className="w-5 h-5 text-red-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              )}
              <span className="font-semibold text-dashText">
                {latest.issues_count === 0
                  ? 'All systems operational'
                  : `${latest.issues_count} issues (${latest.critical_count} critical)`}
              </span>
            </div>
            <p className="text-xs text-dashMuted">
              Last checked: {new Date(latest.created_at).toLocaleString('en-GB')}
            </p>
          </div>
        )}

        {/* Report History */}
        <div className="rounded-xl border border-white/5 bg-dashCard overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-dashText">Report History</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-dashMuted text-sm">
              No reports yet. Click &quot;Run Now&quot; to run the first check.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {reports.map(report => (
                <div key={report.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {report.issues_count === 0 ? (
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    ) : report.critical_count > 0 ? (
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    )}
                    <div>
                      <p className="text-sm text-dashText">
                        {report.issues_count === 0
                          ? 'All clear'
                          : `${report.issues_count} issues (${report.critical_count} critical)`}
                      </p>
                      <p className="text-xs text-dashMuted">
                        {new Date(report.created_at).toLocaleString('en-GB')}
                      </p>
                    </div>
                  </div>
                  {report.fix_plan && (
                    <span className="text-[11px] text-indigo-400 font-medium">Has fix plan</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
