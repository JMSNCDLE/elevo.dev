'use client'

import { useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Upload, Send, Loader2, FileText, Shield, Scale, AlertTriangle, BookOpen, CheckCircle } from 'lucide-react'
import { useUserContext } from '@/lib/hooks/useUserContext'
import { cn } from '@/lib/utils'

type Tab = 'upload' | 'chat' | 'compare' | 'clauses'
type Msg = { role: 'user' | 'assistant'; content: string }

const QUICK_ACTIONS = [
  { label: 'Contract Review', icon: FileText, prompt: 'Review this contract and flag all risks' },
  { label: 'Risk Assessment', icon: AlertTriangle, prompt: 'Assess the overall risk level of this document' },
  { label: 'Plain Language', icon: BookOpen, prompt: 'Summarise this entire document in plain English' },
  { label: 'Clause Comparison', icon: Scale, prompt: 'Compare the key clauses against standard terms' },
  { label: 'NDA Review', icon: Shield, prompt: 'Review this NDA — flag any unusual restrictions' },
  { label: 'T&C Check', icon: CheckCircle, prompt: 'Check these terms & conditions for hidden risks' },
]

const SUGGESTIONS = [
  "What should I look out for in this contract?",
  "Are there any unusual or risky clauses?",
  "Summarise the key terms",
  "What's missing from this agreement?",
]

export default function LawyerPage() {
  const { plan, isAdmin, loading: ctxLoading } = useUserContext()
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'

  const [tab, setTab] = useState<Tab>('chat')
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "Hello! I'm your ELEVO Lawyer™. Upload a contract, agreement, or legal document and I'll review every clause for risks, missing protections, and areas to negotiate. How can I help?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState('')
  const [docText, setDocText] = useState('')
  const [docName, setDocName] = useState('')
  const [uploading, setUploading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  if (ctxLoading) return <div className="min-h-screen bg-dashBg flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
  const isOrbit = plan === 'orbit' || plan === 'galaxy' || isAdmin
  if (!isOrbit) return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <Scale size={48} className="text-accent mx-auto mb-4 opacity-50" />
      <h1 className="text-2xl font-bold text-dashText mb-2">ELEVO Lawyer™</h1>
      <p className="text-dashMuted mb-6">Professional AI legal analyst. Available on Orbit plan and above.</p>
      <a href={`/${locale}/pricing`} className="inline-block px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">Upgrade to Orbit →</a>
    </div>
  )

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/documents/extract', { method: 'POST', body: formData })
      if (res.ok) {
        const { text, fileName } = await res.json()
        setDocText(text)
        setDocName(fileName)
        setMessages(prev => [...prev, { role: 'assistant', content: `📄 Document loaded: **${fileName}**\n\nI've extracted the content (${text.length.toLocaleString()} characters). I'll review every clause. Ask me anything or click a quick action below.` }])
        setTab('chat')
      }
    } catch {} finally { setUploading(false) }
  }

  const sendMessage = useCallback(async (msg?: string) => {
    const text = (msg ?? input).trim()
    if (!text || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)
    setStreaming('')

    try {
      const res = await fetch('/api/lawyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          documentContent: docText || undefined,
          documentType: docName ? docName.split('.').pop() : undefined,
          conversationHistory: messages.slice(-6),
          locale,
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setStreaming(full)
      }
      setMessages(prev => [...prev, { role: 'assistant', content: full }])
      setStreaming('')
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]) }
    finally { setLoading(false) }
  }, [input, loading, messages, docText, docName, locale])

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] md:h-screen">
      {/* Header */}
      <div className="px-6 py-4 border-b border-dashSurface2 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-dashText flex items-center gap-2"><Scale size={20} className="text-blue-400" /> ELEVO Lawyer™</h1>
          <p className="text-xs text-dashMuted">AI Legal Analyst — Contract & document review</p>
        </div>
        <div className="flex gap-1 bg-dashCard rounded-lg border border-dashSurface2 p-1">
          {([['upload', 'Upload'], ['chat', 'Ask Counsel'], ['compare', 'Compare'], ['clauses', 'Clauses']] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-colors', tab === id ? 'bg-accent text-white' : 'text-dashMuted hover:text-dashText')}>{label}</button>
          ))}
        </div>
      </div>

      {/* Upload tab */}
      {tab === 'upload' && (
        <div className="flex-1 p-6 flex items-center justify-center">
          <label className="border-2 border-dashed border-dashSurface2 rounded-xl p-12 text-center cursor-pointer hover:border-accent/50 transition-colors max-w-lg w-full">
            {uploading ? <Loader2 className="mx-auto h-12 w-12 text-accent animate-spin mb-4" /> : <Upload className="mx-auto h-12 w-12 text-dashMuted mb-4" />}
            <h3 className="text-lg font-semibold text-dashText">Upload Legal Documents</h3>
            <p className="text-dashMuted mt-1">Contracts, agreements, T&Cs, NDAs, leases</p>
            <p className="text-sm text-dashMuted mt-2">PDF or DOCX — max 10MB</p>
            {docName && <p className="text-sm text-green-400 mt-3">✓ {docName} loaded</p>}
            <input type="file" accept=".pdf,.docx,.doc,.txt" onChange={handleUpload} className="hidden" />
          </label>
        </div>
      )}

      {/* Chat tab */}
      {tab === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={cn('max-w-2xl', m.role === 'user' ? 'ml-auto' : '')}>
                <div className={cn('rounded-xl px-4 py-3 text-sm', m.role === 'user' ? 'bg-accent text-white' : 'bg-dashCard text-dashText border border-dashSurface2')}>
                  <pre className="whitespace-pre-wrap font-sans">{m.content}</pre>
                </div>
              </div>
            ))}
            {streaming && (
              <div className="max-w-2xl"><div className="bg-dashCard text-dashText border border-dashSurface2 rounded-xl px-4 py-3 text-sm"><pre className="whitespace-pre-wrap font-sans">{streaming}</pre></div></div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="px-6 py-2 flex gap-2 flex-wrap border-t border-dashSurface2">
            {QUICK_ACTIONS.map(a => (
              <button key={a.label} onClick={() => sendMessage(a.prompt)} className="flex items-center gap-1.5 px-3 py-1.5 bg-dashCard border border-dashSurface2 rounded-lg text-xs text-dashMuted hover:text-dashText transition-colors">
                <a.icon size={12} /> {a.label}
              </button>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-dashSurface2 shrink-0">
            <form onSubmit={e => { e.preventDefault(); sendMessage() }} className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about contracts, clauses, risks..." className="flex-1 bg-dashCard border border-dashSurface2 rounded-lg px-4 py-2.5 text-sm text-dashText focus:outline-none focus:ring-2 focus:ring-accent" />
              <button type="submit" disabled={loading || !input.trim()} className="px-4 py-2.5 bg-accent text-white rounded-lg disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </div>
        </>
      )}

      {/* Compare tab */}
      {tab === 'compare' && (
        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto text-center py-16">
            <Scale size={48} className="text-dashMuted mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-dashText mb-2">Contract Comparison</h2>
            <p className="text-dashMuted mb-4">Upload a document first, then ask me to compare it against standard terms or another contract.</p>
            <button onClick={() => { setTab('chat'); sendMessage('Compare this contract against standard industry terms and highlight key differences') }} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium">Compare Against Standard →</button>
          </div>
        </div>
      )}

      {/* Clauses tab */}
      {tab === 'clauses' && (
        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto text-center py-16">
            <BookOpen size={48} className="text-dashMuted mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-dashText mb-2">Clause Library</h2>
            <p className="text-dashMuted mb-4">Ask me about any standard legal clause — termination, liability, IP, non-compete, and more.</p>
            <button onClick={() => { setTab('chat'); sendMessage('Show me the most important standard clauses I should include in a service agreement') }} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium">View Standard Clauses →</button>
          </div>
        </div>
      )}
    </div>
  )
}
