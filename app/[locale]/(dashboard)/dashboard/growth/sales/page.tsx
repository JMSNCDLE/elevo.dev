'use client'

import { useLocale } from 'next-intl'

import { useState, useEffect } from 'react'
import { Loader2, Download } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import CopyButton from '@/components/shared/CopyButton'
import type { BusinessProfile, SalesProposal } from '@/lib/agents/types'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'

export default function SalesPage({}: {  }) {
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [plan, setPlan] = useState<string>('trial')
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [clientName, setClientName] = useState('')
  const [clientBusiness, setClientBusiness] = useState('')
  const [projectBrief, setProjectBrief] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [budget, setBudget] = useState('')
  const [timeline, setTimeline] = useState('')
  const [output, setOutput] = useState<SalesProposal | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: prof }, { data: bpData }] = await Promise.all([
        supabase.from('profiles').select('plan').eq('id', user.id).single(),
        supabase.from('business_profiles').select('*').eq('user_id', user.id).eq('is_primary', true).single(),
      ])
      if (prof) setPlan(prof.plan)
      if (bpData) setBp(bpData as BusinessProfile)
    }
    load()
  }, [])

  if (plan === 'trial' || plan === 'launch') {
    return <UpgradePrompt locale={locale} feature="Sales & Proposals" />
  }

  const toggleService = (s: string) => {
    setSelectedServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const handleGenerate = async () => {
    if (!bp || !clientName.trim() || !projectBrief.trim()) return
    setStatus('thinking')
    setOutput(null)
    setError('')
    try {
      const res = await fetch('/api/growth/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessProfileId: bp.id, clientName, clientBusiness, projectBrief, services: selectedServices, budget, timeline }),
      })
      setStatus('generating')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setOutput(data.result)
      setStatus('done')
    } catch {
      setStatus('error')
      setError('Generation failed. Please try again.')
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dashText">Sales & Proposals</h1>
        <p className="text-dashMuted text-sm mt-1">Generate professional proposals that win clients</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Client name <span className="text-red-400">*</span></label>
            <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. John Smith" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Client's business (optional)</label>
            <input type="text" value={clientBusiness} onChange={e => setClientBusiness(e.target.value)} placeholder="e.g. Smith Retail Ltd" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Project brief <span className="text-red-400">*</span></label>
            <textarea value={projectBrief} onChange={e => setProjectBrief(e.target.value)} rows={3} placeholder="What do they need? What's the scope?" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted resize-none focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Services to include</label>
            <div className="flex flex-wrap gap-2">
              {bp?.services.map(s => (
                <button key={s} onClick={() => toggleService(s)} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${selectedServices.includes(s) ? 'bg-accent text-white' : 'bg-dashSurface text-dashMuted border border-dashSurface2 hover:text-dashText'}`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-dashMuted mb-1.5">Budget range</label>
              <input type="text" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. £2,000–£3,000" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dashMuted mb-1.5">Timeline</label>
              <input type="text" value={timeline} onChange={e => setTimeline(e.target.value)} placeholder="e.g. 4 weeks" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <AgentStatusIndicator status={status} />
            <button onClick={handleGenerate} disabled={!clientName.trim() || !projectBrief.trim() || status === 'thinking' || status === 'generating'} className="px-4 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {(status === 'thinking' || status === 'generating') && <Loader2 size={15} className="animate-spin" />}
              Generate Proposal
            </button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* Output */}
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
          {!output ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-dashMuted text-sm text-center">Your proposal will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-dashText">Generated Proposal</h3>
                <CopyButton text={output.fullDocument} />
              </div>
              <div className="space-y-3 text-sm">
                {output.executiveSummary && (
                  <div>
                    <p className="text-xs text-dashMuted uppercase tracking-wide mb-1">Summary</p>
                    <p className="text-dashText">{output.executiveSummary}</p>
                  </div>
                )}
                {output.deliverables.length > 0 && (
                  <div>
                    <p className="text-xs text-dashMuted uppercase tracking-wide mb-1">Deliverables</p>
                    <ul className="space-y-1">
                      {output.deliverables.map((d, i) => <li key={i} className="text-dashText flex items-start gap-1.5"><span className="text-accent">•</span>{d}</li>)}
                    </ul>
                  </div>
                )}
              </div>
              <div className="pt-3 border-t border-dashSurface2">
                <p className="text-xs text-dashMuted mb-2">Full document</p>
                <textarea readOnly value={output.fullDocument} rows={8} className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-xs text-dashText resize-none focus:outline-none" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
