'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Loader2, Bot, Minus } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function HelperBot() {
  const [open, setOpen] = useState(false)
  const [minimised, setMinimised] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Mira, your ELEVO guide. Ask me anything about the platform — connecting accounts, using tools, upgrading, or finding features."
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  useEffect(() => {
    if (open && !minimised) {
      inputRef.current?.focus()
    }
  }, [open, minimised])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return
    const userMessage = input.trim()
    setInput('')
    const updated = [...messages, { role: 'user' as const, content: userMessage }]
    setMessages(updated)
    setLoading(true)
    setStreamingText('')

    try {
      const res = await fetch('/api/help-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages,
        }),
      })

      if (!res.ok || !res.body) {
        throw new Error('Stream failed')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        setStreamingText(accumulated)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: accumulated || 'Sorry, I had trouble with that. Try again?' }])
      setStreamingText('')
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
      setStreamingText('')
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages])

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setMinimised(false) }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50 flex items-center justify-center transition-all duration-200"
        aria-label="Open help chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }

  if (minimised) {
    return (
      <button
        onClick={() => setMinimised(false)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#1A2332] border border-white/10 rounded-full pl-3 pr-4 py-2 shadow-lg shadow-black/40 hover:border-indigo-500/40 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs font-medium text-white/80">Mira</span>
        {loading && <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />}
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[520px] bg-[#141B24] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-[#1A2332]">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Mira — ELEVO Guide™</p>
          <p className="text-xs text-indigo-400">Always here to help</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimised(true)}
            className="text-white/50 hover:text-white transition-colors p-1"
            aria-label="Minimise"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="text-white/50 hover:text-white transition-colors p-1"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-br-sm'
                : 'bg-[#0D1520] text-[#EEF2FF] rounded-bl-sm border border-white/5'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {streamingText && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-3 py-2 text-sm leading-relaxed bg-[#0D1520] text-[#EEF2FF] border border-white/5 whitespace-pre-wrap">
              {streamingText}
              <span className="inline-block w-1.5 h-4 bg-indigo-400 ml-0.5 animate-pulse rounded-sm" />
            </div>
          </div>
        )}

        {/* Loading indicator (before stream starts) */}
        {loading && !streamingText && (
          <div className="flex justify-start">
            <div className="bg-[#0D1520] border border-white/5 rounded-2xl rounded-bl-sm px-3 py-2">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          {['How do I connect Instagram?', 'What agents are available?', 'How do I upgrade?'].map(q => (
            <button
              key={q}
              onClick={() => setInput(q)}
              className="text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/30 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask anything about ELEVO…"
            className="flex-1 bg-[#0D1520] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
