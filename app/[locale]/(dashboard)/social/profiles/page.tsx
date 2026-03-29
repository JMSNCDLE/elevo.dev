'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'
import {
  User, Loader2, Calendar, Hash, Zap, ChevronRight,
  Instagram, Twitter, Linkedin, Globe, Video
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import ActionExplanation from '@/components/shared/ActionExplanation'
import CopyButton from '@/components/shared/CopyButton'
import { cn } from '@/lib/utils'
import type { BusinessProfile } from '@/lib/agents/types'
import type { SocialProfileKit } from '@/lib/agents/socialProfileAgent'

type Status = 'idle' | 'generating' | 'done' | 'error'
type ResultTab = 'setup' | 'calendar' | 'hashtags' | 'viral' | 'growth'

const PLATFORMS = [
  { key: 'Instagram', icon: Instagram, color: 'text-pink-400' },
  { key: 'TikTok', icon: Video, color: 'text-teal-400' },
  { key: 'Facebook', icon: Globe, color: 'text-blue-400' },
  { key: 'LinkedIn', icon: Linkedin, color: 'text-sky-400' },
  { key: 'Twitter/X', icon: Twitter, color: 'text-white' },
]

const GOALS = [
  'Generate leads and enquiries',
  'Build brand awareness',
  'Grow followers fast',
  'Drive website traffic',
  'Showcase work / portfolio',
  'Get more reviews',
]

export default function SocialProfilesPage() {
  const locale = useLocale()
  const supabase = createBrowserClient()

  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [platform, setPlatform] = useState('Instagram')
  const [goal, setGoal] = useState(GOALS[0])
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [kit, setKit] = useState<SocialProfileKit | null>(null)
  const [resultTab, setResultTab] = useState<ResultTab>('setup')

  const fetchBp = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('business_profiles').select('*').eq('user_id', user.id).eq('is_primary', true).single()
    setBp(data)
  }, [supabase])

  useEffect(() => { fetchBp() }, [fetchBp])

  async function generate() {
    if (!bp) return
    setStatus('generating')
    setError(null)
    try {
      const res = await fetch('/api/social/profile-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessProfileId: bp.id, platform, goal, locale }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      setKit(data.kit)
      setStatus('done')
      setResultTab('setup')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
      setStatus('error')
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
          <User size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-dashText">ELEVO Profile™</h1>
          <p className="text-dashMuted text-sm">Optimised social profiles + 30-day content calendar. 1 credit.</p>
        </div>
      </div>

      {/* Form */}
      {status === 'idle' && (
        <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-xs text-dashMuted mb-2">Platform</label>
            <div className="flex gap-2 flex-wrap">
              {PLATFORMS.map(p => (
                <button key={p.key} onClick={() => setPlatform(p.key)}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors', platform === p.key ? 'border-accent bg-accent/10 text-accent' : 'border-dashSurface2 text-dashMuted hover:border-accent/40')}>
                  <p.icon size={13} className={p.color} />
                  {p.key}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-dashMuted mb-2">Primary Goal</label>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map(g => (
                <button key={g} onClick={() => setGoal(g)}
                  className={cn('text-left px-3 py-2 rounded-lg border text-xs transition-colors', goal === g ? 'border-accent bg-accent/10 text-accent' : 'border-dashSurface2 text-dashMuted hover:border-accent/40')}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generate}
            className="w-full py-2.5 bg-accent text-white font-medium rounded-lg hover:bg-accent/90 transition-colors">
            Generate Full Profile Kit with ELEVO Profile →
          </button>
        </div>
      )}

      {status === 'generating' && (
        <div className="bg-dashCard border border-dashSurface2 rounded-xl p-8 flex flex-col items-center gap-4">
          <AgentStatusIndicator status="thinking" agentName="ELEVO Profile" message="Researching top performers and building your complete kit..." />
        </div>
      )}

      {status === 'error' && error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
          <button onClick={() => setStatus('idle')} className="ml-3 underline">Try again</button>
        </div>
      )}

      {status === 'done' && kit && (
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-dashCard border border-dashSurface2 rounded-xl p-1 overflow-x-auto">
            {([
              { key: 'setup', label: 'Profile Setup' },
              { key: 'calendar', label: '30-Day Calendar' },
              { key: 'hashtags', label: 'Hashtags' },
              { key: 'viral', label: 'Viral Ideas' },
              { key: 'growth', label: 'Growth Plan' },
            ] as Array<{ key: ResultTab; label: string }>).map(t => (
              <button key={t.key} onClick={() => setResultTab(t.key)}
                className={cn('px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors', resultTab === t.key ? 'bg-accent text-white' : 'text-dashMuted hover:text-dashText')}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5 space-y-4">
            {resultTab === 'setup' && (
              <div className="space-y-4">
                {[
                  { label: 'Username', value: kit.username },
                  { label: 'Display Name', value: kit.displayName },
                  { label: 'Profile Image Concept', value: kit.profileImageConcept },
                  { label: 'Cover Image Concept', value: kit.coverImageConcept },
                  { label: 'Pinned Post Idea', value: kit.pinnedPostIdea },
                ].map(item => (
                  <div key={item.label} className="bg-dashBg rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-dashMuted">{item.label}</p>
                      <CopyButton text={item.value} />
                    </div>
                    <p className="text-sm text-dashText">{item.value}</p>
                  </div>
                ))}
                <div className="bg-dashBg rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-dashMuted">Bio (optimised)</p>
                    <CopyButton text={kit.bio} />
                  </div>
                  <p className="text-sm text-dashText">{kit.bio}</p>
                </div>
                {kit.bioVariations.length > 0 && (
                  <div>
                    <p className="text-xs text-dashMuted mb-2">Bio Variations (A/B test)</p>
                    {kit.bioVariations.map((bio, i) => (
                      <div key={i} className="bg-dashBg rounded-lg p-3 mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-dashMuted">Variation {i + 1}</p>
                          <CopyButton text={bio} />
                        </div>
                        <p className="text-sm text-dashText">{bio}</p>
                      </div>
                    ))}
                  </div>
                )}
                {kit.instagramHighlights && kit.instagramHighlights.length > 0 && (
                  <div>
                    <p className="text-xs text-dashMuted mb-2">Instagram Highlights</p>
                    <div className="flex gap-3 flex-wrap">
                      {kit.instagramHighlights.map(h => (
                        <div key={h.name} className="bg-dashBg rounded-lg p-2.5 text-center min-w-[80px]">
                          <p className="text-xs font-medium text-dashText">{h.name}</p>
                          <p className="text-xs text-dashMuted mt-0.5">{h.coverConcept}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {kit.linkInBioStructure.length > 0 && (
                  <div>
                    <p className="text-xs text-dashMuted mb-2">Link in Bio Structure</p>
                    {kit.linkInBioStructure.map(link => (
                      <div key={link.label} className="bg-dashBg rounded-lg p-2.5 mb-1.5 flex items-center gap-2">
                        <span>{link.emoji}</span>
                        <span className="text-sm font-medium text-dashText">{link.label}</span>
                        <span className="text-xs text-dashMuted ml-auto">{link.url}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {resultTab === 'calendar' && (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {kit.contentCalendar.map(entry => (
                  <div key={entry.day} className="bg-dashBg rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-accent w-6">D{entry.day}</span>
                        <span className="text-xs text-dashMuted">{entry.dayOfWeek}</span>
                        <span className="text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded">{entry.contentType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-dashMuted">{entry.bestTimeToPost}</span>
                        <CopyButton text={`${entry.hook}\n\n${entry.caption}\n\n${entry.hashtags.join(' ')}`} />
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-dashText">{entry.hook}</p>
                    <p className="text-xs text-dashMuted line-clamp-2">{entry.caption}</p>
                    <p className="text-xs text-dashMuted">CTA: {entry.callToAction} · Est. reach: {entry.estimatedReach}</p>
                  </div>
                ))}
              </div>
            )}

            {resultTab === 'hashtags' && (
              <div className="space-y-4">
                {[
                  { label: 'Mega Hashtags (1M+ posts)', tags: kit.megaHashtags, color: 'text-red-400' },
                  { label: 'Mid Hashtags (100k-1M posts)', tags: kit.midHashtags, color: 'text-yellow-400' },
                  { label: 'Niche Hashtags (<100k posts)', tags: kit.niceHashtags, color: 'text-green-400' },
                ].map(group => (
                  <div key={group.label}>
                    <div className="flex items-center justify-between mb-2">
                      <p className={cn('text-xs font-medium', group.color)}>{group.label}</p>
                      <CopyButton text={group.tags.join(' ')} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.tags.map(tag => (
                        <span key={tag} className="text-xs bg-dashBg text-dashMuted px-2 py-0.5 rounded border border-dashSurface2">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="bg-dashBg rounded-lg p-3">
                  <p className="text-xs text-dashMuted mb-1">Your branded hashtag</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-accent">{kit.brandedHashtag}</p>
                    <CopyButton text={kit.brandedHashtag} />
                  </div>
                  <p className="text-xs text-dashMuted mt-1">Use on every post to build your own hashtag community.</p>
                </div>
              </div>
            )}

            {resultTab === 'viral' && (
              <div className="space-y-4">
                {kit.viralConcepts.map((concept, i) => (
                  <div key={i} className="bg-dashBg rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-dashText">"{concept.hook}"</p>
                      <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded shrink-0">{concept.format}</span>
                    </div>
                    <p className="text-xs text-dashMuted">{concept.concept}</p>
                    <p className="text-xs text-green-400">{concept.whyItWillGo}</p>
                    {concept.vegaPrompt && (
                      <div className="flex items-center gap-2">
                        <CopyButton text={concept.vegaPrompt} />
                        <a href={`/${locale}/video-studio`} className="text-xs text-accent hover:underline">Generate in ELEVO Studio →</a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {resultTab === 'growth' && (
              <div className="space-y-4">
                {kit.growthTactics.map((tactic, i) => (
                  <div key={i} className="bg-dashBg rounded-lg p-4 space-y-1">
                    <p className="text-sm font-semibold text-dashText">{tactic.tactic}</p>
                    <p className="text-xs text-dashMuted">{tactic.howTo}</p>
                    <div className="flex items-center gap-4 pt-1">
                      <span className="text-xs text-yellow-400">⏱ {tactic.timeCommitment}</span>
                      <span className="text-xs text-green-400">📈 {tactic.expectedResult}</span>
                    </div>
                  </div>
                ))}
                {kit.competitorGaps.length > 0 && (
                  <div>
                    <p className="text-xs text-dashMuted font-medium mb-2">Competitor Gaps to Exploit</p>
                    {kit.competitorGaps.map((gap, i) => (
                      <div key={i} className="bg-dashBg rounded-lg p-3 mb-2">
                        <p className="text-xs font-medium text-dashText">{gap.gapOpportunity}</p>
                        <p className="text-xs text-accent mt-0.5">Your opportunity: {gap.contentIdea}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <ActionExplanation
            title="Your complete social profile kit is ready"
            description="Start with the Profile Setup tab — update your bio, highlights, and link in bio today. Then follow the 30-day calendar for consistent growth."
          />

          <button onClick={() => { setStatus('idle'); setKit(null) }} className="text-sm text-dashMuted hover:text-dashText">
            ← Generate another platform
          </button>
        </div>
      )}
    </div>
  )
}
