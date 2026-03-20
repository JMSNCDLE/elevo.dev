'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import GeneratorShell from '@/components/generators/GeneratorShell'
import type { GenerationOutput, BusinessProfile } from '@/lib/agents/types'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'

const goals = [
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'promotion', label: 'Promotion / offer' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'service_launch', label: 'New service launch' },
  { value: 'reactivation', label: 'Win-back / reactivation' },
  { value: 'review_request', label: 'Review request' },
]

export default function EmailPage({ params }: { params: { locale: string } }) {
  const supabase = createBrowserClient()
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [goal, setGoal] = useState('newsletter')
  const [topic, setTopic] = useState('')
  const [offer, setOffer] = useState('')
  const [service, setService] = useState('')
  const [output, setOutput] = useState<GenerationOutput | null>(null)
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('business_profiles').select('*').eq('user_id', user.id).eq('is_primary', true).single()
      if (data) setBp(data as BusinessProfile)
    }
    load()
  }, [])

  const handleGenerate = async () => {
    if (!bp || !topic.trim()) return
    setStatus('thinking')
    setOutput(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'email', businessProfileId: bp.id, goal, topic, offer, service }),
      })
      setStatus('generating')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setOutput(data.output)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const formContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Email goal</label>
        <div className="grid grid-cols-2 gap-2">
          {goals.map(g => (
            <button key={g.value} onClick={() => setGoal(g.value)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${goal === g.value ? 'bg-accent text-white' : 'bg-dashSurface text-dashMuted hover:text-dashText border border-dashSurface2'}`}>{g.label}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Subject / topic <span className="text-red-400">*</span></label>
        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Spring service reminder" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Special offer (optional)</label>
        <input type="text" value={offer} onChange={e => setOffer(e.target.value)} placeholder="e.g. 10% off, free inspection" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Featured service</label>
        <select value={service} onChange={e => setService(e.target.value)} className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText focus:outline-none focus:ring-2 focus:ring-accent">
          <option value="">Select a service...</option>
          {bp?.services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <button onClick={handleGenerate} disabled={!topic.trim() || status === 'thinking' || status === 'generating'} className="w-full py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {status === 'thinking' || status === 'generating' ? 'Generating...' : 'Generate Email'}
      </button>
    </div>
  )

  return <GeneratorShell title="Email" description="High-converting email copy for any campaign goal" formContent={formContent} output={output} status={status} onRegenerate={handleGenerate} />
}
