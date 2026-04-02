'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'
import {
  Scissors, Loader2, Link2, FileText, Calendar,
  TrendingUp, Music, Film, ExternalLink, Copy,
  CheckCircle2, Zap,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useUserContext } from '@/lib/hooks/useUserContext'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import ActionExplanation from '@/components/shared/ActionExplanation'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import CopyButton from '@/components/shared/CopyButton'
import { cn } from '@/lib/utils'
import type { ClipOutput } from '@/lib/agents/contentClipAgent'
import type { BusinessProfile } from '@/lib/agents/types'

type InputMode = 'url' | 'transcript'
type Status = 'idle' | 'loading' | 'done' | 'error'

const PLATFORMS = [
  { id: 'tiktok', label: 'TikTok', color: 'text-teal-400' },
  { id: 'instagram', label: 'Instagram', color: 'text-pink-400' },
  { id: 'youtube', label: 'YouTube Shorts', color: 'text-red-400' },
  { id: 'linkedin', label: 'LinkedIn', color: 'text-sky-400' },
]

const VIRAL_CONFIG = {
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Medium Potential' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'High Potential' },
  explosive: { color: 'text-red-400', bg: 'bg-red-500/10', label: '🔥 Explosive' },
}

export default function ClipPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = useLocale()
  const supabase = createBrowserClient()
  const { plan, isAdmin, loading: contextLoading } = useUserContext()
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [businessProfileId, setBusinessProfileId] = useState('')
  const [businessProfiles, setBusinessProfiles] = useState<Array<{ id: string; business_name: string }>>([])

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const [inputMode, setInputMode] = useState<InputMode>('url')
  const [sourceUrl, setSourceUrl] = useState('')
  const [transcript, setTranscript] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['tiktok', 'instagram'])
  const [clipCount, setClipCount] = useState(3)

  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ClipOutput | null>(null)
  const [expandedClip, setExpandedClip] = useState<number | null>(null)
  const [clipPlatformTab, setClipPlatformTab] = useState<Record<number, string>>({})

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: bpRes } = await supabase.from('business_profiles').select('*').eq('user_id', user.id)
    setBusinessProfiles(bpRes ?? [])
    if (bpRes?.[0]) {
      setBp(bpRes[0] as BusinessProfile)
      setBusinessProfileId(bpRes[0].id)
    }
  }, [supabase])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  if (!mounted) return <div className="flex flex-col h-[calc(100vh-56px)] md:h-screen"><div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div></div>

  if (contextLoading) return <div className="min-h-screen bg-dashBg flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>

  const isOrbit = plan === 'orbit' || plan === 'galaxy' || isAdmin
  if (!isOrbit) {
    return (
      <div className="min-h-screen bg-dashBg p-8">
        <UpgradePrompt
          locale={locale}
          featureName="ELEVO Clip™"
          description="ELEVO Clip™ identifies the best viral moments in any video and creates platform-specific captions and hooks. Available on Orbit and above."
          requiredPlan="orbit"
        />
      </div>
    )
  }

  function togglePlatform(id: string) {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  async function handleAnalyse() {
    if (!businessProfileId) return
    if (inputMode === 'url' && !sourceUrl) return
    if (inputMode === 'transcript' && !transcript) return

    setStatus('loading')
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/clip/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceUrl: inputMode === 'url' ? sourceUrl : undefined,
          transcript: inputMode === 'transcript' ? transcript : undefined,
          videoTitle: videoTitle || undefined,
          businessProfileId,
          targetPlatforms: selectedPlatforms,
          clipCount,
          locale,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed')
      setResult(data)
      setStatus('done')
      if (data.clips?.length > 0) setExpandedClip(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-dashBg">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
            <Scissors size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-dashText">ELEVO Clip™</h1>
            <p className="text-sm text-dashMuted">Snap — Turn any long content into viral clips</p>
          </div>
        </div>

        {/* Input section */}
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 mb-6">
          {/* Input mode toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setInputMode('url')}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors', inputMode === 'url' ? 'bg-accent text-white' : 'bg-dashSurface2 text-dashMuted hover:text-dashText')}
            >
              <Link2 size={14} />
              Paste URL
            </button>
            <button
              onClick={() => setInputMode('transcript')}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors', inputMode === 'transcript' ? 'bg-accent text-white' : 'bg-dashSurface2 text-dashMuted hover:text-dashText')}
            >
              <FileText size={14} />
              Paste Transcript
            </button>
          </div>

          <div className="space-y-4">
            {inputMode === 'url' ? (
              <div>
                <label className="text-xs text-dashMuted block mb-1.5">YouTube / TikTok / Podcast URL</label>
                <input
                  value={sourceUrl}
                  onChange={e => setSourceUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-dashSurface2 border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:border-accent"
                />
                <p className="text-xs text-dashMuted mt-1">We'll extract the transcript automatically. If unavailable, switch to Paste Transcript.</p>
              </div>
            ) : (
              <div>
                <label className="text-xs text-dashMuted block mb-1.5">Transcript</label>
                <textarea
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                  placeholder="Paste your video transcript here..."
                  rows={6}
                  className="w-full bg-dashSurface2 border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:border-accent resize-none"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-dashMuted block mb-1.5">Video Title (optional)</label>
              <input
                value={videoTitle}
                onChange={e => setVideoTitle(e.target.value)}
                placeholder="e.g. How I built a €10k/month business in 6 months"
                className="w-full bg-dashSurface2 border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:border-accent"
              />
            </div>

            {/* Platforms */}
            <div>
              <label className="text-xs text-dashMuted block mb-2">Target Platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border', selectedPlatforms.includes(p.id) ? 'bg-accent/20 border-accent text-accent' : 'bg-dashSurface2 border-dashSurface2 text-dashMuted hover:text-dashText')}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clip count */}
            <div>
              <label className="text-xs text-dashMuted block mb-2">Number of Clips</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setClipCount(n)}
                    className={cn('w-10 h-10 rounded-lg text-sm font-semibold transition-colors', clipCount === n ? 'bg-accent text-white' : 'bg-dashSurface2 text-dashMuted hover:text-dashText')}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {businessProfiles.length > 1 && (
              <div>
                <label className="text-xs text-dashMuted block mb-1.5">Business Profile</label>
                <select
                  value={businessProfileId}
                  onChange={e => setBusinessProfileId(e.target.value)}
                  className="w-full max-w-xs bg-dashSurface2 border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
                >
                  {businessProfiles.map(p => <option key={p.id} value={p.id}>{p.business_name}</option>)}
                </select>
              </div>
            )}
          </div>

          {error && <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">{error}</div>}

          <button
            onClick={handleAnalyse}
            disabled={status === 'loading' || selectedPlatforms.length === 0 || (!sourceUrl && !transcript)}
            className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight disabled:opacity-50 transition-colors"
          >
            {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Scissors size={16} />}
            {status === 'loading' ? 'Finding best clips...' : `Find Best Clips (2 credits)`}
          </button>
        </div>

        {status === 'loading' && (
          <AgentStatusIndicator
            status="generating"
            message="Snap is analysing your content and identifying the most viral moments..."
          />
        )}

        {/* Results */}
        {result && status === 'done' && (
          <div className="space-y-6">
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <h2 className="text-base font-semibold text-dashText mb-1">{result.sourceTitle}</h2>
              <p className="text-xs text-dashMuted">{result.sourceDuration} · {result.clips.length} clips identified</p>
            </div>

            {/* Clips */}
            <div className="space-y-4">
              {result.clips.map((clip, i) => {
                const viral = VIRAL_CONFIG[clip.viralPotential]
                const isExpanded = expandedClip === i
                const activePlatform = clipPlatformTab[i] ?? selectedPlatforms[0] ?? 'tiktok'

                return (
                  <div key={i} className="bg-dashCard rounded-xl border border-dashSurface2 overflow-hidden">
                    <button
                      onClick={() => setExpandedClip(isExpanded ? null : i)}
                      className="w-full p-5 text-left hover:bg-dashSurface2/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center shrink-0 text-accent font-bold text-sm">
                            {clip.clipNumber}
                          </div>
                          <div>
                            <h3 className="font-semibold text-dashText">{clip.title}</h3>
                            <p className="text-xs text-dashMuted mt-0.5">{clip.startTime} → {clip.endTime} · {clip.duration}</p>
                          </div>
                        </div>
                        <span className={cn('text-xs font-semibold px-2 py-1 rounded-full shrink-0', viral.color, viral.bg)}>
                          {viral.label}
                        </span>
                      </div>
                      <p className="text-sm text-dashMuted mt-3 ml-11">{clip.emotionalHook}</p>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-dashSurface2 p-5">
                        {/* Platform tabs */}
                        <div className="flex gap-2 mb-4">
                          {selectedPlatforms.map(p => {
                            const platform = PLATFORMS.find(pl => pl.id === p)
                            return (
                              <button
                                key={p}
                                onClick={() => setClipPlatformTab(prev => ({ ...prev, [i]: p }))}
                                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', activePlatform === p ? 'bg-accent text-white' : 'bg-dashSurface2 text-dashMuted hover:text-dashText')}
                              >
                                {platform?.label ?? p}
                              </button>
                            )
                          })}
                        </div>

                        {clip.platforms[activePlatform] && (
                          <div className="space-y-3">
                            <div className="bg-dashSurface2/50 rounded-lg p-4">
                              <p className="text-xs text-dashMuted mb-1">Hook (first 3 seconds)</p>
                              <p className="text-sm font-semibold text-dashText">{clip.platforms[activePlatform].hook}</p>
                            </div>
                            <div className="bg-dashSurface2/50 rounded-lg p-4">
                              <p className="text-xs text-dashMuted mb-1">Caption</p>
                              <p className="text-sm text-dashText">{clip.platforms[activePlatform].caption}</p>
                            </div>
                            <div>
                              <p className="text-xs text-dashMuted mb-2">Hashtags</p>
                              <div className="flex flex-wrap gap-1">
                                {clip.platforms[activePlatform].hashtags.map((tag, j) => (
                                  <span key={j} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{tag}</span>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-dashSurface2/50 rounded-lg p-3">
                                <p className="text-xs text-dashMuted mb-1">CTA</p>
                                <p className="text-xs text-dashText">{clip.platforms[activePlatform].cta}</p>
                              </div>
                              <div className="bg-dashSurface2/50 rounded-lg p-3">
                                <p className="text-xs text-dashMuted mb-1">Thumbnail</p>
                                <p className="text-xs text-dashText">{clip.platforms[activePlatform].thumbnailDescription}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <CopyButton
                                text={`${clip.platforms[activePlatform].hook}\n\n${clip.platforms[activePlatform].caption}\n\n${clip.platforms[activePlatform].hashtags.join(' ')}`}
                              />
                            </div>
                          </div>
                        )}

                        {/* Production notes */}
                        <div className="mt-4 space-y-2">
                          <div className="bg-dashSurface2/30 rounded-lg p-3">
                            <p className="text-xs font-semibold text-dashMuted mb-1 flex items-center gap-1"><Film size={12} /> Editing Notes</p>
                            <p className="text-xs text-dashText">{clip.editingNotes}</p>
                          </div>
                          <div className="bg-dashSurface2/30 rounded-lg p-3">
                            <p className="text-xs font-semibold text-dashMuted mb-1 flex items-center gap-1"><Music size={12} /> Music Suggestion</p>
                            <p className="text-xs text-dashText">{clip.musicSuggestion}</p>
                          </div>
                        </div>

                        {/* ELEVO Create link */}
                        <a
                          href={`/${locale}/create?prompt=${encodeURIComponent(clip.enhancementPrompts.titleCardDesign)}`}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent bg-accent/10 px-3 py-1.5 rounded-lg hover:bg-accent/20 transition-colors"
                        >
                          <Zap size={12} /> Enhance with ELEVO Create™ →
                        </a>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Posting schedule */}
            {result.postingSchedule.length > 0 && (
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
                <h3 className="text-sm font-semibold text-dashText mb-4 flex items-center gap-2">
                  <Calendar size={14} className="text-accent" />
                  Recommended Posting Schedule
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dashSurface2">
                        <th className="text-left text-xs text-dashMuted pb-2">Clip</th>
                        <th className="text-left text-xs text-dashMuted pb-2">Platform</th>
                        <th className="text-left text-xs text-dashMuted pb-2">Day</th>
                        <th className="text-left text-xs text-dashMuted pb-2">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.postingSchedule.map((s, i) => (
                        <tr key={i} className="border-b border-dashSurface2/50 last:border-0">
                          <td className="py-2 text-xs text-dashText">Clip {s.clip}</td>
                          <td className="py-2 text-xs text-dashText capitalize">{s.platform}</td>
                          <td className="py-2 text-xs text-dashText">{s.day}</td>
                          <td className="py-2 text-xs text-dashText">{s.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <ActionExplanation
              title="Clips Identified"
              description={`Snap found the ${result.clips.length} most viral moments in your content and created platform-specific hooks, captions, and hashtags for each. Follow the posting schedule to maximise reach. Use ELEVO Create™ to design title cards and thumbnails.`}
            />
          </div>
        )}
      </div>
    </div>
  )
}
