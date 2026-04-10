'use client'

import { useLocale } from 'next-intl'

import { useState, useEffect } from 'react'
import { Loader2, Save, Plus, X } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { BusinessProfile } from '@/lib/agents/types'
import EmailPreferences from '@/components/dashboard/EmailPreferences'

const toneOptions = ['Professional and friendly', 'Casual and approachable', 'Expert and authoritative', 'Warm and personal', 'Bold and energetic', 'Calm and reassuring']

export default function SettingsPage({}: {  }) {
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [form, setForm] = useState({
    business_name: '', category: '', city: '', country: '', tone_of_voice: 'Professional and friendly',
    website_url: '', phone: '', email: '', google_business_url: '', google_review_url: '',
    description: '', target_audience: '',
  })
  const [services, setServices] = useState<string[]>([])
  const [usps, setUsps] = useState<string[]>([])
  const [newService, setNewService] = useState('')
  const [newUsp, setNewUsp] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('business_profiles').select('*').eq('user_id', user.id).eq('is_primary', true).single()
      if (data) {
        setBp(data as BusinessProfile)
        setForm({
          business_name: data.business_name, category: data.category, city: data.city, country: data.country,
          tone_of_voice: data.tone_of_voice, website_url: data.website_url || '', phone: data.phone || '',
          email: data.email || '', google_business_url: data.google_business_url || '',
          google_review_url: data.google_review_url || '', description: data.description || '',
          target_audience: data.target_audience || '',
        })
        setServices(data.services || [])
        setUsps(data.unique_selling_points || [])
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!bp) return
    setSaving(true)
    const { error } = await supabase.from('business_profiles').update({
      ...form, services, unique_selling_points: usps, updated_at: new Date().toISOString(),
    }).eq('id', bp.id)

    if (error) toast.error('Failed to save')
    else toast.success('Profile updated')
    setSaving(false)
  }

  const addService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices(prev => [...prev, newService.trim()])
      setNewService('')
    }
  }

  const addUsp = () => {
    if (newUsp.trim() && !usps.includes(newUsp.trim())) {
      setUsps(prev => [...prev, newUsp.trim()])
      setNewUsp('')
    }
  }

  const f = (k: string) => form[k as keyof typeof form]
  const u = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dashText">Business Settings</h1>
        <p className="text-dashMuted text-sm mt-1">Your business profile powers every piece of content ELEVO creates</p>
      </div>

      <div className="space-y-6">
        {/* Core info */}
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-dashText uppercase tracking-wide">Business info</h2>
          <div className="grid grid-cols-2 gap-4">
            {[['business_name', 'Business name', 'Smith & Sons Plumbing'], ['category', 'Business type', 'Plumber'], ['city', 'City', 'Manchester'], ['country', 'Country', 'United Kingdom']].map(([key, label, ph]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-dashMuted mb-1.5">{label}</label>
                <input type="text" value={f(key)} onChange={e => u(key, e.target.value)} placeholder={ph} className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Description</label>
            <textarea value={f('description')} onChange={e => u('description', e.target.value)} rows={2} className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted resize-none focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Target audience</label>
            <input type="text" value={f('target_audience')} onChange={e => u('target_audience', e.target.value)} placeholder="e.g. Homeowners in Manchester aged 30-65" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
        </div>

        {/* Tone & voice */}
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-dashText uppercase tracking-wide">Tone of voice</h2>
          <div className="grid grid-cols-2 gap-2">
            {toneOptions.map(t => (
              <button key={t} onClick={() => u('tone_of_voice', t)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${form.tone_of_voice === t ? 'bg-accent text-white' : 'bg-dashSurface text-dashMuted border border-dashSurface2 hover:text-dashText'}`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-dashText uppercase tracking-wide">Services</h2>
          <div className="flex flex-wrap gap-2 mb-2">
            {services.map(s => (
              <span key={s} className="flex items-center gap-1.5 px-2.5 py-1 bg-dashSurface border border-dashSurface2 rounded-lg text-sm text-dashText">
                {s}
                <button onClick={() => setServices(prev => prev.filter(x => x !== s))} className="text-dashMuted hover:text-red-400"><X size={12} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newService} onChange={e => setNewService(e.target.value)} onKeyDown={e => e.key === 'Enter' && addService()} placeholder="Add service..." className="flex-1 bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
            <button onClick={addService} className="p-2 bg-accent text-white rounded-lg hover:bg-accentLight"><Plus size={16} /></button>
          </div>
        </div>

        {/* USPs */}
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-dashText uppercase tracking-wide">Unique selling points</h2>
          <div className="flex flex-wrap gap-2 mb-2">
            {usps.map(u_ => (
              <span key={u_} className="flex items-center gap-1.5 px-2.5 py-1 bg-dashSurface border border-dashSurface2 rounded-lg text-sm text-dashText">
                {u_}
                <button onClick={() => setUsps(prev => prev.filter(x => x !== u_))} className="text-dashMuted hover:text-red-400"><X size={12} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newUsp} onChange={e => setNewUsp(e.target.value)} onKeyDown={e => e.key === 'Enter' && addUsp()} placeholder="Add a USP..." className="flex-1 bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
            <button onClick={addUsp} className="p-2 bg-accent text-white rounded-lg hover:bg-accentLight"><Plus size={16} /></button>
          </div>
        </div>

        {/* Contact links */}
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-dashText uppercase tracking-wide">Links & contact</h2>
          <div className="space-y-3">
            {[['website_url', 'Website URL', 'https://yoursite.com'], ['google_business_url', 'Google Business URL', 'https://g.page/...'], ['google_review_url', 'Google Review URL', 'https://g.page/r/...'], ['phone', 'Phone', '01234 567890'], ['email', 'Email', 'hello@yoursite.com']].map(([key, label, ph]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-dashMuted mb-1.5">{label}</label>
                <input type="text" value={f(key)} onChange={e => u(key, e.target.value)} placeholder={ph} className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accentLight transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save settings'}
        </button>

        <EmailPreferences />
      </div>
    </div>
  )
}
