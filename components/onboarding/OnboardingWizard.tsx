'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Rocket, CheckCircle2, Loader2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

const INDUSTRIES = [
  'Restaurant', 'Retail', 'Fitness', 'Real Estate', 'Consulting',
  'E-commerce', 'Agency', 'Trades', 'Beauty & Salon', 'Healthcare', 'Other',
]

const NEEDS = [
  { id: 'marketing', label: 'Marketing & Social Media' },
  { id: 'sales', label: 'Sales & Lead Generation' },
  { id: 'content', label: 'Content Creation' },
  { id: 'crm', label: 'Customer Management (CRM)' },
  { id: 'finance', label: 'Finance & Accounting' },
  { id: 'legal', label: 'Legal & Contracts' },
  { id: 'all', label: 'All of the above' },
]

const SIZES = ['Just me', '2-10', '11-50', '50+']

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as string) ?? 'en'
  const supabase = createBrowserClient()

  const [step, setStep] = useState(1)
  const [businessName, setBusinessName] = useState('')
  const [industry, setIndustry] = useState('')
  const [size, setSize] = useState('')
  const [needs, setNeeds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  async function finish() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({
        full_name: businessName || undefined,
        onboarding_completed: true,
      }).eq('id', user.id)

      // Create/update business profile
      const { data: existing } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single()

      if (existing) {
        await supabase.from('business_profiles').update({
          business_name: businessName,
          category: industry,
        }).eq('id', existing.id)
      } else {
        await supabase.from('business_profiles').insert({
          user_id: user.id,
          business_name: businessName,
          category: industry,
          city: '',
          is_primary: true,
          onboarding_complete: true,
        })
      }
    }
    setSaving(false)
    onComplete()
  }

  const toggleNeed = (id: string) => {
    if (id === 'all') { setNeeds(['all']); return }
    setNeeds(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev.filter(n => n !== 'all'), id])
  }

  return (
    <div className="min-h-screen bg-dashBg flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-accent' : 'bg-dashSurface2'}`} />
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-dashText mb-2">Tell us about your business</h1>
            <p className="text-dashMuted mb-6">We&apos;ll personalise your AI team based on your answers.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-dashMuted mb-1">Business name</label>
                <input value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full bg-dashCard border border-dashSurface2 rounded-lg px-4 py-3 text-dashText focus:outline-none focus:ring-2 focus:ring-accent" placeholder="e.g. Mario's Plumbing" />
              </div>
              <div>
                <label className="block text-sm text-dashMuted mb-1">Industry</label>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map(i => (
                    <button key={i} onClick={() => setIndustry(i)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${industry === i ? 'bg-accent text-white' : 'bg-dashCard text-dashMuted border border-dashSurface2'}`}>{i}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-dashMuted mb-1">Team size</label>
                <div className="flex gap-2">
                  {SIZES.map(s => (
                    <button key={s} onClick={() => setSize(s)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex-1 ${size === s ? 'bg-accent text-white' : 'bg-dashCard text-dashMuted border border-dashSurface2'}`}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setStep(2)} disabled={!businessName || !industry} className="w-full mt-6 py-3 bg-accent text-white font-semibold rounded-xl disabled:opacity-50">Continue →</button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-dashText mb-2">What do you need help with?</h1>
            <p className="text-dashMuted mb-6">Select all that apply — we&apos;ll recommend the right agents.</p>
            <div className="space-y-2">
              {NEEDS.map(n => (
                <button key={n.id} onClick={() => toggleNeed(n.id)} className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors flex items-center gap-3 ${needs.includes(n.id) ? 'bg-accent/10 border-accent text-accent border' : 'bg-dashCard text-dashMuted border border-dashSurface2'}`}>
                  {needs.includes(n.id) ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border border-dashSurface2" />}
                  {n.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 py-3 bg-dashCard text-dashMuted font-medium rounded-xl border border-dashSurface2">← Back</button>
              <button onClick={() => setStep(3)} disabled={needs.length === 0} className="flex-1 py-3 bg-accent text-white font-semibold rounded-xl disabled:opacity-50">Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="text-center">
            <Rocket size={48} className="text-accent mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-dashText mb-2">Your AI team is ready!</h1>
            <p className="text-dashMuted mb-6">{businessName}, your personalised AI team of 60+ agents is set up. Let&apos;s get your first win.</p>
            <button onClick={finish} disabled={saving} className="w-full py-3 bg-accent text-white font-semibold rounded-xl disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Launch my dashboard →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
