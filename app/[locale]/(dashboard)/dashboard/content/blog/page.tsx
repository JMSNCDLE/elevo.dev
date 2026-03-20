'use client'

import { useLocale } from 'next-intl'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import GeneratorShell from '@/components/generators/GeneratorShell'
import type { GenerationOutput, BusinessProfile } from '@/lib/agents/types'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'

const intentOptions = ['Informational', 'How-to guide', 'Local SEO', 'Lead generation', 'Seasonal']
const wordCountOptions = [400, 600, 800, 1000, 1500, 2000]

export default function BlogPage({}: {  }) {
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [topic, setTopic] = useState('')
  const [keyword, setKeyword] = useState('')
  const [service, setService] = useState('')
  const [intent, setIntent] = useState('Informational')
  const [wordCount, setWordCount] = useState(800)
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
        body: JSON.stringify({ type: 'blog', businessProfileId: bp.id, topic, keyword, service, intent, wordCount }),
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
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Topic <span className="text-red-400">*</span></label>
        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. How to know when to replace your boiler" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Target keyword</label>
        <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. boiler replacement Manchester" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Featured service</label>
        <select value={service} onChange={e => setService(e.target.value)} className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText focus:outline-none focus:ring-2 focus:ring-accent">
          <option value="">Select a service...</option>
          {bp?.services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-dashMuted mb-1.5">Intent</label>
          <select value={intent} onChange={e => setIntent(e.target.value)} className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText focus:outline-none focus:ring-2 focus:ring-accent">
            {intentOptions.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-dashMuted mb-1.5">Word count</label>
          <select value={wordCount} onChange={e => setWordCount(Number(e.target.value))} className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText focus:outline-none focus:ring-2 focus:ring-accent">
            {wordCountOptions.map(w => <option key={w} value={w}>{w} words</option>)}
          </select>
        </div>
      </div>
      <button onClick={handleGenerate} disabled={!topic.trim() || status === 'thinking' || status === 'generating'} className="w-full py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {status === 'thinking' || status === 'generating' ? 'Generating...' : 'Generate Blog Post'}
      </button>
    </div>
  )

  return <GeneratorShell title="Blog" description="SEO-optimised blog posts for your website" formContent={formContent} output={output} status={status} onRegenerate={handleGenerate} />
}
