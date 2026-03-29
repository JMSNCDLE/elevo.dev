'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, X, MessageCircle, Loader2, Sparkles } from 'lucide-react'
import type { AssistantMessage } from '@/lib/agents/types'

interface LiveAssistantPanelProps {
  businessProfileId?: string
}

export default function LiveAssistantPanel({ businessProfileId }: LiveAssistantPanelProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm ELEVO. Ask me anything about your business — marketing ideas, copywriting tips, pricing advice, or how to handle any challenge.",
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg: AssistantMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          businessProfileId,
        }),
      })

      if (!res.ok) throw new Error('Failed')

      const data = await res.json()
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.response, timestamp: new Date().toISOString() },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Sorry, I hit an error. Please try again.", timestamp: new Date().toISOString() },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 bg-accent text-white rounded-full shadow-lg hover:bg-accentLight transition-all flex items-center justify-center animate-pulse-ring z-50"
          aria-label="Open ELEVO Assistant"
        >
          <Sparkles size={20} />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 bg-dashCard border border-dashSurface2 rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-dashSurface2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-accent rounded-full flex items-center justify-center">
                <Sparkles size={13} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-dashText">ELEVO</p>
                <p className="text-xs text-green-400">Online</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-dashMuted hover:text-dashText transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-80">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center mr-1.5 mt-1 shrink-0">
                    <span className="text-white text-xs font-bold">E</span>
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-accent text-white rounded-br-sm'
                      : 'bg-dashSurface text-dashText rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center mr-1.5 mt-1 shrink-0">
                  <span className="text-white text-xs font-bold">E</span>
                </div>
                <div className="bg-dashSurface px-3 py-2 rounded-xl rounded-bl-sm">
                  <Loader2 size={14} className="text-accent animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-dashSurface2 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask anything..."
                className="flex-1 bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="p-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
