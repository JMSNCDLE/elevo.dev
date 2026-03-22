'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { Send, Mic, MicOff, Copy, Check, ArrowUpRight, Zap, Rocket } from 'lucide-react'
import type { TaskMessage } from '@/lib/agents/conversationalTaskAgent'

const QUICK_ACTIONS = [
  'Write a Google Business post about my services',
  'Analyse why my bookings dropped this month',
  'Create a social media caption for Instagram',
  'Write a follow-up email to a customer',
  'Draft a blog post about common problems I solve',
  'Help me understand my ad spend ROI',
]

interface MessageBubbleProps {
  message: TaskMessage
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="flex items-center gap-1 text-xs text-dashMuted hover:text-dashText transition-colors"
    >
      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'max-w-[60%]' : 'max-w-[80%]'}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
              <Rocket size={12} className="text-white" />
            </div>
            <span className="text-xs text-dashMuted font-medium">ELEVO</span>
            {message.action?.agentUsed && (
              <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded font-medium">
                {message.action.agentUsed}
              </span>
            )}
          </div>
        )}

        <div className={`rounded-xl px-4 py-3 ${
          isUser
            ? 'bg-accent/20 border border-accent/30 text-dashText text-sm'
            : 'bg-dashCard border-l-2 border-accent text-dashText text-sm'
        }`}>
          <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Content card */}
        {message.contentCard && (
          <div className="mt-2 bg-dashCard border border-dashSurface2 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-accent uppercase tracking-wide">
                {message.contentCard.type.replace(/_/g, ' ')}
              </span>
              <CopyBtn text={message.contentCard.content} />
            </div>
            <p className="text-sm text-dashText leading-relaxed whitespace-pre-wrap">
              {message.contentCard.content}
            </p>
          </div>
        )}

        {/* Action credits indicator */}
        {message.action?.creditsUsed && (
          <p className="text-xs text-dashMuted mt-1 ml-1">
            {message.action.creditsUsed} credit{message.action.creditsUsed > 1 ? 's' : ''} used
          </p>
        )}

        <p className="text-xs text-dashMuted mt-1 ml-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const locale = useLocale()
  const [messages, setMessages] = useState<TaskMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [businessProfileId, setBusinessProfileId] = useState<string | null>(null)
  const [plan, setPlan] = useState('trial')
  const [creditsRemaining, setCreditsRemaining] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [profileLoading, setProfileLoading] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check speech support (safe: always runs client-side inside useEffect)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setHasSpeechSupport(!!SR)

    // Load profile
    async function loadProfile() {
      try {
        // Use a simple endpoint to get profile data — reuse the CRM endpoint
        const r = await fetch('/api/crm/contacts?limit=1')
        // We need a better way — use analytics summary which confirms auth and returns bp id
        // For now, try to get from the generate endpoint metadata — use a simple check
      } catch { /* ignore */ } finally {
        setProfileLoading(false)
      }
    }
    loadProfile()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || sending) return

    const userMsg: TaskMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setSending(true)
    setSuggestions([])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          conversationHistory: messages.slice(-10),
          businessProfileId,
          locale,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errMsg: TaskMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.error ?? 'Something went wrong. Please try again.',
          timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, errMsg])
      } else {
        const assistantMsg: TaskMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString(),
          action: data.action,
          contentCard: data.contentCard,
          dataCard: data.dataCard,
        }
        setMessages(prev => [...prev, assistantMsg])
        if (data.followUpSuggestions?.length) {
          setSuggestions(data.followUpSuggestions)
        }
        if (data.creditsRemaining !== undefined) {
          setCreditsRemaining(data.creditsRemaining)
        }
      }
    } catch {
      const errMsg: TaskMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Connection error. Please try again.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setSending(false)
    }
  }, [messages, sending, businessProfileId, locale])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function toggleRecording() {
    if (!hasSpeechSupport) return

    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = locale === 'es' ? 'es-ES' : 'en-GB'

    recognition.onresult = (e: { results: { transcript: string }[][] }) => {
      const transcript = e.results[0][0].transcript
      setInput(prev => prev + (prev ? ' ' : '') + transcript)
    }
    recognition.onend = () => setIsRecording(false)
    recognition.onerror = () => setIsRecording(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }

  return (
    <div className="flex flex-col h-screen bg-dashBg">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-dashSurface2 bg-dashSurface shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
            <Rocket size={18} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-dashText text-lg">ELEVO</span>
              <ArrowUpRight size={16} className="text-accent" />
            </div>
            <p className="text-xs text-dashMuted">Your AI business partner</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {plan !== 'trial' && (
            <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full font-medium capitalize">
              {plan}
            </span>
          )}
          {creditsRemaining > 0 && (
            <span className="text-xs text-dashMuted">
              {creditsRemaining} credits
            </span>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap size={32} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-dashText mb-2">What can I help you with?</h2>
              <p className="text-dashMuted text-sm mb-8 max-w-md mx-auto">
                Ask me to write content, analyse your business, solve a problem, or manage your customers. I can do it all.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto">
                {QUICK_ACTIONS.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(action)}
                    className="text-left px-4 py-3 bg-dashCard border border-dashSurface2 rounded-xl text-sm text-dashMuted hover:text-dashText hover:border-accent/30 transition-all"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {sending && (
            <div className="flex justify-start mb-4">
              <div className="bg-dashCard border-l-2 border-accent rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-dashMuted">ELEVO is working...</span>
                </div>
              </div>
            </div>
          )}

          {/* Follow-up suggestions */}
          {suggestions.length > 0 && !sending && (
            <div className="flex flex-wrap gap-2 mt-2 mb-4">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 bg-accent/10 text-accent border border-accent/20 rounded-full hover:bg-accent/20 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 px-4 sm:px-8 py-4 border-t border-dashSurface2 bg-dashSurface">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask ELEVO anything about your business..."
                rows={1}
                className="w-full bg-dashSurface2 border border-dashSurface2 rounded-xl px-4 py-3 text-sm text-dashText placeholder:text-dashMuted resize-none focus:outline-none focus:border-accent/50 transition-colors max-h-40 overflow-y-auto"
                style={{ minHeight: '48px' }}
                onInput={e => {
                  const t = e.target as HTMLTextAreaElement
                  t.style.height = 'auto'
                  t.style.height = Math.min(t.scrollHeight, 160) + 'px'
                }}
              />
            </div>
            {hasSpeechSupport && (
              <button
                onClick={toggleRecording}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                  isRecording
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                    : 'bg-dashCard border border-dashSurface2 text-dashMuted hover:text-dashText'
                }`}
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || sending}
              className="w-11 h-11 bg-accent rounded-xl flex items-center justify-center text-white hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-xs text-dashMuted mt-2 text-center">
            Enter to send · Shift+Enter for new line · 1 credit per message
          </p>
        </div>
      </div>
    </div>
  )
}
