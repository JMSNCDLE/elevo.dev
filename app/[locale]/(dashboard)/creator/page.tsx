'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  Video, Loader2, Play, Search, TrendingUp, BarChart2,
  FileText, Scissors, Youtube, CheckCircle2, ChevronRight,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type Tab = 'titles' | 'thumbnails' | 'editing' | 'audit' | 'traffic'
type Status = 'idle' | 'loading' | 'done' | 'error'

interface TitleResult {
  titles: Array<{ title: string; score: number; reason: string }>
  bestTitle: string
  seoKeywords: string[]
  clickThroughTips: string[]
}

interface ThumbnailResult {
  concepts: Array<{ concept: string; elements: string[]; colorScheme: string; textOverlay: string }>
  midjourney: string
  dallePrompt: string
  psychologyTip: string
}

interface EditingResult {
  structure: string[]
  hookScript: string
  bRollSuggestions: string[]
  captionStyle: string
  musicMood: string
  capCutSettings: string[]
  transitionTips: string[]
}

interface AuditResult {
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  seoScore: number
  engagementScore: number
  monetisationScore: number
  quickWins: string[]
  actionPlan: Array<{ action: string; priority: string; impact: string }>
}

interface TrafficResult {
  strategy: string
  platforms: Array<{ platform: string; tactic: string; effort: string; reach: string }>
  contentCalendar: Array<{ day: string; content: string; platform: string }>
  collaborationIdeas: string[]
  seoStrategy: string[]
  viralTriggers: string[]
}

type Result = TitleResult | ThumbnailResult | EditingResult | AuditResult | TrafficResult

const TABS: Array<{ id: Tab; label: string; icon: React.ElementType; endpoint: string }> = [
  { id: 'titles', label: 'Title Optimiser', icon: Search, endpoint: '/api/creator/title' },
  { id: 'thumbnails', label: 'Thumbnail AI', icon: Play, endpoint: '/api/creator/thumbnail' },
  { id: 'editing', label: 'Editing Brief', icon: Scissors, endpoint: '/api/creator/editing' },
  { id: 'audit', label: 'Channel Audit', icon: BarChart2, endpoint: '/api/creator/audit' },
  { id: 'traffic', label: 'Traffic Strategy', icon: TrendingUp, endpoint: '/api/creator/traffic' },
]

export default function CreatorPage() {
  const locale = useLocale()
  const router = useRouter()
  const supabase = createBrowserClient()
  const [activeTab, setActiveTab] = useState<Tab>('titles')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)

  // Form fields
  const [videoTopic, setVideoTopic] = useState('')
  const [channelNiche, setChannelNiche] = useState('')
  const [platform, setPlatform] = useState<'youtube' | 'tiktok'>('youtube')
  const [channelUrl, setChannelUrl] = useState('')

  const checkPlan = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push(`/${locale}/login`); return }
    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
    if (!profile || (profile.plan !== 'orbit' && profile.plan !== 'galaxy')) {
      router.push(`/${locale}/dashboard/upgrade`)
    }
  }, [supabase, router, locale])

  useEffect(() => { checkPlan() }, [checkPlan])

  async function handleGenerate() {
    setStatus('loading')
    setError(null)
    setResult(null)
    const tab = TABS.find(t => t.id === activeTab)!
    try {
      const body: Record<string, string> = {}
      if (activeTab === 'titles' || activeTab === 'thumbnails' || activeTab === 'editing') {
        body.videoTopic = videoTopic
        body.niche = channelNiche
        body.platform = platform
      } else if (activeTab === 'audit' || activeTab === 'traffic') {
        body.channelUrl = channelUrl
        body.niche = channelNiche
        body.platform = platform
      }
      const res = await fetch(tab.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      setResult(data)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
      setStatus('error')
    }
  }

  const isTitleResult = (r: Result): r is TitleResult => 'titles' in r && Array.isArray((r as TitleResult).titles)
  const isThumbnailResult = (r: Result): r is ThumbnailResult => 'concepts' in r
  const isEditingResult = (r: Result): r is EditingResult => 'structure' in r
  const isAuditResult = (r: Result): r is AuditResult => 'overallScore' in r
  const isTrafficResult = (r: Result): r is TrafficResult => 'platforms' in r && 'viralTriggers' in r

  return (
    <div className="min-h-screen bg-[#080C14]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#6366F1]/10 rounded-xl flex items-center justify-center">
            <Video size={20} className="text-[#6366F1]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#EEF2FF]">ELEVO Creator™</h1>
            <p className="text-sm text-[#64748B]">Reel — Your creator business strategist</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Youtube size={16} className="text-red-400" />
            <span className="text-xs text-[#64748B]">YouTube · TikTok</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#141B24] rounded-xl p-1 mb-6 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(null); setError(null) }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                activeTab === tab.id ? 'bg-[#6366F1] text-white' : 'text-[#64748B] hover:text-[#EEF2FF]'
              )}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-4">
            <div className="bg-[#1A2332] rounded-xl border border-[#1E2A3B] p-5">
              <h2 className="text-sm font-semibold text-[#EEF2FF] mb-4">
                {activeTab === 'titles' && 'Optimise Your Video Title'}
                {activeTab === 'thumbnails' && 'Generate Thumbnail Concepts'}
                {activeTab === 'editing' && 'Build Your Editing Brief'}
                {activeTab === 'audit' && 'Audit Your Channel'}
                {activeTab === 'traffic' && 'Build Traffic Strategy'}
              </h2>

              {(activeTab === 'titles' || activeTab === 'thumbnails' || activeTab === 'editing') && (
                <>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-[#64748B] mb-1 block">Video Topic / Working Title</label>
                      <input
                        value={videoTopic}
                        onChange={e => setVideoTopic(e.target.value)}
                        placeholder="e.g. How I made £10k in 30 days dropshipping"
                        className="w-full bg-[#141B24] border border-[#1E2A3B] rounded-lg px-3 py-2 text-sm text-[#EEF2FF] placeholder:text-[#64748B] focus:outline-none focus:border-[#6366F1]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#64748B] mb-1 block">Channel Niche</label>
                      <input
                        value={channelNiche}
                        onChange={e => setChannelNiche(e.target.value)}
                        placeholder="e.g. business, finance, lifestyle"
                        className="w-full bg-[#141B24] border border-[#1E2A3B] rounded-lg px-3 py-2 text-sm text-[#EEF2FF] placeholder:text-[#64748B] focus:outline-none focus:border-[#6366F1]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#64748B] mb-1 block">Platform</label>
                      <select
                        value={platform}
                        onChange={e => setPlatform(e.target.value as 'youtube' | 'tiktok')}
                        className="w-full bg-[#141B24] border border-[#1E2A3B] rounded-lg px-3 py-2 text-sm text-[#EEF2FF] focus:outline-none focus:border-[#6366F1]"
                      >
                        <option value="youtube">YouTube</option>
                        <option value="tiktok">TikTok</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {(activeTab === 'audit' || activeTab === 'traffic') && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[#64748B] mb-1 block">Channel URL or Handle</label>
                    <input
                      value={channelUrl}
                      onChange={e => setChannelUrl(e.target.value)}
                      placeholder="e.g. @yourchannel or youtube.com/c/..."
                      className="w-full bg-[#141B24] border border-[#1E2A3B] rounded-lg px-3 py-2 text-sm text-[#EEF2FF] placeholder:text-[#64748B] focus:outline-none focus:border-[#6366F1]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#64748B] mb-1 block">Channel Niche</label>
                    <input
                      value={channelNiche}
                      onChange={e => setChannelNiche(e.target.value)}
                      placeholder="e.g. business, finance, lifestyle"
                      className="w-full bg-[#141B24] border border-[#1E2A3B] rounded-lg px-3 py-2 text-sm text-[#EEF2FF] placeholder:text-[#64748B] focus:outline-none focus:border-[#6366F1]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#64748B] mb-1 block">Platform</label>
                    <select
                      value={platform}
                      onChange={e => setPlatform(e.target.value as 'youtube' | 'tiktok')}
                      className="w-full bg-[#141B24] border border-[#1E2A3B] rounded-lg px-3 py-2 text-sm text-[#EEF2FF] focus:outline-none focus:border-[#6366F1]"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={status === 'loading'}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white font-semibold rounded-lg hover:bg-[#818CF8] disabled:opacity-50 transition-colors text-sm"
              >
                {status === 'loading' ? (
                  <><Loader2 size={15} className="animate-spin" /> Generating...</>
                ) : (
                  <><ChevronRight size={15} /> Generate →</>
                )}
              </button>
            </div>

            {/* Credit info */}
            <div className="bg-[#1A2332]/50 rounded-xl border border-[#1E2A3B] p-4">
              <p className="text-xs text-[#64748B]">
                <span className="text-[#6366F1] font-semibold">2 credits</span> per generation · Orbit+ plan required
              </p>
            </div>
          </div>

          {/* Result Panel */}
          <div className="bg-[#1A2332] rounded-xl border border-[#1E2A3B] p-5 min-h-[400px]">
            {status === 'idle' && (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <Video size={40} className="text-[#6366F1]/40 mb-3" />
                <p className="text-[#EEF2FF] font-medium mb-1">Ready to analyse</p>
                <p className="text-sm text-[#64748B]">Fill in the form and click Generate</p>
              </div>
            )}
            {status === 'loading' && (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <Loader2 size={32} className="animate-spin text-[#6366F1] mb-3" />
                <p className="text-[#EEF2FF] font-medium">Reel is analysing...</p>
                <p className="text-xs text-[#64748B] mt-1">This takes 15-30 seconds</p>
              </div>
            )}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400">{error}</div>
            )}
            {status === 'done' && result && (
              <div className="space-y-4 overflow-y-auto max-h-[600px] pr-1">
                {/* Title Results */}
                {isTitleResult(result) && (
                  <>
                    <div className="bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-lg p-4">
                      <p className="text-xs font-semibold text-[#6366F1] mb-1">Best Title</p>
                      <p className="text-sm text-[#EEF2FF] font-medium">{result.bestTitle}</p>
                    </div>
                    <div className="space-y-2">
                      {result.titles.map((t, i) => (
                        <div key={i} className="bg-[#141B24] rounded-lg p-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-[#EEF2FF]">{t.title}</p>
                            <span className={cn('text-xs font-bold shrink-0', t.score >= 8 ? 'text-green-400' : t.score >= 6 ? 'text-amber-400' : 'text-[#64748B]')}>{t.score}/10</span>
                          </div>
                          <p className="text-xs text-[#64748B] mt-1">{t.reason}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-2">SEO Keywords</p>
                      <div className="flex flex-wrap gap-1">
                        {result.seoKeywords.map((k, i) => (
                          <span key={i} className="text-xs bg-[#141B24] text-[#64748B] px-2 py-0.5 rounded-full">{k}</span>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Thumbnail Results */}
                {isThumbnailResult(result) && (
                  <>
                    <div className="space-y-3">
                      {result.concepts.map((c, i) => (
                        <div key={i} className="bg-[#141B24] rounded-lg p-4">
                          <p className="text-sm font-semibold text-[#EEF2FF] mb-2">Concept {i + 1}: {c.concept}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {c.elements.map((el, j) => (
                              <span key={j} className="text-xs bg-[#1E2A3B] text-[#64748B] px-2 py-0.5 rounded-full">{el}</span>
                            ))}
                          </div>
                          <p className="text-xs text-[#64748B]">Text: &quot;{c.textOverlay}&quot; · Colors: {c.colorScheme}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-[#6366F1]/5 border border-[#6366F1]/20 rounded-lg p-3">
                      <p className="text-xs font-semibold text-[#6366F1] mb-1">Midjourney Prompt</p>
                      <p className="text-xs text-[#EEF2FF] font-mono">{result.midjourney}</p>
                    </div>
                  </>
                )}

                {/* Editing Brief */}
                {isEditingResult(result) && (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-[#64748B] mb-2 uppercase tracking-wider">Video Structure</p>
                      <ol className="space-y-1">
                        {result.structure.map((s, i) => (
                          <li key={i} className="text-sm text-[#EEF2FF] flex gap-2">
                            <span className="text-[#6366F1] font-bold shrink-0">{i + 1}.</span> {s}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="bg-[#141B24] rounded-lg p-3">
                      <p className="text-xs font-semibold text-[#6366F1] mb-1">Hook Script</p>
                      <p className="text-sm text-[#EEF2FF] italic">&quot;{result.hookScript}&quot;</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-2">CapCut Settings</p>
                      {result.capCutSettings.map((s, i) => (
                        <p key={i} className="text-sm text-[#EEF2FF] flex gap-2 mb-1">
                          <CheckCircle2 size={13} className="text-green-400 shrink-0 mt-0.5" /> {s}
                        </p>
                      ))}
                    </div>
                  </>
                )}

                {/* Audit Results */}
                {isAuditResult(result) && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-[#141B24] rounded-lg p-3 text-center">
                        <p className={cn('text-2xl font-black', result.overallScore >= 70 ? 'text-green-400' : result.overallScore >= 50 ? 'text-amber-400' : 'text-red-400')}>{result.overallScore}</p>
                        <p className="text-xs text-[#64748B]">Overall</p>
                      </div>
                      <div className="bg-[#141B24] rounded-lg p-3 text-center">
                        <p className="text-2xl font-black text-[#EEF2FF]">{result.seoScore}</p>
                        <p className="text-xs text-[#64748B]">SEO</p>
                      </div>
                      <div className="bg-[#141B24] rounded-lg p-3 text-center">
                        <p className="text-2xl font-black text-[#EEF2FF]">{result.engagementScore}</p>
                        <p className="text-xs text-[#64748B]">Engagement</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-2">Quick Wins</p>
                      {result.quickWins.map((w, i) => (
                        <p key={i} className="text-sm text-[#EEF2FF] flex gap-2 mb-1">
                          <CheckCircle2 size={13} className="text-green-400 shrink-0 mt-0.5" /> {w}
                        </p>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {result.actionPlan.map((a, i) => (
                        <div key={i} className="bg-[#141B24] rounded-lg p-3">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm text-[#EEF2FF]">{a.action}</p>
                            <span className={cn('text-xs shrink-0', a.priority === 'high' ? 'text-red-400' : a.priority === 'medium' ? 'text-amber-400' : 'text-[#64748B]')}>{a.priority}</span>
                          </div>
                          <p className="text-xs text-[#64748B]">Impact: {a.impact}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Traffic Results */}
                {isTrafficResult(result) && (
                  <>
                    <div className="bg-[#6366F1]/5 border border-[#6366F1]/20 rounded-lg p-4">
                      <p className="text-xs font-semibold text-[#6366F1] mb-1">Core Strategy</p>
                      <p className="text-sm text-[#EEF2FF]">{result.strategy}</p>
                    </div>
                    <div className="space-y-2">
                      {result.platforms.map((p, i) => (
                        <div key={i} className="bg-[#141B24] rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-[#EEF2FF]">{p.platform}</p>
                            <span className="text-xs text-[#64748B]">Reach: {p.reach}</span>
                          </div>
                          <p className="text-xs text-[#EEF2FF]">{p.tactic}</p>
                          <p className="text-xs text-[#64748B] mt-1">Effort: {p.effort}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
