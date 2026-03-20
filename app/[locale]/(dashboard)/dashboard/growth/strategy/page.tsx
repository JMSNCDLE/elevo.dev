'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import CopyButton from '@/components/shared/CopyButton'
import type { BusinessProfile, SWOTStrategy } from '@/lib/agents/types'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'

const SWOTColors = { strengths: 'text-green-400', weaknesses: 'text-red-400', opportunities: 'text-blue-400', threats: 'text-amber-400' }

export default function StrategyPage({ params }: { params: { locale: string } }) {
  const supabase = createBrowserClient()
  const [plan, setPlan] = useState('trial')
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [strategicGoal, setStrategicGoal] = useState('')
  const [timeframe, setTimeframe] = useState('12 months')
  const [currentChallenges, setCurrentChallenges] = useState('')
  const [output, setOutput] = useState<SWOTStrategy | null>(null)
  const [status, setStatus] = useState<Status>('idle')

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

  if (plan === 'trial' || plan === 'launch') return <UpgradePrompt locale={params.locale} feature="Strategy & SWOT" />

  const handleGenerate = async () => {
    if (!bp || !strategicGoal.trim()) return
    setStatus('thinking')
    setOutput(null)
    try {
      const res = await fetch('/api/growth/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessProfileId: bp.id, strategicGoal, timeframe, currentChallenges }),
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
        <h1 className="text-2xl font-bold text-dashText">Strategy & SWOT</h1>
        <p className="text-dashMuted text-sm mt-1">Strategic planning and SWOT analysis for your business</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Strategic goal <span className="text-red-400">*</span></label>
            <textarea value={strategicGoal} onChange={e => setStrategicGoal(e.target.value)} rows={3} placeholder="e.g. Grow revenue by 30% and hire my first employee within 12 months" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted resize-none focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Timeframe</label>
            <select value={timeframe} onChange={e => setTimeframe(e.target.value)} className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText focus:outline-none focus:ring-2 focus:ring-accent">
              {['3 months', '6 months', '12 months', '18 months', '2 years'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Current challenges (optional)</label>
            <textarea value={currentChallenges} onChange={e => setCurrentChallenges(e.target.value)} rows={2} placeholder="e.g. Seasonal dips, pricing pressure, hard to find staff" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted resize-none focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div className="flex items-center justify-between">
            <AgentStatusIndicator status={status} />
            <button onClick={handleGenerate} disabled={!strategicGoal.trim() || status === 'thinking' || status === 'generating'} className="px-4 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {(status === 'thinking' || status === 'generating') && <Loader2 size={15} className="animate-spin" />}
              Generate Strategy
            </button>
          </div>
        </div>

        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
          {!output ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-dashMuted text-sm text-center">Your SWOT analysis and strategic plan will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-dashText">SWOT Analysis</h3>
                <CopyButton text={output.fullDocument} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(['strengths', 'weaknesses', 'opportunities', 'threats'] as const).map(key => (
                  <div key={key} className="bg-dashSurface rounded-lg p-3">
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${SWOTColors[key]}`}>{key}</p>
                    <ul className="space-y-1">
                      {output[key].slice(0, 3).map((item, i) => <li key={i} className="text-xs text-dashMuted">• {item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
              {output.priorityActions && (
                <div className="bg-accentDim rounded-lg border border-accent/20 p-3">
                  <p className="text-xs font-semibold text-accent mb-1">Priority actions (next 30 days)</p>
                  <p className="text-xs text-dashText">{output.priorityActions}</p>
                </div>
              )}
              <div className="pt-3 border-t border-dashSurface2">
                <textarea readOnly value={output.fullDocument} rows={6} className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-xs text-dashText resize-none focus:outline-none" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
