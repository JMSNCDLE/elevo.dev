'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import {
  Share2, Zap, Globe, BarChart2, Users, Instagram, Loader2,
  CheckCircle2, ChevronDown, ChevronUp, ExternalLink, Copy,
  TrendingUp, Calendar, Eye, Target, Clock, Star,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import ActionExplanation from '@/components/shared/ActionExplanation'
import CopyButton from '@/components/shared/CopyButton'
import { cn } from '@/lib/utils'
import type { SocialPresenceResult, CompetitorSocialAnalysis } from '@/lib/agents/superSMMAgent'

type Tab = 'command' | 'build' | 'content' | 'competitors' | 'analytics' | 'chrome-guide'
type Status = 'idle' | 'loading' | 'done' | 'error'

const PLATFORMS = ['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok']

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸',
  facebook: '👤',
  linkedin: '💼',
  twitter: '🐦',
  tiktok: '🎵',
}

const CONTENT_STYLES = [
  { value: 'educational', label: 'Educational', desc: 'Teach, inform, add value' },
  { value: 'entertaining', label: 'Entertaining', desc: 'Fun, humour, engaging' },
  { value: 'inspirational', label: 'Inspirational', desc: 'Motivate, uplift, inspire' },
  { value: 'promotional', label: 'Promotional', desc: 'Showcase products & offers' },
]

const MOCK_ACTIVITY = [
  { time: '6:02am', action: 'Scanned 847 trending topics across Instagram & TikTok', icon: TrendingUp },
  { time: '6:04am', action: 'Generated 12 post ideas for your connected platforms', icon: Zap },
  { time: '6:05am', action: 'Scheduled 3 posts for today (9am, 12pm, 6pm)', icon: Calendar },
  { time: '6:07am', action: 'Detected competitor posting activity — opportunity identified', icon: Eye },
  { time: '6:09am', action: 'Updated hashtag library with 15 new trending tags', icon: Star },
]

export default function SMMPage() {
  const locale = useLocale()
  const supabase = createBrowserClient()

  const [tab, setTab] = useState<Tab>('command')
  const [plan, setPlan] = useState('trial')
  const [businessProfiles, setBusinessProfiles] = useState<Array<{ id: string; business_name: string }>>([])
  const [selectedProfile, setSelectedProfile] = useState('')
  const [autoEnabled, setAutoEnabled] = useState(false)

  // Build tab
  const [buildStatus, setBuildStatus] = useState<Status>('idle')
  const [buildError, setBuildError] = useState('')
  const [buildResult, setBuildResult] = useState<SocialPresenceResult | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram'])
  const [goal, setGoal] = useState('')
  const [style, setStyle] = useState('educational')
  const [activePlatformGuide, setActivePlatformGuide] = useState(0)

  // Competitor tab
  const [compStatus, setCompStatus] = useState<Status>('idle')
  const [compError, setCompError] = useState('')
  const [compResult, setCompResult] = useState<CompetitorSocialAnalysis | null>(null)
  const [competitorHandles, setCompetitorHandles] = useState<string[]>([''])

  // Chrome guide tab
  const [chromePlatform, setChromePlatform] = useState('instagram')

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: prof } = await supabase.from('profiles').select('plan, auto_smm_enabled').eq('id', user.id).single()
      if (prof) { setPlan(prof.plan); setAutoEnabled(prof.auto_smm_enabled ?? false) }
      const { data: bps } = await supabase.from('business_profiles').select('id, business_name').eq('user_id', user.id).eq('is_primary', true)
      if (bps && bps.length > 0) { setBusinessProfiles(bps); setSelectedProfile(bps[0].id) }
    }
    loadProfile()
  }, [supabase])

  const isOrbit = plan === 'orbit' || plan === 'galaxy'

  function togglePlatform(p: string) {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  async function toggleAutoSMM() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const next = !autoEnabled
    await supabase.from('profiles').update({ auto_smm_enabled: next }).eq('id', user.id)
    setAutoEnabled(next)
  }

  async function buildPresence() {
    if (!selectedProfile || selectedPlatforms.length === 0 || !goal) return
    setBuildStatus('loading')
    setBuildError('')
    try {
      const res = await fetch(`/${locale}/api/smm/build-presence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessProfileId: selectedProfile, platforms: selectedPlatforms, goal, style, locale }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setBuildResult(data.result)
      setBuildStatus('done')
    } catch (err) {
      setBuildError(String(err))
      setBuildStatus('error')
    }
  }

  async function analyseCompetitors() {
    const handles = competitorHandles.filter(h => h.trim())
    if (!selectedProfile || handles.length === 0) return
    setCompStatus('loading')
    setCompError('')
    try {
      const res = await fetch(`/${locale}/api/smm/build-presence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessProfileId: selectedProfile, platforms: selectedPlatforms, goal: 'competitor analysis', style, locale }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setCompResult(data.result)
      setCompStatus('done')
    } catch (err) {
      setCompError(String(err))
      setCompStatus('error')
    }
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'command', label: 'Command Centre' },
    { key: 'build', label: 'Build from Scratch' },
    { key: 'content', label: 'Content Engine' },
    { key: 'competitors', label: 'Competitor Monitor' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'chrome-guide', label: 'Chrome Guide' },
  ]

  // Find a chrome guide from build result
  const chromeGuideData = buildResult?.platformGuides.find(g => g.platform.toLowerCase() === chromePlatform)?.chromeGuide

  return (
    <div className="min-h-screen bg-dashBg text-dashText">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Share2 size={20} className="text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-dashText">ELEVO SMM™</h1>
              <p className="text-sm text-dashMuted">Autonomous Social Media Manager</p>
            </div>
          </div>
          {isOrbit && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-dashMuted">Auto-pilot</span>
              <button
                onClick={toggleAutoSMM}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  autoEnabled ? 'bg-accent' : 'bg-dashSurface2'
                )}
              >
                <span className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  autoEnabled ? 'translate-x-7' : 'translate-x-1'
                )} />
              </button>
              {autoEnabled && <span className="text-xs text-green-400 font-medium">ACTIVE</span>}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-dashSurface rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                tab === t.key ? 'bg-accent text-white' : 'text-dashMuted hover:text-dashText'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab 1: Command Centre ── */}
        {tab === 'command' && (
          <div className="space-y-6">
            {/* Autonomy toggle explanation */}
            <div className={cn(
              'rounded-xl p-5 border',
              autoEnabled
                ? 'bg-green-500/5 border-green-500/20'
                : 'bg-dashCard border-dashSurface2'
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-dashText">
                    {autoEnabled ? '🟢 ELEVO SMM™ is running autonomously' : '⚪ Autonomous mode is off'}
                  </h3>
                  <p className="text-sm text-dashMuted mt-1">
                    {autoEnabled
                      ? 'ELEVO SMM™ runs every morning at 6am — scanning trends, generating content, and scheduling posts automatically.'
                      : 'Enable autonomous mode to let ELEVO SMM™ run daily without you lifting a finger.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Platform health */}
            <div>
              <h3 className="text-sm font-semibold text-dashMuted uppercase tracking-wider mb-3">Platform Health</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PLATFORMS.map(p => (
                  <div key={p} className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{PLATFORM_ICONS[p]}</span>
                      <span className="text-sm font-medium capitalize">{p}</span>
                    </div>
                    <div className="text-xs text-dashMuted">Not connected</div>
                    <div className="mt-2">
                      <span className="text-xs bg-dashSurface px-2 py-0.5 rounded text-dashMuted">Set up →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's activity */}
            <div>
              <h3 className="text-sm font-semibold text-dashMuted uppercase tracking-wider mb-3">
                {autoEnabled ? "Today's Activity" : 'Example Activity (when enabled)'}
              </h3>
              <div className="bg-dashCard rounded-xl border border-dashSurface2 divide-y divide-dashSurface2">
                {MOCK_ACTIVITY.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4">
                    <span className="text-xs text-dashMuted mt-0.5 w-12 shrink-0">{item.time}</span>
                    <item.icon size={14} className="text-accent mt-0.5 shrink-0" />
                    <span className="text-sm text-dashText">{item.action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Build Presence', tab: 'build', icon: Globe },
                { label: 'Create Content', tab: 'content', icon: Zap },
                { label: 'Monitor Competitors', tab: 'competitors', icon: Eye },
                { label: 'Chrome Guide', tab: 'chrome-guide', icon: ExternalLink },
              ].map(action => (
                <button
                  key={action.label}
                  onClick={() => setTab(action.tab as Tab)}
                  className="bg-dashCard border border-dashSurface2 rounded-xl p-4 text-left hover:border-accent/40 transition-colors"
                >
                  <action.icon size={18} className="text-accent mb-2" />
                  <p className="text-sm font-medium text-dashText">{action.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 2: Build from Scratch ── */}
        {tab === 'build' && (
          <div className="space-y-6">
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 space-y-5">
              <h2 className="font-semibold text-dashText">Build Your Social Presence from Scratch</h2>

              {/* Platforms */}
              <div>
                <label className="text-xs text-dashMuted block mb-2">Select platforms</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                        selectedPlatforms.includes(p)
                          ? 'bg-accent/10 border-accent text-accent'
                          : 'border-dashSurface2 text-dashMuted hover:text-dashText'
                      )}
                    >
                      {PLATFORM_ICONS[p]} <span className="capitalize">{p}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal */}
              <div>
                <label className="text-xs text-dashMuted block mb-2">What's your goal?</label>
                <textarea
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  rows={3}
                  placeholder="e.g. Get more local customers, build brand awareness, generate leads for my plumbing business in Manchester..."
                  className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-dashText text-sm resize-none focus:outline-none focus:border-accent"
                />
              </div>

              {/* Style */}
              <div>
                <label className="text-xs text-dashMuted block mb-2">Content style</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CONTENT_STYLES.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setStyle(s.value)}
                      className={cn(
                        'p-3 rounded-lg border text-left transition-colors',
                        style === s.value
                          ? 'bg-accent/10 border-accent'
                          : 'border-dashSurface2 hover:border-dashText/20'
                      )}
                    >
                      <p className="text-sm font-medium text-dashText">{s.label}</p>
                      <p className="text-xs text-dashMuted">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={buildPresence}
                disabled={buildStatus === 'loading' || !goal || selectedPlatforms.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-semibold text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {buildStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
                {buildStatus === 'loading' ? 'Building your presence…' : 'Build My Social Presence — 5 credits'}
              </button>
            </div>

            {buildStatus === 'loading' && <AgentStatusIndicator agentName="ELEVO SMM™" status="analyzing" />}
            {buildError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">{buildError}</div>}

            {buildResult && buildStatus === 'done' && (
              <div className="space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-dashCard rounded-xl border border-dashSurface2 p-4 text-center">
                    <p className="text-2xl font-bold text-accent">{buildResult.platformGuides.length}</p>
                    <p className="text-xs text-dashMuted">Platforms</p>
                  </div>
                  <div className="bg-dashCard rounded-xl border border-dashSurface2 p-4 text-center">
                    <p className="text-2xl font-bold text-green-400">{buildResult.expectedEngagementRate}</p>
                    <p className="text-xs text-dashMuted">Expected engagement</p>
                  </div>
                  <div className="bg-dashCard rounded-xl border border-dashSurface2 p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-400">{buildResult.timeToFirstResults}</p>
                    <p className="text-xs text-dashMuted">To first results</p>
                  </div>
                </div>

                {/* Platform sub-tabs */}
                <div className="flex gap-2 flex-wrap">
                  {buildResult.platformGuides.map((guide, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePlatformGuide(i)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors',
                        activePlatformGuide === i ? 'bg-accent text-white' : 'bg-dashSurface text-dashMuted hover:text-dashText'
                      )}
                    >
                      {PLATFORM_ICONS[guide.platform.toLowerCase()] ?? '📱'} {guide.platform}
                    </button>
                  ))}
                </div>

                {buildResult.platformGuides[activePlatformGuide] && (() => {
                  const guide = buildResult.platformGuides[activePlatformGuide]
                  return (
                    <div className="space-y-4">
                      {/* Profile */}
                      <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                        <h3 className="font-semibold text-dashText mb-4">Profile Setup</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { label: 'Display Name', value: guide.displayName },
                            { label: 'Username', value: guide.username },
                            { label: 'Posting Schedule', value: guide.postingSchedule },
                            { label: 'Content Style', value: guide.commentingStrategy },
                          ].map(item => (
                            <div key={item.label}>
                              <p className="text-xs text-dashMuted mb-1">{item.label}</p>
                              <p className="text-sm text-dashText">{item.value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4">
                          <p className="text-xs text-dashMuted mb-1">Bio (ready to paste)</p>
                          <div className="flex items-start gap-2">
                            <p className="text-sm text-dashText flex-1 bg-dashSurface rounded-lg p-3">{guide.bio}</p>
                            <CopyButton text={guide.bio} />
                          </div>
                        </div>
                      </div>

                      {/* First week content */}
                      <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                        <h3 className="font-semibold text-dashText mb-4">First Week Content Calendar</h3>
                        <div className="space-y-3">
                          {guide.firstWeekContent.map((item, i) => (
                            <div key={i} className="border border-dashSurface2 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-accent">{item.day}</span>
                                  <span className="text-xs bg-dashSurface px-2 py-0.5 rounded text-dashMuted">{item.type}</span>
                                </div>
                                <CopyButton text={`${item.hook}\n\n${item.caption}\n\n${item.hashtags.join(' ')}`} />
                              </div>
                              <p className="text-xs font-semibold text-yellow-400 mb-1">Hook: {item.hook}</p>
                              <p className="text-sm text-dashMuted mb-2">{item.caption}</p>
                              <div className="flex flex-wrap gap-1">
                                {item.hashtags.slice(0, 5).map((tag, j) => (
                                  <span key={j} className="text-xs text-accent/70">{tag}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Content pillars */}
                      <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                        <h3 className="font-semibold text-dashText mb-3">Content Pillars</h3>
                        <div className="flex flex-wrap gap-2">
                          {guide.contentPillars.map((pillar, i) => (
                            <span key={i} className="px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg text-sm text-accent">{pillar}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })()}

                <ActionExplanation description="Social presence built using Opus 4.6 with live web search for current trends, hashtags, and best practices for your industry." />
              </div>
            )}
          </div>
        )}

        {/* ── Tab 3: Content Engine ── */}
        {tab === 'content' && (
          <div className="space-y-6">
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
              <h2 className="font-semibold text-dashText mb-4">This Week's Content</h2>
              <p className="text-sm text-dashMuted mb-4">Generate a full week of content for all your connected platforms.</p>
              <button
                className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-semibold text-sm hover:bg-accent/90 transition-colors"
                onClick={() => setTab('build')}
              >
                <Zap size={16} /> Generate This Week's Content — 3 credits
              </button>
            </div>

            {/* Mock content calendar */}
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="bg-dashCard rounded-xl border border-dashSurface2 p-3">
                  <p className="text-xs font-bold text-dashMuted mb-2">{day}</p>
                  {i % 2 === 0 ? (
                    <div className="space-y-1">
                      <div className="w-full h-1.5 rounded bg-accent/30" />
                      <p className="text-xs text-dashMuted">Post scheduled</p>
                    </div>
                  ) : (
                    <p className="text-xs text-dashMuted/50">Empty</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-sm font-medium">
                <CheckCircle2 size={14} /> Approve All
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent border border-accent/20 rounded-lg text-sm font-medium">
                <Calendar size={14} /> Schedule All
              </button>
            </div>
          </div>
        )}

        {/* ── Tab 4: Competitor Monitor ── */}
        {tab === 'competitors' && (
          <div className="space-y-6">
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 space-y-4">
              <h2 className="font-semibold text-dashText">Competitor Social Monitor</h2>
              <div className="space-y-2">
                {competitorHandles.map((handle, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={handle}
                      onChange={e => {
                        const next = [...competitorHandles]
                        next[i] = e.target.value
                        setCompetitorHandles(next)
                      }}
                      placeholder={`@competitor${i + 1}`}
                      className="flex-1 bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-dashText text-sm focus:outline-none focus:border-accent"
                    />
                    {i === competitorHandles.length - 1 && i < 4 && (
                      <button
                        onClick={() => setCompetitorHandles([...competitorHandles, ''])}
                        className="px-3 py-2 bg-dashSurface border border-dashSurface2 rounded-lg text-dashMuted text-sm hover:text-dashText"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={analyseCompetitors}
                disabled={compStatus === 'loading' || competitorHandles.every(h => !h.trim())}
                className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-semibold text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {compStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                {compStatus === 'loading' ? 'Analysing…' : 'Analyse Competitors — 3 credits'}
              </button>
            </div>

            {compStatus === 'loading' && <AgentStatusIndicator agentName="ELEVO SMM™" status="analyzing" />}
            {compError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">{compError}</div>}

            {compResult && compStatus === 'done' && (
              <div className="space-y-4">
                {Object.keys(compResult.competitorStrengths).length > 0 && (
                  <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                    <h3 className="font-semibold text-dashText mb-4">Competitor Strengths</h3>
                    {Object.entries(compResult.competitorStrengths).map(([handle, strengths]) => (
                      <div key={handle} className="mb-3">
                        <p className="text-sm font-medium text-accent mb-1">{handle}</p>
                        <ul className="space-y-0.5">
                          {strengths.map((s, i) => (
                            <li key={i} className="text-xs text-dashMuted flex gap-1.5"><ChevronDown size={10} className="text-accent mt-0.5 shrink-0" />{s}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                  <h3 className="font-semibold text-dashText mb-3">Content Gaps (Your Opportunity)</h3>
                  <div className="space-y-2">
                    {compResult.contentGaps.map((gap, i) => (
                      <div key={i} className="flex gap-2 p-2 bg-green-500/5 border border-green-500/10 rounded-lg">
                        <CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-dashText">{gap}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                  <h3 className="font-semibold text-dashText mb-3">Viral Hooks to Use</h3>
                  <div className="space-y-2">
                    {compResult.viralHooks.map((hook, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-dashSurface rounded-lg">
                        <span className="text-xs font-bold text-accent w-4">{i + 1}.</span>
                        <p className="text-sm text-dashText flex-1">{hook}</p>
                        <CopyButton text={hook} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab 5: Analytics ── */}
        {tab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Followers', value: '—', sub: 'Connect platforms to track', icon: Users },
                { label: 'Avg Engagement', value: '—', sub: 'Connect platforms to track', icon: TrendingUp },
                { label: 'Posts This Week', value: '0', sub: 'No posts scheduled', icon: Calendar },
                { label: 'Best Day', value: '—', sub: 'Needs data', icon: Star },
              ].map(stat => (
                <div key={stat.label} className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
                  <stat.icon size={16} className="text-accent mb-2" />
                  <p className="text-2xl font-bold text-dashText">{stat.value}</p>
                  <p className="text-xs text-dashMuted mt-0.5">{stat.label}</p>
                  <p className="text-xs text-dashMuted/60 mt-1">{stat.sub}</p>
                </div>
              ))}
            </div>
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 text-center">
              <BarChart2 size={32} className="text-dashMuted/30 mx-auto mb-3" />
              <p className="text-dashMuted text-sm">Connect your social platforms to see analytics here.</p>
              <button
                onClick={() => setTab('command')}
                className="mt-3 px-4 py-2 bg-accent/10 text-accent rounded-lg text-sm font-medium hover:bg-accent/20 transition-colors"
              >
                Set up platforms →
              </button>
            </div>
          </div>
        )}

        {/* ── Tab 6: Chrome Guide ── */}
        {tab === 'chrome-guide' && (
          <div className="space-y-6">
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
              <h2 className="font-semibold text-dashText mb-4">Step-by-step Chrome Guide</h2>
              <p className="text-sm text-dashMuted mb-4">Follow these exact steps to set up your social profiles. Designed for complete beginners.</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {PLATFORMS.map(p => (
                  <button
                    key={p}
                    onClick={() => setChromePlatform(p)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium capitalize transition-colors',
                      chromePlatform === p
                        ? 'bg-accent/10 border-accent text-accent'
                        : 'border-dashSurface2 text-dashMuted hover:text-dashText'
                    )}
                  >
                    {PLATFORM_ICONS[p]} {p}
                  </button>
                ))}
              </div>

              {chromeGuideData ? (
                <div className="space-y-3">
                  {chromeGuideData.map((step) => (
                    <div key={step.step} className="flex gap-4 p-4 bg-dashSurface rounded-xl">
                      <div className="w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-dashText mb-1">{step.action}</p>
                        {step.url && (
                          <a href={step.url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent flex items-center gap-1 mb-2 hover:underline">
                            <ExternalLink size={10} /> {step.url}
                          </a>
                        )}
                        {step.exactTextToPaste && (
                          <div className="flex items-start gap-2 bg-dashCard rounded-lg p-3 border border-dashSurface2">
                            <p className="text-xs text-dashText flex-1 font-mono">{step.exactTextToPaste}</p>
                            <CopyButton text={step.exactTextToPaste} />
                          </div>
                        )}
                        {step.screenshot && (
                          <p className="text-xs text-dashMuted mt-1.5 italic">📍 {step.screenshot}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Globe size={32} className="text-dashMuted/30 mx-auto mb-3" />
                  <p className="text-sm text-dashMuted">Build your social presence first to get a personalised Chrome guide.</p>
                  <button
                    onClick={() => setTab('build')}
                    className="mt-3 px-4 py-2 bg-accent/10 text-accent rounded-lg text-sm font-medium hover:bg-accent/20 transition-colors"
                  >
                    Build from Scratch →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
