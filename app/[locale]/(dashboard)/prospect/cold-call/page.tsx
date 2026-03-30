'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Loader2, Download, Phone, UserPlus, ChevronDown, ChevronUp } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { ADMIN_IDS } from '@/lib/admin'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import CopyButton from '@/components/shared/CopyButton'
import type { ColdCallScript } from '@/lib/agents/coldCallAgent'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'
type TabId = 'openers' | 'fullscript' | 'objections' | 'closing' | 'delivery'

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

const TABS: { id: TabId; label: string }[] = [
  { id: 'openers', label: 'Openers' },
  { id: 'fullscript', label: 'Full Script' },
  { id: 'objections', label: 'Objection Handlers' },
  { id: 'closing', label: 'Closing Framework' },
  { id: 'delivery', label: 'Delivery Notes' },
]

const STYLE_LABELS: Record<string, string> = {
  pattern_interrupt: 'Pattern Interrupt',
  referral: 'Referral',
  research_based: 'Research-Based',
}

const STYLE_COLORS: Record<string, string> = {
  pattern_interrupt: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  referral: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  research_based: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
}

export default function ColdCallPage() {
  const locale = useLocale()
  const supabase = createBrowserClient()

  const [plan, setPlan] = useState<string>('trial')
  const [prospectName, setProspectName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0])
  const [city, setCity] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')
  const [auditFinding, setAuditFinding] = useState('')
  const [yourName, setYourName] = useState('')
  const [agencyName, setAgencyName] = useState('ELEVO AI')
  const [offer, setOffer] = useState(OFFERS[0])

  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [script, setScript] = useState<ColdCallScript | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('openers')
  const [openObjection, setOpenObjection] = useState<number | null>(null)
  const [crmToast, setCrmToast] = useState(false)

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
    return <UpgradePrompt locale={locale} feature="ELEVO Dial™" requiredPlan="orbit" />
  }

  const canGenerate = prospectName.trim() && businessName.trim() && city.trim() && yourName.trim()

  const handleGenerate = async () => {
    if (!canGenerate) return
    setStatus('thinking')
    setScript(null)
    setError('')

    try {
      const res = await fetch('/api/prospect/cold-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            prospectName,
            businessName,
            businessType,
            city,
            instagramHandle: instagramHandle || undefined,
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
      setScript(data.script)
      setStatus('done')
      setActiveTab('openers')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Generation failed. Please try again.')
    }
  }

  const handleAddToCRM = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await fetch('/api/crm/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: prospectName,
        business_name: businessName,
        city,
        notes: `Cold call prospect — ${businessType}`,
      }),
    })

    setCrmToast(true)
    setTimeout(() => setCrmToast(false), 3000)
  }

  const handlePrint = () => window.print()

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-accent/15 border border-accent/30 rounded-lg flex items-center justify-center">
            <Phone size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-dashText">ELEVO Dial™</h1>
            <p className="text-dashMuted text-sm">Cold Call Script Generator — Natural scripts with 8 objection handlers</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs bg-accent/10 border border-accent/20 text-accent px-2.5 py-1 rounded-full font-medium">2 credits</span>
          <span className="text-xs text-dashMuted">Orbit+ feature</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form — 2 cols */}
        <div className="lg:col-span-2 bg-[#1A2332] rounded-xl border border-[#161F2E] p-6 space-y-4 h-fit">
          <h2 className="text-sm font-semibold text-dashText mb-4">Prospect Details</h2>

          <div>
            <label className="block text-xs font-medium text-dashMuted mb-1.5">Prospect name <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={prospectName}
              onChange={e => setProspectName(e.target.value)}
              placeholder="e.g. Sarah Johnson"
              className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-dashMuted mb-1.5">Business name <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              placeholder="e.g. Sarah's Hair Studio"
              className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-dashMuted mb-1.5">Business type</label>
            <select
              value={businessType}
              onChange={e => setBusinessType(e.target.value)}
              className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            >
              {BUSINESS_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-dashMuted mb-1.5">City <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="e.g. Manchester"
              className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
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
            <label className="block text-xs font-medium text-dashMuted mb-1.5">Key finding to reference (optional)</label>
            <textarea
              value={auditFinding}
              onChange={e => setAuditFinding(e.target.value)}
              rows={2}
              placeholder="e.g. their engagement dropped 40% last month, or their competitor is ranking above them"
              className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] placeholder:text-[#94A3B8] resize-none focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
          </div>

          <div className="border-t border-[#161F2E] pt-4">
            <h3 className="text-xs font-semibold text-dashMuted mb-3 uppercase tracking-wide">Your Info</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-dashMuted mb-1.5">Your name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={yourName}
                  onChange={e => setYourName(e.target.value)}
                  placeholder="e.g. James"
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
              <div>
                <label className="block text-xs font-medium text-dashMuted mb-1.5">What you&apos;re offering</label>
                <select
                  value={offer}
                  onChange={e => setOffer(e.target.value)}
                  className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                >
                  {OFFERS.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <AgentStatusIndicator status={status} agentName="ELEVO Dial™" />
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || status === 'thinking' || status === 'generating'}
              className="px-4 py-2.5 bg-[#6366F1] text-white font-semibold rounded-lg hover:bg-[#818CF8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              {(status === 'thinking' || status === 'generating') && <Loader2 size={14} className="animate-spin" />}
              Generate Script →
            </button>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        {/* Output — 3 cols */}
        <div className="lg:col-span-3">
          {!script ? (
            <div className="bg-[#1A2332] rounded-xl border border-[#161F2E] p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mb-4">
                <Phone size={24} className="text-accent/60" />
              </div>
              <p className="text-dashMuted text-sm">Fill in the prospect details and click Generate Script.</p>
              <p className="text-dashMuted/60 text-xs mt-1">Your complete call script will appear here.</p>
            </div>
          ) : (
            <div className="bg-[#1A2332] rounded-xl border border-[#161F2E] overflow-hidden">
              {/* Script header */}
              <div className="px-6 py-4 border-b border-[#161F2E] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#EEF2FF]">Script for {prospectName} — {businessName}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-dashMuted">Est. duration: {script.estimatedCallDuration}</span>
                    <span className="text-xs text-dashMuted">•</span>
                    <span className="text-xs text-dashMuted">Success rate: {script.successRate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddToCRM}
                    className="flex items-center gap-1.5 text-xs text-dashMuted hover:text-[#EEF2FF] transition-colors px-2.5 py-1.5 rounded-md border border-[#161F2E] hover:border-[#6366F1]/30"
                  >
                    <UserPlus size={12} />
                    Add to CRM
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 text-xs text-dashMuted hover:text-[#EEF2FF] transition-colors px-2.5 py-1.5 rounded-md border border-[#161F2E] hover:border-[#6366F1]/30"
                  >
                    <Download size={12} />
                    Download PDF
                  </button>
                </div>
              </div>

              {/* CRM Toast */}
              {crmToast && (
                <div className="mx-6 mt-3 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-400">
                  Added to CRM
                </div>
              )}

              {/* Tabs */}
              <div className="flex border-b border-[#161F2E] overflow-x-auto">
                {TABS.map(tab => (
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

              <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                {/* OPENERS TAB */}
                {activeTab === 'openers' && (
                  <div className="space-y-4">
                    {script.openers.map((opener, i) => (
                      <div key={i} className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STYLE_COLORS[opener.style] ?? 'bg-accent/10 text-accent border-accent/20'}`}>
                            {STYLE_LABELS[opener.style] ?? opener.style}
                          </span>
                          <CopyButton text={opener.script} size="sm" />
                        </div>
                        <blockquote className="text-sm text-[#EEF2FF] leading-relaxed border-l-2 border-[#6366F1] pl-4 italic">
                          {opener.script}
                        </blockquote>
                        <div className="mt-3 pt-3 border-t border-[#161F2E]">
                          <p className="text-xs text-dashMuted font-medium mb-1">Why this works</p>
                          <p className="text-xs text-dashMuted/80">{opener.whyThisWorks}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* FULL SCRIPT TAB */}
                {activeTab === 'fullscript' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-dashMuted">Full script — print or read from screen during calls</p>
                      <CopyButton text={script.fullScript} />
                    </div>
                    <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-5">
                      <pre className="text-sm text-[#EEF2FF] whitespace-pre-wrap leading-relaxed font-sans">
                        {script.fullScript}
                      </pre>
                    </div>
                  </div>
                )}

                {/* OBJECTIONS TAB */}
                {activeTab === 'objections' && (
                  <div className="space-y-2">
                    {script.objections.map((obj, i) => (
                      <div key={i} className="bg-[#141B24] rounded-xl border border-[#161F2E] overflow-hidden">
                        <button
                          onClick={() => setOpenObjection(openObjection === i ? null : i)}
                          className="w-full flex items-center justify-between px-4 py-3 text-left"
                        >
                          <span className="text-sm font-medium text-[#EEF2FF]">&ldquo;{obj.objection}&rdquo;</span>
                          {openObjection === i ? (
                            <ChevronUp size={16} className="text-dashMuted shrink-0" />
                          ) : (
                            <ChevronDown size={16} className="text-dashMuted shrink-0" />
                          )}
                        </button>
                        {openObjection === i && (
                          <div className="px-4 pb-4 space-y-3 border-t border-[#161F2E] pt-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-dashMuted font-medium uppercase tracking-wide">Response</p>
                                <CopyButton text={obj.response} size="sm" />
                              </div>
                              <p className="text-sm text-[#EEF2FF]">{obj.response}</p>
                            </div>
                            <div>
                              <p className="text-xs text-dashMuted font-medium uppercase tracking-wide mb-1">Follow-up</p>
                              <p className="text-sm text-[#EEF2FF]">{obj.followUp}</p>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                              <p className="text-xs text-amber-300 font-medium mb-0.5">Tip</p>
                              <p className="text-xs text-amber-200/80">{obj.tip}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* CLOSING FRAMEWORK TAB */}
                {activeTab === 'closing' && (
                  <div className="space-y-3">
                    {[
                      { label: 'Soft Close', value: script.closing.softClose, color: 'border-blue-500/30 bg-blue-500/5' },
                      { label: 'Hard Close', value: script.closing.hardClose, color: 'border-purple-500/30 bg-purple-500/5' },
                      { label: 'If They Say Yes', value: script.closing.ifYes, color: 'border-green-500/30 bg-green-500/5' },
                      { label: 'If They Say No', value: script.closing.ifNo, color: 'border-orange-500/30 bg-orange-500/5' },
                      { label: 'Voicemail Script', value: script.closing.voicemail, color: 'border-[#161F2E] bg-[#141B24]' },
                    ].map((item) => (
                      <div key={item.label} className={`rounded-xl border p-4 ${item.color}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-dashMuted uppercase tracking-wide">{item.label}</p>
                          <CopyButton text={item.value} size="sm" />
                        </div>
                        <p className="text-sm text-[#EEF2FF] leading-relaxed">{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* DELIVERY NOTES TAB */}
                {activeTab === 'delivery' && (
                  <div className="space-y-3">
                    {script.deliveryNotes.map((note, i) => (
                      <div key={i} className="flex gap-4 bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="w-6 h-6 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-xs text-accent font-bold">{i + 1}</div>
                          {i < script.deliveryNotes.length - 1 && <div className="w-px h-full bg-[#161F2E] min-h-[20px]" />}
                        </div>
                        <div className="pb-2">
                          <p className="text-xs font-medium text-[#6366F1] mb-1">{note.timing}</p>
                          <p className="text-sm text-[#EEF2FF]">{note.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          body { background: white; color: black; }
          nav, aside, header, .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}
