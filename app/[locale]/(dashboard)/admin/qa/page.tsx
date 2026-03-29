'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle2, XCircle, Loader2, RefreshCw, Send,
  Shield, CreditCard, Mail, Zap, Activity, Globe,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RouteResult {
  route: string
  label: string
  status: 'idle' | 'loading' | 'pass' | 'fail'
  responseTime?: number
  statusCode?: number
}

interface AgentResult {
  name: string
  route: string
  status: 'idle' | 'loading' | 'pass' | 'fail'
}

interface EmailResult {
  type: string
  status: 'idle' | 'sent' | 'failed'
  reason?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DASHBOARD_ROUTES: { route: string; label: string }[] = [
  { route: '/en/dashboard', label: 'Mission Control' },
  { route: '/en/dashboard/content/gbp-posts', label: 'GBP Posts' },
  { route: '/en/dashboard/content/blog', label: 'Blog Generator' },
  { route: '/en/dashboard/content/social', label: 'Social Captions' },
  { route: '/en/dashboard/content/reviews', label: 'Review Responses' },
  { route: '/en/dashboard/content/email', label: 'Email Generator' },
  { route: '/en/dashboard/content/seo', label: 'SEO Copy' },
  { route: '/en/dashboard/growth/sales', label: 'Sales Proposals' },
  { route: '/en/dashboard/growth/research', label: 'Market Research' },
  { route: '/en/dashboard/growth/strategy', label: 'SWOT Strategy' },
  { route: '/en/dashboard/growth/financial', label: 'Financial Health' },
  { route: '/en/dashboard/growth/management', label: 'HR Docs' },
  { route: '/en/dashboard/growth/campaigns', label: 'Campaigns' },
  { route: '/en/dashboard/advisor', label: 'Problem Solver' },
  { route: '/en/dashboard/customers', label: 'CRM Contacts' },
  { route: '/en/dashboard/library', label: 'Saved Library' },
  { route: '/en/dashboard/settings', label: 'Settings' },
  { route: '/en/dashboard/analytics', label: 'Analytics' },
  { route: '/en/dashboard/viral', label: 'ELEVO Viral™' },
  { route: '/en/dashboard/spy', label: 'ELEVO Spy™' },
  { route: '/en/dashboard/market', label: 'ELEVO Market™' },
  { route: '/en/dashboard/ads', label: 'Ad Campaigns' },
  { route: '/en/dashboard/seo', label: 'SEO Rankings' },
  { route: '/en/dashboard/social', label: 'Social Hub' },
  { route: '/en/dashboard/video-studio', label: 'Video Studio' },
  { route: '/en/dashboard/creator', label: 'ELEVO Creator™' },
  { route: '/en/dashboard/create', label: 'ELEVO Create™' },
  { route: '/en/dashboard/clip', label: 'ELEVO Clip™' },
  { route: '/en/dashboard/smm', label: 'ELEVO SMM™' },
  { route: '/en/dashboard/drop', label: 'ELEVO Drop™' },
  { route: '/en/dashboard/store', label: 'Store Analytics' },
  { route: '/en/dashboard/conversations', label: 'Conversations' },
  { route: '/en/dashboard/roas', label: 'ROAS Analysis' },
  { route: '/en/dashboard/finances', label: 'Finance Intel' },
  { route: '/en/dashboard/agents', label: 'All Agents' },
]

const AGENTS: { name: string; route: string }[] = [
  { name: 'Content Writer', route: '/api/generate' },
  { name: 'Problem Solver', route: '/api/problem-solver' },
  { name: 'CRM Brief', route: '/api/crm/brief' },
  { name: 'Sales Agent', route: '/api/growth/sales' },
  { name: 'Research Agent', route: '/api/growth/research' },
  { name: 'Strategy Agent', route: '/api/growth/strategy' },
  { name: 'Financial Agent', route: '/api/growth/financial' },
  { name: 'Management Agent', route: '/api/growth/management' },
  { name: 'Campaign Agent', route: '/api/growth/campaigns' },
  { name: 'ROAS Agent', route: '/api/roas' },
  { name: 'Spy Agent', route: '/api/spy/analyse' },
  { name: 'Viral Agent', route: '/api/viral/strategy' },
  { name: 'Market Agent', route: '/api/market/mission' },
  { name: 'Video Studio', route: '/api/video-studio/avatar' },
  { name: 'Clip Agent', route: '/api/clip/analyse' },
  { name: 'Creator Agent', route: '/api/creator/title' },
]

const PERF_ROUTES = [
  '/api/health',
  '/api/generate',
  '/api/crm/contacts',
  '/api/analytics/summary',
  '/api/problem-solver',
  '/api/growth/sales',
  '/api/viral/trending',
  '/api/spy/saved',
  '/api/social/oauth/instagram',
  '/api/video-studio/voiceover',
]

const PERF_TIPS = [
  'Enable Next.js caching on all GET routes with revalidate=60',
  'Use React.lazy() for heavy chart components (recharts)',
  'Compress all images with next/image and WebP format',
  'Move heavy agent calls to background jobs with webhooks',
  'Add Redis caching for frequently-hit DB queries',
  'Use streaming responses for long AI generations',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: RouteResult['status'] | AgentResult['status'] }) {
  if (status === 'loading') return <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
  if (status === 'pass') return <CheckCircle2 className="w-4 h-4 text-green-400" />
  if (status === 'fail') return <XCircle className="w-4 h-4 text-red-400" />
  return <div className="w-4 h-4 rounded-full bg-white/10" />
}

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-[#EEF2FF]/50">
        <span>{completed}/{total} completed</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Tab Config ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'pages', label: 'Page Health', icon: Globe },
  { id: 'auth', label: 'Auth Flow', icon: Shield },
  { id: 'payment', label: 'Payment Flow', icon: CreditCard },
  { id: 'agents', label: 'Agent Health', icon: Zap },
  { id: 'email', label: 'Email Flow', icon: Mail },
  { id: 'perf', label: 'Performance', icon: Activity },
] as const

type TabId = typeof TABS[number]['id']

// ─── Component ────────────────────────────────────────────────────────────────

export default function QADashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('pages')

  // Panel 1 — Page Health
  const [routeResults, setRouteResults] = useState<RouteResult[]>(
    DASHBOARD_ROUTES.map(r => ({ ...r, status: 'idle' as const }))
  )
  const [pagesRunning, setPagesRunning] = useState(false)

  // Panel 2 — Auth Checklist
  const [authChecks, setAuthChecks] = useState<boolean[]>(new Array(6).fill(false))
  const AUTH_ITEMS = [
    'Sign up creates user in Supabase',
    'Confirmation email arrives',
    'Login works',
    'Google OAuth works',
    'Password reset works',
    'Session persists on refresh',
  ]

  // Panel 3 — Payment Checklist
  const [payChecks, setPayChecks] = useState<boolean[]>(new Array(5).fill(false))
  const PAY_ITEMS = [
    'Stripe checkout opens',
    'Trial plan creates subscription',
    'Webhook fires on payment',
    'Receipt email sent',
    'Profile updated with plan',
  ]

  // Panel 4 — Agent Health
  const [agentResults, setAgentResults] = useState<AgentResult[]>(
    AGENTS.map(a => ({ ...a, status: 'idle' as const }))
  )
  const [agentsRunning, setAgentsRunning] = useState(false)

  // Panel 5 — Email
  const [testEmail, setTestEmail] = useState('')
  const [emailResults, setEmailResults] = useState<Record<string, EmailResult>>({
    confirmation: { type: 'confirmation', status: 'idle' },
    receipt: { type: 'receipt', status: 'idle' },
    onboarding: { type: 'onboarding', status: 'idle' },
  })

  // Panel 6 — Performance
  const [perfResults, setPerfResults] = useState<{ route: string; time: number }[]>([])
  const [perfRunning, setPerfRunning] = useState(false)

  // Auto-run page health on mount
  useEffect(() => {
    runAllPageTests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runAllPageTests = useCallback(async () => {
    setPagesRunning(true)
    setRouteResults(prev => prev.map(r => ({ ...r, status: 'loading' })))

    await Promise.all(
      DASHBOARD_ROUTES.map(async (r, idx) => {
        const start = Date.now()
        try {
          const res = await fetch(`/api/admin/qa/page-health?route=${encodeURIComponent(r.route)}`, {
            method: 'GET',
          })
          const data = await res.json()
          const responseTime = Date.now() - start
          setRouteResults(prev => {
            const next = [...prev]
            next[idx] = {
              ...next[idx],
              status: data.ok ? 'pass' : 'fail',
              responseTime,
              statusCode: data.statusCode,
            }
            return next
          })
        } catch {
          setRouteResults(prev => {
            const next = [...prev]
            next[idx] = { ...next[idx], status: 'fail', responseTime: Date.now() - start }
            return next
          })
        }
      })
    )

    setPagesRunning(false)
  }, [])

  const runAllAgentTests = useCallback(async () => {
    setAgentsRunning(true)
    setAgentResults(prev => prev.map(a => ({ ...a, status: 'loading' })))

    await Promise.all(
      AGENTS.map(async (agent, idx) => {
        try {
          // Send minimal POST — will fail with 401/400 but not 404/500 if route exists
          const res = await fetch(agent.route, {
            method: agent.route.includes('/api/problem-solver') ? 'GET' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: agent.route.includes('/api/problem-solver') ? undefined : JSON.stringify({}),
          })
          // 401 = route exists, auth working. 400 = route exists, validation working. Both are "pass" for routing.
          const ok = res.status !== 404 && res.status !== 500
          setAgentResults(prev => {
            const next = [...prev]
            next[idx] = { ...next[idx], status: ok ? 'pass' : 'fail' }
            return next
          })
        } catch {
          setAgentResults(prev => {
            const next = [...prev]
            next[idx] = { ...next[idx], status: 'fail' }
            return next
          })
        }
      })
    )

    setAgentsRunning(false)
  }, [])

  const sendTestEmail = useCallback(async (type: 'confirmation' | 'receipt' | 'onboarding') => {
    if (!testEmail.trim()) {
      alert('Enter a test email address first.')
      return
    }
    setEmailResults(prev => ({ ...prev, [type]: { type, status: 'idle' } }))
    try {
      const res = await fetch('/api/admin/qa/send-test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, email: testEmail }),
      })
      const data = await res.json()
      setEmailResults(prev => ({
        ...prev,
        [type]: { type, status: data.success ? 'sent' : 'failed', reason: data.error },
      }))
    } catch (err) {
      setEmailResults(prev => ({
        ...prev,
        [type]: { type, status: 'failed', reason: String(err) },
      }))
    }
  }, [testEmail])

  const runPerfCheck = useCallback(async () => {
    setPerfRunning(true)
    setPerfResults([])

    const results = await Promise.all(
      PERF_ROUTES.map(async (route) => {
        const start = Date.now()
        try {
          await fetch(route, { method: 'GET' })
        } catch {
          // ignore errors — just measuring time
        }
        return { route, time: Date.now() - start }
      })
    )

    setPerfResults(results)
    setPerfRunning(false)
  }, [])

  // ─── Derived Stats ──────────────────────────────────────────────────────────

  const pagePassCount = routeResults.filter(r => r.status === 'pass').length
  const pageFailCount = routeResults.filter(r => r.status === 'fail').length
  const authCompleted = authChecks.filter(Boolean).length
  const payCompleted = payChecks.filter(Boolean).length

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#EEF2FF]">ELEVO QA Suite</h1>
        <p className="text-sm text-[#EEF2FF]/50 mt-1">Test everything before launch</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pages passing', value: `${pagePassCount}/${DASHBOARD_ROUTES.length}`, color: 'text-green-400' },
          { label: 'Pages failing', value: String(pageFailCount), color: pageFailCount > 0 ? 'text-red-400' : 'text-green-400' },
          { label: 'Auth checks', value: `${authCompleted}/6`, color: 'text-indigo-400' },
          { label: 'Payment checks', value: `${payCompleted}/5`, color: 'text-indigo-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#1A2332] rounded-xl p-3 border border-white/5">
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-[#EEF2FF]/50 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#141B24] p-1 rounded-xl border border-white/5 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'text-[#EEF2FF]/50 hover:text-[#EEF2FF] hover:bg-white/5'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Panel 1: Page Health ── */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#EEF2FF]">Dashboard Page Health</h2>
            <button
              onClick={runAllPageTests}
              disabled={pagesRunning}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {pagesRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Run All Tests
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {routeResults.map((r) => (
              <div
                key={r.route}
                className="flex items-center gap-3 bg-[#1A2332] rounded-xl px-4 py-3 border border-white/5"
              >
                <StatusIcon status={r.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#EEF2FF] truncate">{r.label}</p>
                  <p className="text-xs text-[#EEF2FF]/30 truncate">{r.route}</p>
                </div>
                {r.responseTime && (
                  <span className={cn(
                    'text-xs font-mono',
                    r.responseTime > 2000 ? 'text-orange-400' : r.responseTime > 5000 ? 'text-red-400' : 'text-[#EEF2FF]/30'
                  )}>
                    {r.responseTime}ms
                  </span>
                )}
                {r.statusCode && r.status === 'fail' && (
                  <span className="text-xs text-red-400 font-mono">{r.statusCode}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Panel 2: Auth Flow ── */}
      {activeTab === 'auth' && (
        <div className="space-y-4 max-w-xl">
          <div>
            <h2 className="text-base font-semibold text-[#EEF2FF]">Auth Flow Checklist</h2>
            <p className="text-xs text-[#EEF2FF]/50 mt-0.5">Manually test each step and check them off</p>
          </div>

          <ProgressBar completed={authCompleted} total={6} />

          <div className="space-y-2">
            {AUTH_ITEMS.map((item, i) => (
              <label
                key={item}
                className="flex items-center gap-3 bg-[#1A2332] rounded-xl px-4 py-3 border border-white/5 cursor-pointer hover:bg-[#1E2A3A] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={authChecks[i]}
                  onChange={() => {
                    const next = [...authChecks]
                    next[i] = !next[i]
                    setAuthChecks(next)
                  }}
                  className="w-4 h-4 rounded accent-indigo-500"
                />
                <span className={cn('text-sm', authChecks[i] ? 'text-[#EEF2FF]/40 line-through' : 'text-[#EEF2FF]')}>
                  {item}
                </span>
                {authChecks[i] && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ── Panel 3: Payment Flow ── */}
      {activeTab === 'payment' && (
        <div className="space-y-4 max-w-xl">
          <div>
            <h2 className="text-base font-semibold text-[#EEF2FF]">Payment Flow Checklist</h2>
            <p className="text-xs text-[#EEF2FF]/50 mt-0.5">Manually test Stripe integration end-to-end</p>
          </div>

          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl px-4 py-3">
            <p className="text-sm text-indigo-300 font-mono">Test card: 4242 4242 4242 4242</p>
            <p className="text-xs text-indigo-400/70 mt-0.5">Any future expiry date, any 3-digit CVC</p>
          </div>

          <ProgressBar completed={payCompleted} total={5} />

          <div className="space-y-2">
            {PAY_ITEMS.map((item, i) => (
              <label
                key={item}
                className="flex items-center gap-3 bg-[#1A2332] rounded-xl px-4 py-3 border border-white/5 cursor-pointer hover:bg-[#1E2A3A] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={payChecks[i]}
                  onChange={() => {
                    const next = [...payChecks]
                    next[i] = !next[i]
                    setPayChecks(next)
                  }}
                  className="w-4 h-4 rounded accent-indigo-500"
                />
                <span className={cn('text-sm', payChecks[i] ? 'text-[#EEF2FF]/40 line-through' : 'text-[#EEF2FF]')}>
                  {item}
                </span>
                {payChecks[i] && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ── Panel 4: Agent Health ── */}
      {activeTab === 'agents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#EEF2FF]">Agent Health</h2>
              <p className="text-xs text-[#EEF2FF]/50 mt-0.5">Tests routing only — real AI calls need API keys</p>
            </div>
            <button
              onClick={runAllAgentTests}
              disabled={agentsRunning}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {agentsRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              Test All Agents
            </button>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-400">
              401 (Unauthorised) and 400 (Bad Request) = PASS — route exists and auth/validation is working correctly.
              404 or 500 = FAIL.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {agentResults.map((a) => (
              <div
                key={a.route}
                className="flex items-center gap-3 bg-[#1A2332] rounded-xl px-4 py-3 border border-white/5"
              >
                <StatusIcon status={a.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#EEF2FF]">{a.name}</p>
                  <p className="text-xs text-[#EEF2FF]/30 font-mono truncate">{a.route}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Panel 5: Email Flow ── */}
      {activeTab === 'email' && (
        <div className="space-y-4 max-w-xl">
          <div>
            <h2 className="text-base font-semibold text-[#EEF2FF]">Email Flow Testing</h2>
            <p className="text-xs text-[#EEF2FF]/50 mt-0.5">Send test emails to verify your Resend integration</p>
          </div>

          <div>
            <label className="text-xs text-[#EEF2FF]/50 block mb-1">Test email address</label>
            <input
              type="email"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#0D1520] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#EEF2FF] placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div className="space-y-2">
            {(['confirmation', 'receipt', 'onboarding'] as const).map((type) => {
              const result = emailResults[type]
              return (
                <div
                  key={type}
                  className="flex items-center gap-3 bg-[#1A2332] rounded-xl px-4 py-3 border border-white/5"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#EEF2FF] capitalize">
                      {type === 'confirmation' ? 'Confirmation email' : type === 'receipt' ? 'Receipt email' : 'Onboarding email'}
                    </p>
                    {result.status === 'failed' && result.reason && (
                      <p className="text-xs text-red-400 mt-0.5">{result.reason}</p>
                    )}
                  </div>
                  {result.status === 'sent' && <span className="text-xs text-green-400 font-medium">Sent ✓</span>}
                  {result.status === 'failed' && <span className="text-xs text-red-400 font-medium">Failed ✗</span>}
                  <button
                    onClick={() => sendTestEmail(type)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium rounded-lg border border-indigo-500/20 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    Send test
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Panel 6: Performance ── */}
      {activeTab === 'perf' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#EEF2FF]">Performance Check</h2>
              <p className="text-xs text-[#EEF2FF]/50 mt-0.5">Measures response time for API routes</p>
            </div>
            <button
              onClick={runPerfCheck}
              disabled={perfRunning}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {perfRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
              Run Performance Check
            </button>
          </div>

          {perfResults.length > 0 && (
            <div className="space-y-2">
              {perfResults.map((r) => (
                <div
                  key={r.route}
                  className="flex items-center gap-3 bg-[#1A2332] rounded-xl px-4 py-3 border border-white/5"
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    r.time > 5000 ? 'bg-red-500' : r.time > 2000 ? 'bg-orange-400' : 'bg-green-400'
                  )} />
                  <p className="text-sm text-[#EEF2FF] flex-1 font-mono truncate">{r.route}</p>
                  <span className={cn(
                    'text-sm font-mono font-medium',
                    r.time > 5000 ? 'text-red-400' : r.time > 2000 ? 'text-orange-400' : 'text-green-400'
                  )}>
                    {r.time}ms
                  </span>
                  {r.time > 5000 && <span className="text-xs text-red-400">Slow</span>}
                  {r.time > 2000 && r.time <= 5000 && <span className="text-xs text-orange-400">Warning</span>}
                </div>
              ))}
            </div>
          )}

          <div className="bg-[#1A2332] rounded-xl p-4 border border-white/5 space-y-3">
            <p className="text-sm font-semibold text-[#EEF2FF]">Optimisation Tips</p>
            <div className="space-y-2">
              {PERF_TIPS.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#EEF2FF]/60">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
