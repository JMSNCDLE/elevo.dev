'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Zap, Plus, Play, Pause, Eye, Calendar, BarChart2, Users,
  CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp,
  Copy, Check, RefreshCw, Bot,
} from 'lucide-react'
import type { MarketingMissionPlan } from '@/lib/agents/superMarketingAgent'
import { createBrowserClient } from '@/lib/supabase/client'
import { ADMIN_IDS } from '@/lib/admin'

interface Mission {
  id: string
  title: string
  goal: string
  timeframe: string
  status: string
  current_week: number
  auto_execute: boolean
  started_at: string
  ends_at: string
  total_credits_used: number
  plan: MarketingMissionPlan
}

interface BusinessProfile {
  id: string
  business_name: string
  category: string
}

const PLATFORMS = ['TikTok', 'Instagram', 'Facebook', 'LinkedIn', 'YouTube Shorts', 'Pinterest', 'Twitter/X']
const TIMEFRAME_OPTIONS = ['2 weeks', '4 weeks', '6 weeks', '8 weeks', '12 weeks']
const BUDGET_OPTIONS = ['No paid ads', '€100-500/mo', '€500-1000/mo', '€1000-2500/mo', '€2500+/mo']

const LOADING_STEPS = [
  'Analysing your business profile...',
  'Researching platform algorithms...',
  'Scanning competitor content gaps...',
  'Identifying trending formats...',
  'Building content strategy...',
  'Writing 30-day content calendar...',
  'Finalising mission plan...',
]

const PLATFORM_COLORS: Record<string, string> = {
  TikTok: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  Instagram: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Facebook: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  LinkedIn: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  YouTube: 'bg-red-500/20 text-red-400 border-red-500/30',
  'YouTube Shorts': 'bg-red-500/20 text-red-400 border-red-500/30',
  Pinterest: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  'Twitter/X': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
    </button>
  )
}

export default function MarketPage({ params }: { params: Promise<{ locale: string }> }) {
  const router = useRouter()
  const [locale, setLocale] = useState('en')
  const [isGalaxy, setIsGalaxy] = useState(false)
  const [activeTab, setActiveTab] = useState<'missions' | 'new' | 'calendar' | 'performance' | 'team'>('missions')
  const [missions, setMissions] = useState<Mission[]>([])
  const [activeMission, setActiveMission] = useState<Mission | null>(null)
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMissions, setLoadingMissions] = useState(true)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [plan, setPlan] = useState<MarketingMissionPlan | null>(null)
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([0]))
  const [expandedCalItems, setExpandedCalItems] = useState<Set<number>>(new Set())
  const [runningReview, setRunningReview] = useState(false)

  const [form, setForm] = useState({
    businessProfileId: '',
    goal: '',
    timeframe: '4 weeks',
    budget: 'No paid ads',
    platforms: ['Instagram', 'TikTok'] as string[],
    autoExecute: false,
  })

  useEffect(() => {
    params.then((p) => setLocale(p.locale))
    loadData()
  }, [])

  async function loadData() {
    setLoadingMissions(true)
    try {
      const [missionsRes, profilesRes, userRes] = await Promise.all([
        fetch('/api/market/mission'),
        fetch('/api/business-profiles'),
        fetch('/api/auth/profile'),
      ])
      if (missionsRes.ok) {
        const d = await missionsRes.json()
        setMissions(d.missions || [])
        if (d.missions?.length > 0) setActiveMission(d.missions[0])
      }
      if (profilesRes.ok) {
        const d = await profilesRes.json()
        setBusinessProfiles(d.profiles || d.businessProfiles || [])
        const first = (d.profiles || d.businessProfiles || [])[0]
        if (first) setForm((f) => ({ ...f, businessProfileId: first.id }))
      }
      if (userRes.ok) {
        const d = await userRes.json()
        const supabase = createBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()
        setIsGalaxy(user && ADMIN_IDS.includes(user.id) ? true : d.profile?.plan === 'galaxy')
      }
    } finally {
      setLoadingMissions(false)
    }
  }

  async function handleGenerate() {
    if (!form.goal || !form.businessProfileId) {
      setError('Please fill in your goal and select a business profile.')
      return
    }
    setLoading(true)
    setError(null)
    setLoadingStep(0)

    const stepInterval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1))
    }, 2500)

    try {
      const res = await fetch('/api/market/mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfileId: form.businessProfileId,
          goal: form.goal,
          timeframe: form.timeframe,
          budget: form.budget,
          platforms: form.platforms,
          locale,
          autoExecute: form.autoExecute && isGalaxy,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setPlan(data.plan)
      setMissions((prev) => [data.mission, ...prev])
      setActiveMission(data.mission)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      clearInterval(stepInterval)
      setLoading(false)
    }
  }

  async function handleRunReview() {
    if (!activeMission) return
    setRunningReview(true)
    try {
      const res = await fetch('/api/market/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missionId: activeMission.id,
          performanceData: activeMission.plan?.kpis || {},
          locale,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review failed')
    } finally {
      setRunningReview(false)
    }
  }

  function togglePlatform(p: string) {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
    }))
  }

  const TABS = [
    { id: 'missions' as const, label: 'Mission Control', icon: Zap },
    { id: 'new' as const, label: 'New Mission', icon: Plus },
    { id: 'calendar' as const, label: 'Content Calendar', icon: Calendar },
    { id: 'performance' as const, label: 'Performance', icon: BarChart2 },
    { id: 'team' as const, label: 'Agent Team', icon: Bot },
  ]

  return (
    <div className="min-h-screen bg-[#080C14] text-[#EEF2FF] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
              <Zap size={20} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#EEF2FF]">ELEVO Market™</h1>
              <p className="text-sm text-gray-400">Your complete AI marketing department</p>
            </div>
          </div>
        </div>

        <div className="flex gap-1 mb-8 bg-[#141B24] rounded-xl p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'missions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Active Missions</h2>
              <button
                onClick={() => setActiveTab('new')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={14} />
                New Mission
              </button>
            </div>

            {loadingMissions ? (
              <div className="text-center py-12 text-gray-400">Loading missions...</div>
            ) : missions.length === 0 ? (
              <div className="text-center py-16 bg-[#141B24] rounded-2xl border border-white/5">
                <Zap size={40} className="text-indigo-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No missions yet</h3>
                <p className="text-gray-400 mb-6 text-sm">Create your first marketing mission to get started</p>
                <button
                  onClick={() => setActiveTab('new')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Create Mission
                </button>
              </div>
            ) : (
              missions.map((m) => {
                const totalWeeks = parseInt(m.timeframe) || 4
                const weekPct = Math.min(100, ((m.current_week || 1) / totalWeeks) * 100)
                return (
                  <div
                    key={m.id}
                    className={`bg-[#141B24] rounded-2xl border p-6 transition-all ${
                      activeMission?.id === m.id ? 'border-indigo-500/50' : 'border-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${m.status === 'active' ? 'bg-green-400' : 'bg-gray-500'}`} />
                          <h3 className="font-semibold text-[#EEF2FF] truncate">{m.title}</h3>
                        </div>
                        <p className="text-sm text-gray-400 mb-3 truncate">{m.goal}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Week {m.current_week || 1} of {totalWeeks}</span>
                          <span>{m.total_credits_used || 10} credits used</span>
                          {m.auto_execute && (
                            <span className="text-indigo-400 flex items-center gap-1">
                              <Zap size={10} /> Auto-executing
                            </span>
                          )}
                        </div>
                        <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all"
                            style={{ width: `${weekPct}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{Math.round(weekPct)}% complete</span>
                          <span className="text-xs text-green-400 ml-auto">Health: 85%</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => { setActiveMission(m); setActiveTab('calendar') }}
                          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg text-xs transition-colors"
                        >
                          <Eye size={12} /> View
                        </button>
                        {isGalaxy && (
                          <button className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg text-xs transition-colors">
                            <Pause size={12} /> Pause
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'new' && (
          <div className="max-w-2xl">
            {!plan && !loading && (
              <div className="bg-[#141B24] rounded-2xl border border-white/5 p-6 space-y-6">
                <h2 className="text-lg font-semibold">Build New Marketing Mission</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Business Profile</label>
                  <select
                    value={form.businessProfileId}
                    onChange={(e) => setForm((f) => ({ ...f, businessProfileId: e.target.value }))}
                    className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-3 text-[#EEF2FF] text-sm"
                  >
                    <option value="">Select a business...</option>
                    {businessProfiles.map((bp) => (
                      <option key={bp.id} value={bp.id}>{bp.business_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Mission Goal</label>
                  <textarea
                    value={form.goal}
                    onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                    placeholder="e.g. Get 500 new followers on Instagram and generate 20 leads per month within 4 weeks"
                    rows={3}
                    className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-3 text-[#EEF2FF] text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Timeframe</label>
                    <select
                      value={form.timeframe}
                      onChange={(e) => setForm((f) => ({ ...f, timeframe: e.target.value }))}
                      className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-3 text-[#EEF2FF] text-sm"
                    >
                      {TIMEFRAME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ad Budget</label>
                    <select
                      value={form.budget}
                      onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                      className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-3 text-[#EEF2FF] text-sm"
                    >
                      {BUDGET_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Platforms</label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p}
                        onClick={() => togglePlatform(p)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                          form.platforms.includes(p)
                            ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {isGalaxy && (
                  <div className="flex items-center justify-between p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-indigo-300">Auto-Execute Daily</p>
                      <p className="text-xs text-gray-400">Galaxy feature — runs the mission autonomously each day</p>
                    </div>
                    <button
                      onClick={() => setForm((f) => ({ ...f, autoExecute: !f.autoExecute }))}
                      className={`w-12 h-6 rounded-full transition-colors relative ${form.autoExecute ? 'bg-indigo-600' : 'bg-white/10'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.autoExecute ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                )}

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                  onClick={handleGenerate}
                  disabled={!form.goal || !form.businessProfileId}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Zap size={18} />
                  Build Marketing Mission (10 credits)
                </button>
              </div>
            )}

            {loading && (
              <div className="bg-[#141B24] rounded-2xl border border-indigo-500/30 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto mb-6">
                  <Zap size={24} className="text-indigo-400 animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold mb-6">Building your marketing mission...</h3>
                <div className="space-y-3 max-w-sm mx-auto">
                  {LOADING_STEPS.map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      {i < loadingStep ? (
                        <CheckCircle size={16} className="text-green-400 shrink-0" />
                      ) : i === loadingStep ? (
                        <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-white/10 shrink-0" />
                      )}
                      <span className={i <= loadingStep ? 'text-[#EEF2FF]' : 'text-gray-500'}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {plan && !loading && (
              <div className="space-y-4">
                <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={18} className="text-green-400" />
                    <h3 className="font-semibold text-[#EEF2FF]">{plan.missionTitle}</h3>
                  </div>
                  <p className="text-sm text-gray-300">{plan.executiveSummary}</p>
                </div>

                <div className="bg-[#141B24] rounded-2xl border border-white/5 p-5">
                  <h4 className="text-sm font-semibold text-[#EEF2FF] mb-3">Strategy Overview</h4>
                  <p className="text-sm text-indigo-300 mb-3 italic">"{plan.strategy.overarchingAngle}"</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {plan.strategy.platformPriority.map((p) => (
                      <span key={p.platform} className={`px-2 py-1 rounded-full text-xs border ${PLATFORM_COLORS[p.platform] || 'bg-white/5 text-gray-400 border-white/10'}`}>
                        {p.platform}: {p.allocation}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400"><span className="text-gray-300">Competitor gap:</span> {plan.strategy.competitorGap}</p>
                </div>

                <div className="bg-[#141B24] rounded-2xl border border-white/5 p-5">
                  <h4 className="text-sm font-semibold mb-3">Weekly Plans</h4>
                  <div className="space-y-2">
                    {plan.weeklyPlans.map((w) => (
                      <div key={w.week} className="border border-white/5 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedWeeks((s) => { const n = new Set(s); n.has(w.week - 1) ? n.delete(w.week - 1) : n.add(w.week - 1); return n })}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-white/3 transition-colors"
                        >
                          <div>
                            <span className="text-xs text-indigo-400 font-semibold">WEEK {w.week}</span>
                            <p className="text-sm font-medium text-[#EEF2FF]">{w.theme}</p>
                          </div>
                          {expandedWeeks.has(w.week - 1) ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                        </button>
                        {expandedWeeks.has(w.week - 1) && (
                          <div className="px-4 pb-4 space-y-2">
                            <p className="text-sm text-gray-400">{w.focus}</p>
                            <div className="flex flex-wrap gap-2">
                              {w.keyActions.map((a, i) => (
                                <span key={i} className="text-xs bg-white/5 rounded-lg px-2 py-1 text-gray-300">{a}</span>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {w.agentsToActivate.map((a) => (
                                <span key={a} className="text-xs bg-indigo-600/20 border border-indigo-500/30 rounded-full px-2 py-0.5 text-indigo-300">{a}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#141B24] rounded-2xl border border-white/5 p-5">
                  <h4 className="text-sm font-semibold mb-2">Mission Stats</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white/3 rounded-xl">
                      <p className="text-2xl font-bold text-indigo-400">{plan.contentCalendar.length}</p>
                      <p className="text-xs text-gray-400">Posts planned</p>
                    </div>
                    <div className="text-center p-3 bg-white/3 rounded-xl">
                      <p className="text-2xl font-bold text-green-400">{plan.estimatedTotalCredits}</p>
                      <p className="text-xs text-gray-400">Credits needed</p>
                    </div>
                    <div className="text-center p-3 bg-white/3 rounded-xl">
                      <p className="text-xl font-bold text-amber-400">{plan.successProbability}</p>
                      <p className="text-xs text-gray-400">Success rate</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { setActiveTab('missions'); setMissions((prev) => prev); }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 rounded-xl transition-colors"
                >
                  Mission Launched ✓
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Content Calendar</h2>
              {activeMission && (
                <div className="flex items-center gap-2">
                  <select
                    className="bg-[#141B24] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300"
                    onChange={(e) => { const m = missions.find((x) => x.id === e.target.value); if (m) setActiveMission(m) }}
                    value={activeMission.id}
                  >
                    {missions.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
              )}
            </div>

            {!activeMission ? (
              <div className="text-center py-16 text-gray-400">No mission selected. Create one first.</div>
            ) : (
              <div className="space-y-2">
                {(activeMission.plan?.contentCalendar || []).map((entry, i) => (
                  <div key={i} className="bg-[#141B24] rounded-xl border border-white/5 overflow-hidden">
                    <button
                      onClick={() => setExpandedCalItems((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })}
                      className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/3 transition-colors"
                    >
                      <div className="text-xs text-gray-500 w-24 shrink-0">{entry.date}</div>
                      <span className={`px-2 py-0.5 rounded-full text-xs border shrink-0 ${PLATFORM_COLORS[entry.platform] || 'bg-white/5 text-gray-400 border-white/10'}`}>
                        {entry.platform}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">{entry.contentType}</span>
                      <p className="text-sm text-[#EEF2FF] flex-1 truncate">{entry.topic}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        entry.status === 'published' ? 'bg-green-500/20 text-green-400' :
                        entry.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-white/5 text-gray-400'
                      }`}>{entry.status}</span>
                      {expandedCalItems.has(i) ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                    </button>
                    {expandedCalItems.has(i) && (
                      <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-4">
                        <div>
                          <p className="text-xs text-indigo-400 font-semibold mb-1">HOOK</p>
                          <div className="flex items-start gap-2">
                            <p className="text-sm text-[#EEF2FF]">{entry.hook}</p>
                            <CopyButton text={entry.hook} />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-indigo-400 font-semibold mb-1">CAPTION</p>
                          <div className="flex items-start gap-2">
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{entry.caption}</p>
                            <CopyButton text={entry.caption} />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {entry.hashtags.map((h, j) => (
                            <span key={j} className="text-xs text-indigo-300 bg-indigo-600/10 rounded-full px-2 py-0.5">{h}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span><Clock size={10} className="inline mr-1" />{entry.bestTime}</span>
                          <span>{entry.credits} credit{entry.credits !== 1 ? 's' : ''}</span>
                          <span className="text-indigo-300">{entry.agentToGenerate}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            {!activeMission ? (
              <div className="text-center py-16 text-gray-400">No mission selected.</div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(activeMission.plan?.kpis || []).slice(0, 4).map((kpi, i) => (
                    <div key={i} className="bg-[#141B24] rounded-xl border border-white/5 p-4">
                      <p className="text-xs text-gray-400 mb-1">{kpi.metric}</p>
                      <p className="text-xl font-bold text-indigo-400">{kpi.weeklyTarget}</p>
                      <p className="text-xs text-gray-500">target/week</p>
                    </div>
                  ))}
                </div>

                <div className="bg-[#141B24] rounded-2xl border border-white/5 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Weekly Review</h3>
                    <button
                      onClick={handleRunReview}
                      disabled={runningReview}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {runningReview ? (
                        <><RefreshCw size={14} className="animate-spin" /> Running Review...</>
                      ) : (
                        <><RefreshCw size={14} /> Run Weekly Review (3 credits)</>
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-400">Run a weekly review to analyse performance and update your content calendar based on what's working.</p>
                </div>

                <div className="bg-[#141B24] rounded-2xl border border-white/5 p-6">
                  <h3 className="font-semibold mb-4">KPI Targets</h3>
                  <div className="space-y-3">
                    {(activeMission.plan?.kpis || []).map((kpi, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-[#EEF2FF]">{kpi.metric}</p>
                          <p className="text-xs text-gray-400">{kpi.measureHow}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-indigo-400">{kpi.monthlyTarget}</p>
                          <p className="text-xs text-gray-500">monthly target</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-4">
            {!activeMission ? (
              <div className="text-center py-16 text-gray-400">No mission selected.</div>
            ) : (
              <>
                <h2 className="text-lg font-semibold">Agent Activations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(activeMission.plan?.agentActivations || []).map((a, i) => (
                    <div key={i} className="bg-[#141B24] rounded-xl border border-white/5 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-indigo-300">{a.agent}</span>
                        <span className="text-xs text-gray-400">{a.frequency}</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{a.task}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span><Clock size={10} className="inline mr-1" />{a.when}</span>
                        <span>{a.credits} credit{a.credits !== 1 ? 's' : ''}/run</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#141B24] rounded-2xl border border-white/5 p-5 mt-4">
                  <h3 className="font-semibold mb-3">Activity Feed</h3>
                  <div className="space-y-2">
                    {[
                      { time: 'Today 09:00', action: 'ELEVO Write generated 2 Instagram captions', type: 'success' },
                      { time: 'Today 08:30', action: 'Mission day 3 execution summary ready', type: 'info' },
                      { time: 'Yesterday 18:00', action: 'ELEVO Viral™ identified 3 trending hooks', type: 'success' },
                      { time: 'Yesterday 09:00', action: 'ELEVO Write generated 2 TikTok scripts', type: 'success' },
                      { time: '2 days ago', action: 'Weekly content calendar generated', type: 'info' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.type === 'success' ? 'bg-green-400' : 'bg-blue-400'}`} />
                        <div>
                          <p className="text-sm text-[#EEF2FF]">{item.action}</p>
                          <p className="text-xs text-gray-500">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
