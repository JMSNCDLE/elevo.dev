'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Megaphone, Send, Loader2, Bot, FileText, Calendar,
  Monitor, Search, Mail, PieChart, Lock,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { ADMIN_IDS } from '@/lib/admin'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_ACTIONS = [
  { label: 'Marketing Plan', prompt: 'Create a comprehensive 90-day marketing plan for my business. Include channels, budget allocation, content strategy, and KPIs.', icon: FileText },
  { label: 'Content Calendar', prompt: 'Build a 30-day content calendar for my business across Instagram, Facebook, Google Business, and email. Include post topics, formats, and optimal posting times.', icon: Calendar },
  { label: 'Ad Campaign Brief', prompt: 'Create ad campaign briefs for Meta and Google Ads. Include audience targeting, budget split, creative direction, ad copy, and expected results.', icon: Monitor },
  { label: 'SEO Strategy', prompt: 'Develop an SEO strategy for my business. Include target keywords, content topics to write, on-page optimisation tasks, and link building opportunities.', icon: Search },
  { label: 'Email Sequence', prompt: 'Design a 7-email nurture sequence for new leads. Include subject lines, send timing, content outline, and CTAs for each email.', icon: Mail },
  { label: 'Budget Planner', prompt: 'Help me allocate a monthly marketing budget of €500. Break it down by channel with expected ROI for each.', icon: PieChart },
]

export default function MarketingPlannerPage() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'
  const supabase = createBrowserClient()

  const [plan, setPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "I'm ELEVO Marketing Planner™ — your 24/7 AI marketing strategist. I create marketing plans, content calendars, ad campaign briefs, SEO strategies, email sequences, and budget recommendations. What would you like to plan?" }
  ])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, streamingText])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('plan').eq('id', user.id).single().then(({ data }) => {
        setPlan(ADMIN_IDS.includes(user.id) ? 'galaxy' : (data?.plan ?? 'trial'))
        setLoading(false)
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendMessage = useCallback(async (msg?: string) => {
    const text = (msg ?? input).trim()
    if (!text || chatLoading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setChatLoading(true)
    setStreamingText('')

    try {
      const res = await fetch('/api/agents/marketing-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversationHistory: messages }),
      })

      if (res.status === 403) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'This feature requires the Orbit or Galaxy plan. Upgrade to unlock Marketing Planner™.' }])
        setChatLoading(false)
        return
      }

      if (!res.ok || !res.body) throw new Error('Failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setStreamingText(accumulated)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: accumulated || 'Sorry, something went wrong.' }])
      setStreamingText('')
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
      setStreamingText('')
    } finally {
      setChatLoading(false)
      inputRef.current?.focus()
    }
  }, [input, chatLoading, messages])

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>

  if (plan !== 'orbit' && plan !== 'galaxy') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-dashCard border border-white/5 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Marketing Planner™</h1>
          <p className="text-dashMuted mb-6">
            Upgrade to Orbit (€49.99/mo) to unlock your 24/7 AI marketing strategist. Get marketing plans, content calendars, ad briefs, SEO strategies, and budget recommendations.
          </p>
          <Link href={`/${locale}/pricing`} className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">
            Upgrade to Orbit →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
          <Megaphone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Marketing Planner™</h1>
          <p className="text-sm text-dashMuted">Your 24/7 AI marketing strategist — 1 credit per query</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {QUICK_ACTIONS.map(action => (
          <button key={action.label} onClick={() => sendMessage(action.prompt)} disabled={chatLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-dashMuted bg-dashCard border border-white/5 rounded-lg hover:text-white hover:border-white/10 transition-colors whitespace-nowrap disabled:opacity-40">
            <action.icon className="w-3.5 h-3.5" />
            {action.label}
          </button>
        ))}
      </div>

      {/* Chat */}
      <div className="bg-dashCard border border-white/5 rounded-xl overflow-hidden flex flex-col" style={{ height: 520 }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center mr-2 mt-1 shrink-0">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-dashBg text-[#EEF2FF] rounded-bl-sm border border-white/5'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {streamingText && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center mr-2 mt-1 shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed bg-dashBg text-[#EEF2FF] border border-white/5 whitespace-pre-wrap">
                {streamingText}<span className="inline-block w-1.5 h-4 bg-green-400 ml-0.5 animate-pulse rounded-sm" />
              </div>
            </div>
          )}
          {chatLoading && !streamingText && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center mr-2 mt-1 shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-dashBg border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3">
                <Loader2 className="w-4 h-4 text-green-400 animate-spin" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-3 border-t border-white/5">
          <div className="flex gap-2">
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about marketing plans, content calendars, ad campaigns, SEO…"
              className="flex-1 bg-dashBg border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
              disabled={chatLoading} />
            <button onClick={() => sendMessage()} disabled={!input.trim() || chatLoading}
              className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
