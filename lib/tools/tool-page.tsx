'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, Bot, Lock } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface QuickAction {
  label: string
  prompt: string
  icon: React.ElementType
}

interface ToolPageConfig {
  title: string
  subtitle: string
  apiPath: string
  iconColor: string
  cursorColor: string
  icon: React.ElementType
  greeting: string
  quickActions: QuickAction[]
  upgradeCopy: string
}

export default function createToolPage(config: ToolPageConfig) {
  return function ToolPage() {
    const params = useParams()
    const locale = (params?.locale as string) ?? 'en'
    const supabase = createBrowserClient()

    const [plan, setPlan] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [messages, setMessages] = useState<ChatMessage[]>([
      { role: 'assistant', content: config.greeting }
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
          setPlan(data?.plan ?? 'trial')
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
        const res = await fetch(config.apiPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, conversationHistory: messages }),
        })

        if (res.status === 403) {
          setMessages(prev => [...prev, { role: 'assistant', content: 'This tool requires the Orbit or Galaxy plan.' }])
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
            <Lock className="w-10 h-10 text-dashMuted mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">{config.title}</h1>
            <p className="text-dashMuted mb-6">{config.upgradeCopy}</p>
            <Link href={`/${locale}/pricing`} className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">
              Upgrade to Orbit →
            </Link>
          </div>
        </div>
      )
    }

    const Icon = config.icon

    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 ${config.iconColor} rounded-xl flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{config.title}</h1>
            <p className="text-sm text-dashMuted">{config.subtitle}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {config.quickActions.map(action => (
            <button key={action.label} onClick={() => sendMessage(action.prompt)} disabled={chatLoading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-dashMuted bg-dashCard border border-white/5 rounded-lg hover:text-white hover:border-white/10 transition-colors whitespace-nowrap disabled:opacity-40">
              <action.icon className="w-3.5 h-3.5" />
              {action.label}
            </button>
          ))}
        </div>

        <div className="bg-dashCard border border-white/5 rounded-xl overflow-hidden flex flex-col" style={{ height: 520 }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className={`w-7 h-7 rounded-full ${config.iconColor} flex items-center justify-center mr-2 mt-1 shrink-0`}>
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-dashBg text-[#EEF2FF] rounded-bl-sm border border-white/5'
                }`}>{msg.content}</div>
              </div>
            ))}
            {streamingText && (
              <div className="flex justify-start">
                <div className={`w-7 h-7 rounded-full ${config.iconColor} flex items-center justify-center mr-2 mt-1 shrink-0`}>
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed bg-dashBg text-[#EEF2FF] border border-white/5 whitespace-pre-wrap">
                  {streamingText}<span className={`inline-block w-1.5 h-4 ${config.cursorColor} ml-0.5 animate-pulse rounded-sm`} />
                </div>
              </div>
            )}
            {chatLoading && !streamingText && (
              <div className="flex justify-start">
                <div className={`w-7 h-7 rounded-full ${config.iconColor} flex items-center justify-center mr-2 mt-1 shrink-0`}>
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-dashBg border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3">
                  <Loader2 className={`w-4 h-4 ${config.cursorColor} animate-spin`} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-white/5">
            <div className="flex gap-2">
              <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask anything…"
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
}
