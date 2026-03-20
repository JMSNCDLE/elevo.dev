'use client'

import { useLocale } from 'next-intl'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import CopyButton from '@/components/shared/CopyButton'
import type { BusinessProfile, HRDocument } from '@/lib/agents/types'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'

const docTypes = [
  { value: 'job_description', label: 'Job Description' },
  { value: 'employment_contract_outline', label: 'Contract Outline' },
  { value: 'performance_review', label: 'Performance Review' },
  { value: 'disciplinary_letter', label: 'Disciplinary Letter' },
  { value: 'onboarding_checklist', label: 'Onboarding Checklist' },
  { value: 'staff_handbook_section', label: 'Handbook Section' },
  { value: 'team_meeting_agenda', label: 'Meeting Agenda' },
  { value: 'redundancy_letter_outline', label: 'Redundancy Outline' },
]

export default function ManagementPage({}: {  }) {
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [plan, setPlan] = useState('trial')
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [documentType, setDocumentType] = useState('job_description')
  const [roleName, setRoleName] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [specificContext, setSpecificContext] = useState('')
  const [output, setOutput] = useState<HRDocument | null>(null)
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

  if (plan === 'trial' || plan === 'launch') return <UpgradePrompt locale={locale} feature="Management & HR" />

  const handleGenerate = async () => {
    if (!bp || !specificContext.trim()) return
    setStatus('thinking')
    setOutput(null)
    try {
      const res = await fetch('/api/growth/management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessProfileId: bp.id, documentType, roleName, employeeName, specificContext }),
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
        <h1 className="text-2xl font-bold text-dashText">Management & HR</h1>
        <p className="text-dashMuted text-sm mt-1">Professional HR documents for your team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Document type</label>
            <div className="grid grid-cols-2 gap-2">
              {docTypes.map(d => (
                <button key={d.value} onClick={() => setDocumentType(d.value)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${documentType === d.value ? 'bg-accent text-white' : 'bg-dashSurface text-dashMuted border border-dashSurface2 hover:text-dashText'}`}>{d.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Role / job title</label>
            <input type="text" value={roleName} onChange={e => setRoleName(e.target.value)} placeholder="e.g. Apprentice Plumber" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Employee name (if applicable)</label>
            <input type="text" value={employeeName} onChange={e => setEmployeeName(e.target.value)} placeholder="e.g. Jamie Smith" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Context / requirements <span className="text-red-400">*</span></label>
            <textarea value={specificContext} onChange={e => setSpecificContext(e.target.value)} rows={3} placeholder="What do you need this document to cover?" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted resize-none focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div className="flex items-center justify-between">
            <AgentStatusIndicator status={status} />
            <button onClick={handleGenerate} disabled={!specificContext.trim() || status === 'thinking' || status === 'generating'} className="px-4 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {(status === 'thinking' || status === 'generating') && <Loader2 size={15} className="animate-spin" />}
              Generate Document
            </button>
          </div>
        </div>

        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
          {!output ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-dashMuted text-sm text-center">Your HR document will appear here. Always seek legal advice before using employment documents.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-dashText">{output.title}</h3>
                <CopyButton text={output.fullDocument} />
              </div>
              <textarea readOnly value={output.fullDocument} rows={14} className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-xs text-dashText resize-none focus:outline-none" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
