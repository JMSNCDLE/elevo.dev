'use client'

import { useState, useCallback } from 'react'
import {
  Globe, Search, RefreshCw, CheckCircle2, XCircle, AlertTriangle,
  Send, ExternalLink, FileText, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SEOCheck {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message: string
  engine?: string
}

interface SEOReport {
  timestamp: string
  total: number
  passed: number
  failed: number
  warned: number
  indexNowPinged: boolean
  checks: SEOCheck[]
}

const ENGINES = [
  { name: 'Google', icon: '🔍', note: 'Primary. Index via Search Console + sitemap.' },
  { name: 'Bing', icon: '🟦', note: 'IndexNow instant indexing. Covers DuckDuckGo + Yahoo.' },
  { name: 'DuckDuckGo', icon: '🦆', note: 'Uses Bing index. Optimised automatically.' },
  { name: 'Yahoo', icon: '🟣', note: 'Uses Bing index. Covered by Bing optimisation.' },
  { name: 'Yandex', icon: '🔴', note: 'IndexNow supported. Significant EU/RU traffic.' },
  { name: 'Apple', icon: '🍎', note: 'Applebot allowed. Uses Google index for Safari.' },
]

export default function AdminSEOPage() {
  const [report, setReport] = useState<SEOReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [indexNowLoading, setIndexNowLoading] = useState(false)
  const [indexNowResult, setIndexNowResult] = useState<string | null>(null)

  const runCheck = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cron/seo-monitor', {
        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ''}` },
      })
      if (res.ok) setReport(await res.json())
    } catch {} finally {
      setLoading(false)
    }
  }, [])

  const pingIndexNow = useCallback(async () => {
    setIndexNowLoading(true)
    setIndexNowResult(null)
    try {
      const res = await fetch('/api/seo/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (data.ok) {
        setIndexNowResult(`Submitted ${data.urlsSubmitted} URLs to ${data.engines.join(', ')}`)
      } else {
        setIndexNowResult(data.error ?? 'Failed')
      }
    } catch {
      setIndexNowResult('Network error')
    } finally {
      setIndexNowLoading(false)
    }
  }, [])

  const statusIcon = (status: string) => {
    if (status === 'pass') return <CheckCircle2 size={16} className="text-emerald-400" />
    if (status === 'fail') return <XCircle size={16} className="text-red-400" />
    return <AlertTriangle size={16} className="text-amber-400" />
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-[#EEF2FF] p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Globe size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">SEO Command Centre</h1>
              <p className="text-sm text-gray-400">Centro de comando SEO — Multi-engine monitoring</p>
            </div>
          </div>
          <button
            onClick={runCheck}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Scanning...' : 'Run SEO Audit'}
          </button>
        </div>

        {/* Search Engine Coverage */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Search size={18} />
            Search Engine Coverage / Cobertura de motores
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ENGINES.map(e => {
              const check = report?.checks.find(c => c.engine === e.name)
              return (
                <div key={e.name} className="bg-[#1A2332] rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{e.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{e.name}</p>
                      {check && (
                        <span className={cn(
                          'text-xs font-medium',
                          check.status === 'pass' ? 'text-emerald-400' : 'text-red-400'
                        )}>
                          {check.status === 'pass' ? 'Allowed' : 'Blocked'}
                        </span>
                      )}
                    </div>
                    {check && statusIcon(check.status)}
                  </div>
                  <p className="text-xs text-gray-500">{e.note}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* IndexNow */}
        <div className="bg-[#1A2332] rounded-xl p-5 border border-white/5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Send size={16} className="text-indigo-400" />
                IndexNow — Instant Indexing
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Submit URLs to Bing, Yandex, DuckDuckGo, Seznam, and Naver instantly
              </p>
            </div>
            <button
              onClick={pingIndexNow}
              disabled={indexNowLoading}
              className="flex items-center gap-2 px-4 py-2 bg-[#141B24] hover:bg-[#1E2A3A] rounded-lg text-sm font-medium disabled:opacity-50"
            >
              <Send size={14} />
              {indexNowLoading ? 'Submitting...' : 'Submit All Pages'}
            </button>
          </div>
          {indexNowResult && (
            <p className={cn(
              'text-sm mt-2 px-3 py-2 rounded-lg',
              indexNowResult.includes('Submitted') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            )}>
              {indexNowResult}
            </p>
          )}
        </div>

        {/* Audit Results */}
        {report && (
          <>
            {/* Summary bar */}
            <div className="flex gap-4 mb-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-3 flex-1 text-center">
                <p className="text-2xl font-bold text-emerald-400">{report.passed}</p>
                <p className="text-xs text-gray-400">Passed</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 flex-1 text-center">
                <p className="text-2xl font-bold text-red-400">{report.failed}</p>
                <p className="text-xs text-gray-400">Failed</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-3 flex-1 text-center">
                <p className="text-2xl font-bold text-amber-400">{report.warned}</p>
                <p className="text-xs text-gray-400">Warnings</p>
              </div>
            </div>

            {/* Check details */}
            <div className="space-y-2">
              {report.checks.map((check, i) => (
                <div key={i} className="bg-[#1A2332] rounded-lg px-4 py-3 flex items-center gap-3 border border-white/5">
                  {statusIcon(check.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{check.name}</p>
                    <p className="text-xs text-gray-500 truncate">{check.message}</p>
                  </div>
                  <span className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded',
                    check.status === 'pass' ? 'bg-emerald-500/20 text-emerald-400' :
                    check.status === 'fail' ? 'bg-red-500/20 text-red-400' :
                    'bg-amber-500/20 text-amber-400'
                  )}>
                    {check.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-600 mt-4 text-right">
              Last scan: {new Date(report.timestamp).toLocaleString()}
            </p>
          </>
        )}

        {!report && !loading && (
          <div className="text-center py-16 text-gray-500">
            <Globe size={48} className="mx-auto mb-4 opacity-30" />
            <p>Click "Run SEO Audit" to scan all search engines</p>
            <p className="text-sm mt-1">Haz clic en "Run SEO Audit" para escanear todos los motores</p>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Google Search Console', url: 'https://search.google.com/search-console', icon: Search },
            { label: 'Bing Webmaster Tools', url: 'https://www.bing.com/webmasters', icon: Shield },
            { label: 'Yandex Webmaster', url: 'https://webmaster.yandex.com', icon: Globe },
            { label: 'View Sitemap', url: 'https://elevo.dev/sitemap.xml', icon: FileText },
          ].map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1A2332] rounded-lg px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-[#1E2A3A] transition-colors border border-white/5"
            >
              <link.icon size={14} />
              {link.label}
              <ExternalLink size={12} className="ml-auto opacity-50" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
