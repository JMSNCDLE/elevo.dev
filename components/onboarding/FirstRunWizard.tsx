'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Rocket, Users, PenTool, BarChart3, Briefcase, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const GOALS = [
  { id: 'get_clients', label: 'Get more clients', desc: 'Find leads and create outreach campaigns', icon: Users, route: '/marketing-planner', prompt: 'Analyse my business and create a strategy to get 10 new clients this month. Include specific outreach templates, channels to use, and a week-by-week action plan.' },
  { id: 'create_content', label: 'Create content', desc: 'Social posts, blog articles, email campaigns', icon: PenTool, route: '/chat', prompt: 'Create a 7-day content calendar for my business. Include Instagram posts with captions and hashtags, one blog article outline, and one email newsletter draft.' },
  { id: 'understand_numbers', label: 'Understand my numbers', desc: 'Revenue analysis, expenses, cash flow', icon: BarChart3, route: '/accountant', prompt: 'Give me a financial health check for a small business. What are the key metrics I should track? Create a template for monthly financial review.' },
  { id: 'organise_business', label: 'Organise my business', desc: 'Strategy, planning, task management', icon: Briefcase, route: '/ceo', prompt: 'Create a 30-day business improvement plan. Prioritise the most impactful tasks, set weekly goals, and create a simple system for tracking progress.' },
]

export default function FirstRunWizard({ locale }: { locale: string }) {
  const [step, setStep] = useState<'ask' | 'business'>('ask')
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const router = useRouter()

  const handleStart = useCallback(async () => {
    if (!selectedGoal) return
    const goal = GOALS.find(g => g.id === selectedGoal)
    if (!goal) return

    try {
      await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_name: businessName, business_industry: businessType, onboarding_completed: true }),
      })
    } catch {}

    const prompt = encodeURIComponent(`My business is "${businessName || 'my business'}" (${businessType || 'general'}). ${goal.prompt}`)
    router.push(`/${locale}${goal.route}?autoPrompt=${prompt}`)
  }, [selectedGoal, businessName, businessType, locale, router])

  const handleSkip = useCallback(async () => {
    try {
      await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboarding_completed: true }),
      })
    } catch {}
    router.push(`/${locale}/dashboard`)
  }, [locale, router])

  return (
    <div className="fixed inset-0 z-50 bg-dashBg flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Rocket size={24} className="text-accent" />
            <span className="text-xl font-bold text-dashText">ELEVO AI</span>
          </div>
          <h1 className="text-2xl font-bold text-dashText mb-2">
            {step === 'ask' ? 'What do you want help with today?' : 'Tell us about your business'}
          </h1>
          <p className="text-dashMuted text-sm">
            {step === 'ask' ? "Pick one and I'll show you what ELEVO can do in 60 seconds." : "This helps our AI give you personalised results."}
          </p>
        </div>

        {step === 'ask' && (
          <div className="space-y-3">
            {GOALS.map(goal => {
              const Icon = goal.icon
              return (
                <button key={goal.id} onClick={() => { setSelectedGoal(goal.id); setStep('business') }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border bg-dashCard border-dashSurface2 hover:border-accent/50 hover:bg-accent/5 text-left transition-all">
                  <div className="p-2.5 rounded-lg bg-accent/10 text-accent"><Icon size={20} /></div>
                  <div>
                    <p className="font-medium text-dashText">{goal.label}</p>
                    <p className="text-xs text-dashMuted mt-0.5">{goal.desc}</p>
                  </div>
                  <ArrowRight size={16} className="text-dashMuted ml-auto" />
                </button>
              )
            })}
            <button onClick={handleSkip} className="w-full text-center text-xs text-dashMuted hover:text-dashText py-3 transition-colors">
              Skip — I&apos;ll explore on my own
            </button>
          </div>
        )}

        {step === 'business' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-dashMuted mb-1.5">Business name</label>
              <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Apex Plumbing"
                className="w-full px-4 py-2.5 bg-dashCard border border-dashSurface2 rounded-lg text-dashText text-sm placeholder:text-dashMuted/50 focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dashMuted mb-1.5">What do you do?</label>
              <input type="text" value={businessType} onChange={e => setBusinessType(e.target.value)} placeholder="e.g. Plumbing, Hair salon, Consulting..."
                className="w-full px-4 py-2.5 bg-dashCard border border-dashSurface2 rounded-lg text-dashText text-sm placeholder:text-dashMuted/50 focus:border-accent focus:outline-none" />
            </div>
            <button onClick={handleStart} className="w-full py-3 bg-accent text-white rounded-lg font-medium text-sm hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
              <Rocket size={16} /> Show me what ELEVO can do
            </button>
            <button onClick={() => setStep('ask')} className="w-full text-center text-xs text-dashMuted hover:text-dashText py-2 transition-colors">← Back</button>
          </div>
        )}
      </div>
    </div>
  )
}
