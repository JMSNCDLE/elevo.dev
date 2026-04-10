'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowRight, Loader2, Target, FileText, DollarSign, BarChart3, Check,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

const INDUSTRIES = [
  'Restaurant / Café',
  'Retail / E-commerce',
  'Services (Hair, Beauty, Fitness)',
  'Professional Services (Law, Accounting)',
  'Real Estate',
  'Health & Wellness',
  'Marketing Agency',
  'Other',
]

const SIZES = ['Just me', '2–5 people', '6–20', '20+']

interface Goal {
  id: 'get_customers' | 'create_content' | 'manage_finances' | 'understand_business'
  icon: typeof Target
  emoji: string
  title: string
  description: string
  agents: string
  ctaTitle: string
  ctaSubtitle: string
  redirectPath: string
}

const GOALS: Goal[] = [
  {
    id: 'get_customers',
    icon: Target,
    emoji: '🎯',
    title: 'Get more customers',
    description: 'Ads, SEO, social, marketing campaigns',
    agents: 'ELEVO Market™, Rank™, SMM™, Ads Pro™',
    ctaTitle: "Let's optimise your Google Business Profile",
    ctaSubtitle: 'ELEVO Market™ will build your 30-day marketing mission and start bringing in leads.',
    redirectPath: 'market',
  },
  {
    id: 'create_content',
    icon: FileText,
    emoji: '📝',
    title: 'Create content faster',
    description: 'Posts, videos, captions, blogs',
    agents: 'ELEVO Creator™, SMM™, Viral™, Studio™',
    ctaTitle: "Let's create your first social media post",
    ctaSubtitle: 'ELEVO Creator™ will write platform-ready content in 30 seconds.',
    redirectPath: 'creator',
  },
  {
    id: 'manage_finances',
    icon: DollarSign,
    emoji: '💰',
    title: 'Manage my finances',
    description: 'Bookkeeping, invoices, tax, ROAS',
    agents: 'ELEVO Accountant™, ROAS™, Money™',
    ctaTitle: "Let's scan your first invoice",
    ctaSubtitle: 'ELEVO Accountant™ will categorise it and update your books automatically.',
    redirectPath: 'accountant',
  },
  {
    id: 'understand_business',
    icon: BarChart3,
    emoji: '📊',
    title: 'Understand my business',
    description: 'Strategy, analytics, competitor intel',
    agents: 'ELEVO CEO™, Spy™, Insight™',
    ctaTitle: "Let's run your first CEO briefing",
    ctaSubtitle: 'ELEVO CEO™ will analyse your business and surface the highest-leverage moves.',
    redirectPath: 'ceo',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'
  const supabase = createBrowserClient()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [businessName, setBusinessName] = useState('')
  const [industry, setIndustry] = useState('')
  const [businessSize, setBusinessSize] = useState('')
  const [description, setDescription] = useState('')
  const [primaryGoal, setPrimaryGoal] = useState<Goal['id'] | ''>('')
  const [saving, setSaving] = useState(false)

  const selectedGoal = GOALS.find(g => g.id === primaryGoal)

  async function saveStep1() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({
      business_name: businessName.trim(),
      industry,
      business_size: businessSize,
    }).eq('id', user.id)

    // Upsert business profile so legacy code keeps working
    const { data: existingBp } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()

    const bpData = {
      business_name: businessName.trim(),
      category: industry,
      city: 'Not specified',
    }

    if (existingBp) {
      await supabase.from('business_profiles').update(bpData).eq('id', existingBp.id)
    } else {
      await supabase.from('business_profiles').insert({
        user_id: user.id,
        ...bpData,
        services: description ? [description.trim()] : [],
        unique_selling_points: [],
        is_primary: true,
        onboarding_complete: false,
      })
    }
  }

  async function saveStep2(goalId: Goal['id']) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({
      primary_goal: goalId,
      onboarding_goals: [goalId],
    }).eq('id', user.id)
  }

  async function completeOnboarding(redirectTo: string) {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({
      onboarding_completed: true,
    }).eq('id', user.id)

    await supabase
      .from('business_profiles')
      .update({ onboarding_complete: true })
      .eq('user_id', user.id)
      .eq('is_primary', true)

    router.push(redirectTo)
  }

  async function handleSkip() {
    await completeOnboarding(`/${locale}/dashboard`)
  }

  async function handleStep1Next() {
    await saveStep1()
    setStep(2)
  }

  async function handleStep2Next(goalId: Goal['id']) {
    setPrimaryGoal(goalId)
    await saveStep2(goalId)
    setStep(3)
  }

  async function handleLaunch() {
    if (!selectedGoal) return
    await completeOnboarding(`/${locale}/${selectedGoal.redirectPath}`)
  }

  const step1Valid = businessName.trim().length > 0 && industry && businessSize

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo + progress */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Image src="/logo.svg" alt="ELEVO AI™" width={40} height={40} className="rounded-lg" priority />
            <span className="text-xl font-black text-white">ELEVO AI™</span>
          </div>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`w-12 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-indigo-500' : 'bg-white/10'}`} />
            ))}
          </div>
          <p className="text-xs text-white/40 mt-3">Step {step} of 3</p>
        </div>

        {/* Step 1: Business Profile */}
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold text-white text-center mb-2">What&apos;s your business?</h1>
            <p className="text-white/50 text-center mb-8">Takes 30 seconds. We&apos;ll personalise everything.</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Business name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Mario's Pizza"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Industry</label>
                <div className="grid grid-cols-2 gap-2">
                  {INDUSTRIES.map(i => (
                    <button
                      key={i}
                      onClick={() => setIndustry(i)}
                      className={`px-3 py-2.5 text-sm font-medium rounded-xl border text-left transition-colors ${
                        industry === i
                          ? 'border-indigo-500 bg-indigo-500/15 text-white'
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Team size</label>
                <div className="grid grid-cols-4 gap-2">
                  {SIZES.map(s => (
                    <button
                      key={s}
                      onClick={() => setBusinessSize(s)}
                      className={`px-3 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
                        businessSize === s
                          ? 'border-indigo-500 bg-indigo-500/15 text-white'
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  What does your business do? <span className="text-white/30">(optional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Wood-fired pizzas and Italian classics"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button onClick={handleSkip} className="text-sm text-white/40 hover:text-white/70 transition-colors">
                Skip for now
              </button>
              <button
                onClick={handleStep1Next}
                disabled={!step1Valid}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Goal Selection */}
        {step === 2 && (
          <div>
            <h1 className="text-3xl font-bold text-white text-center mb-2">What do you need most?</h1>
            <p className="text-white/50 text-center mb-8">Pick one — we&apos;ll start there. You can use everything else later.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {GOALS.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => handleStep2Next(goal.id)}
                  className="text-left p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all group"
                >
                  <div className="text-3xl mb-3">{goal.emoji}</div>
                  <h3 className="text-lg font-bold text-white mb-1">{goal.title}</h3>
                  <p className="text-sm text-white/50 mb-3">{goal.description}</p>
                  <p className="text-xs text-indigo-400/80 group-hover:text-indigo-300 transition-colors">
                    {goal.agents}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button onClick={() => setStep(1)} className="text-sm text-white/40 hover:text-white/70 transition-colors">
                ← Back
              </button>
              <button onClick={handleSkip} className="text-sm text-white/40 hover:text-white/70 transition-colors">
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Step 3: First Action */}
        {step === 3 && selectedGoal && (
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-500/15 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">You&apos;re all set, {businessName}!</h1>
            <p className="text-white/50 mb-8">Here&apos;s the fastest way to get your first win.</p>

            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6 mb-8 text-left">
              <div className="text-3xl mb-3">{selectedGoal.emoji}</div>
              <h2 className="text-xl font-bold text-white mb-2">{selectedGoal.ctaTitle}</h2>
              <p className="text-sm text-white/60 mb-4">{selectedGoal.ctaSubtitle}</p>
              <p className="text-xs text-indigo-300">Powered by {selectedGoal.agents}</p>
            </div>

            <button
              onClick={handleLaunch}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              {saving ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Setting up...</>
              ) : (
                <>Let&apos;s go <ArrowRight className="w-5 h-5" /></>
              )}
            </button>

            <div className="mt-6 flex items-center justify-between">
              <button onClick={() => setStep(2)} className="text-sm text-white/40 hover:text-white/70 transition-colors">
                ← Back
              </button>
              <button onClick={handleSkip} className="text-sm text-white/40 hover:text-white/70 transition-colors">
                Skip — go to dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
