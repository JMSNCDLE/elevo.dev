'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import GeneratorShell from '@/components/generators/GeneratorShell'
import type { GenerationOutput, BusinessProfile } from '@/lib/agents/types'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'

export default function ReviewsPage({ params }: { params: { locale: string } }) {
  const supabase = createBrowserClient()
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [starRating, setStarRating] = useState(5)
  const [reviewerName, setReviewerName] = useState('')
  const [service, setService] = useState('')
  const [reviewText, setReviewText] = useState('')
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
    if (!bp) return
    setStatus('thinking')
    setOutput(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'review_response', businessProfileId: bp.id, starRating, reviewerName, service, reviewText }),
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
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Star rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setStarRating(n)} className="p-1">
              <Star size={24} className={n <= starRating ? 'text-amber-400 fill-amber-400' : 'text-dashMuted'} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Reviewer name</label>
        <input type="text" value={reviewerName} onChange={e => setReviewerName(e.target.value)} placeholder="e.g. Sarah J." className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Service mentioned</label>
        <select value={service} onChange={e => setService(e.target.value)} className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText focus:outline-none focus:ring-2 focus:ring-accent">
          <option value="">Select a service...</option>
          {bp?.services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Review text (paste it here)</label>
        <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Paste the customer's review..." rows={4} className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted resize-none focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <button onClick={handleGenerate} disabled={status === 'thinking' || status === 'generating'} className="w-full py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {status === 'thinking' || status === 'generating' ? 'Generating...' : 'Generate Response'}
      </button>
    </div>
  )

  return <GeneratorShell title="Review Responses" description="Professional responses that turn reviews into marketing" formContent={formContent} output={output} status={status} onRegenerate={handleGenerate} />
}
