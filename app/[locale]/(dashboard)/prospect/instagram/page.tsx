'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'
import {
  Instagram,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageCircle,
  Mail,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import type { InstagramAudit } from '@/lib/agents/instagramAuditAgent'

type Step = 'form' | 'loading' | 'results' | 'demo-generated'
type AuditTab = 'overview' | 'content' | 'profile' | 'quickwins'

const CATEGORIES = [
  'Plumber',
  'Electrician',
  'Restaurant',
  'Dental',
  'Salon',
  'Retail',
  'Other',
]

const LOADING_STEPS = [
  'Searching Instagram profile...',
  'Analysing content strategy...',
  'Finding competitors...',
  'Identifying opportunities...',
  'Building audit report...',
]

const EFFORT_COLORS: Record<string, string> = {
  minutes: 'bg-green-500/10 text-green-400',
  hours: 'bg-yellow-500/10 text-yellow-400',
  days: 'bg-red-500/10 text-red-400',
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const clampedScore = Math.min(100, Math.max(0, score))
  const dashOffset = circumference - (clampedScore / 100) * circumference

  const color =
    clampedScore >= 70 ? '#22c55e' : clampedScore >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144">
        <circle
          cx="72"
          cy="72"
          r={radius}
          stroke="#1A2332"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="72"
          cy="72"
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="text-center">
        <p className="text-3xl font-black text-dashText">{clampedScore}</p>
        <p className="text-xs text-dashMuted">/100</p>
      </div>
    </div>
  )
}

export default function InstagramAuditPage() {
  const locale = useLocale()

  // Step state
  const [step, setStep] = useState<Step>('form')

  // Form
  const [handle, setHandle] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessCategory, setBusinessCategory] = useState('Other')
  const [agencyName, setAgencyName] = useState('ELEVO AI')
  const [formError, setFormError] = useState<string | null>(null)

  // Loading
  const [loadingStep, setLoadingStep] = useState(0)

  // Results
  const [audit, setAudit] = useState<InstagramAudit | null>(null)
  const [activeTab, setActiveTab] = useState<AuditTab>('overview')

  // Demo generated
  const [pageSlug, setPageSlug] = useState('')
  const [pageUrl, setPageUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [generatingDemo, setGeneratingDemo] = useState(false)

  // Animate loading steps
  useEffect(() => {
    if (step !== 'loading') return
    setLoadingStep(0)
    const intervals: ReturnType<typeof setTimeout>[] = []
    LOADING_STEPS.forEach((_, idx) => {
      if (idx === 0) return
      intervals.push(
        setTimeout(() => setLoadingStep(idx), idx * 2200)
      )
    })
    return () => intervals.forEach(clearTimeout)
  }, [step])

  async function handleAudit() {
    setFormError(null)
    const cleanHandle = handle.replace('@', '').trim()
    if (!cleanHandle) {
      setFormError('Please enter an Instagram handle.')
      return
    }
    setStep('loading')

    try {
      const res = await fetch('/api/prospect/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instagramHandle: cleanHandle,
          businessName: businessName || undefined,
          businessCategory,
          agencyName,
          locale,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Audit failed')
      setAudit(data.audit)
      setPageSlug(data.pageSlug)
      setPageUrl(data.pageUrl)
      setStep('results')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Audit failed. Please try again.')
      setStep('form')
    }
  }

  async function handleGenerateDemo() {
    if (!audit) return
    setGeneratingDemo(true)
    // Demo page was already generated during audit — we just transition
    await new Promise(r => setTimeout(r, 800))
    setGeneratingDemo(false)
    setStep('demo-generated')
  }

  function copyUrl() {
    navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`I've built a personalised demo just for you: ${pageUrl}`)}`
  const emailUrl = `mailto:?subject=${encodeURIComponent('Your personalised ELEVO AI audit')}&body=${encodeURIComponent(`Hi,\n\nI've built a personalised Instagram audit and demo page for you:\n\n${pageUrl}\n\nLet me know your thoughts!`)}`

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Back */}
      {step !== 'loading' && (
        <button
          onClick={() => {
            if (step === 'results' || step === 'demo-generated') {
              setStep('form')
              setAudit(null)
            } else {
              window.history.back()
            }
          }}
          className="flex items-center gap-1.5 text-dashMuted hover:text-dashText text-sm transition-colors"
        >
          <ArrowLeft size={14} />
          {step === 'form' ? 'Back to Prospect Hub' : 'Back'}
        </button>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
          <Instagram size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-dashText">Instagram Client Machine</h1>
          <p className="text-dashMuted text-sm">Audit any Instagram profile in minutes. Costs 5 credits.</p>
        </div>
      </div>

      {/* ── STEP 1: FORM ── */}
      {step === 'form' && (
        <div className="bg-dashCard border border-[#1E2D42] rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-xs text-dashMuted mb-1">Instagram Handle</label>
            <div className="flex items-center bg-dashBg border border-dashSurface2 rounded-lg overflow-hidden focus-within:border-accent">
              <span className="px-3 text-dashMuted text-sm select-none">@</span>
              <input
                value={handle}
                onChange={e => setHandle(e.target.value.replace('@', ''))}
                placeholder="marioplumbing"
                className="flex-1 bg-transparent px-1 py-2.5 text-sm text-dashText focus:outline-none"
                onKeyDown={e => e.key === 'Enter' && handleAudit()}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-dashMuted mb-1">Business Name (optional)</label>
              <input
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. Mario's Plumbing"
                className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs text-dashMuted mb-1">Business Category</label>
              <select
                value={businessCategory}
                onChange={e => setBusinessCategory(e.target.value)}
                className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText focus:outline-none focus:border-accent"
              >
                {CATEGORIES.map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-dashMuted mb-1">Your Agency Name</label>
            <input
              value={agencyName}
              onChange={e => setAgencyName(e.target.value)}
              placeholder="ELEVO AI"
              className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText focus:outline-none focus:border-accent"
            />
            <p className="text-xs text-dashMuted mt-1">This appears on the personalised demo page you send to the prospect.</p>
          </div>

          {formError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {formError}
            </div>
          )}

          <button
            onClick={handleAudit}
            disabled={!handle.trim()}
            className="w-full py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Audit This Instagram → (5 credits)
          </button>
        </div>
      )}

      {/* ── STEP 2: LOADING ── */}
      {step === 'loading' && (
        <div className="bg-dashCard border border-[#1E2D42] rounded-xl p-8 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <AgentStatusIndicator
              status="analyzing"
              agentName="ELEVO Prospect"
              message="Researching your prospect on Instagram..."
            />
          </div>
          <div className="space-y-3 mt-4">
            {LOADING_STEPS.map((s, idx) => {
              const done = idx < loadingStep
              const active = idx === loadingStep
              return (
                <div
                  key={s}
                  className={cn(
                    'flex items-center gap-3 text-sm transition-opacity duration-500',
                    done || active ? 'opacity-100' : 'opacity-30'
                  )}
                >
                  {done ? (
                    <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                  ) : active ? (
                    <Loader2 size={16} className="text-accent shrink-0 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-dashSurface2 shrink-0" />
                  )}
                  <span className={done ? 'text-dashMuted line-through' : active ? 'text-dashText' : 'text-dashMuted'}>
                    {s}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── STEP 3: RESULTS ── */}
      {step === 'results' && audit && (
        <div className="space-y-5">
          {/* Score + summary */}
          <div className="bg-dashCard border border-[#1E2D42] rounded-xl p-5 flex items-center gap-6">
            <ScoreGauge score={audit.overallScore} />
            <div className="flex-1">
              <p className="text-xs text-dashMuted uppercase tracking-wide font-semibold mb-1">Instagram Score</p>
              <p className="text-dashText text-sm leading-relaxed">{audit.scoreSummary}</p>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-dashBg rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-dashText">{audit.estimatedFollowers}</p>
                  <p className="text-xs text-dashMuted">Followers</p>
                </div>
                <div className="bg-dashBg rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-dashText">{audit.estimatedEngagementRate}</p>
                  <p className="text-xs text-dashMuted">Engagement</p>
                </div>
                <div className="bg-dashBg rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-dashText">{audit.postingFrequency}</p>
                  <p className="text-xs text-dashMuted">Frequency</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-dashCard border border-[#1E2D42] rounded-xl p-1 overflow-x-auto">
            {([
              { key: 'overview', label: 'Overview' },
              { key: 'content', label: 'Content' },
              { key: 'profile', label: 'Profile' },
              { key: 'quickwins', label: 'Quick Wins' },
            ] as Array<{ key: AuditTab; label: string }>).map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  'flex-1 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors',
                  activeTab === t.key
                    ? 'bg-accent text-white'
                    : 'text-dashMuted hover:text-dashText'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="bg-dashCard border border-[#1E2D42] rounded-xl p-5 space-y-4">
            {/* Overview tab */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {audit.revenueOpportunities.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-dashMuted uppercase tracking-wide mb-2">
                      Revenue Opportunities
                    </p>
                    <div className="space-y-2">
                      {audit.revenueOpportunities.map((opp, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-accent font-bold shrink-0">£</span>
                          <span className="text-dashText">{opp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-dashBg rounded-lg p-3">
                    <p className="text-xs font-semibold text-red-400 uppercase mb-2">They beat you at</p>
                    <div className="space-y-1">
                      {audit.competitorComparison.theyAreBeating.map((item, i) => (
                        <p key={i} className="text-xs text-dashMuted">· {item}</p>
                      ))}
                    </div>
                  </div>
                  <div className="bg-dashBg rounded-lg p-3">
                    <p className="text-xs font-semibold text-green-400 uppercase mb-2">You beat them at</p>
                    <div className="space-y-1">
                      {audit.competitorComparison.youAreBeating.map((item, i) => (
                        <p key={i} className="text-xs text-dashMuted">· {item}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {audit.competitorComparison.biggestGap && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-xs font-semibold text-yellow-400 mb-1">Biggest Gap</p>
                    <p className="text-sm text-dashText">{audit.competitorComparison.biggestGap}</p>
                  </div>
                )}
              </div>
            )}

            {/* Content tab */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-dashBg rounded-lg p-3">
                    <p className="text-xs text-dashMuted mb-1">Avg Likes</p>
                    <p className="text-lg font-bold text-dashText">{audit.contentAnalysis.averageLikes.toLocaleString()}</p>
                  </div>
                  <div className="bg-dashBg rounded-lg p-3">
                    <p className="text-xs text-dashMuted mb-1">Avg Comments</p>
                    <p className="text-lg font-bold text-dashText">{audit.contentAnalysis.averageComments.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-dashMuted uppercase mb-2">Top Performing Types</p>
                  <div className="flex flex-wrap gap-2">
                    {audit.contentAnalysis.topPerformingTypes.map(t => (
                      <span key={t} className="text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-lg">{t}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-green-400 uppercase mb-2">Best Times</p>
                    {audit.contentAnalysis.bestPostingTimes.map(t => (
                      <p key={t} className="text-xs text-dashMuted">· {t}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-400 uppercase mb-2">Worst Times</p>
                    {audit.contentAnalysis.worstPostingTimes.map(t => (
                      <p key={t} className="text-xs text-dashMuted">· {t}</p>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Caption Quality', value: audit.contentAnalysis.captionQuality },
                    { label: 'Hashtag Strategy', value: audit.contentAnalysis.hashtagStrategy },
                    { label: 'CTA Usage', value: audit.contentAnalysis.cta_usage },
                  ].map(item => (
                    <div key={item.label} className="bg-dashBg rounded-lg p-2.5 text-center">
                      <p className="text-xs text-dashMuted mb-1">{item.label}</p>
                      <span className="text-xs font-semibold text-dashText">{item.value}</span>
                    </div>
                  ))}
                </div>

                {audit.contentAnalysis.missingContent.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-400 uppercase mb-2">Missing Content</p>
                    <div className="space-y-1">
                      {audit.contentAnalysis.missingContent.map((m, i) => (
                        <p key={i} className="text-xs text-dashMuted">· {m}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile tab */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="relative w-20 h-20 flex items-center justify-center mx-auto">
                      <svg className="-rotate-90 absolute" width="80" height="80">
                        <circle cx="40" cy="40" r="34" stroke="#1A2332" strokeWidth="7" fill="none" />
                        <circle
                          cx="40" cy="40" r="34"
                          stroke="#6366F1" strokeWidth="7" fill="none"
                          strokeDasharray={2 * Math.PI * 34}
                          strokeDashoffset={2 * Math.PI * 34 * (1 - audit.profileAnalysis.bioScore / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-sm font-bold text-dashText relative">
                        {audit.profileAnalysis.bioScore}
                      </span>
                    </div>
                    <p className="text-xs text-dashMuted mt-1">Bio Score</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[
                      { label: 'Bio Optimised', value: audit.profileAnalysis.bioOptimised },
                      { label: 'Link in Bio', value: audit.profileAnalysis.hasLinkInBio },
                      { label: 'Link Optimised', value: audit.profileAnalysis.linkInBioOptimised },
                      { label: 'Professional Image', value: audit.profileAnalysis.profileImageProfessional },
                      { label: 'Highlights Used', value: audit.profileAnalysis.highlightsUsed },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2">
                        {item.value ? (
                          <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-red-400 shrink-0 flex items-center justify-center">
                            <span className="text-red-400 text-[10px] font-bold">✗</span>
                          </div>
                        )}
                        <span className="text-xs text-dashMuted">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {audit.profileAnalysis.bioIssues.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-400 uppercase mb-2">Bio Issues</p>
                    <div className="space-y-1">
                      {audit.profileAnalysis.bioIssues.map((issue, i) => (
                        <p key={i} className="text-xs text-dashMuted">· {issue}</p>
                      ))}
                    </div>
                  </div>
                )}

                {audit.profileAnalysis.highlightGaps.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-yellow-400 uppercase mb-2">Highlight Gaps</p>
                    <div className="space-y-1">
                      {audit.profileAnalysis.highlightGaps.map((gap, i) => (
                        <p key={i} className="text-xs text-dashMuted">· {gap}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Wins tab */}
            {activeTab === 'quickwins' && (
              <div className="space-y-3">
                {[...audit.quickWins]
                  .sort((a, b) => {
                    const order = { minutes: 0, hours: 1, days: 2 }
                    return order[a.effort] - order[b.effort]
                  })
                  .map((win, i) => (
                    <div key={i} className="bg-dashBg rounded-lg p-3 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-dashText">{win.action}</p>
                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full shrink-0', EFFORT_COLORS[win.effort])}>
                          {win.effort}
                        </span>
                      </div>
                      <p className="text-xs text-dashMuted">{win.expectedImpact}</p>
                      {win.canELEVODoThis && (
                        <span className="inline-flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
                          ⚡ ELEVO can automate this
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Generate Demo Button */}
          <button
            onClick={handleGenerateDemo}
            disabled={generatingDemo}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {generatingDemo ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Building demo page...
              </>
            ) : (
              'Generate Personalised Demo Page →'
            )}
          </button>
        </div>
      )}

      {/* ── STEP 4: DEMO GENERATED ── */}
      {step === 'demo-generated' && (
        <div className="bg-dashCard border border-[#1E2D42] rounded-xl p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-dashText">Your personalised demo page is live</h2>
            <p className="text-dashMuted text-sm">
              Send this link to your prospect. It expires in 30 days.
            </p>
          </div>

          {/* URL display */}
          <div className="bg-dashBg border border-dashSurface2 rounded-xl p-4 flex items-center gap-3">
            <div className="flex-1 truncate">
              <p className="text-xs text-dashMuted mb-0.5">Demo URL</p>
              <p className="text-sm font-mono text-accent truncate">{pageUrl}</p>
            </div>
            <button
              onClick={copyUrl}
              className="flex items-center gap-1.5 px-3 py-2 bg-accent text-white rounded-lg text-xs font-semibold hover:bg-accentLight transition-colors shrink-0"
            >
              <Copy size={13} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-3">
            <a
              href={pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 bg-dashBg border border-dashSurface2 rounded-xl p-3 hover:border-accent/40 transition-colors text-center"
            >
              <ExternalLink size={18} className="text-accent" />
              <span className="text-xs text-dashMuted">Open Preview</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 bg-dashBg border border-dashSurface2 rounded-xl p-3 hover:border-accent/40 transition-colors text-center"
            >
              <MessageCircle size={18} className="text-green-400" />
              <span className="text-xs text-dashMuted">WhatsApp</span>
            </a>
            <a
              href={emailUrl}
              className="flex flex-col items-center gap-1.5 bg-dashBg border border-dashSurface2 rounded-xl p-3 hover:border-accent/40 transition-colors text-center"
            >
              <Mail size={18} className="text-blue-400" />
              <span className="text-xs text-dashMuted">Email</span>
            </a>
          </div>

          <button
            onClick={() => {
              setStep('form')
              setAudit(null)
              setHandle('')
              setBusinessName('')
              setPageSlug('')
              setPageUrl('')
            }}
            className="w-full py-2.5 border border-dashSurface2 text-dashMuted rounded-lg text-sm hover:text-dashText hover:border-accent/40 transition-colors"
          >
            Audit another profile
          </button>
        </div>
      )}
    </div>
  )
}
