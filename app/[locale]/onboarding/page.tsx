'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Store, ShoppingCart, Shirt, Palette, Camera, Briefcase, Users2,
  MoreHorizontal, ArrowRight, Loader2, Rocket,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

const BUSINESS_TYPES = [
  { id: 'local_business', label: 'Local Business', desc: 'Restaurant, salon, gym, clinic, trades', icon: Store, color: 'bg-blue-500' },
  { id: 'ecommerce', label: 'Ecommerce / Online Store', desc: 'Shopify, WooCommerce, online retail', icon: ShoppingCart, color: 'bg-green-500' },
  { id: 'pod', label: 'Print on Demand', desc: 'Custom merch, t-shirts, mugs, posters', icon: Palette, color: 'bg-purple-500' },
  { id: 'fashion', label: 'Fashion Brand', desc: 'Clothing, accessories, streetwear', icon: Shirt, color: 'bg-pink-500' },
  { id: 'influencer', label: 'Influencer / Creator', desc: 'YouTube, TikTok, Instagram, podcasts', icon: Camera, color: 'bg-orange-500' },
  { id: 'freelancer', label: 'Freelancer / Consultant', desc: 'Design, dev, coaching, writing', icon: Briefcase, color: 'bg-indigo-500' },
  { id: 'agency', label: 'Agency', desc: 'Marketing, design, dev, PR agency', icon: Users2, color: 'bg-cyan-500' },
  { id: 'other', label: 'Other', desc: "I'll describe it myself", icon: MoreHorizontal, color: 'bg-gray-500' },
]

const GOALS = [
  'Grow sales and revenue',
  'Get more clients or customers',
  'Build my brand online',
  'Save time on marketing',
  'Automate repetitive tasks',
  'Improve my social media presence',
  'Launch a new product or service',
]

export default function OnboardingPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'
  const supabase = createBrowserClient()

  const [step, setStep] = useState(1)
  const [businessType, setBusinessType] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessGoal, setBusinessGoal] = useState('')
  const [city, setCity] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleComplete() {
    if (!businessType || !businessName.trim()) return
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('profiles').update({
        business_type: businessType,
        business_goal: businessGoal || null,
      }).eq('id', user.id)

      const { data: existingBp } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single()

      if (existingBp) {
        await supabase.from('business_profiles').update({
          business_name: businessName.trim(),
          category: businessType,
          city: city.trim() || 'Not specified',
          onboarding_complete: true,
        }).eq('id', existingBp.id)
      } else {
        await supabase.from('business_profiles').insert({
          user_id: user.id,
          business_name: businessName.trim(),
          category: businessType,
          city: city.trim() || 'Not specified',
          services: [],
          unique_selling_points: [],
          is_primary: true,
          onboarding_complete: true,
        })
      }

      router.push(`/${locale}/dashboard`)
    } catch (err) {
      console.error('Onboarding error:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080C14] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo + progress */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">E</span>
            </div>
            <span className="text-xl font-black text-white">ELEVO AI</span>
          </div>
          <div className="flex justify-center gap-2">
            <div className={`w-8 h-1.5 rounded-full ${step >= 1 ? 'bg-indigo-500' : 'bg-white/10'}`} />
            <div className={`w-8 h-1.5 rounded-full ${step >= 2 ? 'bg-indigo-500' : 'bg-white/10'}`} />
          </div>
        </div>

        {/* Step 1: Business type */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-white text-center mb-2">What type of business do you run?</h1>
            <p className="text-white/50 text-center text-sm mb-8">
              We&apos;ll customise your dashboard and recommend the best AI agents for you.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {BUSINESS_TYPES.map(bt => (
                <button
                  key={bt.id}
                  onClick={() => setBusinessType(bt.id)}
                  className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                    businessType === bt.id
                      ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-9 h-9 ${bt.color} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
                    <bt.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{bt.label}</p>
                    <p className="text-xs text-white/40 mt-0.5">{bt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!businessType}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Name + Goal */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-white text-center mb-2">Tell us about your business</h1>
            <p className="text-white/50 text-center text-sm mb-8">
              This helps our AI agents create better content and strategies for you.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Business name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Mario's Pizza, Luxe Streetwear, Sarah Design Co."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">City / Location</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. London, Barcelona, New York"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Main goal</label>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map(goal => (
                    <button
                      key={goal}
                      onClick={() => setBusinessGoal(goal)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                        businessGoal === goal
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                          : 'border-white/10 text-white/50 hover:text-white/80 hover:border-white/20'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <button onClick={() => setStep(1)} className="text-sm text-white/40 hover:text-white transition-colors">
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={!businessName.trim() || saving}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Setting up...</>
                ) : (
                  <><Rocket className="w-4 h-4" /> Launch my dashboard</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
