'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'
import {
  Film, User, Link, Mic, Clapperboard,
  ChevronRight, Copy, ExternalLink, CheckCircle2,
  Loader2, ChevronDown, ChevronUp
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useUserContext } from '@/lib/hooks/useUserContext'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import ActionExplanation from '@/components/shared/ActionExplanation'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import CopyButton from '@/components/shared/CopyButton'
import { cn } from '@/lib/utils'
import type { BusinessProfile } from '@/lib/agents/types'
import type { AvatarAdResult, ProductVideoResult, VoiceoverResult } from '@/lib/agents/videoStudioAgent'

type Mode = 'avatar' | 'product_url' | 'voiceover' | null
type Status = 'idle' | 'generating' | 'done' | 'error'
type ResultTab = 'script' | 'prompts' | 'voice' | 'schedule'

const PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'LinkedIn', 'Twitter']
const VOICE_STYLES = ['conversational', 'energetic', 'authoritative', 'friendly', 'calm', 'urgent', 'warm', 'professional']
const EMOTIONS = ['excited', 'calm', 'urgent', 'warm', 'professional'] as const
const DURATIONS = ['15s', '30s', '60s'] as const
const TONES = ['conversational', 'energetic', 'authoritative', 'friendly'] as const

const COMPARISON = [
  { feature: 'Avatar scripts', arcads: true, creatify: false, elevenlabs: false, elevo: true },
  { feature: 'URL to video', arcads: false, creatify: true, elevenlabs: false, elevo: true },
  { feature: 'Voiceover', arcads: false, creatify: false, elevenlabs: true, elevo: true },
  { feature: 'Cinematic UGC', arcads: false, creatify: false, elevenlabs: false, elevo: 'Coming soon' },
  { feature: 'CRM integration', arcads: false, creatify: false, elevenlabs: false, elevo: true },
  { feature: 'Auto-schedule', arcads: false, creatify: false, elevenlabs: false, elevo: true },
  { feature: 'Price', arcads: '€99+/mo', creatify: '€99+/mo', elevenlabs: '€22+/mo', elevo: '€29.99 add-on' },
]

export default function VideoStudioPage() {
  const locale = useLocale()
  const supabase = createBrowserClient()
  const { plan, isAdmin, loading: contextLoading } = useUserContext()

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [mode, setMode] = useState<Mode>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ResultTab>('script')
  const [showComparison, setShowComparison] = useState(true)

  // Avatar form
  const [productOrService, setProductOrService] = useState('')
  const [painPoint, setPainPoint] = useState('')
  const [platform, setPlatform] = useState('Instagram')
  const [duration, setDuration] = useState<'15s' | '30s' | '60s'>('30s')
  const [tone, setTone] = useState<typeof TONES[number]>('conversational')

  // Product URL form
  const [productUrl, setProductUrl] = useState('')
  const [objective, setObjective] = useState<'sales' | 'awareness' | 'traffic'>('sales')

  // Voiceover form
  const [voContent, setVoContent] = useState('')
  const [voiceStyle, setVoiceStyle] = useState('conversational')
  const [emotion, setEmotion] = useState<typeof EMOTIONS[number]>('warm')
  const [language, setLanguage] = useState('en')

  // Results
  const [avatarResult, setAvatarResult] = useState<AvatarAdResult | null>(null)
  const [productResult, setProductResult] = useState<ProductVideoResult | null>(null)
  const [voiceResult, setVoiceResult] = useState<VoiceoverResult | null>(null)

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: bpData } = await supabase.from('business_profiles').select('*').eq('user_id', user.id).eq('is_primary', true).single()
    setBp(bpData)
  }, [supabase])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const isOrbit = plan === 'orbit' || plan === 'galaxy' || isAdmin

  async function generate() {
    if (!bp) return
    setStatus('generating')
    setError(null)

    try {
      let endpoint = ''
      let body: Record<string, unknown> = { businessProfileId: bp.id, platform, locale }

      if (mode === 'avatar') {
        endpoint = '/api/video-studio/avatar'
        body = { ...body, productOrService, painPoint, duration, tone }
      } else if (mode === 'product_url') {
        endpoint = '/api/video-studio/product-url'
        body = { ...body, productUrl, objective }
      } else if (mode === 'voiceover') {
        endpoint = '/api/video-studio/voiceover'
        body = { ...body, content: voContent, voiceStyle, emotion, language }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Generation failed')

      if (mode === 'avatar') setAvatarResult(data.result)
      else if (mode === 'product_url') setProductResult(data.result)
      else if (mode === 'voiceover') setVoiceResult(data.result)

      setStatus('done')
      setActiveTab('script')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
      setStatus('error')
    }
  }

  if (!mounted) return <div className="flex flex-col h-[calc(100vh-56px)] md:h-screen"><div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div></div>

  if (contextLoading) return <div className="min-h-screen bg-dashBg flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>

  if (!isOrbit) {
    return (
      <div className="p-6">
        <UpgradePrompt
          locale={locale}
          featureName="Video Studio"
          description="Create Arcads-style avatar ads, Creatify-style URL videos, and ElevenLabs voiceovers — all in one place."
          requiredPlan="orbit"
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
          <Film size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-dashText">Video Studio</h1>
          <p className="text-dashMuted text-sm">Create AI videos that look human. Powered by every major AI video tool.</p>
        </div>
      </div>

      {/* Comparison table */}
      <div className="bg-dashCard border border-dashSurface2 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowComparison(p => !p)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-dashText hover:bg-dashSurface2 transition-colors"
        >
          <span>Why ELEVO Video Studio vs Arcads / Creatify / ElevenLabs?</span>
          {showComparison ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        {showComparison && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-dashSurface2 bg-dashSurface">
                  <th className="text-left px-5 py-2.5 text-dashMuted font-medium">Feature</th>
                  <th className="text-center px-4 py-2.5 text-dashMuted font-medium">Arcads</th>
                  <th className="text-center px-4 py-2.5 text-dashMuted font-medium">Creatify</th>
                  <th className="text-center px-4 py-2.5 text-dashMuted font-medium">ElevenLabs</th>
                  <th className="text-center px-4 py-2.5 text-accent font-semibold">ELEVO</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(row => (
                  <tr key={row.feature} className="border-t border-dashSurface2">
                    <td className="px-5 py-2.5 text-dashMuted">{row.feature}</td>
                    {[row.arcads, row.creatify, row.elevenlabs, row.elevo].map((val, i) => (
                      <td key={i} className={cn('text-center px-4 py-2.5', i === 3 && 'text-accent font-medium')}>
                        {typeof val === 'boolean' ? (
                          val ? <CheckCircle2 size={14} className={i === 3 ? 'text-accent mx-auto' : 'text-green-400 mx-auto'} />
                            : <span className="text-dashMuted text-xs">—</span>
                        ) : val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4 Studio Modes */}
      {!mode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              key: 'avatar' as Mode,
              icon: User,
              title: 'Avatar Ad',
              subtitle: 'Arcads style',
              desc: 'AI spokesperson reads your script on camera',
              best: 'Facebook ads, YouTube pre-roll, product demos',
              color: 'text-violet-400',
              bg: 'hover:border-violet-500/40',
            },
            {
              key: 'product_url' as Mode,
              icon: Link,
              title: 'Product URL',
              subtitle: 'Creatify style',
              desc: 'Paste your URL. Get a full video ad.',
              best: 'Ecommerce, service pages, landing pages',
              color: 'text-blue-400',
              bg: 'hover:border-blue-500/40',
            },
            {
              key: 'voiceover' as Mode,
              icon: Mic,
              title: 'Voiceover Video',
              subtitle: 'ElevenLabs style',
              desc: 'Professional voice on any content',
              best: 'Explainers, testimonials, slide decks',
              color: 'text-teal-400',
              bg: 'hover:border-teal-500/40',
            },
            {
              key: null,
              icon: Clapperboard,
              title: 'Cinematic UGC',
              subtitle: 'Coming soon',
              desc: 'AI-generated cinematic scenes',
              best: 'Brand videos, social ads, product reveals',
              color: 'text-orange-400',
              bg: 'hover:border-orange-500/40 opacity-60 cursor-default',
            },
          ].map(item => (
            <div
              key={item.title}
              onClick={() => item.key && setMode(item.key)}
              className={cn(
                'bg-dashCard border border-dashSurface2 rounded-xl p-5 cursor-pointer transition-all group',
                item.bg
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <item.icon size={18} className={item.color} />
                    <span className="font-semibold text-dashText">{item.title}</span>
                  </div>
                  <span className="text-xs text-dashMuted">{item.subtitle}</span>
                </div>
                <ChevronRight size={16} className="text-dashMuted group-hover:text-dashText transition-colors mt-1" />
              </div>
              <p className="text-sm text-dashMuted mb-2">{item.desc}</p>
              <p className="text-xs text-dashMuted">Best for: {item.best}</p>
            </div>
          ))}
        </div>
      )}

      {/* Active Mode Form */}
      {mode && status === 'idle' && (
        <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-dashText">
              {mode === 'avatar' && 'Create Avatar Ad'}
              {mode === 'product_url' && 'Product URL to Video'}
              {mode === 'voiceover' && 'Create Voiceover Video'}
            </h2>
            <button onClick={() => setMode(null)} className="text-xs text-dashMuted hover:text-dashText">← Back</button>
          </div>

          {mode === 'avatar' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-dashMuted mb-1">Product or Service</label>
                <input value={productOrService} onChange={e => setProductOrService(e.target.value)}
                  className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
                  placeholder="e.g. Roof cleaning service" />
              </div>
              <div>
                <label className="block text-xs text-dashMuted mb-1">Pain Point</label>
                <input value={painPoint} onChange={e => setPainPoint(e.target.value)}
                  className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
                  placeholder="e.g. Dirty roof makes house look old and decreases value" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-dashMuted mb-1">Platform</label>
                  <select value={platform} onChange={e => setPlatform(e.target.value)}
                    className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent">
                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dashMuted mb-1">Duration</label>
                  <select value={duration} onChange={e => setDuration(e.target.value as typeof duration)}
                    className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent">
                    {DURATIONS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dashMuted mb-1">Tone</label>
                  <select value={tone} onChange={e => setTone(e.target.value as typeof tone)}
                    className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent">
                    {TONES.map(t => <option key={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {mode === 'product_url' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-dashMuted mb-1">Product / Service URL</label>
                <input value={productUrl} onChange={e => setProductUrl(e.target.value)}
                  className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
                  placeholder="https://yourwebsite.com/service" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dashMuted mb-1">Platform</label>
                  <select value={platform} onChange={e => setPlatform(e.target.value)}
                    className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent">
                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dashMuted mb-1">Objective</label>
                  <select value={objective} onChange={e => setObjective(e.target.value as typeof objective)}
                    className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent">
                    <option value="sales">Sales</option>
                    <option value="awareness">Awareness</option>
                    <option value="traffic">Traffic</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {mode === 'voiceover' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-dashMuted mb-1">Content / Script</label>
                <textarea value={voContent} onChange={e => setVoContent(e.target.value)} rows={4}
                  className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent resize-none"
                  placeholder="Paste your content or write a brief — Sol will optimise it for voice" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-dashMuted mb-1">Voice Style</label>
                  <select value={voiceStyle} onChange={e => setVoiceStyle(e.target.value)}
                    className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent">
                    {VOICE_STYLES.map(s => <option key={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dashMuted mb-1">Emotion</label>
                  <select value={emotion} onChange={e => setEmotion(e.target.value as typeof emotion)}
                    className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent">
                    {EMOTIONS.map(em => <option key={em} className="capitalize">{em}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dashMuted mb-1">Language</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)}
                    className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="pt">Portuguese</option>
                    <option value="nl">Dutch</option>
                    <option value="it">Italian</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={generate}
            className="w-full py-2.5 bg-accent text-white font-medium rounded-lg hover:bg-accent/90 transition-colors"
          >
            Generate with Vega →
          </button>
        </div>
      )}

      {/* Generating */}
      {status === 'generating' && (
        <div className="bg-dashCard border border-dashSurface2 rounded-xl p-8 flex flex-col items-center gap-4">
          <AgentStatusIndicator status="writing" agentName="Vega" message="Building your complete video package..." />
        </div>
      )}

      {/* Error */}
      {status === 'error' && error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
          <button onClick={() => { setStatus('idle'); setError(null) }} className="ml-3 underline">Try again</button>
        </div>
      )}

      {/* Results */}
      {status === 'done' && (
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-dashCard border border-dashSurface2 rounded-xl p-1">
            {(['script', 'prompts', 'voice', 'schedule'] as ResultTab[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors',
                  activeTab === tab ? 'bg-accent text-white' : 'text-dashMuted hover:text-dashText'
                )}>
                {tab === 'voice' ? 'Voice Settings' : tab}
              </button>
            ))}
          </div>

          {/* Avatar result tabs */}
          {mode === 'avatar' && avatarResult && (
            <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5 space-y-4">
              {activeTab === 'script' && (
                <div className="space-y-4">
                  <ResultBlock label="Hook (0-3s)" content={avatarResult.hook} />
                  <ResultBlock label="Full Script" content={avatarResult.script} />
                  <ResultBlock label="On-Screen Text" content={avatarResult.onScreenText.join('\n')} />
                  <ResultBlock label="Avatar Direction" content={avatarResult.avatarDirection} />
                  <div className="grid grid-cols-2 gap-4">
                    <ResultBlock label="Background" content={avatarResult.backgroundSuggestion} />
                    <ResultBlock label="Music Mood" content={avatarResult.musicMood} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <ResultBlock label="Estimated CTR" content={avatarResult.estimatedCTR} />
                    <ResultBlock label="Why This Works" content={avatarResult.whyThisWorks} />
                  </div>
                </div>
              )}
              {activeTab === 'prompts' && (
                <div className="space-y-4">
                  <ResultBlockWithLink label="D-ID Prompt" content={avatarResult.dIdPrompt} link="https://studio.d-id.com" linkLabel="Open D-ID →" />
                  <ResultBlockWithLink label="HeyGen Prompt" content={avatarResult.heygenPrompt} link="https://www.heygen.com" linkLabel="Open HeyGen →" />
                  <ResultBlock label="CapCut Template" content={avatarResult.capcut_template} />
                </div>
              )}
              {activeTab === 'voice' && (
                <ResultBlockWithLink label="ElevenLabs Voice Prompt" content={avatarResult.elevenLabsVoicePrompt} link="https://elevenlabs.io" linkLabel="Open ElevenLabs →" />
              )}
              {activeTab === 'schedule' && (
                <div className="text-sm text-dashMuted">
                  <p>Schedule this video to social once it&apos;s produced.</p>
                  <a href={`/${locale}/social`} className="text-accent hover:underline mt-2 inline-block">Go to Social Hub →</a>
                </div>
              )}
            </div>
          )}

          {/* Product URL result tabs */}
          {mode === 'product_url' && productResult && (
            <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5 space-y-4">
              {activeTab === 'script' && (
                <div className="space-y-4">
                  <ResultBlock label="Key Highlights" content={productResult.scrapedHighlights.join('\n• ')} />
                  <ResultBlock label="Full Script" content={productResult.fullScript} />
                  <ResultBlock label="Call to Action" content={productResult.callToAction} />
                  <ResultBlock label="Ad Copy Variations" content={productResult.adCopyVariations.join('\n')} />
                </div>
              )}
              {activeTab === 'prompts' && (
                <div className="space-y-4">
                  <ResultBlockWithLink label="Higgsfield Scenes" content={productResult.higgsfieldScenes.join('\n\n')} link="https://higgsfield.ai" linkLabel="Open Higgsfield →" />
                  <ResultBlock label="Music Recommendation" content={productResult.musicRecommendation} />
                  <ResultBlock label="Landing Page Improvements" content={productResult.landingPageSuggestions.join('\n• ')} />
                </div>
              )}
              {activeTab === 'voice' && (
                <ResultBlockWithLink label="ElevenLabs Prompt" content={productResult.elevenLabsPrompt} link="https://elevenlabs.io" linkLabel="Open ElevenLabs →" />
              )}
              {activeTab === 'schedule' && (
                <div className="text-sm text-dashMuted">
                  <a href={`/${locale}/social`} className="text-accent hover:underline">Go to Social Hub to schedule →</a>
                </div>
              )}
            </div>
          )}

          {/* Voiceover result tabs */}
          {mode === 'voiceover' && voiceResult && (
            <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5 space-y-4">
              {activeTab === 'script' && (
                <div className="space-y-4">
                  <ResultBlock label="Optimised Script" content={voiceResult.script} />
                  <ResultBlock label="Pacing Guide" content={voiceResult.pacing} />
                  <ResultBlock label="Pause Markers" content={voiceResult.pauseMarkers} />
                  <ResultBlock label="Music Bed" content={voiceResult.musicBed} />
                </div>
              )}
              {activeTab === 'prompts' && (
                <ResultBlock label="SSML Markup" content={voiceResult.ssmlMarkup} />
              )}
              {activeTab === 'voice' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(voiceResult.elevenLabsSettings).map(([k, v]) => (
                      <div key={k} className="bg-dashBg rounded-lg p-3">
                        <p className="text-xs text-dashMuted capitalize mb-1">{k.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-sm font-medium text-dashText">{String(v)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {voiceResult.voiceRecommendations.map(v => (
                      <div key={v.voiceId} className="bg-dashBg rounded-lg p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-dashText">{v.voiceName}</p>
                          <span className="text-xs text-dashMuted font-mono">{v.voiceId}</span>
                        </div>
                        <p className="text-xs text-dashMuted">{v.why}</p>
                        <p className="text-xs text-dashText italic">&quot;{v.sampleText}&quot;</p>
                      </div>
                    ))}
                  </div>
                  <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-accent text-sm hover:underline">
                    Open ElevenLabs <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </div>
          )}

          <ActionExplanation
            title="Your video package is ready"
            description="Copy each section and paste into the relevant tool. The script goes into D-ID/HeyGen for avatar, the voice prompt into ElevenLabs, and scenes into Higgsfield."
          />

          <button
            onClick={() => { setMode(null); setStatus('idle'); setAvatarResult(null); setProductResult(null); setVoiceResult(null) }}
            className="text-sm text-dashMuted hover:text-dashText"
          >
            ← Create another
          </button>
        </div>
      )}
    </div>
  )
}

function ResultBlock({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-dashMuted">{label}</label>
        <CopyButton text={content} />
      </div>
      <pre className="text-sm text-dashText bg-dashBg rounded-lg p-3 whitespace-pre-wrap font-sans border border-dashSurface2">
        {content}
      </pre>
    </div>
  )
}

function ResultBlockWithLink({ label, content, link, linkLabel }: { label: string; content: string; link: string; linkLabel: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-dashMuted">{label}</label>
        <div className="flex items-center gap-2">
          <CopyButton text={content} />
          <a href={link} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-accent hover:underline">
            {linkLabel} <ExternalLink size={11} />
          </a>
        </div>
      </div>
      <pre className="text-sm text-dashText bg-dashBg rounded-lg p-3 whitespace-pre-wrap font-sans border border-dashSurface2">
        {content}
      </pre>
    </div>
  )
}
