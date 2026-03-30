'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Loader2, Mail, Download, ExternalLink } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { ADMIN_IDS } from '@/lib/admin'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import CopyButton from '@/components/shared/CopyButton'
import type { ColdEmailSequence } from '@/lib/agents/coldEmailAgent'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'

const BUSINESS_TYPES = [
  'Restaurant / Café',
  'Hair Salon / Barber',
  'Beauty / Spa / Nails',
  'Plumber / Electrician / Tradesperson',
  'Gym / Personal Trainer',
  'Dentist / Healthcare',
  'Estate Agent / Property',
  'Accountant / Financial Services',
  'Solicitor / Legal',
  'Retail Shop',
  'Cleaning Company',
  'Landscaping / Gardening',
  'Photographer / Videographer',
  'Digital Marketing Agency',
  'Other',
]

const OFFERS = [
  'Free audit',
  '15-min demo',
  'Free trial',
  'Discovery call',
]

const EMAIL_DAY_LABELS: Record<number, string> = {
  1: 'Day 1 — Hook',
  2: 'Day 3 — Value',
  3: 'Day 7 — Social Proof',
  4: 'Day 14 — Urgency',
  5: 'Day 21 — Break-up',
}

export default function ColdEmailPage() {
  const locale = useLocale()
  const supabase = createBrowserClient()

  const [plan, setPlan] = useState<string>('trial')
  const [prospectEmail, setProspectEmail] = useState('')
  const [prospectName, setProspectName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0])
  const [city, setCity] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [linkedInUrl, setLinkedInUrl] = useState('')
  const [auditFinding, setAuditFinding] = useState('')
  const [yourName, setYourName] = useState('')
  const [agencyName, setAgencyName] = useState('ELEVO AI')
  const [offer, setOffer] = useState(OFFERS[0])

  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [sequence, setSequence] = useState<ColdEmailSequence | null>(null)
  const [activeTab, setActiveTab] = useState<string>('angle')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: prof } = await supabase.from('profiles').select('plan, full_name').eq('id', user.id).single()
      if (prof) {
        setPlan(ADMIN_IDS.includes(user.id) ? 'galaxy' : (prof.plan ?? 'trial'))
        if (prof.full_name) setYourName(prof.full_name)
      }
    }
    load()
  }, [])

  if (plan === 'trial' || plan === 'launch') {
    return <UpgradePrompt locale={locale} feature="ELEVO Send™" requiredPlan="orbit" />
  }

  const canGenerate = prospectEmail.trim() && prospectName.trim() && businessName.trim() && yourName.trim()

  const handleGenerate = async () => {
    if (!canGenerate) return
    setStatus('thinking')
    setSequence(null)
    setError('')

    try {
      const res = await fetch('/api/prospect/cold-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            prospectEmail,
            prospectName,
            businessName,
            businessType,
            city,
            instagramHandle: instagramHandle || undefined,
            websiteUrl: websiteUrl || undefined,
            linkedInUrl: linkedInUrl || undefined,
            auditFinding: auditFinding || undefined,
            yourName,
            agencyName,
            offer,
            locale,
          },
          locale,
        }),
      })

      setStatus('generating')

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Generation failed')
      }

      const data = await res.json()
      setSequence(data.sequence)
      setStatus('done')
      setActiveTab('angle')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Generation failed. Please try again.')
    }
  }

  const handleExportCSV = () => {
    if (!sequence) return
    const rows = [
      ['Day', 'Subject A', 'Subject B', 'Preheader', 'Body', 'CTA', 'PS'],
      ...sequence.emails.map(e => [
        String(e.sendOnDay),
        e.subject,
        e.subjectB,
        e.preheader,
        e.body.replace(/\n/g, ' '),
        e.cta,
        e.psLine,
      ]),
    ]
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cold-email-${businessName.replace(/\s+/g, '-').toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getAllEmailsText = () => {
    if (!sequence) return ''
    return sequence.emails.map(e =>
      `--- EMAIL ${e.emailNumber} (Day ${e.sendOnDay}) ---\nSubject: ${e.subject}\nPreheader: ${e.preheader}\n\n${e.body}\n\n${e.cta}\n\n${e.psLine}`
    ).join('\n\n')
  }

  const tabs = [
    { id: 'angle', label: 'The Angle' },
    ...(sequence?.emails.map((_, i) => ({
      id: `email${i + 1}`,
      label: EMAIL_DAY_LABELS[i + 1] ?? `Email ${i + 1}`,
    })) ?? []),
    { id: 'linkedin', label: 'LinkedIn + DM' },
    { id: 'replies', label: 'Reply Handlers' },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-accent/15 border border-accent/30 rounded-lg flex items-center justify-center">
            <Mail size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-dashText">ELEVO Send™</h1>
            <p className="text-dashMuted text-sm">Cold Email Machine — Research-backed sequences that get replies</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs bg-accent/10 border border-accent/20 text-accent px-2.5 py-1 rounded-full font-medium">3 credits</span>
          <span className="text-xs text-dashMuted">Orbit+ feature</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 bg-[#1A2332] rounded-xl border border-[#161F2E] p-6 space-y-4 h-fit">
          <h2 className="text-sm font-semibold text-dashText mb-4">Prospect Details</h2>

          <div>
            <label className="block text-xs font-medium text-dashMuted mb-1.5">Prospect email <span className="text-red-400">*</span></label>
            <input
              type="email"
              value={prospectEmail}
              onChange={e => setProspectEmail(e.target.value)}
              placeholder="sarah@sarahshair.co.uk"
              className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dashMuted mb-1.5">Prospect name <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={prospectName}
                onChange={e => setProspectName(e.target.value)}
                placeholder="Sarah Johnson"
                className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dashMuted mb-1.5">Business name <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="Sarah's Hair Studio"
                className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dashMuted mb-1.5">Business type</label>
              <select
                value={businessType}
                onChange={e => setBusinessType(e.target.value)}
                className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              >
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-dashMuted mb-1.5">City</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Manchester"
                className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-dashMuted mb-1.5">Instagram handle (optional)</label>
            <input
              type="text"
              value={instagramHandle}
              onChange={e => setInstagramHandle(e.target.value)}
              placeholder="@sarahshair"
              className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-dashMuted mb-1.5">Website URL (optional)</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={e => setWebsiteUrl(e.target.value)}
              placeholder="https://sarahshair.co.uk"
              className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-dashMuted mb-1.5">LinkedIn URL (optional)</label>
            <input
              type="url"
              value={linkedInUrl}
              onChange={e => setLinkedInUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-dashMuted mb-1.5">Key finding (optional)</label>
            <textarea
              value={auditFinding}
              onChange={e => setAuditFinding(e.target.value)}
              rows={2}
              placeholder="e.g. their Google ranking dropped 3 positions, or Instagram engagement fell 40%"
              className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] placeholder:text-[#94A3B8] resize-none focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
          </div>

          <div className="border-t border-[#161F2E] pt-4">
            <h3 className="text-xs font-semibold text-dashMuted mb-3 uppercase tracking-wide">Your Info</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-dashMuted mb-1.5">Your name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={yourName}
                    onChange={e => setYourName(e.target.value)}
                    placeholder="James"
                    className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dashMuted mb-1.5">Agency name</label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={e => setAgencyName(e.target.value)}
                    placeholder="ELEVO AI"
                    className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-dashMuted mb-1.5">What you&apos;re offering</label>
                <select
                  value={offer}
                  onChange={e => setOffer(e.target.value)}
                  className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                >
                  {OFFERS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <AgentStatusIndicator status={status} agentName="ELEVO Send™" />
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || status === 'thinking' || status === 'generating'}
              className="px-4 py-2.5 bg-[#6366F1] text-white font-semibold rounded-lg hover:bg-[#818CF8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              {(status === 'thinking' || status === 'generating') && <Loader2 size={14} className="animate-spin" />}
              Write the Sequence →
            </button>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        {/* Output */}
        <div className="lg:col-span-3">
          {!sequence ? (
            <div className="bg-[#1A2332] rounded-xl border border-[#161F2E] p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mb-4">
                <Mail size={24} className="text-accent/60" />
              </div>
              <p className="text-dashMuted text-sm">Fill in the prospect details and click Write the Sequence.</p>
              <p className="text-dashMuted/60 text-xs mt-1">Your 5-email sequence will appear here, research-backed and personalised.</p>
            </div>
          ) : (
            <div className="bg-[#1A2332] rounded-xl border border-[#161F2E] overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#161F2E] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#EEF2FF]">Sequence for {prospectName} — {businessName}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-dashMuted">Expected reply rate: {sequence.expectedResponseRate}</span>
                    <span className="text-xs text-dashMuted">•</span>
                    <span className="text-xs text-dashMuted">Best time: {sequence.bestTimeToSend}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton text={getAllEmailsText()} size="sm" />
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 text-xs text-dashMuted hover:text-[#EEF2FF] transition-colors px-2.5 py-1.5 rounded-md border border-[#161F2E] hover:border-[#6366F1]/30"
                  >
                    <Download size={12} />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#161F2E] overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'text-[#6366F1] border-b-2 border-[#6366F1]'
                        : 'text-dashMuted hover:text-[#EEF2FF]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6 max-h-[620px] overflow-y-auto">
                {/* ANGLE TAB */}
                {activeTab === 'angle' && (
                  <div className="space-y-4">
                    <div className="bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-xl p-5">
                      <p className="text-xs font-medium text-[#6366F1] uppercase tracking-wide mb-3">Research Finding</p>
                      <p className="text-sm text-[#EEF2FF] mb-4">{sequence.angle.finding}</p>
                      <div className="border-t border-[#6366F1]/20 pt-3">
                        <p className="text-xs font-medium text-[#6366F1] uppercase tracking-wide mb-2">The Hook</p>
                        <p className="text-lg font-semibold text-[#EEF2FF]">{sequence.angle.hook}</p>
                      </div>
                    </div>
                    <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                      <p className="text-xs font-medium text-dashMuted uppercase tracking-wide mb-2">Why this angle will land</p>
                      <p className="text-sm text-[#EEF2FF]">{sequence.angle.whyThisAngle}</p>
                    </div>
                    <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                      <p className="text-xs font-medium text-dashMuted uppercase tracking-wide mb-2">Sequence Logic</p>
                      <p className="text-sm text-[#EEF2FF]">{sequence.sequenceLogic}</p>
                    </div>
                  </div>
                )}

                {/* EMAIL TABS */}
                {sequence.emails.map((email, i) => (
                  activeTab === `email${i + 1}` && (
                    <div key={i} className="space-y-4">
                      {/* Subjects */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-dashMuted uppercase tracking-wide">Subject A</p>
                            <span className="text-xs bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full">{email.subjectLineScore}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-[#EEF2FF]">{email.subject}</p>
                            <CopyButton text={email.subject} size="sm" />
                          </div>
                        </div>
                        <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-dashMuted uppercase tracking-wide">Subject B</p>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-[#EEF2FF]">{email.subjectB}</p>
                            <CopyButton text={email.subjectB} size="sm" />
                          </div>
                        </div>
                      </div>

                      {/* Preheader */}
                      <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-dashMuted mb-0.5">Preheader</p>
                          <p className="text-sm text-[#EEF2FF]">{email.preheader}</p>
                        </div>
                        <CopyButton text={email.preheader} size="sm" />
                      </div>

                      {/* Email body — styled like email client */}
                      <div className="bg-white rounded-xl border border-[#161F2E] overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">From:</span>
                            <span className="text-xs text-gray-700 font-medium">{yourName} &lt;hello@{agencyName.toLowerCase().replace(/\s/g, '')}.com&gt;</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">Subject:</span>
                            <span className="text-xs text-gray-700 font-medium">{email.subject}</span>
                          </div>
                        </div>
                        <div className="px-5 py-4">
                          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">{email.body}</pre>
                        </div>
                        <div className="px-5 pb-4">
                          <p className="text-sm text-[#6366F1] font-medium">{email.cta}</p>
                        </div>
                        <div className="px-5 pb-4 border-t border-gray-100 pt-3">
                          <p className="text-xs text-gray-500 italic">{email.psLine}</p>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#141B24] rounded-lg border border-[#161F2E] p-3 text-center">
                          <p className="text-xs text-dashMuted mb-1">Tone</p>
                          <p className="text-xs text-[#EEF2FF] font-medium">{email.tone}</p>
                        </div>
                        <div className="bg-[#141B24] rounded-lg border border-[#161F2E] p-3 text-center">
                          <p className="text-xs text-dashMuted mb-1">Word count</p>
                          <p className="text-xs text-[#EEF2FF] font-medium">{email.wordCount} words</p>
                        </div>
                        <div className="bg-[#141B24] rounded-lg border border-[#161F2E] p-3 text-center">
                          <p className="text-xs text-dashMuted mb-1">Best send time</p>
                          <p className="text-xs text-[#EEF2FF] font-medium">{email.sendTime}</p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <CopyButton text={`Subject: ${email.subject}\n\n${email.body}\n\n${email.cta}\n\n${email.psLine}`} />
                      </div>
                    </div>
                  )
                ))}

                {/* LINKEDIN + DM TAB */}
                {activeTab === 'linkedin' && (
                  <div className="space-y-4">
                    <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center">
                            <span className="text-[10px] font-bold text-blue-400">in</span>
                          </div>
                          <p className="text-sm font-semibold text-[#EEF2FF]">LinkedIn Message</p>
                        </div>
                        <CopyButton text={sequence.linkedInMessage} size="sm" />
                      </div>
                      <p className="text-sm text-[#EEF2FF] leading-relaxed">{sequence.linkedInMessage}</p>
                      <p className="text-xs text-dashMuted mt-2">{sequence.linkedInMessage.length} / 300 characters</p>
                    </div>

                    <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-pink-500/20 rounded-md flex items-center justify-center">
                            <span className="text-[10px] font-bold text-pink-400">IG</span>
                          </div>
                          <p className="text-sm font-semibold text-[#EEF2FF]">Instagram DM</p>
                        </div>
                        <CopyButton text={sequence.instagramDM} size="sm" />
                      </div>
                      <p className="text-sm text-[#EEF2FF] leading-relaxed">{sequence.instagramDM}</p>
                      <p className="text-xs text-dashMuted mt-2">{sequence.instagramDM.length} / 150 characters</p>
                    </div>
                  </div>
                )}

                {/* REPLY HANDLERS TAB */}
                {activeTab === 'replies' && (
                  <div className="space-y-3">
                    {sequence.replyHandlers.map((handler, i) => (
                      <div key={i} className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-[#EEF2FF] bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full">
                            {handler.replyType}
                          </span>
                          <CopyButton text={handler.response} size="sm" />
                        </div>
                        <p className="text-sm text-[#EEF2FF] leading-relaxed">{handler.response}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[#161F2E] flex items-center justify-between">
                <a
                  href={`/${locale}/conversations`}
                  className="flex items-center gap-1.5 text-xs text-dashMuted hover:text-[#EEF2FF] transition-colors"
                >
                  <ExternalLink size={12} />
                  Load into ELEVO Connect™
                </a>
                <div className="flex items-center gap-2">
                  <CopyButton text={getAllEmailsText()} />
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 text-xs text-dashMuted hover:text-[#EEF2FF] transition-colors px-3 py-1.5 rounded-md border border-[#161F2E] hover:border-[#6366F1]/30"
                  >
                    <Download size={12} />
                    Export to CSV
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
