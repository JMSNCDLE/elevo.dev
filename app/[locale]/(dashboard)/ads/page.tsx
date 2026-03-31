'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'
import {
  Target, Loader2, ChevronRight, Copy, ExternalLink,
  BarChart2, Film, Globe, Plus, CheckCircle2
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { ADMIN_IDS } from '@/lib/admin'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import ActionExplanation from '@/components/shared/ActionExplanation'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import CopyButton from '@/components/shared/CopyButton'
import { cn } from '@/lib/utils'
import type { BusinessProfile } from '@/lib/agents/types'
import type { AdCampaignOutput } from '@/lib/agents/adCampaignAgent'

type Tab = 'builder' | 'campaigns' | 'elevo_own'
type Status = 'idle' | 'building' | 'done' | 'error'

const PLATFORMS = [
  { key: 'meta', label: 'Meta (Facebook & Instagram)', color: 'text-blue-400' },
  { key: 'google', label: 'Google Ads', color: 'text-yellow-400' },
  { key: 'tiktok', label: 'TikTok Ads', color: 'text-teal-400' },
  { key: 'linkedin', label: 'LinkedIn Ads', color: 'text-sky-400' },
]

const OBJECTIVES = ['awareness', 'traffic', 'leads', 'conversions', 'video_views']

const PLATFORM_URLS: Record<string, string> = {
  meta: 'https://business.facebook.com/adsmanager',
  google: 'https://ads.google.com',
  tiktok: 'https://ads.tiktok.com',
  linkedin: 'https://www.linkedin.com/campaignmanager',
}

const ELEVO_MARKETS = [
  { key: 'spain_hospitality', label: 'Spain — Hospitality', desc: 'Restaurants, cafes, bars in Spain', emoji: '🇪🇸' },
  { key: 'uk_trades', label: 'UK — Trades', desc: 'Plumbers, electricians, roofers', emoji: '🔧' },
  { key: 'uk_professional', label: 'UK — Professional Services', desc: 'Accountants, dentists, solicitors', emoji: '💼' },
  { key: 'global_agencies', label: 'Global — Agencies', desc: 'Marketing agencies to resell ELEVO', emoji: '🌍' },
]

export default function AdsPage() {
  const locale = useLocale()
  const supabase = createBrowserClient()

  const [plan, setPlan] = useState<string>('trial')
  const [isAdmin, setIsAdmin] = useState(false)
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [tab, setTab] = useState<Tab>('builder')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [output, setOutput] = useState<AdCampaignOutput | null>(null)
  const [resultTab, setResultTab] = useState<'targeting' | 'copy' | 'creative' | 'structure' | 'predictions' | 'guide'>('copy')
  const [generatingMarket, setGeneratingMarket] = useState<string | null>(null)
  const [eleveOutput, setEleveOutput] = useState<AdCampaignOutput | null>(null)

  // Form
  const [platform, setPlatform] = useState('meta')
  const [objective, setObjective] = useState('leads')
  const [dailyBudget, setDailyBudget] = useState('20')
  const [currency, setCurrency] = useState('GBP')
  const [targetLocation, setTargetLocation] = useState('')
  const [campaignDuration, setCampaignDuration] = useState('30 days')
  const [productOrService, setProductOrService] = useState('')
  const [uniqueSellingPoint, setUniqueSP] = useState('')

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [profileRes, bpRes] = await Promise.all([
      supabase.from('profiles').select('plan, role').eq('id', user.id).single(),
      supabase.from('business_profiles').select('*').eq('user_id', user.id).eq('is_primary', true).single(),
    ])
    setPlan(ADMIN_IDS.includes(user!.id) ? 'galaxy' : (profileRes.data?.plan ?? 'trial'))
    setIsAdmin(profileRes.data?.role === 'admin')
    setBp(bpRes.data)
    if (bpRes.data?.city) setTargetLocation(bpRes.data.city)
    if (bpRes.data?.category) setProductOrService(bpRes.data.category + ' services')
  }, [supabase])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const isOrbit = plan === 'orbit' || plan === 'galaxy'

  async function buildCampaign() {
    if (!bp) return
    setStatus('building')
    setError(null)
    try {
      const res = await fetch('/api/ads/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfileId: bp.id,
          brief: { platform, objective, dailyBudget: Number(dailyBudget), currency, targetLocation, campaignDuration, productOrService, uniqueSellingPoint, locale },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Build failed')
      setOutput(data.output)
      setStatus('done')
      setResultTab('copy')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Build failed')
      setStatus('error')
    }
  }

  async function generateEleveOwn(market: string) {
    setGeneratingMarket(market)
    setEleveOutput(null)
    const res = await fetch('/api/ads/elevo-own', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetMarket: market, locale }),
    })
    const data = await res.json()
    if (data.output) setEleveOutput(data.output)
    setGeneratingMarket(null)
  }

  if (!isOrbit) {
    return (
      <div className="p-6">
        <UpgradePrompt locale={locale} featureName="ELEVO Ads Pro" description="Build complete Meta, Google, and TikTok ad campaigns with targeting, copy variations, creative briefs, and performance predictions." requiredPlan="orbit" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
          <Target size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-dashText">ELEVO Ads Pro™</h1>
          <p className="text-dashMuted text-sm">Build Meta, Google, and TikTok campaigns like an agency. 3 credits.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dashCard border border-dashSurface2 rounded-xl p-1">
        {([
          { key: 'builder', label: 'Campaign Builder' },
          { key: 'campaigns', label: 'My Campaigns' },
          ...(isAdmin ? [{ key: 'elevo_own', label: "ELEVO's Own Ads" }] : []),
        ] as Array<{ key: Tab; label: string }>).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors', tab === t.key ? 'bg-accent text-white' : 'text-dashMuted hover:text-dashText')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CAMPAIGN BUILDER ── */}
      {tab === 'builder' && (
        <>
          {status === 'idle' && (
            <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5 space-y-4">
              {/* Platform */}
              <div>
                <label className="block text-xs text-dashMuted mb-2">Platform</label>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.map(p => (
                    <button key={p.key} onClick={() => setPlatform(p.key)}
                      className={cn('py-2.5 px-3 rounded-lg border text-sm font-medium text-left transition-colors', platform === p.key ? 'border-accent bg-accent/10 text-accent' : 'border-dashSurface2 text-dashMuted hover:border-accent/40')}>
                      <span className={p.color}>●</span> {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dashMuted mb-1">Objective</label>
                  <select value={objective} onChange={e => setObjective(e.target.value)}
                    className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent">
                    {OBJECTIVES.map(o => <option key={o} className="capitalize">{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dashMuted mb-1">Duration</label>
                  <select value={campaignDuration} onChange={e => setCampaignDuration(e.target.value)}
                    className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent">
                    {['7 days', '14 days', '30 days', '60 days', 'ongoing'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dashMuted mb-1">Daily Budget</label>
                  <div className="flex gap-2">
                    <select value={currency} onChange={e => setCurrency(e.target.value)}
                      className="w-20 bg-dashBg border border-dashSurface2 rounded-lg px-2 py-2 text-sm text-dashText focus:outline-none focus:border-accent">
                      <option value="GBP">€</option>
                      <option value="EUR">€</option>
                      <option value="USD">$</option>
                    </select>
                    <input type="number" value={dailyBudget} onChange={e => setDailyBudget(e.target.value)} min="5"
                      className="flex-1 bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-dashMuted mb-1">Target Location</label>
                  <input value={targetLocation} onChange={e => setTargetLocation(e.target.value)}
                    className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
                    placeholder="e.g. Manchester, UK" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-dashMuted mb-1">Product or Service</label>
                <input value={productOrService} onChange={e => setProductOrService(e.target.value)}
                  className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
                  placeholder="e.g. Emergency boiler repair" />
              </div>

              <div>
                <label className="block text-xs text-dashMuted mb-1">Unique Selling Point</label>
                <input value={uniqueSellingPoint} onChange={e => setUniqueSP(e.target.value)}
                  className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
                  placeholder="e.g. Same-day service, 5-star rated, 20 years experience" />
              </div>

              <button onClick={buildCampaign}
                className="w-full py-2.5 bg-accent text-white font-medium rounded-lg hover:bg-accent/90 transition-colors">
                Build Campaign with ELEVO Ads Pro → (3 credits)
              </button>
            </div>
          )}

          {status === 'building' && (
            <div className="bg-dashCard border border-dashSurface2 rounded-xl p-8 flex flex-col items-center gap-4">
              <AgentStatusIndicator status="thinking" agentName="ELEVO Ads Pro" message="Researching your market and building your campaign..." />
            </div>
          )}

          {status === 'error' && error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
              {error}
              <button onClick={() => setStatus('idle')} className="ml-3 underline">Try again</button>
            </div>
          )}

          {status === 'done' && output && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-dashCard border border-dashSurface2 rounded-xl p-4">
                <p className="text-sm font-semibold text-dashText mb-1">{output.campaignName}</p>
                <p className="text-xs text-dashMuted">{output.executiveSummary}</p>
              </div>

              {/* Result tabs */}
              <div className="flex gap-1 bg-dashCard border border-dashSurface2 rounded-xl p-1 overflow-x-auto">
                {(['copy', 'targeting', 'creative', 'structure', 'predictions', 'guide'] as const).map(t => (
                  <button key={t} onClick={() => setResultTab(t)}
                    className={cn('px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-colors', resultTab === t ? 'bg-accent text-white' : 'text-dashMuted hover:text-dashText')}>
                    {t === 'copy' ? 'Ad Copy (A/B/C)' : t === 'guide' ? 'Setup Guide' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5 space-y-4">
                {resultTab === 'copy' && (
                  <div className="space-y-4">
                    {output.adCopies.map(copy => (
                      <div key={copy.variation} className="bg-dashBg rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-accent">Variation {copy.variation} — {copy.predictedCTR} CTR</span>
                          <CopyButton text={`${copy.headline}\n\n${copy.primaryText}\n\n${copy.callToAction}`} />
                        </div>
                        <p className="text-sm font-semibold text-dashText">Hook: {copy.hook}</p>
                        <p className="text-sm font-bold text-dashText">"{copy.headline}"</p>
                        <p className="text-xs text-dashMuted">{copy.primaryText}</p>
                        <p className="text-xs text-dashMuted italic">{copy.description}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">{copy.callToAction}</span>
                          <span className="text-xs text-dashMuted">{copy.whyThisWorks}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {resultTab === 'targeting' && (
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Estimated Reach', value: output.targeting.estimatedReach },
                        { label: 'Est. CPM', value: output.targeting.estimatedCPM },
                        { label: 'Est. CPC', value: output.targeting.estimatedCPC },
                        { label: 'Age Range', value: output.targeting.ageRange },
                      ].map(item => (
                        <div key={item.label} className="bg-dashBg rounded-lg p-3">
                          <p className="text-xs text-dashMuted">{item.label}</p>
                          <p className="font-semibold text-dashText">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    {output.targeting.interests.length > 0 && (
                      <div>
                        <p className="text-xs text-dashMuted mb-2">Interests to target</p>
                        <div className="flex flex-wrap gap-2">
                          {output.targeting.interests.map(i => (
                            <span key={i} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">{i}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-dashMuted mb-1">Lookalike strategy</p>
                      <p className="text-sm text-dashText">{output.targeting.lookalikeStrategy}</p>
                    </div>
                  </div>
                )}

                {resultTab === 'creative' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-dashBg rounded-lg p-3">
                        <p className="text-xs text-dashMuted">Format</p>
                        <p className="font-semibold text-dashText capitalize">{output.creativeBrief.format}</p>
                      </div>
                      <div className="bg-dashBg rounded-lg p-3">
                        <p className="text-xs text-dashMuted">Dimensions</p>
                        <p className="font-semibold text-dashText">{output.creativeBrief.dimensions}</p>
                      </div>
                    </div>
                    <div className="bg-dashBg rounded-lg p-3">
                      <p className="text-xs text-dashMuted mb-1">Visual Direction</p>
                      <p className="text-sm text-dashText">{output.creativeBrief.visualDirection}</p>
                    </div>
                    {output.creativeBrief.scriptIfVideo && (
                      <div className="bg-dashBg rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-dashMuted">Video Script</p>
                          <CopyButton text={output.creativeBrief.scriptIfVideo} />
                        </div>
                        <p className="text-sm text-dashText whitespace-pre-wrap">{output.creativeBrief.scriptIfVideo}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <a href={`/${locale}/video-studio`}
                        className="flex items-center gap-1.5 text-accent text-xs hover:underline">
                        <Film size={12} /> Generate video in ELEVO Studio →
                      </a>
                    </div>
                  </div>
                )}

                {resultTab === 'structure' && (
                  <div className="space-y-3">
                    {output.campaignStructure.adSets.map(set => (
                      <div key={set.name} className="bg-dashBg rounded-lg p-3">
                        <p className="text-sm font-semibold text-dashText">{set.name}</p>
                        <p className="text-xs text-dashMuted">{set.audience}</p>
                        <p className="text-xs text-accent font-medium mt-1">Budget: {set.budget}/day</p>
                        <p className="text-xs text-dashMuted">Placements: {set.placements.join(', ')}</p>
                      </div>
                    ))}
                    <div className="bg-dashBg rounded-lg p-3 space-y-1">
                      <p className="text-xs text-dashMuted font-medium">Testing Strategy</p>
                      <p className="text-xs text-dashText">{output.campaignStructure.testingStrategy}</p>
                    </div>
                    <div className="bg-dashBg rounded-lg p-3 space-y-1">
                      <p className="text-xs text-dashMuted font-medium">Scaling Plan</p>
                      <p className="text-xs text-dashText">{output.campaignStructure.scalingPlan}</p>
                    </div>
                  </div>
                )}

                {resultTab === 'predictions' && (
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(output.predictions).map(([k, v]) => (
                      <div key={k} className="bg-dashBg rounded-lg p-3">
                        <p className="text-xs text-dashMuted capitalize">{k.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-sm font-bold text-dashText">{v}</p>
                      </div>
                    ))}
                  </div>
                )}

                {resultTab === 'guide' && (
                  <div className="space-y-3">
                    {output.setupGuide.map(step => (
                      <div key={step.step} className="flex gap-3">
                        <div className="w-6 h-6 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">{step.step}</div>
                        <div>
                          <p className="text-sm font-medium text-dashText">{step.action}</p>
                          <p className="text-xs text-dashMuted">{step.exactSetting}</p>
                          <p className="text-xs text-dashMuted italic mt-0.5">{step.screenshot_note}</p>
                        </div>
                      </div>
                    ))}
                    {platform in PLATFORM_URLS && (
                      <a href={PLATFORM_URLS[platform]} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-accent text-sm hover:underline mt-2">
                        Open {PLATFORMS.find(p => p.key === platform)?.label} <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                )}
              </div>

              <ActionExplanation
                title="Your campaign is ready to launch"
                description="Copy Variation A first. Run for 7 days. Check which variation has the highest CTR and double its budget. Pause the others."
              />

              <button onClick={() => { setStatus('idle'); setOutput(null) }} className="text-sm text-dashMuted hover:text-dashText">
                ← Build another campaign
              </button>
            </div>
          )}
        </>
      )}

      {/* ── MY CAMPAIGNS ── */}
      {tab === 'campaigns' && (
        <div className="bg-dashCard border border-dashSurface2 rounded-xl p-8 text-center">
          <BarChart2 size={32} className="text-dashMuted mx-auto mb-3" />
          <p className="text-dashMuted text-sm">No campaigns yet. Build your first campaign above.</p>
          <button onClick={() => setTab('builder')} className="mt-4 text-accent text-sm hover:underline">Build a campaign →</button>
        </div>
      )}

      {/* ── ELEVO'S OWN ADS (admin only) ── */}
      {tab === 'elevo_own' && isAdmin && (
        <div className="space-y-4">
          <div className="bg-dashCard border border-dashSurface2 rounded-xl p-4">
            <p className="text-sm font-semibold text-dashText mb-1">Generate ads to market ELEVO itself</p>
            <p className="text-xs text-dashMuted">Pick a target market and ELEVO Ads Pro builds a ready-to-run campaign for that audience.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {ELEVO_MARKETS.map(market => (
              <button key={market.key} onClick={() => generateEleveOwn(market.key)}
                disabled={generatingMarket !== null}
                className="bg-dashCard border border-dashSurface2 rounded-xl p-4 text-left hover:border-accent/40 transition-colors disabled:opacity-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{market.emoji}</span>
                  {generatingMarket === market.key ? (
                    <Loader2 size={14} className="animate-spin text-accent" />
                  ) : (
                    <ChevronRight size={14} className="text-dashMuted" />
                  )}
                </div>
                <p className="text-sm font-semibold text-dashText">{market.label}</p>
                <p className="text-xs text-dashMuted">{market.desc}</p>
              </button>
            ))}
          </div>
          {eleveOutput && (
            <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5 space-y-3">
              <p className="text-sm font-semibold text-dashText">{eleveOutput.campaignName}</p>
              <p className="text-xs text-dashMuted">{eleveOutput.executiveSummary}</p>
              {eleveOutput.adCopies.slice(0, 2).map(copy => (
                <div key={copy.variation} className="bg-dashBg rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-accent">Variation {copy.variation}</span>
                    <CopyButton text={`${copy.headline}\n\n${copy.primaryText}`} />
                  </div>
                  <p className="text-sm font-bold text-dashText">"{copy.headline}"</p>
                  <p className="text-xs text-dashMuted">{copy.primaryText}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
