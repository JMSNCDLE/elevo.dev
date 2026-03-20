'use client'

import { useLocale } from 'next-intl'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import GeneratorShell from '@/components/generators/GeneratorShell'
import type { GenerationOutput, BusinessProfile } from '@/lib/agents/types'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'

const schemaTypes = ['Service page', 'Homepage', 'Location page', 'Blog post', 'FAQ page', 'About page']

export default function SEOPage({}: {  }) {
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [schemaType, setSchemaType] = useState('Service page')
  const [keyword, setKeyword] = useState('')
  const [service, setService] = useState('')
  const [pageUrl, setPageUrl] = useState('')
  const [pageTitle, setPageTitle] = useState('')
  const [output, setOutput] = useState<GenerationOutput | null>(null)
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('business_profiles').select('*').eq('user_id', user.id).eq('is_primary', true).single()
      if (data) {
        setBp(data as BusinessProfile)
        setPageUrl(data.website_url || '')
      }
    }
    load()
  }, [])

  const handleGenerate = async () => {
    if (!bp || !keyword.trim()) return
    setStatus('thinking')
    setOutput(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'seo', businessProfileId: bp.id, schemaType, keyword, service, pageUrl, pageTitle }),
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
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Page type</label>
        <div className="grid grid-cols-2 gap-2">
          {schemaTypes.map(t => (
            <button key={t} onClick={() => setSchemaType(t)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${schemaType === t ? 'bg-accent text-white' : 'bg-dashSurface text-dashMuted hover:text-dashText border border-dashSurface2'}`}>{t}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Target keyword <span className="text-red-400">*</span></label>
        <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. plumber in Manchester" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Service (optional)</label>
        <select value={service} onChange={e => setService(e.target.value)} className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText focus:outline-none focus:ring-2 focus:ring-accent">
          <option value="">Select a service...</option>
          {bp?.services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Page URL (optional)</label>
        <input type="url" value={pageUrl} onChange={e => setPageUrl(e.target.value)} placeholder="https://yoursite.com/services/plumbing" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Current page title (optional)</label>
        <input type="text" value={pageTitle} onChange={e => setPageTitle(e.target.value)} placeholder="e.g. Plumbing Services" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <button onClick={handleGenerate} disabled={!keyword.trim() || status === 'thinking' || status === 'generating'} className="w-full py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {status === 'thinking' || status === 'generating' ? 'Generating...' : 'Generate SEO Copy'}
      </button>
    </div>
  )

  return <GeneratorShell title="SEO Copy" description="Keyword-optimised copy for better organic rankings" formContent={formContent} output={output} status={status} onRegenerate={handleGenerate} />
}
