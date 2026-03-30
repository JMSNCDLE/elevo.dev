'use client'

import { useLocale } from 'next-intl'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { ADMIN_IDS } from '@/lib/admin'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import CopyButton from '@/components/shared/CopyButton'
import type { BusinessProfile, MarketResearchReport } from '@/lib/agents/types'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'

export default function ResearchPage({}: {  }) {
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [plan, setPlan] = useState('trial')
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [researchFocus, setResearchFocus] = useState('')
  const [targetMarket, setTargetMarket] = useState('')
  const [geographicScope, setGeographicScope] = useState('')
  const [output, setOutput] = useState<MarketResearchReport | null>(null)
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
      if (bpData) {
        setBp(bpData as BusinessProfile)
        setGeographicScope(`${bpData.city} and surrounding area`)
      }
    }
    load()
  }, [])

  if (plan === 'trial' || plan === 'launch') return <UpgradePrompt locale={locale} feature="Market Research" />

  const handleGenerate = async () => {
    if (!bp || !researchFocus.trim()) return
    setStatus('thinking')
    setOutput(null)
    try {
      const res = await fetch('/api/growth/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessProfileId: bp.id, researchFocus, targetMarket, geographicScope }),
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
        <h1 className="text-2xl font-bold text-dashText">Market Research</h1>
        <p className="text-dashMuted text-sm mt-1">AI-powered market intelligence with live web data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Research focus <span className="text-red-400">*</span></label>
            <textarea value={researchFocus} onChange={e => setResearchFocus(e.target.value)} rows={3} placeholder="e.g. What's the demand for electric vehicle servicing in my area? Who are my main competitors?" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted resize-none focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Target market</label>
            <input type="text" value={targetMarket} onChange={e => setTargetMarket(e.target.value)} placeholder="e.g. Homeowners aged 35-60" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Geographic scope</label>
            <input type="text" value={geographicScope} onChange={e => setGeographicScope(e.target.value)} placeholder="e.g. Manchester and surrounding towns" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div className="flex items-center justify-between">
            <AgentStatusIndicator status={status} />
            <button onClick={handleGenerate} disabled={!researchFocus.trim() || status === 'thinking' || status === 'generating'} className="px-4 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {(status === 'thinking' || status === 'generating') && <Loader2 size={15} className="animate-spin" />}
              Run Research
            </button>
          </div>
        </div>

        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
          {!output ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-dashMuted text-sm text-center">Research results will appear here. This uses live web search data.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-dashText">Research Report</h3>
                <CopyButton text={output.fullReport} />
              </div>
              {output.opportunities.length > 0 && (
                <div>
                  <p className="text-xs text-dashMuted uppercase tracking-wide mb-2">Opportunities</p>
                  <ul className="space-y-1.5">
                    {output.opportunities.map((o, i) => <li key={i} className="flex items-start gap-2 text-sm text-dashText"><span className="text-green-400 mt-0.5">↑</span>{o}</li>)}
                  </ul>
                </div>
              )}
              {output.threats.length > 0 && (
                <div>
                  <p className="text-xs text-dashMuted uppercase tracking-wide mb-2">Threats</p>
                  <ul className="space-y-1.5">
                    {output.threats.map((t, i) => <li key={i} className="flex items-start gap-2 text-sm text-dashText"><span className="text-red-400 mt-0.5">↓</span>{t}</li>)}
                  </ul>
                </div>
              )}
              <div className="pt-3 border-t border-dashSurface2">
                <textarea readOnly value={output.fullReport} rows={8} className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-xs text-dashText resize-none focus:outline-none" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
