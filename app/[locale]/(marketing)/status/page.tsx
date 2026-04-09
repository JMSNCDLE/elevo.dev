'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { RefreshCw, Loader2 } from 'lucide-react'

interface ServiceStatus {
  name: string
  status: 'operational' | 'degraded' | 'down' | 'checking'
  responseMs: number | null
}

const STATUS_STYLES = {
  operational: { dot: 'bg-green-500', text: 'text-green-600', label: 'Operational' },
  degraded: { dot: 'bg-yellow-500', text: 'text-yellow-600', label: 'Degraded' },
  down: { dot: 'bg-red-500', text: 'text-red-600', label: 'Down' },
  checking: { dot: 'bg-gray-300 animate-pulse', text: 'text-gray-400', label: 'Checking...' },
}

const ENDPOINTS = [
  { name: 'ELEVO Dashboard', path: '/api/health' },
  { name: 'AI Agents', path: '/api/help-bot' },
  { name: 'Authentication', path: '/api/auth/callback' },
  { name: 'CRM & Contacts', path: '/api/crm/contacts' },
  { name: 'Content Generation', path: '/api/generate' },
  { name: 'Analytics', path: '/api/analytics/summary' },
  { name: 'Billing (Stripe)', path: '/api/stripe/checkout' },
  { name: 'Blog & Pages', path: '/api/updates' },
]

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>(
    ENDPOINTS.map(e => ({ name: e.name, status: 'checking', responseMs: null }))
  )
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [checking, setChecking] = useState(false)

  const runChecks = useCallback(async () => {
    setChecking(true)
    const results: ServiceStatus[] = []

    for (const endpoint of ENDPOINTS) {
      const start = performance.now()
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 8000)
        const res = await fetch(endpoint.path, {
          method: 'GET',
          signal: controller.signal,
        }).catch(() => null)
        clearTimeout(timeout)
        const elapsed = Math.round(performance.now() - start)

        if (!res) {
          results.push({ name: endpoint.name, status: 'down', responseMs: elapsed })
        } else if (res.status >= 500) {
          results.push({ name: endpoint.name, status: 'down', responseMs: elapsed })
        } else if (elapsed > 5000) {
          results.push({ name: endpoint.name, status: 'degraded', responseMs: elapsed })
        } else {
          // 200, 401, 403, 404, 405 all mean the server is responding
          results.push({ name: endpoint.name, status: 'operational', responseMs: elapsed })
        }
      } catch {
        results.push({ name: endpoint.name, status: 'down', responseMs: Math.round(performance.now() - start) })
      }
    }

    setServices(results)
    setLastChecked(new Date())
    setChecking(false)
  }, [])

  useEffect(() => {
    runChecks()
  }, [runChecks])

  const allOperational = services.every(s => s.status === 'operational')
  const anyDown = services.some(s => s.status === 'down')

  return (
    <main className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">System Status</h1>
          {services[0].status === 'checking' ? (
            <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              <span className="text-sm font-semibold text-gray-500">Checking all services...</span>
            </div>
          ) : allOperational ? (
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-green-700">All systems operational</span>
            </div>
          ) : anyDown ? (
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
              <span className="text-sm font-semibold text-red-700">Some services experiencing issues</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-2">
              <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
              <span className="text-sm font-semibold text-yellow-700">Some services degraded</span>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 overflow-hidden">
          {services.map((service, i) => {
            const style = STATUS_STYLES[service.status]
            return (
              <div
                key={service.name}
                className={`flex items-center justify-between px-5 py-4 ${
                  i < services.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <span className="text-sm font-medium text-gray-800">{service.name}</span>
                <div className="flex items-center gap-3">
                  {service.responseMs !== null && (
                    <span className="text-[11px] text-gray-400 font-mono">{service.responseMs}ms</span>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                    <span className={`text-xs font-medium ${style.text}`}>{style.label}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-400">
            {lastChecked ? `Last checked: ${lastChecked.toLocaleTimeString('en-GB')}` : 'Checking...'}
          </p>
          <button
            onClick={runChecks}
            disabled={checking}
            className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="text-indigo-600 hover:underline text-sm">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </main>
  )
}
