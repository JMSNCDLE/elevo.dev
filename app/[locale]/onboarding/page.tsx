'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send, Sparkles } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Step {
  id: string
  question: string
  placeholder: string
  hint: string
}

const STEPS: Step[] = [
  {
    id: 'business_name',
    question: "What's your business called?",
    placeholder: "e.g. Smith & Sons Plumbing",
    hint: "Just the trading name you use.",
  },
  {
    id: 'category',
    question: "What type of business is it?",
    placeholder: "e.g. Plumber, Electrician, Hair Salon, Landscaper...",
    hint: "The industry or trade you're in.",
  },
  {
    id: 'city',
    question: "Where are you based?",
    placeholder: "e.g. Manchester, London, Birmingham...",
    hint: "Your main operating city or town.",
  },
  {
    id: 'services',
    question: "What are your main services?",
    placeholder: "e.g. Boiler repairs, installations, bathroom fitting",
    hint: "List your key services, separated by commas.",
  },
  {
    id: 'unique_selling_points',
    question: "What makes you different from the competition?",
    placeholder: "e.g. 20 years experience, same-day response, family-run",
    hint: "Your USPs — what customers love about you.",
  },
]

interface ChatMessage {
  role: 'assistant' | 'user'
  content: string
}

export default function OnboardingPage({ params }: { params: { locale: string } }) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [currentStep, setCurrentStep] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm ELEVO. Let's get your account set up so I can start creating content that actually sounds like you. This will take about 2 minutes." },
    { role: 'assistant', content: STEPS[0].question },
  ])
  const [input, setInput] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || submitting) return

    const step = STEPS[currentStep]
    const userMessage = input.trim()
    setInput('')

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }]
    setAnswers(prev => ({ ...prev, [step.id]: userMessage }))

    const nextStep = currentStep + 1

    if (nextStep < STEPS.length) {
      newMessages.push({ role: 'assistant', content: STEPS[nextStep].question })
      setMessages(newMessages)
      setCurrentStep(nextStep)
    } else {
      // All done — submit
      newMessages.push({ role: 'assistant', content: "Perfect! Setting up your account now..." })
      setMessages(newMessages)
      setSubmitting(true)

      const allAnswers = { ...answers, [step.id]: userMessage }
      await submitOnboarding(allAnswers)
    }
  }

  const submitOnboarding = async (allAnswers: Record<string, string>) => {
    const services = allAnswers.services
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const usps = allAnswers.unique_selling_points
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const res = await fetch('/api/onboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: allAnswers.business_name,
        category: allAnswers.category,
        city: allAnswers.city,
        country: 'United Kingdom',
        services,
        uniqueSellingPoints: usps,
        locale: params.locale,
      }),
    })

    if (res.ok) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `You're all set! Welcome to ELEVO AI, ${allAnswers.business_name}. Taking you to Mission Control...` },
      ])
      setTimeout(() => router.push(`/${params.locale}/dashboard`), 2000)
    } else {
      setMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong. Please try again." }])
      setSubmitting(false)
    }
  }

  const progress = ((currentStep) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-dashBg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-dashText font-bold text-lg">ELEVO AI</span>
          </div>
          <p className="text-dashMuted text-sm">Setting up your account</p>

          {/* Progress bar */}
          <div className="mt-4 w-full bg-dashCard rounded-full h-1.5">
            <div
              className="bg-accent h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-dashMuted mt-1">{currentStep} of {STEPS.length} questions</p>
        </div>

        {/* Chat window */}
        <div className="bg-dashCard rounded-2xl border border-dashSurface2 overflow-hidden">
          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center mr-2 mt-0.5 shrink-0">
                    <span className="text-white text-xs font-bold">E</span>
                  </div>
                )}
                <div
                  className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-accent text-white rounded-br-sm'
                      : 'bg-dashSurface text-dashText rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {submitting && (
              <div className="flex justify-start">
                <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center mr-2 mt-0.5 shrink-0">
                  <span className="text-white text-xs font-bold">E</span>
                </div>
                <div className="bg-dashSurface px-4 py-2.5 rounded-2xl rounded-bl-sm">
                  <Loader2 size={16} className="text-accent animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          {!submitting && (
            <div className="border-t border-dashSurface2 p-4">
              <p className="text-xs text-dashMuted mb-2">{STEPS[currentStep]?.hint}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder={STEPS[currentStep]?.placeholder}
                  className="flex-1 bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent"
                  autoFocus
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
