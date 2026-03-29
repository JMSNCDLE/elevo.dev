'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, Search, AlertTriangle, TrendingUp, MessageSquare,
  BarChart2, Globe, DollarSign, Shield, Zap, RefreshCw,
  ChevronRight, Bell, Target, Lock,
} from 'lucide-react'
import type { CompetitorIntelReport } from '@/lib/agents/competitorSpyAgent'

const THREAT_CONFIG = {
  low: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', label: 'LOW THREAT' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'MEDIUM THREAT' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', label: 'HIGH THREAT' },
  critical: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'CRITICAL THREAT' },
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'content', label: 'Content', icon: MessageSquare },
  { id: 'ads', label: 'Ads', icon: Target },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'sentiment', label: 'Sentiment', icon: TrendingUp },
  { id: 'battleplan', label: 'Battle Plan', icon: Zap },
]

type DepthOption = { id: 'quick' | 'deep' | 'full'; label: string; credits: number; time: string }
const DEPTH_OPTIONS: DepthOption[] = [
  { id: 'quick', label: 'Quick Scan', credits: 1, time: '~2 min' },
  { id: 'deep', label: 'Deep Dive', credits: 3, time: '~8 min' },
  { id: 'full', label: 'Full Intel', credits: 5, time: '~20 min' },
]

export default function SpyPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState('en')
  const [activeTab, setActiveTab] = useState('overview')
  const [form, setForm] = useState({
    competitorName: '',
    competitorWebsite: '',
    competitorInstagram: '',
    analysisDepth: 'quick' as 'quick' | 'deep' | 'full',
    businessProfileId: '',
  })
  const [businessProfiles, setBusinessProfiles] = useState<Array<{ id: string; business_name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [report, setReport] = useState<CompetitorIntelReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savedCompetitors, setSavedCompetitors] = useState<Array<{ id: string; competitor_name: string; threat_level: string; last_refreshed_at: string }>>([])

  useEffect(() => {
    params.then(p => setLocale(p.locale))
    fetchProfiles()
    fetchSavedCompetitors()
  }, [])

  async function fetchProfiles() {
    const res = await fetch('/api/business-profiles')
    if (res.ok) {
      const data = await res.json()
      const profiles = data.profiles ?? []
      setBusinessProfiles(profiles)
      if (profiles.length > 0) setForm(f => ({ ...f, businessProfileId: profiles[0].id }))
    }
  }

  async function fetchSavedCompetitors() {
    const res = await fetch('/api/spy/saved')
    if (res.ok) {
      const data = await res.json()
      setSavedCompetitors(data.competitors ?? [])
    }
  }

  const LOADING_STEPS = [
    'Scanning web presence...',
    'Analysing content strategy...',
    'Checking ad activity...',
    'Reading customer sentiment...',
    'Building battle plan...',
  ]

  async function handleAnalyse() {
    if (!form.competitorName || !form.businessProfileId) return
    setLoading(true)
    setError(null)
    setReport(null)

    // Simulate loading steps
    let stepIdx = 0
    setLoadingStep(LOADING_STEPS[0])
    const stepInterval = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, LOADING_STEPS.length - 1)
      setLoadingStep(LOADING_STEPS[stepIdx])
    }, 3000)

    try {
      const res = await fetch('/api/spy/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, locale }),
      })
      clearInterval(stepInterval)
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Analysis failed')
        return
      }
      const data = await res.json()
      setReport(data.report)
      setActiveTab('overview')
      fetchSavedCompetitors()
    } catch (e) {
      clearInterval(stepInterval)
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  const threat = report ? THREAT_CONFIG[report.threatLevel] : null

  return (
    <div className="min-h-screen bg-dashBg px-4 sm:px-6 py-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Eye size={20} className="text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-dashText">ELEVO Spy™</h1>
              <p className="text-sm text-dashMuted">Competitor Intelligence</p>
            </div>
            <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              ORBIT+
            </span>
          </div>
          <p className="text-dashMuted text-sm">
            Know everything your competitor does. Before they do it.
          </p>
        </div>

        {/* Monitored competitors */}
        {savedCompetitors.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-dashMuted uppercase tracking-wider mb-3">Monitored Competitors</p>
            <div className="flex gap-3 flex-wrap">
              {savedCompetitors.map(c => {
                const t = THREAT_CONFIG[c.threat_level as keyof typeof THREAT_CONFIG] ?? THREAT_CONFIG.low
                return (
                  <div key={c.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${t.bg}`}>
                    <span className={`font-semibold ${t.color} text-xs`}>{t.label}</span>
                    <span className="text-dashText">{c.competitor_name}</span>
                    <span className="text-dashMuted text-xs">
                      {new Date(c.last_refreshed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Input form */}
        <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-dashText mb-4 flex items-center gap-2">
            <Search size={14} className="text-accent" />
            Analyse a Competitor
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-dashMuted mb-1.5">Competitor Name *</label>
              <input
                value={form.competitorName}
                onChange={e => setForm(f => ({ ...f, competitorName: e.target.value }))}
                placeholder="e.g. Joe's Plumbing Ltd"
                className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder-dashMuted focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dashMuted mb-1.5">Your Business Profile *</label>
              <select
                value={form.businessProfileId}
                onChange={e => setForm(f => ({ ...f, businessProfileId: e.target.value }))}
                className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                {businessProfiles.map(p => (
                  <option key={p.id} value={p.id}>{p.business_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-dashMuted mb-1.5">Website URL (optional)</label>
              <input
                value={form.competitorWebsite}
                onChange={e => setForm(f => ({ ...f, competitorWebsite: e.target.value }))}
                placeholder="https://competitors-site.co.uk"
                className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder-dashMuted focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dashMuted mb-1.5">Instagram Handle (optional)</label>
              <input
                value={form.competitorInstagram}
                onChange={e => setForm(f => ({ ...f, competitorInstagram: e.target.value }))}
                placeholder="@theirhandle"
                className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder-dashMuted focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
          </div>

          {/* Depth selector */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-dashMuted mb-2">Analysis Depth</label>
            <div className="flex gap-3">
              {DEPTH_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setForm(f => ({ ...f, analysisDepth: opt.id }))}
                  className={`flex-1 text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                    form.analysisDepth === opt.id
                      ? 'border-accent bg-accent/10 text-dashText'
                      : 'border-dashSurface2 bg-dashSurface text-dashMuted hover:border-accent/40'
                  }`}
                >
                  <div className="font-semibold mb-0.5">{opt.label}</div>
                  <div className="text-xs opacity-70">{opt.credits} credit{opt.credits > 1 ? 's' : ''} · {opt.time}</div>
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyse}
            disabled={loading || !form.competitorName || !form.businessProfileId}
            className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white rounded-xl py-3 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                {loadingStep}
              </>
            ) : (
              <>
                <Eye size={14} />
                Begin Intelligence Report →
              </>
            )}
          </motion.button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Report */}
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Threat level banner */}
            {threat && (
              <div className={`border rounded-2xl p-5 ${threat.bg}`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={20} className={threat.color} />
                    <div>
                      <div className={`text-lg font-bold ${threat.color}`}>{threat.label}</div>
                      <div className="text-sm text-dashMuted">{report.threatReason}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-dashMuted">
                    <RefreshCw size={12} />
                    Last updated: {new Date(report.lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto bg-dashCard border border-dashSurface2 rounded-xl p-1">
              {TABS.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-accent text-white'
                        : 'text-dashMuted hover:text-dashText hover:bg-dashSurface'
                    }`}
                  >
                    <Icon size={13} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Executive summary */}
                    <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-dashText mb-2">Executive Summary</h3>
                      <p className="text-sm text-dashMuted leading-relaxed">{report.executiveSummary}</p>
                    </div>

                    {/* Competitor profile */}
                    <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-dashText mb-3">Competitor Profile</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { label: 'Est. Revenue', value: report.competitor.estimatedRevenue },
                          { label: 'Rating', value: report.competitor.rating },
                          { label: 'Reviews', value: report.competitor.reviewCount.toString() },
                          { label: 'GBP Post Freq.', value: report.competitor.gbpPostFrequency },
                        ].map(stat => (
                          <div key={stat.label} className="bg-dashSurface rounded-lg p-3">
                            <div className="text-xs text-dashMuted mb-1">{stat.label}</div>
                            <div className="text-sm font-bold text-dashText">{stat.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Strengths & weaknesses */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-dashText mb-3 flex items-center gap-2">
                          <Shield size={13} className="text-red-400" /> Their Strengths
                        </h3>
                        <div className="space-y-2.5">
                          {report.strengths.slice(0, 4).map((s, i) => (
                            <div key={i} className="text-sm">
                              <div className="font-medium text-dashText">{s.area}</div>
                              <div className="text-dashMuted text-xs mt-0.5">{s.detail}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-dashText mb-3 flex items-center gap-2">
                          <TrendingUp size={13} className="text-green-400" /> Their Weaknesses (your opportunities)
                        </h3>
                        <div className="space-y-2.5">
                          {report.weaknesses.slice(0, 4).map((w, i) => (
                            <div key={i} className="text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-dashText">{w.area}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  w.urgency === 'immediate' ? 'bg-red-500/10 text-red-400' :
                                  w.urgency === 'this_month' ? 'bg-amber-500/10 text-amber-400' :
                                  'bg-blue-500/10 text-blue-400'
                                }`}>
                                  {w.urgency.replace('_', ' ')}
                                </span>
                              </div>
                              <div className="text-dashMuted text-xs mt-0.5">{w.yourOpportunity}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quick wins */}
                    {report.quickWins?.length > 0 && (
                      <div className="bg-accent/10 border border-accent/20 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-dashText mb-3 flex items-center gap-2">
                          <Zap size={13} className="text-accent" /> Quick Wins (next 24 hours)
                        </h3>
                        <ul className="space-y-1.5">
                          {report.quickWins.map((win, i) => (
                            <li key={i} className="text-sm text-dashMuted flex items-start gap-2">
                              <ChevronRight size={12} className="text-accent mt-0.5 shrink-0" />
                              {win}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'content' && (
                  <div className="space-y-4">
                    <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-dashText mb-3">Their Content Strategy</h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {Object.entries(report.contentStrategy.postingFrequency).map(([platform, freq]) => (
                          <div key={platform} className="bg-dashSurface rounded-lg p-3">
                            <div className="text-xs text-dashMuted capitalize">{platform}</div>
                            <div className="text-sm font-medium text-dashText">{freq}</div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-dashMuted mb-1">Top content types</p>
                          <div className="flex flex-wrap gap-1.5">
                            {report.contentStrategy.topContentTypes.map((t, i) => (
                              <span key={i} className="text-xs bg-dashSurface px-2 py-1 rounded-lg text-dashText">{t}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-dashMuted mb-1">Content gaps (what they NEVER post — your opportunity)</p>
                          <div className="flex flex-wrap gap-1.5">
                            {report.contentStrategy.contentGaps.map((g, i) => (
                              <span key={i} className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-lg border border-green-500/20">{g}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-sm text-dashMuted">
                      <strong className="text-dashText">ELEVO Social</strong> can automatically fill these content gaps with scheduled posts. <a href={`/${locale}/social`} className="text-accent underline ml-1">Go to Social Hub →</a>
                    </div>
                  </div>
                )}

                {activeTab === 'ads' && (
                  <div className="space-y-4">
                    <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-3 h-3 rounded-full ${report.adIntelligence.isRunningAds ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`} />
                        <h3 className="text-sm font-semibold text-dashText">
                          {report.adIntelligence.isRunningAds ? 'Running Active Ads' : 'Not Currently Running Ads'}
                        </h3>
                      </div>
                      {report.adIntelligence.isRunningAds && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-dashMuted mb-2">Platforms</p>
                            <div className="flex flex-wrap gap-1.5">
                              {report.adIntelligence.platforms.map((p, i) => (
                                <span key={i} className="text-xs bg-dashSurface px-2 py-1 rounded-lg text-dashText">{p}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-dashMuted mb-2">Estimated ad spend</p>
                            <p className="text-sm font-bold text-dashText">{report.adIntelligence.estimatedAdSpend}</p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-xs text-dashMuted mb-2">Their ad angles</p>
                            <ul className="space-y-1">
                              {report.adIntelligence.adAngles.map((a, i) => (
                                <li key={i} className="text-sm text-dashText flex items-start gap-2">
                                  <ChevronRight size={12} className="text-accent mt-0.5 shrink-0" />
                                  {a}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-xs font-medium text-dashMuted mb-2">Opportunity gaps</p>
                            <ul className="space-y-1">
                              {report.adIntelligence.opportunityGaps.map((g, i) => (
                                <li key={i} className="text-sm text-green-400 flex items-start gap-2">
                                  <ChevronRight size={12} className="mt-0.5 shrink-0" />
                                  {g}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-sm text-dashMuted">
                      <strong className="text-dashText">ELEVO Ads Pro™</strong> can build a counter-campaign targeting their weaknesses. <a href={`/${locale}/ads`} className="text-accent underline ml-1">Build campaign →</a>
                    </div>
                  </div>
                )}

                {activeTab === 'seo' && (
                  <div className="space-y-4">
                    <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-dashText mb-3">SEO Intelligence</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                        {[
                          { label: 'Est. Monthly Traffic', value: report.seoIntelligence.estimatedMonthlyTraffic },
                          { label: 'Local SEO Strength', value: report.seoIntelligence.localSEOStrength },
                          { label: 'Backlinks', value: report.seoIntelligence.backlinks },
                        ].map(stat => (
                          <div key={stat.label} className="bg-dashSurface rounded-lg p-3">
                            <div className="text-xs text-dashMuted mb-1">{stat.label}</div>
                            <div className="text-sm font-bold text-dashText">{stat.value}</div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-dashMuted mb-1.5">Keywords they rank for</p>
                          <div className="flex flex-wrap gap-1.5">
                            {report.seoIntelligence.topRankingKeywords.slice(0, 8).map((k, i) => (
                              <span key={i} className="text-xs bg-dashSurface px-2 py-1 rounded-lg text-dashText">{k}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-dashMuted mb-1.5">Missing keywords you can own</p>
                          <div className="flex flex-wrap gap-1.5">
                            {report.seoIntelligence.missingKeywords.slice(0, 8).map((k, i) => (
                              <span key={i} className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-lg border border-green-500/20">{k}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-sm text-dashMuted">
                      <strong className="text-dashText">ELEVO Rank™</strong> can help you dominate these missing keywords. <a href={`/${locale}/seo`} className="text-accent underline ml-1">Go to SEO Rankings →</a>
                    </div>
                  </div>
                )}

                {activeTab === 'sentiment' && (
                  <div className="space-y-4">
                    <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-3xl font-black text-dashText">{report.customerSentiment.averageRating.toFixed(1)}</div>
                        <div>
                          <div className="flex gap-0.5 mb-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < Math.round(report.customerSentiment.averageRating) ? 'text-amber-400' : 'text-dashMuted'}>★</span>
                            ))}
                          </div>
                          <p className="text-xs text-dashMuted">Average rating</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-green-400 mb-2">What customers love</p>
                          <ul className="space-y-1">
                            {report.customerSentiment.positiveThemes.map((t, i) => (
                              <li key={i} className="text-sm text-dashText flex items-start gap-2">
                                <span className="text-green-400 mt-0.5">✓</span> {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-red-400 mb-2">Common complaints (your GOLD)</p>
                          <ul className="space-y-1">
                            {report.customerSentiment.commonComplaints.map((c, i) => (
                              <li key={i} className="text-sm text-dashText flex items-start gap-2">
                                <span className="text-red-400 mt-0.5">!</span> {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {report.customerSentiment.opportunityFromComplaints && (
                        <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                          <p className="text-xs font-semibold text-amber-400 mb-1">Your opportunity</p>
                          <p className="text-sm text-dashMuted">{report.customerSentiment.opportunityFromComplaints}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'battleplan' && (
                  <div className="space-y-4">
                    {(['immediate', 'this_week', 'this_month'] as const).map(priority => {
                      const items = report.battlePlan.filter(b => b.priority === priority)
                      if (!items.length) return null
                      const labels = { immediate: '🔴 Immediate', this_week: '🟡 This Week', this_month: '🟢 This Month' }
                      return (
                        <div key={priority} className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
                          <h3 className="text-sm font-semibold text-dashText mb-3">{labels[priority]}</h3>
                          <div className="space-y-3">
                            {items.map((b, i) => (
                              <div key={i} className="bg-dashSurface rounded-lg p-4">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <p className="text-sm font-medium text-dashText">{b.action}</p>
                                  {b.eleveCanDoThis && b.eleveFeature && (
                                    <span className="shrink-0 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">{b.eleveFeature}</span>
                                  )}
                                </div>
                                <p className="text-xs text-dashMuted mb-2">{b.whyNow}</p>
                                <p className="text-xs text-green-400">Expected: {b.expectedImpact}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}

                    {/* Monitoring panel */}
                    <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-dashText mb-3 flex items-center gap-2">
                        <Bell size={13} className="text-accent" /> Weekly Monitoring
                      </h3>
                      <p className="text-xs text-dashMuted mb-3">We check their activity every Monday and alert you to changes.</p>
                      <div className="space-y-2">
                        {report.alertSuggestions?.slice(0, 3).map((a, i) => (
                          <div key={i} className="flex items-center justify-between text-sm bg-dashSurface rounded-lg px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                a.importance === 'critical' ? 'bg-red-400' :
                                a.importance === 'high' ? 'bg-amber-400' : 'bg-blue-400'
                              }`} />
                              <span className="text-dashText text-xs">{a.trigger}</span>
                            </div>
                            <span className="text-dashMuted text-xs">{a.frequency}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty state */}
        {!report && !loading && (
          <div className="text-center py-16 text-dashMuted">
            <Eye size={40} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm">Enter a competitor above to begin your intelligence report.</p>
          </div>
        )}
      </div>
    </div>
  )
}
