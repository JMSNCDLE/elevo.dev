'use client'

import { useLocale } from 'next-intl'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import GeneratorShell from '@/components/generators/GeneratorShell'
import type { GenerationOutput, BusinessProfile } from '@/lib/agents/types'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'

const platforms = ['Instagram', 'Facebook', 'LinkedIn', 'X (Twitter)', 'TikTok']
const angles = ['Behind the scenes', 'Customer result', 'Tips & advice', 'Promotion / offer', 'Brand story', 'Before & after']

export default function SocialPage({}: {  }) {
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [platform, setPlatform] = useState('Instagram')
  const [topic, setTopic] = useState('')
  const [angle, setAngle] = useState('Behind the scenes')
  const [service, setService] = useState('')
  const [includeHashtags, setIncludeHashtags] = useState(true)
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
        body: JSON.stringify({ type: 'social_caption', businessProfileId: bp.id, topic, platform, angle, service, includeHashtags }),
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
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Platform</label>
        <div className="flex flex-wrap gap-2">
          {platforms.map(p => (
            <button key={p} onClick={() => setPlatform(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${platform === p ? 'bg-accent text-white' : 'bg-dashSurface text-dashMuted hover:text-dashText border border-dashSurface2'}`}>{p}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Topic <span className="text-red-400">*</span></label>
        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Just finished a kitchen renovation" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Content angle</label>
        <select value={angle} onChange={e => setAngle(e.target.value)} className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText focus:outline-none focus:ring-2 focus:ring-accent">
          {angles.map(a => <option key={a}>{a}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-dashMuted mb-1.5">Featured service</label>
        <select value={service} onChange={e => setService(e.target.value)} className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText focus:outline-none focus:ring-2 focus:ring-accent">
          <option value="">Select a service...</option>
          {bp?.services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={includeHashtags} onChange={e => setIncludeHashtags(e.target.checked)} className="w-4 h-4 rounded border-dashSurface2 text-accent focus:ring-accent" />
        <span className="text-sm text-dashMuted">Include hashtags</span>
      </label>
      <button onClick={handleGenerate} disabled={!topic.trim() || status === 'thinking' || status === 'generating'} className="w-full py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {status === 'thinking' || status === 'generating' ? 'Generating...' : 'Generate Caption'}
      </button>
    </div>
  )

  return <GeneratorShell title="Social Captions" description="Platform-native captions that drive engagement" formContent={formContent} output={output} status={status} onRegenerate={handleGenerate} />
}
