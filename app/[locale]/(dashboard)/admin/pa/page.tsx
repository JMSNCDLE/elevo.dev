'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  Bot, RefreshCw, Loader2, CheckCircle2, AlertTriangle,
  AlertCircle, Info, Shield, Database, Zap, CreditCard,
  TrendingUp, Clock, Users, DollarSign, Activity,
  Plus, ChevronRight, X, MessageCircle, Phone,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { HealthCheckResult, DailySummary, PATask } from '@/lib/agents/paEngineerAgent'

type HealthStatus = 'idle' | 'checking' | 'done' | 'error'
type SummaryStatus = 'idle' | 'loading' | 'done' | 'error'

const SEVERITY_CONFIG = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Critical' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'High' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Medium' },
  low: { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20', label: 'Low' },
}

const PRIORITY_CONFIG = {
  urgent: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Urgent' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'High' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Medium' },
  low: { color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Low' },
}

const TYPE_CONFIG: Record<PATask['type'], { label: string; color: string }> = {
  bug: { label: 'Bug', color: 'text-red-400' },
  optimisation: { label: 'Optimisation', color: 'text-blue-400' },
  content: { label: 'Content', color: 'text-purple-400' },
  security: { label: 'Security', color: 'text-orange-400' },
  research: { label: 'Research', color: 'text-cyan-400' },
  reminder: { label: 'Reminder', color: 'text-green-400' },
}

const HEALTH_SCORE: Record<HealthCheckResult['overallHealth'], { score: number; color: string; label: string }> = {
  healthy: { score: 95, color: 'text-green-400', label: 'Healthy' },
  degraded: { score: 65, color: 'text-amber-400', label: 'Degraded' },
  critical: { score: 30, color: 'text-red-400', label: 'Critical' },
}

const STATUS_NEXT: Record<PATask['status'], PATask['status']> = {
  open: 'in_progress',
  in_progress: 'done',
  done: 'done',
  wont_fix: 'wont_fix',
}

interface NewTaskForm {
  type: PATask['type']
  priority: PATask['priority']
  title: string
  description: string
  autoFixAvailable: boolean
  estimatedTime: string
}

export default function PAPage() {
  const locale = useLocale()
  const router = useRouter()
  const supabase = createBrowserClient()

  const [waTestStatus, setWaTestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const [healthStatus, setHealthStatus] = useState<HealthStatus>('idle')
  const [health, setHealth] = useState<HealthCheckResult | null>(null)
  const [healthError, setHealthError] = useState<string | null>(null)

  const [summaryStatus, setSummaryStatus] = useState<SummaryStatus>('idle')
  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const [tasks, setTasks] = useState<PATask[]>([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [newTask, setNewTask] = useState<NewTaskForm>({
    type: 'bug',
    priority: 'medium',
    title: '',
    description: '',
    autoFixAvailable: false,
    estimatedTime: '1h',
  })
  const [submittingTask, setSubmittingTask] = useState(false)

  const checkAdmin = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push(`/${locale}/login`); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
      router.push(`/${locale}/dashboard`)
    }
  }, [supabase, router, locale])

  const loadTasks = useCallback(async () => {
    setTasksLoading(true)
    try {
      const res = await fetch('/api/admin/pa/tasks')
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch {
      // silent
    } finally {
      setTasksLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAdmin()
    loadTasks()
  }, [checkAdmin, loadTasks])

  async function runHealthCheck() {
    setHealthStatus('checking')
    setHealthError(null)
    try {
      const res = await fetch('/api/admin/pa/health')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Health check failed')
      setHealth(data)
      setHealthStatus('done')
    } catch (err) {
      setHealthError(err instanceof Error ? err.message : 'Health check failed')
      setHealthStatus('error')
    }
  }

  async function refreshSummary() {
    setSummaryStatus('loading')
    setSummaryError(null)
    try {
      const res = await fetch('/api/admin/pa/summary')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Summary failed')
      setSummary(data)
      setSummaryStatus('done')
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : 'Summary failed')
      setSummaryStatus('error')
    }
  }

  async function advanceTask(taskId: string, currentStatus: PATask['status']) {
    const nextStatus = STATUS_NEXT[currentStatus]
    if (nextStatus === currentStatus) return

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t))

    try {
      await fetch('/api/admin/pa/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: nextStatus }),
      })
    } catch {
      loadTasks()
    }
  }

  async function sendTestWhatsApp() {
    setWaTestStatus('sending')
    try {
      const res = await fetch('/api/whatsapp/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'criticalError', data: { error: 'Test notification from ELEVO PA™', page: '/admin/pa' } }),
      })
      if (res.ok) {
        setWaTestStatus('sent')
        setTimeout(() => setWaTestStatus('idle'), 3000)
      } else {
        setWaTestStatus('error')
        setTimeout(() => setWaTestStatus('idle'), 3000)
      }
    } catch {
      setWaTestStatus('error')
      setTimeout(() => setWaTestStatus('idle'), 3000)
    }
  }

  async function submitTask() {
    if (!newTask.title.trim()) return
    setSubmittingTask(true)
    try {
      const res = await fetch('/api/admin/pa/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      })
      if (res.ok) {
        setShowTaskForm(false)
        setNewTask({ type: 'bug', priority: 'medium', title: '', description: '', autoFixAvailable: false, estimatedTime: '1h' })
        await loadTasks()
      }
    } finally {
      setSubmittingTask(false)
    }
  }

  const openTasks = tasks.filter(t => t.status === 'open')
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
  const doneTasks = tasks.filter(t => t.status === 'done')

  const healthConfig = health ? HEALTH_SCORE[health.overallHealth] : null

  return (
    <div className="min-h-screen bg-dashBg">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
            <Bot size={24} className="text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-dashText">ELEVO PA™ — Your 24/7 Personal Engineer</h1>
            <p className="text-sm text-dashMuted mt-0.5">Aria watches every page, API, database table, and Stripe webhook</p>
          </div>
        </div>

        {/* ─── SECTION 1: HEALTH DASHBOARD ────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dashText flex items-center gap-2">
              <Activity size={18} className="text-accent" />
              Health Dashboard
            </h2>
            <button
              onClick={runHealthCheck}
              disabled={healthStatus === 'checking'}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight disabled:opacity-50 transition-colors text-sm"
            >
              {healthStatus === 'checking'
                ? <><Loader2 size={14} className="animate-spin" /> Checking...</>
                : <><RefreshCw size={14} /> Check Now</>
              }
            </button>
          </div>

          {healthStatus === 'checking' && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-8 text-center">
              <Loader2 size={32} className="animate-spin text-accent mx-auto mb-3" />
              <p className="text-dashText font-medium">Running full health check...</p>
              <p className="text-sm text-dashMuted mt-1">Analysing pages, APIs, database, Stripe, security, and SEO</p>
            </div>
          )}

          {healthError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">{healthError}</div>
          )}

          {health && (
            <div className="space-y-4">
              {/* Health score */}
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className={cn('text-5xl font-black', healthConfig?.color)}>{healthConfig?.score}</span>
                      <div>
                        <p className={cn('text-lg font-bold', healthConfig?.color)}>{healthConfig?.label}</p>
                        <p className="text-xs text-dashMuted">Health Score</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-dashMuted">Last checked</p>
                    <p className="text-sm text-dashText">{new Date(health.timestamp).toLocaleString('en-GB')}</p>
                  </div>
                </div>
                <p className="text-sm text-dashMuted">{health.summary}</p>
              </div>

              {/* Status cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatusCard
                  icon={<ChevronRight size={16} />}
                  label="Pages"
                  ok={health.pages.filter(p => p.status === 'ok').length}
                  total={health.pages.length}
                  issues={health.pages.filter(p => p.status !== 'ok').length}
                />
                <StatusCard
                  icon={<Zap size={16} />}
                  label="APIs"
                  ok={health.apis.filter(a => a.status === 'ok').length}
                  total={health.apis.length}
                  issues={health.apis.filter(a => a.status !== 'ok').length}
                />
                <StatusCard
                  icon={<Database size={16} />}
                  label="Database"
                  ok={health.database.connected ? 1 : 0}
                  total={1}
                  issues={health.database.missingTables.length}
                  detail={health.database.missingTables.length > 0 ? `${health.database.missingTables.length} missing tables` : 'All tables OK'}
                />
                <StatusCard
                  icon={<CreditCard size={16} />}
                  label="Stripe"
                  ok={health.stripe.connected ? 1 : 0}
                  total={1}
                  issues={health.stripe.recentFailedPayments}
                  detail={health.stripe.connected ? 'Connected' : 'Not connected'}
                />
              </div>

              {/* Performance */}
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
                <h3 className="text-sm font-semibold text-dashText mb-3 flex items-center gap-2">
                  <TrendingUp size={14} className="text-accent" />
                  Core Web Vitals
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <WebVitalCard label="LCP" value={health.performance.coreWebVitals.lcp} good="< 2.5s" />
                  <WebVitalCard label="FID" value={health.performance.coreWebVitals.fid} good="< 100ms" />
                  <WebVitalCard label="CLS" value={health.performance.coreWebVitals.cls} good="< 0.1" />
                </div>
                <p className="text-xs text-dashMuted mt-3">Avg page load: {health.performance.avgPageLoadTime}</p>
              </div>

              {/* Issues */}
              {health.issues.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-dashText">Issues ({health.issues.length})</h3>
                  {health.issues.map((issue, i) => {
                    const sc = SEVERITY_CONFIG[issue.severity]
                    return (
                      <div key={i} className={cn('rounded-xl border p-4', sc.bg, sc.border)}>
                        <div className="flex items-start gap-3">
                          <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5', sc.color, sc.bg)}>
                            {sc.label}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-dashText">{issue.description}</p>
                            {issue.affectedFile && (
                              <p className="text-xs text-dashMuted font-mono mt-0.5">{issue.affectedFile}</p>
                            )}
                            <p className="text-xs text-dashMuted mt-1">{issue.category}</p>
                            <div className="mt-2 bg-black/20 rounded-lg p-2">
                              <p className="text-xs text-dashMuted mb-0.5">Proposed fix:</p>
                              <p className="text-xs text-dashText">{issue.proposedFix}</p>
                            </div>
                          </div>
                          <button
                            disabled={!issue.autoFixable}
                            className={cn(
                              'shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors',
                              issue.autoFixable
                                ? 'bg-accent text-white hover:bg-accentLight'
                                : 'bg-dashSurface2 text-dashMuted cursor-not-allowed opacity-50'
                            )}
                          >
                            Auto-Fix
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Recommendations */}
              {health.recommendations.length > 0 && (
                <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
                  <h3 className="text-sm font-semibold text-dashText mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {health.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-dashMuted">
                        <CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {healthStatus === 'idle' && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-8 text-center">
              <Shield size={40} className="text-accent/40 mx-auto mb-3" />
              <p className="text-dashText font-medium mb-2">No health data yet</p>
              <p className="text-sm text-dashMuted">Click &quot;Check Now&quot; to run a full system health check.</p>
            </div>
          )}
        </div>

        {/* ─── SECTION 2: DAILY SUMMARY ────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dashText flex items-center gap-2">
              <Activity size={18} className="text-accent" />
              Daily Summary
            </h2>
            <button
              onClick={refreshSummary}
              disabled={summaryStatus === 'loading'}
              className="flex items-center gap-2 px-4 py-2 bg-dashCard text-dashText font-medium rounded-lg hover:bg-dashSurface2 disabled:opacity-50 transition-colors text-sm border border-dashSurface2"
            >
              {summaryStatus === 'loading'
                ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
                : <><RefreshCw size={14} /> Refresh Summary</>
              }
            </button>
          </div>

          {summaryStatus === 'loading' && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-8 text-center">
              <Loader2 size={32} className="animate-spin text-accent mx-auto mb-3" />
              <p className="text-dashText font-medium">Generating your daily summary...</p>
            </div>
          )}

          {summaryError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">{summaryError}</div>
          )}

          {summary && (
            <div className="space-y-4">
              {/* Greeting */}
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                <p className="text-xl font-bold text-dashText leading-relaxed">{summary.greeting}</p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SummaryStatCard icon={<Users size={16} />} label="New Users" value={summary.todayStats.newUsers.toString()} color="text-blue-400" />
                <SummaryStatCard icon={<DollarSign size={16} />} label="Revenue" value={`€${summary.todayStats.revenue.toFixed(2)}`} color="text-green-400" />
                <SummaryStatCard icon={<Zap size={16} />} label="Credits Used" value={summary.todayStats.credits_used.toString()} color="text-purple-400" />
                <SummaryStatCard icon={<AlertTriangle size={16} />} label="Errors" value={summary.todayStats.errors.toString()} color={summary.todayStats.errors > 0 ? 'text-red-400' : 'text-green-400'} />
              </div>

              {/* Wins */}
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
                <h3 className="text-sm font-semibold text-dashText mb-3">Today&apos;s Wins</h3>
                <ul className="space-y-2">
                  {summary.wins.map((win, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-dashText">
                      <CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" />
                      {win}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations + Upcoming */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
                  <h3 className="text-sm font-semibold text-dashText mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {summary.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-dashMuted">
                        <ChevronRight size={14} className="text-accent mt-0.5 shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
                  <h3 className="text-sm font-semibold text-dashText mb-3 flex items-center gap-2">
                    Upcoming Tasks
                    <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">
                      {openTasks.length} open
                    </span>
                  </h3>
                  <ul className="space-y-2">
                    {summary.upcomingTasks.map((task, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-dashMuted">
                        <Clock size={14} className="text-dashMuted mt-0.5 shrink-0" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Motivational note */}
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                <p className="text-sm text-accent font-medium text-center">{summary.motivationalNote}</p>
              </div>
            </div>
          )}

          {summaryStatus === 'idle' && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-8 text-center">
              <Info size={40} className="text-accent/40 mx-auto mb-3" />
              <p className="text-dashText font-medium mb-2">No summary yet</p>
              <p className="text-sm text-dashMuted">Click &quot;Refresh Summary&quot; to generate today&apos;s briefing.</p>
            </div>
          )}
        </div>

        {/* ─── SECTION 3: KANBAN TASKS ─────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dashText flex items-center gap-2">
              <AlertCircle size={18} className="text-accent" />
              PA Tasks
            </h2>
            <button
              onClick={() => setShowTaskForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors text-sm"
            >
              <Plus size={14} /> Add Task
            </button>
          </div>

          {/* New task form */}
          {showTaskForm && (
            <div className="bg-dashCard rounded-xl border border-accent/30 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-dashText">New Task</h3>
                <button onClick={() => setShowTaskForm(false)} className="text-dashMuted hover:text-dashText">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-dashMuted mb-1 block">Type</label>
                  <select
                    value={newTask.type}
                    onChange={e => setNewTask(p => ({ ...p, type: e.target.value as PATask['type'] }))}
                    className="w-full bg-dashSurface2 border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
                  >
                    {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-dashMuted mb-1 block">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask(p => ({ ...p, priority: e.target.value as PATask['priority'] }))}
                    className="w-full bg-dashSurface2 border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="text-xs text-dashMuted mb-1 block">Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                  placeholder="Task title"
                  className="w-full bg-dashSurface2 border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:border-accent"
                />
              </div>
              <div className="mb-3">
                <label className="text-xs text-dashMuted mb-1 block">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe the task..."
                  rows={2}
                  className="w-full bg-dashSurface2 border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:border-accent resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-dashMuted mb-1 block">Est. Time</label>
                  <input
                    type="text"
                    value={newTask.estimatedTime}
                    onChange={e => setNewTask(p => ({ ...p, estimatedTime: e.target.value }))}
                    placeholder="e.g. 2h"
                    className="w-full bg-dashSurface2 border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTask.autoFixAvailable}
                      onChange={e => setNewTask(p => ({ ...p, autoFixAvailable: e.target.checked }))}
                      className="w-4 h-4 accent-accent"
                    />
                    <span className="text-sm text-dashMuted">Auto-fix available</span>
                  </label>
                </div>
              </div>
              <button
                onClick={submitTask}
                disabled={!newTask.title.trim() || submittingTask}
                className="w-full py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight disabled:opacity-50 transition-colors text-sm"
              >
                {submittingTask ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Create Task'}
              </button>
            </div>
          )}

          {/* Kanban board */}
          {tasksLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-dashCard animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KanbanColumn
                title="Open"
                count={openTasks.length}
                color="text-red-400"
                tasks={openTasks}
                onAdvance={advanceTask}
                nextLabel="→ In Progress"
              />
              <KanbanColumn
                title="In Progress"
                count={inProgressTasks.length}
                color="text-amber-400"
                tasks={inProgressTasks}
                onAdvance={advanceTask}
                nextLabel="→ Done"
              />
              <KanbanColumn
                title="Done"
                count={doneTasks.length}
                color="text-green-400"
                tasks={doneTasks}
                onAdvance={advanceTask}
                nextLabel=""
                isDone
              />
            </div>
          )}
        </div>

        {/* ─── SECTION 4: WHATSAPP NOTIFICATIONS ───────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-dashText flex items-center gap-2">
            <MessageCircle size={18} className="text-accent" />
            WhatsApp Notifications
          </h2>

          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Phone size={16} className="text-green-400" />
                  <span className="text-sm font-medium text-dashText">+34 679 444 783</span>
                  <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">Configured</span>
                </div>
                <p className="text-xs text-dashMuted">James receives WhatsApp alerts for all critical events</p>
              </div>
              <button
                onClick={sendTestWhatsApp}
                disabled={waTestStatus === 'sending'}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  waTestStatus === 'sent'
                    ? 'bg-green-500/20 text-green-400'
                    : waTestStatus === 'error'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-accent/10 text-accent hover:bg-accent/20'
                )}
              >
                {waTestStatus === 'sending' && <Loader2 size={13} className="animate-spin" />}
                {waTestStatus === 'sent' && <CheckCircle2 size={13} />}
                {waTestStatus === 'idle' || waTestStatus === 'error'
                  ? 'Send Test WhatsApp'
                  : waTestStatus === 'sending'
                  ? 'Sending...'
                  : 'Sent!'
                }
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { label: 'New Sale', event: 'newSale', color: 'text-green-400' },
                { label: 'New Signup', event: 'newUser', color: 'text-blue-400' },
                { label: 'Payment Failed', event: 'paymentFailed', color: 'text-red-400' },
                { label: 'Critical Error', event: 'criticalError', color: 'text-orange-400' },
                { label: 'Daily Summary', event: 'dailySummary', color: 'text-purple-400' },
                { label: 'Competitor Alert', event: 'competitorAlert', color: 'text-yellow-400' },
              ].map(ev => (
                <div key={ev.event} className="flex items-center gap-2 bg-dashSurface2/40 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <span className={cn('text-xs font-medium', ev.color)}>{ev.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusCard({
  icon, label, ok, total, issues, detail,
}: {
  icon: React.ReactNode
  label: string
  ok: number
  total: number
  issues: number
  detail?: string
}) {
  const allOk = issues === 0
  return (
    <div className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={allOk ? 'text-green-400' : 'text-amber-400'}>{icon}</span>
        <span className="text-xs font-medium text-dashMuted">{label}</span>
      </div>
      <p className={cn('text-2xl font-bold', allOk ? 'text-green-400' : 'text-amber-400')}>
        {ok}/{total}
      </p>
      <p className="text-xs text-dashMuted mt-0.5">{detail ?? (issues > 0 ? `${issues} issue(s)` : 'All OK')}</p>
    </div>
  )
}

function WebVitalCard({ label, value, good }: { label: string; value: string; good: string }) {
  return (
    <div className="bg-dashSurface2/50 rounded-lg p-3 text-center">
      <p className="text-xs text-dashMuted mb-1">{label}</p>
      <p className="text-lg font-bold text-dashText">{value}</p>
      <p className="text-xs text-green-400">Good: {good}</p>
    </div>
  )
}

function SummaryStatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <span className="text-xs text-dashMuted">{label}</span>
      </div>
      <p className={cn('text-2xl font-bold', color)}>{value}</p>
    </div>
  )
}

function KanbanColumn({
  title, count, color, tasks, onAdvance, nextLabel, isDone = false,
}: {
  title: string
  count: number
  color: string
  tasks: PATask[]
  onAdvance: (id: string, status: PATask['status']) => void
  nextLabel: string
  isDone?: boolean
}) {
  return (
    <div className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className={cn('text-sm font-semibold', color)}>{title}</h3>
        <span className="text-xs bg-dashSurface2 text-dashMuted px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <div className="space-y-2 min-h-[120px]">
        {tasks.length === 0 && (
          <p className="text-xs text-dashMuted text-center py-6">No tasks</p>
        )}
        {tasks.map(task => {
          const tc = TYPE_CONFIG[task.type]
          const pc = PRIORITY_CONFIG[task.priority]
          return (
            <div key={task.id} className="bg-dashSurface2/60 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={cn('text-xs font-medium', tc.color)}>{tc.label}</span>
                <span className="text-dashMuted">·</span>
                <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded-full', pc.color, pc.bg)}>{pc.label}</span>
              </div>
              <p className="text-xs font-medium text-dashText leading-tight">{task.title}</p>
              {task.description && (
                <p className="text-xs text-dashMuted leading-snug line-clamp-2">{task.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-dashMuted flex items-center gap-1">
                  <Clock size={10} /> {task.estimatedTime}
                </span>
                {!isDone && (
                  <button
                    onClick={() => onAdvance(task.id, task.status)}
                    className="text-xs text-accent hover:text-accentLight font-medium transition-colors"
                  >
                    {nextLabel}
                  </button>
                )}
                {isDone && <CheckCircle2 size={12} className="text-green-400" />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
