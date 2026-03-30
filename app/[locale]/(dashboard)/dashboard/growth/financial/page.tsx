'use client'

import { useLocale } from 'next-intl'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { ADMIN_IDS } from '@/lib/admin'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import CopyButton from '@/components/shared/CopyButton'
import type { BusinessProfile, FinancialHealthReport } from '@/lib/agents/types'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'

export default function FinancialPage({}: {  }) {
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [plan, setPlan] = useState('trial')
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [monthlyRevenue, setMonthlyRevenue] = useState('')
  const [monthlyExpenses, setMonthlyExpenses] = useState('')
  const [topExpenses, setTopExpenses] = useState('')
  const [financialConcern, setFinancialConcern] = useState('')
  const [output, setOutput] = useState<FinancialHealthReport | null>(null)
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

  if (plan === 'trial' || plan === 'launch') return <UpgradePrompt locale={locale} feature="Financial Health" />

  const handleGenerate = async () => {
    if (!bp || !financialConcern.trim()) return
    setStatus('thinking')
    setOutput(null)
    try {
      const res = await fetch('/api/growth/financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfileId: bp.id,
          monthlyRevenue: monthlyRevenue ? Number(monthlyRevenue) : undefined,
          monthlyExpenses: monthlyExpenses ? Number(monthlyExpenses) : undefined,
          topExpenses, financialConcern,
        }),
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
        <h1 className="text-2xl font-bold text-dashText">Financial Health</h1>
        <p className="text-dashMuted text-sm mt-1">AI-powered financial analysis and recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-dashMuted mb-1.5">Monthly revenue (£)</label>
              <input type="number" value={monthlyRevenue} onChange={e => setMonthlyRevenue(e.target.value)} placeholder="e.g. 8500" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dashMuted mb-1.5">Monthly expenses (£)</label>
              <input type="number" value={monthlyExpenses} onChange={e => setMonthlyExpenses(e.target.value)} placeholder="e.g. 4200" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Top expense categories</label>
            <input type="text" value={topExpenses} onChange={e => setTopExpenses(e.target.value)} placeholder="e.g. Materials, insurance, fuel, subscriptions" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Financial concern <span className="text-red-400">*</span></label>
            <textarea value={financialConcern} onChange={e => setFinancialConcern(e.target.value)} rows={3} placeholder="e.g. I'm struggling with cash flow gaps between projects, and I'm not sure if my pricing is right" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted resize-none focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div className="flex items-center justify-between">
            <AgentStatusIndicator status={status} />
            <button onClick={handleGenerate} disabled={!financialConcern.trim() || status === 'thinking' || status === 'generating'} className="px-4 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {(status === 'thinking' || status === 'generating') && <Loader2 size={15} className="animate-spin" />}
              Analyse Finances
            </button>
          </div>
        </div>

        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
          {!output ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-dashMuted text-sm text-center">Your financial health report will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-dashText">Financial Report</h3>
                <CopyButton text={output.fullReport} />
              </div>
              <p className="text-sm text-dashText">{output.executiveSummary}</p>
              {output.growthLevers.length > 0 && (
                <div>
                  <p className="text-xs text-dashMuted uppercase tracking-wide mb-2">Growth levers</p>
                  <ul className="space-y-1.5">
                    {output.growthLevers.map((l, i) => <li key={i} className="flex items-start gap-2 text-sm text-green-400"><span>↑</span><span className="text-dashText">{l}</span></li>)}
                  </ul>
                </div>
              )}
              {output.actionPlan.length > 0 && (
                <div>
                  <p className="text-xs text-dashMuted uppercase tracking-wide mb-2">Action plan</p>
                  <ul className="space-y-1.5">
                    {output.actionPlan.map((a, i) => <li key={i} className="flex items-start gap-2 text-sm"><span className="text-accent font-bold">{i + 1}.</span><span className="text-dashText">{a}</span></li>)}
                  </ul>
                </div>
              )}
              <div className="pt-3 border-t border-dashSurface2">
                <textarea readOnly value={output.fullReport} rows={6} className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-xs text-dashText resize-none focus:outline-none" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
