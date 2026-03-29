'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Circle, ArrowRight, Loader2, Sparkles, Send } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import type { MiraResponse } from '@/lib/agents/miraOnboardingAgent'
import { ONBOARDING_CHECKLIST } from '@/lib/agents/miraOnboardingAgent'

interface ChecklistState {
  completedSteps: string[]
  completionPercent: number
}

export default function OnboardingGuidePage() {
  const locale = useLocale()
  const [state, setState] = useState<ChecklistState>({ completedSteps: [], completionPercent: 0 })
  const [miraMessage, setMiraMessage] = useState<MiraResponse | null>(null)
  const [question, setQuestion] = useState('')
  const [asking, setAsking] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [checklistRes, miraRes] = await Promise.all([
          fetch('/api/onboarding-guide'),
          fetch('/api/onboarding-guide', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentStep: 'profile', locale }),
          }),
        ])

        if (checklistRes.ok) {
          const d: ChecklistState = await checklistRes.json()
          setState(d)
        }

        if (miraRes.ok) {
          const m: MiraResponse = await miraRes.json()
          setMiraMessage(m)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [locale])

  async function handleAskMira() {
    if (!question.trim()) return
    setAsking(true)

    try {
      const r = await fetch('/api/onboarding-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStep: state.completedSteps[state.completedSteps.length - 1] ?? 'profile',
          question: question.trim(),
          locale,
        }),
      })

      if (r.ok) {
        const m: MiraResponse = await r.json()
        setMiraMessage(m)
        setQuestion('')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setAsking(false)
    }
  }

  async function markComplete(stepId: string) {
    await fetch('/api/onboarding-guide', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepId }),
    })

    setState(prev => ({
      completedSteps: [...prev.completedSteps, stepId],
      completionPercent: Math.round(((prev.completedSteps.length + 1) / ONBOARDING_CHECKLIST.length) * 100),
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-dashMuted" size={24} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
          <Sparkles size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-dashText">Getting Started</h1>
          <p className="text-dashMuted text-sm">Your personal guide with Mira</p>
        </div>
      </div>

      {/* Mira Message */}
      {miraMessage && (
        <div className="bg-dashCard border border-accent/20 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-dashText mb-0.5">Mira</p>
              <p className="text-sm text-dashMuted leading-relaxed">{miraMessage.message}</p>
              {miraMessage.encouragement && (
                <p className="text-sm text-accent mt-2 font-medium">{miraMessage.encouragement}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-dashText">Your Progress</h2>
          <span className="text-sm font-bold text-accent">{state.completionPercent}%</span>
        </div>
        <div className="w-full bg-dashSurface rounded-full h-2 mb-4">
          <div
            className="h-2 rounded-full bg-accent transition-all duration-500"
            style={{ width: `${state.completionPercent}%` }}
          />
        </div>

        <div className="space-y-2">
          {ONBOARDING_CHECKLIST.map(item => {
            const done = state.completedSteps.includes(item.id)
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between rounded-xl p-3 transition-colors ${
                  done ? 'bg-green-500/5 border border-green-500/10' : 'bg-dashSurface'
                }`}
              >
                <div className="flex items-center gap-3">
                  {done ? (
                    <CheckCircle size={18} className="text-green-400 shrink-0" />
                  ) : (
                    <Circle size={18} className="text-dashMuted shrink-0" />
                  )}
                  <span className={`text-sm ${done ? 'text-dashMuted line-through' : 'text-dashText'}`}>
                    {item.title}
                  </span>
                </div>
                {!done && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markComplete(item.id)}
                      className="text-xs text-dashMuted hover:text-green-400 transition-colors"
                    >
                      Mark done
                    </button>
                    <Link
                      href={`/${locale}${item.route}`}
                      className="flex items-center gap-1 text-xs text-accent hover:underline"
                    >
                      Go <ArrowRight size={12} />
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Ask Mira */}
      <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-dashText mb-3">Ask Mira a question</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAskMira()}
            placeholder="How do I get my first customer..."
            className="flex-1 bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-dashText text-sm focus:outline-none focus:border-accent/50"
          />
          <button
            onClick={handleAskMira}
            disabled={asking || !question.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50"
          >
            {asking ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Ask
          </button>
        </div>
      </div>
    </div>
  )
}
