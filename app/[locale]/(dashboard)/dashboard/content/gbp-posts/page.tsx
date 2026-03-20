'use client'

import { useLocale } from 'next-intl'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import GeneratorShell from '@/components/generators/GeneratorShell'
import type { GenerationOutput, BusinessProfile } from '@/lib/agents/types'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'

export default function GBPPostsPage({}: {  }) {
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [topic, setTopic] = useState('')
  const [service, setService] = useState('')
  const [keyword, setKeyword] = useState('')
  const [season, setSeason] = useState('')
  const [output, setOutput] = useState<GenerationOutput | null>(null)
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single()
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
        body: JSON.stringify({ type: 'gbp_post', businessProfileId: bp.id, topic, service, keyword, season }),
      })

      setStatus('generating')

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Generation failed')
      }

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
        <label className="block text-sm font-medium text-dashMuted mb-1.5">
          Topic or brief <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="e.g. Spring boiler service offer"
          className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Featured service</label>
        <select
          value={service}
          onChange={e => setService(e.target.value)}
          className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">Select a service...</option>
          {bp?.services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Target keyword (optional)</label>
        <input
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="e.g. emergency plumber Manchester"
          className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Season / occasion (optional)</label>
        <input
          type="text"
          value={season}
          onChange={e => setSeason(e.target.value)}
          placeholder="e.g. Christmas, Spring, School holidays"
          className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={!topic.trim() || status === 'thinking' || status === 'generating'}
        className="w-full py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'thinking' || status === 'generating' ? 'Generating...' : 'Generate GBP Post'}
      </button>
    </div>
  )

  return (
    <GeneratorShell
      title="GBP Posts"
      description="Create Google Business Profile posts that improve local visibility"
      formContent={formContent}
      output={output}
      status={status}
      onRegenerate={handleGenerate}
    />
  )
}
