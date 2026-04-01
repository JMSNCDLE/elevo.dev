'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Shield, Send, Loader2, Bot, Users, TrendingUp,
  Target, DollarSign, Layers, Radar, Lock, Crown,
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
  { label: 'Competitor Analysis', prompt: 'Analyse my top 3 competitors. Compare pricing, features, target market, strengths, and weaknesses. Create a competitive matrix with scoring.', icon: Users },
  { label: 'Market Trends', prompt: 'What are the top emerging trends in my industry right now? Focus on customer behaviour shifts, technology changes, and new market opportunities.', icon: TrendingUp },
  { label: 'SWOT Analysis', prompt: 'Do a thorough SWOT analysis of my business. Be brutally honest. Include actionable recommendations for each quadrant.', icon: Target },
  { label: 'Pricing Benchmark', prompt: 'Benchmark my pricing against competitors. Identify pricing gaps, value perception opportunities, and suggest optimal positioning.', icon: DollarSign },
  { label: 'Feature Gap Analysis', prompt: 'Compare my features against the top 5 competitors in my space. Identify critical gaps and prioritise them by customer impact.', icon: Layers },
  { label: 'Opportunity Radar', prompt: 'Scan for market opportunities I might be missing. Look at underserved segments, unmet needs, and emerging niches in my industry.', icon: Radar },
]

export default function CompetitiveIntelPage() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'
  const supabase = createBrowserClient()

  const [plan, setPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "I'm ELEVO Competitive Intelligence™ — your Galaxy-exclusive strategic analyst. I monitor competitors, analyse market trends, benchmark pricing, identify feature gaps, and find opportunities others miss. What would you like me to investigate?" }
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
      const res = await fetch('/api/agents/competitive-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversationHistory: messages }),
      })

      if (res.status === 403) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Competitive Intelligence™ is exclusively available on the Galaxy plan (€149/mo). Upgrade to unlock our most powerful strategic agent.' }])
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

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 text-purple-400 animate-spin" /></div>

  // Loading state
  if (plan === null) {
    return <div className="min-h-screen bg-dashBg flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
  }

  // Galaxy-only upgrade gate
  if (plan !== 'galaxy') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-gradient-to-b from-purple-900/20 to-dashCard border border-purple-500/20 rounded-2xl p-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-500/20">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div className="inline-block bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-4">
            Galaxy Exclusive
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Competitive Intelligence™</h1>
          <p className="text-dashMuted mb-6 max-w-md mx-auto">
            Our most powerful strategic agent. Monitor competitors, analyse market trends, benchmark pricing, identify feature gaps, and find opportunities others miss.
          </p>
          <Link href={`/${locale}/pricing`} className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20">
            Upgrade to Galaxy — €149/mo →
          </Link>
          <p className="text-xs text-dashMuted mt-4">2 credits per query · Unlimited strategic depth</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Competitive Intelligence™</h1>
            <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full px-2 py-0.5 uppercase">Galaxy</span>
          </div>
          <p className="text-sm text-dashMuted">Strategic analysis on demand — 2 credits per query</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {QUICK_ACTIONS.map(action => (
          <button key={action.label} onClick={() => sendMessage(action.prompt)} disabled={chatLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-dashMuted bg-dashCard border border-white/5 rounded-lg hover:text-white hover:border-purple-500/20 transition-colors whitespace-nowrap disabled:opacity-40">
            <action.icon className="w-3.5 h-3.5" />
            {action.label}
          </button>
        ))}
      </div>

      <div className="bg-dashCard border border-purple-500/10 rounded-xl overflow-hidden flex flex-col" style={{ height: 520 }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mr-2 mt-1 shrink-0">
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
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mr-2 mt-1 shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed bg-dashBg text-[#EEF2FF] border border-white/5 whitespace-pre-wrap">
                {streamingText}<span className="inline-block w-1.5 h-4 bg-purple-400 ml-0.5 animate-pulse rounded-sm" />
              </div>
            </div>
          )}
          {chatLoading && !streamingText && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mr-2 mt-1 shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-dashBg border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3">
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-3 border-t border-purple-500/10">
          <div className="flex gap-2">
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about competitors, market trends, pricing, SWOT, opportunities…"
              className="flex-1 bg-dashBg border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
              disabled={chatLoading} />
            <button onClick={() => sendMessage()} disabled={!input.trim() || chatLoading}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shrink-0">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
