'use client'

import { useState } from 'react'
import { useUserContext } from '@/lib/hooks/useUserContext'
import { Palette, Image, Film, FileText, Layout, CreditCard, Mail, Youtube, Sparkles, Loader2 } from 'lucide-react'

const TEMPLATES = [
  { id: 'logo', label: 'Logo Design', icon: Palette, color: 'text-indigo-400', desc: 'Create a professional logo for your brand' },
  { id: 'social', label: 'Social Media Post', icon: Image, color: 'text-pink-400', desc: 'Instagram, Facebook, LinkedIn, Twitter' },
  { id: 'story', label: 'Story / Reel Cover', icon: Film, color: 'text-purple-400', desc: 'Vertical format for Stories and Reels' },
  { id: 'ad', label: 'Ad Creative', icon: Layout, color: 'text-blue-400', desc: 'Facebook Ad, Google Ad, banner' },
  { id: 'presentation', label: 'Presentation Slide', icon: FileText, color: 'text-green-400', desc: 'Professional slide designs' },
  { id: 'card', label: 'Business Card', icon: CreditCard, color: 'text-amber-400', desc: 'Print-ready business card design' },
  { id: 'email', label: 'Email Header', icon: Mail, color: 'text-teal-400', desc: 'Eye-catching email banner' },
  { id: 'youtube', label: 'YouTube Thumbnail', icon: Youtube, color: 'text-red-400', desc: 'Click-worthy video thumbnails' },
]

const STYLES = ['Minimal', 'Bold', 'Professional', 'Playful', 'Elegant']

export default function CreatePage() {
  const { plan, isAdmin, loading: contextLoading } = useUserContext()
  const [selected, setSelected] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('Professional')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  if (contextLoading) {
    return <div className="min-h-screen bg-dashBg flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
  }

  const isOrbit = plan === 'orbit' || plan === 'galaxy' || isAdmin
  if (!isOrbit) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <Palette size={48} className="text-accent mx-auto mb-4 opacity-50" />
        <h1 className="text-2xl font-bold text-dashText mb-2">ELEVO Create™</h1>
        <p className="text-dashMuted mb-6">Design anything — logos, social posts, ads, presentations. Available on Orbit plan and above.</p>
        <a href="/en/pricing" className="inline-block px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">Upgrade to Orbit →</a>
      </div>
    )
  }

  async function handleGenerate() {
    if (!prompt.trim() || !selected) return
    setGenerating(true)
    setResult(null)
    try {
      const res = await fetch('/api/create/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outputType: selected, description: prompt, style }),
      })
      if (res.ok) {
        const data = await res.json()
        setResult(data.result ? JSON.stringify(data.result, null, 2) : 'Generation complete! Check your library.')
      } else {
        setResult('Generation coming soon — this feature is being activated.')
      }
    } catch {
      setResult('Generation coming soon — this feature is being activated.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dashText flex items-center gap-2">
          <Sparkles size={24} className="text-accent" /> ELEVO Create™
        </h1>
        <p className="text-dashMuted mt-1">Design anything — logos, social posts, ads, presentations</p>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id)}
            className={`bg-dashCard border rounded-xl p-4 text-left transition-all ${
              selected === t.id ? 'border-accent bg-accent/5' : 'border-dashSurface2 hover:border-dashMuted'
            }`}
          >
            <t.icon size={20} className={`${t.color} mb-2`} />
            <p className="text-sm font-medium text-dashText">{t.label}</p>
            <p className="text-xs text-dashMuted mt-0.5 line-clamp-1">{t.desc}</p>
          </button>
        ))}
      </div>

      {/* Generation form */}
      {selected && (
        <div className="bg-dashCard border border-dashSurface2 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-dashText mb-4">
            Create: {TEMPLATES.find(t => t.id === selected)?.label}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-dashMuted mb-1">Describe what you want to create</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={3}
                className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                placeholder="e.g. A modern minimalist logo for a coffee shop called 'Brew & Co' with earth tones..."
              />
            </div>

            <div>
              <label className="block text-xs text-dashMuted mb-1">Style</label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map(s => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      style === s ? 'bg-accent text-white' : 'bg-dashSurface2 text-dashMuted hover:text-dashText'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {generating ? 'Generating...' : 'Generate'}
            </button>

            {result && (
              <div className="mt-4 bg-dashBg border border-dashSurface2 rounded-lg p-4">
                <pre className="text-sm text-dashText whitespace-pre-wrap">{result}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
