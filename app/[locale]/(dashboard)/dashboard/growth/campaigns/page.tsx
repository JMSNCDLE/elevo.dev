'use client'

import { useLocale } from 'next-intl'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { ADMIN_IDS } from '@/lib/admin'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import CopyButton from '@/components/shared/CopyButton'
import type { BusinessProfile, CampaignPlan } from '@/lib/agents/types'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'

const channelOptions = ['Google Business Profile', 'Instagram', 'Facebook', 'Email', 'WhatsApp', 'Leaflets / Local', 'LinkedIn']

export default function CampaignsPage({}: {  }) {
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [plan, setPlan] = useState('trial')
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [campaignGoal, setCampaignGoal] = useState('')
  const [campaignDuration, setCampaignDuration] = useState('4 weeks')
  const [budget, setBudget] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['Instagram', 'Email'])
  const [season, setSeason] = useState('')
  const [offer, setOffer] = useState('')
  const [output, setOutput] = useState<CampaignPlan | null>(null)
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: prof }, { data: bpData }] = await Promise.all([
        supabase.from('profiles').select('plan').eq('id', user.id).single(),
        supabase.from('business_profiles').select('*').eq('user_id', user.id).eq('is_primary', true).single(),
      ])
      if (prof) setPlan(ADMIN_IDS.includes(user.id) ? 'galaxy' : prof.plan)
      if (bpData) setBp(bpData as BusinessProfile)
    }
    load()
  }, [])

  if (plan === 'trial' || plan === 'launch') return <UpgradePrompt locale={locale} feature="Campaign Planning" />

  const toggleChannel = (c: string) => setSelectedChannels(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  const handleGenerate = async () => {
    if (!bp || !campaignGoal.trim()) return
    setStatus('thinking')
    setOutput(null)
    try {
      const res = await fetch('/api/growth/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessProfileId: bp.id, campaignGoal, campaignDuration, budget, targetAudience, channels: selectedChannels, season, offer }),
      })
      setStatus('generating')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setOutput(data.result)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dashText">Campaign Planning</h1>
        <p className="text-dashMuted text-sm mt-1">Full marketing campaigns with content calendar and KPIs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Campaign goal <span className="text-red-400">*</span></label>
            <textarea value={campaignGoal} onChange={e => setCampaignGoal(e.target.value)} rows={2} placeholder="e.g. Generate 20 new boiler service bookings before winter" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted resize-none focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-dashMuted mb-1.5">Duration</label>
              <select value={campaignDuration} onChange={e => setCampaignDuration(e.target.value)} className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText focus:outline-none focus:ring-2 focus:ring-accent">
                {['1 week', '2 weeks', '4 weeks', '6 weeks', '3 months'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dashMuted mb-1.5">Budget</label>
              <input type="text" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. €200 or organic" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Channels</label>
            <div className="flex flex-wrap gap-2">
              {channelOptions.map(c => (
                <button key={c} onClick={() => toggleChannel(c)} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${selectedChannels.includes(c) ? 'bg-accent text-white' : 'bg-dashSurface text-dashMuted border border-dashSurface2 hover:text-dashText'}`}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Core offer / hook</label>
            <input type="text" value={offer} onChange={e => setOffer(e.target.value)} placeholder="e.g. Free boiler check, 15% off, limited availability" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div className="flex items-center justify-between">
            <AgentStatusIndicator status={status} />
            <button onClick={handleGenerate} disabled={!campaignGoal.trim() || status === 'thinking' || status === 'generating'} className="px-4 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {(status === 'thinking' || status === 'generating') && <Loader2 size={15} className="animate-spin" />}
              Build Campaign
            </button>
          </div>
        </div>

        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
          {!output ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-dashMuted text-sm text-center">Your campaign plan will appear here with a full content calendar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-dashText">{output.campaignName}</h3>
                <CopyButton text={output.fullPlan} />
              </div>
              {output.contentCalendar.length > 0 && (
                <div>
                  <p className="text-xs text-dashMuted uppercase tracking-wide mb-2">Content calendar</p>
                  <div className="space-y-2">
                    {output.contentCalendar.map((item, i) => (
                      <div key={i} className="bg-dashSurface rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-accent">{item.week}</span>
                          <span className="text-xs text-dashMuted">{item.channel}</span>
                        </div>
                        <p className="text-xs text-dashText">{item.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-3 border-t border-dashSurface2">
                <textarea readOnly value={output.fullPlan} rows={6} className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-xs text-dashText resize-none focus:outline-none" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
