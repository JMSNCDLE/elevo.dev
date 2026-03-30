'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Heart, RefreshCw, Loader2, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { isAdminId } from '@/lib/admin'

interface ServiceCheck {
  name: string
  status: 'operational' | 'degraded' | 'down' | 'checking'
  responseMs: number
  detail: string
}

const SERVICES = [
  { name: 'Supabase Database', path: '/api/health', key: 'supabase' },
  { name: 'Anthropic AI (Agents)', path: '/api/help-bot', key: 'anthropic' },
  { name: 'Stripe Billing', path: '/api/stripe/checkout', key: 'stripe' },
  { name: 'Content Generation', path: '/api/generate', key: 'content' },
  { name: 'CRM & Contacts', path: '/api/crm/contacts', key: 'crm' },
  { name: 'Analytics Engine', path: '/api/analytics/summary', key: 'analytics' },
  { name: 'Email System (Resend)', path: '/api/admin/emails', key: 'email' },
  { name: 'PA Agent', path: '/api/pa', key: 'pa' },
  { name: 'Help Bot', path: '/api/help-bot', key: 'helpbot' },
  { name: 'Updates API', path: '/api/updates', key: 'updates' },
]

export default function AdminHealthPage() {
  const router = useRouter()
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [authed, setAuthed] = useState(false)
  const [checks, setChecks] = useState<ServiceCheck[]>(
    SERVICES.map(s => ({ name: s.name, status: 'checking', responseMs: 0, detail: 'Checking...' }))
  )
  const [running, setRunning] = useState(false)
  const [lastRun, setLastRun] = useState<Date | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || !isAdminId(user.id)) { router.push(`/${locale}/dashboard`); return }
      setAuthed(true)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runChecks = useCallback(async () => {
    setRunning(true)
    const results: ServiceCheck[] = []

    for (const svc of SERVICES) {
      const start = performance.now()
      try {
        const res = await fetch(svc.path, { method: 'HEAD' }).catch(() =>
          fetch(svc.path, { method: 'GET' }).catch(() => null)
        )
        const ms = Math.round(performance.now() - start)

        if (!res) {
          results.push({ name: svc.name, status: 'down', responseMs: ms, detail: 'No response' })
        } else if (res.status >= 500) {
          results.push({ name: svc.name, status: 'down', responseMs: ms, detail: `HTTP ${res.status}` })
        } else if (ms > 3000) {
          results.push({ name: svc.name, status: 'degraded', responseMs: ms, detail: `Slow (${ms}ms)` })
        } else {
          results.push({ name: svc.name, status: 'operational', responseMs: ms, detail: `${ms}ms` })
        }
      } catch {
        results.push({ name: svc.name, status: 'down', responseMs: Math.round(performance.now() - start), detail: 'Connection failed' })
      }
    }

    // Env var checks
    const envRes = await fetch('/api/admin/stats').then(r => r.json()).catch(() => null)
    if (envRes?.healthChecks) {
      for (const [key, value] of Object.entries(envRes.healthChecks)) {
        const existing = results.find(r => r.name.toLowerCase().includes(key.toLowerCase()))
        if (existing && value !== 'configured' && value !== 'operational') {
          existing.detail += ` (env: ${value})`
        }
      }
    }

    setChecks(results)
    setLastRun(new Date())
    setRunning(false)
  }, [])

  useEffect(() => {
    if (authed) {
      runChecks()
      const interval = setInterval(runChecks, 60000) // auto-refresh every 60s
      return () => clearInterval(interval)
    }
  }, [authed, runChecks])

  if (!authed) return <div className="p-6 flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>

  const operational = checks.filter(c => c.status === 'operational').length
  const degraded = checks.filter(c => c.status === 'degraded').length
  const down = checks.filter(c => c.status === 'down').length
  const allGood = down === 0 && degraded === 0 && checks[0].status !== 'checking'

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5 text-red-400" />
          <h1 className="text-xl font-bold text-white">System Health</h1>
        </div>
        <div className="flex items-center gap-3">
          {lastRun && (
            <span className="text-xs text-dashMuted flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lastRun.toLocaleTimeString('en-GB')} (auto-refreshes)
            </span>
          )}
          <button onClick={runChecks} disabled={running}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-dashMuted bg-dashCard border border-white/5 rounded-lg hover:text-white transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Overall status banner */}
      <div className={`rounded-xl p-4 flex items-center gap-3 border ${
        allGood ? 'bg-green-500/5 border-green-500/20' : down > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-yellow-500/5 border-yellow-500/20'
      }`}>
        {allGood ? <CheckCircle className="w-5 h-5 text-green-400" /> : down > 0 ? <XCircle className="w-5 h-5 text-red-400" /> : <AlertTriangle className="w-5 h-5 text-yellow-400" />}
        <div>
          <p className={`text-sm font-semibold ${allGood ? 'text-green-400' : down > 0 ? 'text-red-400' : 'text-yellow-400'}`}>
            {allGood ? 'All systems operational' : down > 0 ? `${down} service(s) down` : `${degraded} service(s) degraded`}
          </p>
          <p className="text-xs text-dashMuted">{operational} operational · {degraded} degraded · {down} down</p>
        </div>
      </div>

      {/* Service grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {checks.map(check => (
          <div key={check.name} className="bg-dashCard border border-white/5 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusDot status={check.status} />
              <div>
                <p className="text-sm font-medium text-white">{check.name}</p>
                <p className="text-[11px] text-dashMuted">{check.detail}</p>
              </div>
            </div>
            {check.responseMs > 0 && (
              <span className={`text-xs font-mono ${check.responseMs > 2000 ? 'text-yellow-400' : 'text-dashMuted'}`}>
                {check.responseMs}ms
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  if (status === 'operational') return <div className="w-3 h-3 bg-green-500 rounded-full" />
  if (status === 'degraded') return <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
  if (status === 'down') return <div className="w-3 h-3 bg-red-500 rounded-full" />
  return <Loader2 className="w-3 h-3 text-dashMuted animate-spin" />
}
