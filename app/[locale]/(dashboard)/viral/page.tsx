'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp, Zap, Calendar, BookOpen, BarChart2,
  ChevronDown, ChevronUp, Play, RefreshCw, Copy, Check,
  Film, Clock, Eye, Star, AlertCircle,
} from 'lucide-react'
import type { ViralStrategy } from '@/lib/agents/viralMarketingAgent'

const PLATFORMS = ['TikTok', 'Instagram', 'Facebook', 'YouTube Shorts', 'LinkedIn', 'Twitter/X']
const BUDGET_OPTIONS = [
  { value: 'zero', label: 'Zero budget (organic only)' },
  { value: 'low', label: 'Low (£50-200/mo)' },
  { value: 'medium', label: 'Medium (£200-500/mo)' },
  { value: 'high', label: 'High (£500+/mo)' },
]
const GOAL_OPTIONS = [
  { value: 'followers', label: 'Grow followers' },
  { value: 'leads', label: 'Generate leads' },
  { value: 'sales', label: 'Drive sales' },
  { value: 'brand_awareness', label: 'Brand awareness' },
  { value: 'traffic', label: 'Website traffic' },
]

const TABS = [
  { id: 'trending', label: 'Trending Now', icon: TrendingUp },
  { id: 'formula', label: 'Your Viral Formula', icon: Zap },
  { id: 'calendar', label: '30-Day Calendar', icon: Calendar },
  { id: 'elevo-own', label: 'ELEVO Own', icon: Star },
]

const URGENCY_CONFIG = {
  post_today: { label: 'POST TODAY', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  this_week: { label: 'THIS WEEK', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  upcoming: { label: 'UPCOMING', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
}

const VIRAL_CONFIG = {
  explosive: { label: 'EXPLOSIVE', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  high: { label: 'HIGH', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  medium: { label: 'MEDIUM', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  low: { label: 'LOW', color: 'text-gray-400', bg: 'bg-gray-500/10' },
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

export default function ViralPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState('en')
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('trending')
  const [strategy, setStrategy] = useState<ViralStrategy | null>(null)
  const [trends, setTrends] = useState<Array<{ trend: string; platform: string; type: string; peakWindow: string; howToUse: string; hook: string }>>([])
  const [loading, setLoading] = useState(false)
  const [loadingTrends, setLoadingTrends] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [businessProfiles, setBusinessProfiles] = useState<Array<{ id: string; business_name: string; category: string }>>([])
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set())
  const [hookPlatformFilter, setHookPlatformFilter] = useState('all')
  const [generatingPost, setGeneratingPost] = useState<number | null>(null)
  const [generatedPosts, setGeneratedPosts] = useState<Record<number, { hook: string; fullScript: string; caption: string; hashtags: string[] }>>({})

  const [form, setForm] = useState({
    businessProfileId: '',
    targetPlatforms: ['TikTok', 'Instagram'] as string[],
    contentBudget: 'zero' as 'zero' | 'low' | 'medium' | 'high',
    goal: 'followers' as 'followers' | 'leads' | 'sales' | 'brand_awareness' | 'traffic',
  })

  useEffect(() => {
    params.then(p => setLocale(p.locale))
    fetchProfiles()
    checkAdmin()
  }, [])

  useEffect(() => {
    if (businessProfiles.length > 0 && !form.businessProfileId) {
      const primary = businessProfiles[0]
      setForm(f => ({ ...f, businessProfileId: primary.id }))
      fetchTrends(primary.category, form.targetPlatforms)
    }
  }, [businessProfiles])

  async function checkAdmin() {
    const res = await fetch('/api/business-profiles')
    if (res.ok) {
      const data = await res.json()
      setIsAdmin(data.role === 'admin')
    }
  }

  async function fetchProfiles() {
    const res = await fetch('/api/business-profiles')
    if (res.ok) {
      const data = await res.json()
      setBusinessProfiles(data.profiles ?? [])
    }
  }

  async function fetchTrends(niche?: string, platforms?: string[]) {
    setLoadingTrends(true)
    const selectedNiche = niche ?? businessProfiles.find(b => b.id === form.businessProfileId)?.category ?? 'local business'
    const selectedPlatforms = platforms ?? form.targetPlatforms
    const params = new URLSearchParams({
      niche: selectedNiche,
      platforms: selectedPlatforms.join(','),
      locale,
    })
    try {
      const res = await fetch(`/api/viral/trending?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTrends(data.trends ?? [])
      }
    } catch (err) {
      console.error('Failed to fetch trends', err)
    } finally {
      setLoadingTrends(false)
    }
  }

  function togglePlatform(platform: string) {
    setForm(f => ({
      ...f,
      targetPlatforms: f.targetPlatforms.includes(platform)
        ? f.targetPlatforms.filter(p => p !== platform)
        : [...f.targetPlatforms, platform],
    }))
  }

  async function handleGenerate() {
    if (!form.businessProfileId) return setError('Select a business profile')
    if (form.targetPlatforms.length === 0) return setError('Select at least one platform')
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/viral/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, locale }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setStrategy(data.strategy)
      setActiveTab('trending')
      if (data.strategy.trendingNow?.length > 0) {
        setTrends(data.strategy.trendingNow.map((t: { trend: string; platform: string; trendType: string; peakExpected: string; howToUse: string; exampleHook: string }) => ({
          trend: t.trend,
          platform: t.platform,
          type: t.trendType,
          peakWindow: t.peakExpected,
          howToUse: t.howToUse,
          hook: t.exampleHook,
        })))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  async function generatePostFromCalendar(dayEntry: ViralStrategy['viralCalendar'][0], dayIndex: number) {
    if (!form.businessProfileId) return
    setGeneratingPost(dayIndex)
    try {
      const res = await fetch('/api/viral/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfileId: form.businessProfileId,
          platform: dayEntry.platform,
          format: dayEntry.contentType,
          hook: dayEntry.hook,
          trendToRide: dayEntry.trendToRide,
          locale,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setGeneratedPosts(p => ({ ...p, [dayIndex]: data.post }))
      }
    } catch (err) {
      console.error('Post generation failed', err)
    } finally {
      setGeneratingPost(null)
    }
  }

  const visibleTabs = TABS.filter(t => t.id !== 'elevo-own' || isAdmin)

  return (
    <div className="min-h-screen bg-[#080C14] text-[#EEF2FF]">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#6366F1]/20 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-[#6366F1]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#EEF2FF]">ELEVO Viral™</h1>
              <p className="text-sm text-gray-400">Go viral. Grow organically.</p>
            </div>
          </div>
        </div>

        {/* Strategy form */}
        <div className="bg-[#141B24] border border-white/5 rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-[#EEF2FF] mb-4">Generate Viral Strategy</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Business profile */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Business Profile</label>
              <select
                value={form.businessProfileId}
                onChange={e => setForm(f => ({ ...f, businessProfileId: e.target.value }))}
                className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#EEF2FF] focus:outline-none focus:border-[#6366F1]/50"
              >
                <option value="">Select profile...</option>
                {businessProfiles.map(bp => (
                  <option key={bp.id} value={bp.id}>{bp.business_name}</option>
                ))}
              </select>
            </div>

            {/* Goal */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Primary Goal</label>
              <select
                value={form.goal}
                onChange={e => setForm(f => ({ ...f, goal: e.target.value as typeof form.goal }))}
                className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#EEF2FF] focus:outline-none focus:border-[#6366F1]/50"
              >
                {GOAL_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
          </div>

          {/* Budget */}
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-2">Content Budget</label>
            <div className="flex flex-wrap gap-2">
              {BUDGET_OPTIONS.map(b => (
                <button
                  key={b.value}
                  onClick={() => setForm(f => ({ ...f, contentBudget: b.value as typeof form.contentBudget }))}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${form.contentBudget === b.value ? 'bg-[#6366F1]/20 border-[#6366F1]/50 text-[#6366F1]' : 'bg-[#1A2332] border-white/10 text-gray-400 hover:text-gray-300'}`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div className="mb-5">
            <label className="block text-xs text-gray-400 mb-2">Target Platforms</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${form.targetPlatforms.includes(p) ? 'bg-[#6366F1]/20 border-[#6366F1]/50 text-[#6366F1]' : 'bg-[#1A2332] border-white/10 text-gray-400 hover:text-gray-300'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-[#6366F1] hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Building your viral strategy... (this takes ~2 minutes)
              </>
            ) : (
              <>
                <TrendingUp size={16} />
                Generate Viral Strategy (5 credits)
              </>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#141B24] rounded-xl p-1 mb-6 border border-white/5 overflow-x-auto">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-[#6366F1] text-white' : 'text-gray-400 hover:text-gray-300'}`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TRENDING NOW ─────────────────────────────────────────────────────── */}
        {activeTab === 'trending' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#EEF2FF]">Trending Now in Your Niche</h2>
              <button
                onClick={() => fetchTrends()}
                disabled={loadingTrends}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-300 bg-[#1A2332] border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <RefreshCw size={13} className={loadingTrends ? 'animate-spin' : ''} />
                Refresh trends (1 credit)
              </button>
            </div>

            {loadingTrends && (
              <div className="bg-[#141B24] border border-white/5 rounded-2xl p-12 text-center">
                <RefreshCw size={24} className="animate-spin text-[#6366F1] mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Scanning trending topics...</p>
              </div>
            )}

            {!loadingTrends && trends.length === 0 && (
              <div className="bg-[#141B24] border border-white/5 rounded-2xl p-12 text-center">
                <TrendingUp size={32} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-2">No trends loaded yet</p>
                <p className="text-gray-500 text-sm">Generate a strategy or click Refresh to load current trends</p>
              </div>
            )}

            {!loadingTrends && trends.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trends.map((trend, i) => {
                  // For strategy-derived trends, map urgency from viralPotential
                  const strategyTrend = strategy?.trendingNow?.[i]
                  const urgency = strategyTrend?.urgency ?? 'this_week'
                  const viralPotential = strategyTrend?.viralPotential ?? 'medium'
                  const urgCfg = URGENCY_CONFIG[urgency]
                  const viralCfg = VIRAL_CONFIG[viralPotential]

                  return (
                    <div key={i} className="bg-[#141B24] border border-white/5 rounded-2xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs bg-[#6366F1]/20 text-[#6366F1] px-2 py-0.5 rounded-full font-medium">
                            {trend.platform}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${urgCfg.bg} ${urgCfg.color}`}>
                            {urgCfg.label}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${viralCfg.bg} ${viralCfg.color}`}>
                            {viralCfg.label} POTENTIAL
                          </span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-[#EEF2FF] mb-1">{trend.trend}</h3>
                      <p className="text-xs text-gray-500 mb-2">Type: {trend.type} · Peaks: {trend.peakWindow}</p>
                      <p className="text-sm text-gray-400 mb-3">{trend.howToUse}</p>
                      {trend.hook && (
                        <div className="bg-[#1A2332] rounded-xl p-3 mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">Example hook</span>
                            <CopyButton text={trend.hook} />
                          </div>
                          <p className="text-sm text-[#EEF2FF] italic">"{trend.hook}"</p>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setForm(f => ({ ...f }))
                          setActiveTab('calendar')
                        }}
                        className="w-full text-center text-xs text-[#6366F1] hover:text-indigo-400 py-2 border border-[#6366F1]/20 rounded-lg transition-colors"
                      >
                        Create post for this trend →
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── YOUR VIRAL FORMULA ────────────────────────────────────────────────── */}
        {activeTab === 'formula' && (
          <div>
            {!strategy && (
              <div className="bg-[#141B24] border border-white/5 rounded-2xl p-12 text-center">
                <Zap size={32} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-2">No strategy generated yet</p>
                <p className="text-gray-500 text-sm">Generate a viral strategy above to see your formula</p>
              </div>
            )}

            {strategy && (
              <div className="space-y-6">
                {/* Viral readiness score */}
                <div className="bg-[#141B24] border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[#EEF2FF]">Viral Readiness Score</h3>
                    <span className="text-2xl font-bold text-[#6366F1]">{strategy.viralReadinessScore}/100</span>
                  </div>
                  <div className="w-full bg-[#1A2332] rounded-full h-3 mb-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-[#6366F1] to-indigo-400 transition-all"
                      style={{ width: `${strategy.viralReadinessScore}%` }}
                    />
                  </div>
                  <p className="text-sm text-amber-400 font-medium">Biggest opportunity: {strategy.biggestOpportunity}</p>
                </div>

                {/* Viral formula */}
                <div className="bg-[#141B24] border border-white/5 rounded-2xl p-6">
                  <h3 className="font-semibold text-[#EEF2FF] mb-4">Your Viral Formula</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(strategy.viralFormula).map(([key, val]) => (
                      <div key={key} className="bg-[#1A2332] rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm text-[#EEF2FF]">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hook library */}
                <div className="bg-[#141B24] border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#EEF2FF]">Hook Library ({strategy.hookLibrary?.length ?? 0} hooks)</h3>
                    <select
                      value={hookPlatformFilter}
                      onChange={e => setHookPlatformFilter(e.target.value)}
                      className="bg-[#1A2332] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-[#EEF2FF] focus:outline-none"
                    >
                      <option value="all">All platforms</option>
                      {form.targetPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    {(strategy.hookLibrary ?? [])
                      .filter(h => hookPlatformFilter === 'all' || h.platform === hookPlatformFilter)
                      .map((hook, i) => (
                        <div key={i} className="bg-[#1A2332] rounded-xl p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="text-sm text-[#EEF2FF] font-medium italic">"{hook.hook}"</p>
                            <CopyButton text={hook.hook} />
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs bg-[#6366F1]/10 text-[#6366F1] px-2 py-0.5 rounded">{hook.platform}</span>
                            <span className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded">{hook.type}</span>
                            <span className="text-xs text-gray-500">{hook.emotion}</span>
                          </div>
                          {hook.exampleExpansion && (
                            <p className="text-xs text-gray-500 mt-2">{hook.exampleExpansion}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* KPIs */}
                {strategy.kpis && (
                  <div className="bg-[#141B24] border border-white/5 rounded-2xl p-6">
                    <h3 className="font-semibold text-[#EEF2FF] mb-4">KPI Targets</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="text-left text-xs text-gray-500 pb-2 font-medium">Metric</th>
                            <th className="text-left text-xs text-gray-500 pb-2 font-medium">Baseline</th>
                            <th className="text-left text-xs text-gray-500 pb-2 font-medium">Day 30</th>
                            <th className="text-left text-xs text-gray-500 pb-2 font-medium">Day 90</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {strategy.kpis.map((kpi, i) => (
                            <tr key={i}>
                              <td className="py-2.5 text-[#EEF2FF]">{kpi.metric}</td>
                              <td className="py-2.5 text-gray-400">{kpi.baseline}</td>
                              <td className="py-2.5 text-amber-400">{kpi.day30Target}</td>
                              <td className="py-2.5 text-green-400">{kpi.day90Target}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── 30-DAY CALENDAR ───────────────────────────────────────────────────── */}
        {activeTab === 'calendar' && (
          <div>
            {!strategy && (
              <div className="bg-[#141B24] border border-white/5 rounded-2xl p-12 text-center">
                <Calendar size={32} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-2">No calendar yet</p>
                <p className="text-gray-500 text-sm">Generate a viral strategy to see your 30-day calendar</p>
              </div>
            )}

            {strategy?.viralCalendar && (
              <div className="space-y-3">
                {strategy.viralCalendar.map((entry, i) => {
                  const isExpanded = expandedDays.has(i)
                  const generatedPost = generatedPosts[i]

                  return (
                    <div key={i} className="bg-[#141B24] border border-white/5 rounded-2xl overflow-hidden">
                      <button
                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/2 transition-colors"
                        onClick={() => setExpandedDays(s => {
                          const next = new Set(s)
                          isExpanded ? next.delete(i) : next.add(i)
                          return next
                        })}
                      >
                        <div className="w-10 h-10 bg-[#6366F1]/20 rounded-xl flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-[#6366F1]">D{entry.day}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-xs bg-[#1A2332] text-gray-400 px-2 py-0.5 rounded">{entry.platform}</span>
                            <span className="text-xs text-gray-500">{entry.contentType}</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={10} />{entry.bestTimeToPost}</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1"><Eye size={10} />{entry.expectedViews}</span>
                          </div>
                          <p className="text-sm text-[#EEF2FF] font-medium truncate">{entry.hook}</p>
                        </div>
                        {isExpanded ? <ChevronUp size={16} className="text-gray-500 shrink-0" /> : <ChevronDown size={16} className="text-gray-500 shrink-0" />}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-4">
                          {/* Full script */}
                          <div className="bg-[#1A2332] rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-500 uppercase tracking-wider">Full Script / Caption</span>
                              <CopyButton text={entry.fullScript} />
                            </div>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{entry.fullScript}</p>
                          </div>

                          {/* Hashtags */}
                          {entry.hashtags?.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Hashtags</p>
                              <div className="flex flex-wrap gap-1.5">
                                {entry.hashtags.map((tag, j) => (
                                  <span key={j} className="text-xs bg-[#6366F1]/10 text-[#6366F1] px-2 py-0.5 rounded">
                                    #{tag.replace(/^#/, '')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Viral element & trend */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#1A2332] rounded-xl p-3">
                              <p className="text-xs text-gray-500 mb-1">Viral element</p>
                              <p className="text-sm text-amber-400">{entry.viralElement}</p>
                            </div>
                            {entry.trendToRide && (
                              <div className="bg-[#1A2332] rounded-xl p-3">
                                <p className="text-xs text-gray-500 mb-1">Trend to ride</p>
                                <p className="text-sm text-green-400">{entry.trendToRide}</p>
                              </div>
                            )}
                          </div>

                          {/* Thumbnail */}
                          {entry.thumbnail && (
                            <div className="bg-[#1A2332] rounded-xl p-3">
                              <p className="text-xs text-gray-500 mb-1">Thumbnail description</p>
                              <p className="text-sm text-gray-300">{entry.thumbnail}</p>
                            </div>
                          )}

                          {/* Vega prompt */}
                          {entry.vegaPrompt && (
                            <div className="bg-[#1A2332] rounded-xl p-3">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-gray-500">ELEVO Studio™ video prompt</p>
                                <CopyButton text={entry.vegaPrompt} />
                              </div>
                              <p className="text-sm text-gray-300 italic">{entry.vegaPrompt}</p>
                              <a
                                href={`/${locale}/video-studio`}
                                className="mt-2 inline-flex items-center gap-1 text-xs text-[#6366F1] hover:text-indigo-400"
                              >
                                <Film size={12} />
                                Create video in ELEVO Studio →
                              </a>
                            </div>
                          )}

                          {/* Generated post preview */}
                          {generatedPost && (
                            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                              <p className="text-xs text-green-400 mb-2 font-medium">Generated post</p>
                              <p className="text-sm text-gray-300 mb-2 font-medium italic">"{generatedPost.hook}"</p>
                              <p className="text-sm text-gray-400 whitespace-pre-wrap">{generatedPost.caption}</p>
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => generatePostFromCalendar(entry, i)}
                              disabled={generatingPost === i}
                              className="flex items-center gap-1.5 text-sm bg-[#6366F1] hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              {generatingPost === i ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                              {generatingPost === i ? 'Generating...' : 'Generate this post (1 credit)'}
                            </button>
                            <a
                              href={`/${locale}/video-studio`}
                              className="flex items-center gap-1.5 text-sm bg-[#1A2332] hover:bg-white/10 text-gray-400 hover:text-gray-300 px-4 py-2 rounded-lg border border-white/10 transition-colors"
                            >
                              <Film size={14} />
                              Create video →
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ELEVO OWN (admin only) ────────────────────────────────────────────── */}
        {activeTab === 'elevo-own' && isAdmin && (
          <div>
            {!strategy?.eleveOwnViralPlan && (
              <div className="bg-[#141B24] border border-white/5 rounded-2xl p-12 text-center">
                <Star size={32} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-2">No ELEVO Own plan generated</p>
                <p className="text-gray-500 text-sm">Generate a strategy to see the ELEVO Own viral plan</p>
              </div>
            )}

            {strategy?.eleveOwnViralPlan && (
              <div className="space-y-6">
                <div className="bg-[#141B24] border border-white/5 rounded-2xl p-6">
                  <h3 className="font-semibold text-[#EEF2FF] mb-4">ELEVO Own Viral Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#1A2332] rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-2">Target niches</p>
                      <div className="flex flex-wrap gap-1.5">
                        {strategy.eleveOwnViralPlan.targetNiches.map((n, i) => (
                          <span key={i} className="text-xs bg-[#6366F1]/10 text-[#6366F1] px-2 py-0.5 rounded">{n}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#1A2332] rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Cross-platform angle</p>
                      <p className="text-sm text-[#EEF2FF]">{strategy.eleveOwnViralPlan.crossPlatformAngle}</p>
                    </div>
                  </div>
                  <div className="bg-[#1A2332] rounded-xl p-4 mb-4">
                    <p className="text-xs text-gray-500 mb-1">Founder content strategy</p>
                    <p className="text-sm text-[#EEF2FF]">{strategy.eleveOwnViralPlan.founderContentStrategy}</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
                    <p className="text-xs text-amber-400 font-medium mb-2">Urgent actions</p>
                    <ul className="space-y-1">
                      {strategy.eleveOwnViralPlan.urgentActions.map((a, i) => (
                        <li key={i} className="text-sm text-amber-300 flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">→</span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-[#141B24] border border-white/5 rounded-2xl p-6">
                  <h3 className="font-semibold text-[#EEF2FF] mb-4">First 7 Days Content Script</h3>
                  <div className="space-y-4">
                    {strategy.eleveOwnViralPlan.first7DaysScript.map((day, i) => (
                      <div key={i} className="bg-[#1A2332] rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-[#6366F1]/20 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-bold text-[#6366F1]">D{day.day}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">{day.platform}</span>
                            <p className="text-sm font-medium text-[#EEF2FF] italic">"{day.hook}"</p>
                          </div>
                          <CopyButton text={day.content} />
                        </div>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{day.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Executive summary (shown when strategy loaded) */}
        {strategy && (
          <div className="mt-6 bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 size={16} className="text-[#6366F1]" />
              <span className="text-sm font-semibold text-[#6366F1]">Executive Summary</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{strategy.executiveSummary}</p>
          </div>
        )}
      </div>
    </div>
  )
}
