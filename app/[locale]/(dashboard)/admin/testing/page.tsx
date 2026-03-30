'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
  FlaskConical, Play, Loader2, CheckCircle, XCircle, AlertTriangle,
  Clock, RefreshCw,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { isAdminId } from '@/lib/admin'

interface TestResult {
  test_name: string
  status: 'pass' | 'fail' | 'error'
  response_time_ms: number
  error_message: string | null
}

interface TestRun {
  summary: { total: number; passed: number; failed: number; errors: number }
  results: TestResult[]
  run_at: string
}

export default function TestingPage() {
  const router = useRouter()
  const locale = useLocale()
  const supabase = createBrowserClient()

  const [authed, setAuthed] = useState(false)
  const [running, setRunning] = useState(false)
  const [lastRun, setLastRun] = useState<TestRun | null>(null)
  const [history, setHistory] = useState<TestResult[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || !isAdminId(user.id)) {
        router.push(`/${locale}/dashboard`)
        return
      }
      setAuthed(true)
      loadHistory()
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/testing')
      if (res.ok) {
        const data = await res.json()
        setHistory(data.results || [])
      }
    } catch {
      // ignore
    }
  }, [])

  async function runTests() {
    setRunning(true)
    try {
      const res = await fetch('/api/admin/testing', { method: 'POST' })
      if (res.ok) {
        const data: TestRun = await res.json()
        setLastRun(data)
        loadHistory()
      }
    } catch {
      // ignore
    } finally {
      setRunning(false)
    }
  }

  if (!authed) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const results = lastRun?.results || []
  const summary = lastRun?.summary

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">QA Testing Bot</h1>
            <p className="text-sm text-dashMuted">Run automated checks across the platform</p>
          </div>
        </div>

        <button
          onClick={runTests}
          disabled={running}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {running ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running tests…
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run All Tests
            </>
          )}
        </button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <SummaryCard label="Total" value={summary.total} color="text-white" />
          <SummaryCard label="Passed" value={summary.passed} color="text-green-400" icon={CheckCircle} />
          <SummaryCard label="Failed" value={summary.failed} color="text-red-400" icon={XCircle} />
          <SummaryCard label="Errors" value={summary.errors} color="text-yellow-400" icon={AlertTriangle} />
        </div>
      )}

      {/* Results table */}
      {results.length > 0 && (
        <div className="bg-dashCard border border-white/5 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">Test Results</h2>
            <span className="text-xs text-dashMuted flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lastRun?.run_at ? new Date(lastRun.run_at).toLocaleString('en-GB') : '—'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-xs font-medium text-dashMuted">Test</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-dashMuted">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-dashMuted">Response</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-dashMuted">Error</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-white font-medium">{r.test_name}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-3 text-dashMuted font-mono text-xs">
                      {r.response_time_ms > 0 ? `${r.response_time_ms}ms` : '—'}
                    </td>
                    <td className="px-5 py-3 text-red-400 text-xs truncate max-w-[200px]">
                      {r.error_message || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No results yet */}
      {results.length === 0 && !running && (
        <div className="bg-dashCard border border-white/5 rounded-xl p-12 text-center">
          <FlaskConical className="w-12 h-12 text-dashMuted mx-auto mb-4" />
          <p className="text-dashMuted text-sm mb-4">No test results yet. Click &quot;Run All Tests&quot; to start.</p>
        </div>
      )}

      {/* History */}
      {history.length > 0 && !lastRun && (
        <div className="bg-dashCard border border-white/5 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">Previous Results</h2>
            <button onClick={loadHistory} className="text-xs text-dashMuted hover:text-white flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-xs font-medium text-dashMuted">Test</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-dashMuted">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-dashMuted">Response</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-dashMuted">Run at</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 30).map((r, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-white">{r.test_name}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 text-dashMuted font-mono text-xs">{r.response_time_ms > 0 ? `${r.response_time_ms}ms` : '—'}</td>
                    <td className="px-5 py-3 text-dashMuted text-xs">{new Date((r as unknown as { run_at: string }).run_at).toLocaleString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'pass') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
        <CheckCircle className="w-3 h-3" />
        Pass
      </span>
    )
  }
  if (status === 'fail') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
        <XCircle className="w-3 h-3" />
        Fail
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
      <AlertTriangle className="w-3 h-3" />
      Error
    </span>
  )
}

function SummaryCard({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon?: React.ElementType }) {
  return (
    <div className="bg-dashCard border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className={`w-3.5 h-3.5 ${color}`} />}
        <p className="text-xs text-dashMuted">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
