'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { DollarSign, Send, Loader2, Bot, Lock, Crown } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
interface ChatMessage { role: 'user' | 'assistant'; content: string }
export default function ThreadsMonetizationPage() {
  const params = useParams(); const locale = (params?.locale as string) ?? 'en'; const supabase = createBrowserClient()
  const [plan, setPlan] = useState<string | null>(null); const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', content: "I'm the ELEVO Threads Monetization Agent — Galaxy exclusive. I create monetisation strategies, digital product ideas, sales funnels, and revenue projections. What's your niche?" }])
  const [input, setInput] = useState(''); const [chatLoading, setChatLoading] = useState(false); const [streamingText, setStreamingText] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null); const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, streamingText])
  useEffect(() => { supabase.auth.getUser().then(({ data: { user } }) => { if (!user) return; supabase.from('profiles').select('plan').eq('id', user.id).single().then(({ data }) => { setPlan(data?.plan ?? 'trial'); setLoading(false) }) }) }, [supabase])
  const sendMessage = useCallback(async (msg?: string) => {
    const text = (msg ?? input).trim(); if (!text || chatLoading) return; setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }]); setChatLoading(true); setStreamingText('')
    try {
      const res = await fetch('/api/tools/threads-monetization', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, conversationHistory: messages }) })
      if (res.status === 403) { setMessages(prev => [...prev, { role: 'assistant', content: 'Galaxy plan required.' }]); setChatLoading(false); return }
      if (!res.ok || !res.body) throw new Error('Failed')
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let acc = ''
      while (true) { const { done, value } = await reader.read(); if (done) break; acc += decoder.decode(value, { stream: true }); setStreamingText(acc) }
      setMessages(prev => [...prev, { role: 'assistant', content: acc || 'Error' }]); setStreamingText('')
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error.' }]); setStreamingText('') }
    finally { setChatLoading(false); inputRef.current?.focus() }
  }, [input, chatLoading, messages])
  if (loading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 text-purple-400 animate-spin" /></div>
  if (plan !== 'galaxy') return (<div className="p-6 max-w-2xl mx-auto"><div className="bg-gradient-to-b from-purple-900/20 to-dashCard border border-purple-500/20 rounded-2xl p-10 text-center"><Crown className="w-12 h-12 text-purple-400 mx-auto mb-4" /><div className="inline-block bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 text-[11px] font-bold text-purple-400 uppercase mb-4">Galaxy Exclusive</div><h1 className="text-2xl font-bold text-white mb-2">Threads Monetization</h1><p className="text-dashMuted mb-6">Create monetisation strategies, digital product ideas, and revenue projections.</p><Link href={`/${locale}/pricing`} className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl">Upgrade to Galaxy →</Link></div></div>)
  return (<div className="p-6 max-w-5xl mx-auto"><div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5 text-white" /></div><div><h1 className="text-xl font-bold text-white">Threads Monetization</h1><span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full px-2 py-0.5 uppercase">Galaxy</span></div></div>
    <div className="bg-dashCard border border-purple-500/10 rounded-xl overflow-hidden flex flex-col" style={{ height: 520 }}>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">{messages.map((msg, i) => (<div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>{msg.role === 'assistant' && <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mr-2 mt-1 shrink-0"><Bot className="w-3.5 h-3.5 text-white" /></div>}<div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-dashBg text-[#EEF2FF] rounded-bl-sm border border-white/5'}`}>{msg.content}</div></div>))}
        {streamingText && <div className="flex justify-start"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mr-2 mt-1 shrink-0"><Bot className="w-3.5 h-3.5 text-white" /></div><div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm bg-dashBg text-[#EEF2FF] border border-white/5 whitespace-pre-wrap">{streamingText}<span className="inline-block w-1.5 h-4 bg-purple-400 ml-0.5 animate-pulse rounded-sm" /></div></div>}
        {chatLoading && !streamingText && <div className="flex justify-start"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mr-2 mt-1 shrink-0"><Bot className="w-3.5 h-3.5 text-white" /></div><div className="bg-dashBg border border-white/5 rounded-2xl px-4 py-3"><Loader2 className="w-4 h-4 text-purple-400 animate-spin" /></div></div>}
        <div ref={chatEndRef} /></div>
      <div className="p-3 border-t border-purple-500/10"><div className="flex gap-2"><input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask about monetisation..." className="flex-1 bg-dashBg border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50" disabled={chatLoading} /><button onClick={() => sendMessage()} disabled={!input.trim() || chatLoading} className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 disabled:opacity-40 flex items-center justify-center"><Send className="w-4 h-4 text-white" /></button></div></div>
    </div></div>)
}
