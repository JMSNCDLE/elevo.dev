'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function HelperBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Mira, your ELEVO guide. Ask me anything about the platform — connecting accounts, using tools, upgrading, or finding features."
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)
    try {
      const res = await fetch('/api/helper/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, conversationHistory: messages })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || "Sorry, I had trouble with that. Try again?" }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50 flex items-center justify-center transition-all duration-200 ${open ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-label="Open help chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[480px] bg-[#141B24] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-[#1A2332]">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Mira — ELEVO Guide™</p>
              <p className="text-xs text-indigo-400">Always here to help</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/50 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-[#0D1520] text-[#EEF2FF] rounded-bl-sm border border-white/5'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
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
              {['How do I connect Instagram?', 'What is ELEVO Create?', 'How do I upgrade?'].map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q) }}
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
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask anything about ELEVO…"
                className="flex-1 bg-[#0D1520] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
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
      )}
    </>
  )
}
