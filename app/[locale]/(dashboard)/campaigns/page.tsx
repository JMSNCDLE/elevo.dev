'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Megaphone, Loader2, CheckCircle2, Calendar, Mail, Share2, FileText, TrendingUp } from 'lucide-react'
import { useUserContext } from '@/lib/hooks/useUserContext'

const CHANNELS = [
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'social', label: 'Social Media', icon: Share2 },
  { id: 'blog', label: 'Blog', icon: FileText },
  { id: 'ads', label: 'Ads', icon: TrendingUp },
]

const DURATIONS = ['7 days', '14 days', '30 days']

interface CampaignStep {
  day: number
  channel: string
  action: string
  description: string
  time?: string
}

export default function CampaignsPage() {
  const { plan, isAdmin, loading: ctxLoading } = useUserContext()
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const [goal, setGoal] = useState('')
  const [channels, setChannels] = useState<string[]>(['email', 'social'])
  const [duration, setDuration] = useState('7 days')
  const [generating, setGenerating] = useState(false)
  const [plan_, setPlan] = useState<CampaignStep[] | null>(null)
  const [error, setError] = useState('')

  const isOrbit = plan === 'orbit' || plan === 'galaxy' || isAdmin

  const toggleChannel = (id: string) => {
    setChannels(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  async function createCampaign() {
    if (!goal.trim()) return
    setGenerating(true)
    setError('')
    setPlan(null)
    try {
      const res = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, channels, duration }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPlan(Array.isArray(data.plan) ? data.plan : data.plan?.steps ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
    } finally {
      setGenerating(false)
    }
  }

  if (!mounted) return <div className="flex flex-col h-[calc(100vh-56px)] md:h-screen"><div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div></div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {ctxLoading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
      ) : !isOrbit ? (
        <div className="text-center py-20">
          <Megaphone size={48} className="text-accent mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-bold text-dashText mb-2">Campaign Automation</h1>
          <p className="text-dashMuted mb-6">AI-powered multi-step campaigns. Available on Orbit plan and above.</p>
          <a href={`/${locale}/pricing`} className="inline-block px-6 py-3 bg-accent text-white font-semibold rounded-xl">Upgrade to Orbit →</a>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-dashText flex items-center gap-2">
              <Megaphone size={24} className="text-accent" /> Campaign Automation
            </h1>
            <p className="text-dashMuted mt-1">Describe your goal — ELEVO plans and executes a multi-step campaign.</p>
          </div>

          {/* Campaign builder */}
          <div className="bg-dashCard border border-dashSurface2 rounded-xl p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-dashMuted mb-1">Campaign goal</label>
                <textarea value={goal} onChange={e => setGoal(e.target.value)} rows={3} className="w-full bg-dashBg border border-dashSurface2 rounded-lg px-4 py-3 text-sm text-dashText focus:outline-none focus:ring-2 focus:ring-accent resize-none" placeholder="e.g. Launch a new product line to existing customers and generate 50 leads in 2 weeks..." />
              </div>
              <div>
                <label className="block text-sm text-dashMuted mb-1">Channels</label>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map(c => (
                    <button key={c.id} onClick={() => toggleChannel(c.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${channels.includes(c.id) ? 'bg-accent text-white' : 'bg-dashSurface2 text-dashMuted'}`}>
                      <c.icon size={14} /> {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-dashMuted mb-1">Duration</label>
                <div className="flex gap-2">
                  {DURATIONS.map(d => (
                    <button key={d} onClick={() => setDuration(d)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${duration === d ? 'bg-accent text-white' : 'bg-dashSurface2 text-dashMuted'}`}>{d}</button>
                  ))}
                </div>
              </div>
              <button onClick={createCampaign} disabled={generating || !goal.trim()} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-semibold rounded-lg disabled:opacity-50">
                {generating ? <Loader2 size={16} className="animate-spin" /> : <Megaphone size={16} />}
                {generating ? 'Planning campaign...' : 'Create Campaign'}
              </button>
              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>
          </div>

          {/* Campaign plan */}
          {plan_ && plan_.length > 0 && (
            <div className="bg-dashCard border border-dashSurface2 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-dashText uppercase tracking-wide mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-accent" /> Campaign Plan ({plan_.length} steps)
              </h2>
              <div className="space-y-3">
                {plan_.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 bg-dashBg rounded-lg p-3 border border-dashSurface2">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-accent">{step.day ?? i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-dashSurface2 text-dashMuted px-2 py-0.5 rounded">{step.channel}</span>
                        {step.time && <span className="text-xs text-dashMuted">{step.time}</span>}
                      </div>
                      <p className="text-sm text-dashText">{step.description}</p>
                    </div>
                    <CheckCircle2 size={16} className="text-dashSurface2 shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
