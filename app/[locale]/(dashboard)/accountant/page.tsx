'use client'

import { useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Upload, Send, Loader2, Calculator, Receipt, PieChart, FileText, DollarSign, TrendingUp } from 'lucide-react'
import { useUserContext } from '@/lib/hooks/useUserContext'
import { cn } from '@/lib/utils'

type Tab = 'upload' | 'chat' | 'tax' | 'expenses'
type Msg = { role: 'user' | 'assistant'; content: string }

const QUICK_ACTIONS = [
  { label: 'Scan Invoice', icon: Receipt, prompt: 'Analyse this invoice and extract key data' },
  { label: 'Tax Summary', icon: Calculator, prompt: 'Give me a tax summary for the current quarter' },
  { label: 'Expense Report', icon: PieChart, prompt: 'Generate an expense report by category' },
  { label: 'Cash Flow', icon: TrendingUp, prompt: 'Analyse my cash flow for this month' },
  { label: 'VAT Calculation', icon: DollarSign, prompt: 'Calculate my VAT liability' },
  { label: 'Year-End Review', icon: FileText, prompt: 'Prepare a year-end financial summary' },
]

const SUGGESTIONS = [
  "What's my total tax liability this quarter?",
  "Where am I overspending?",
  "Flag any anomalies in my expenses",
  "Calculate my profit margin",
]

export default function AccountantPage() {
  const { plan, isAdmin, loading: ctxLoading } = useUserContext()
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'

  const [tab, setTab] = useState<Tab>('chat')
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "Hello! I'm Theo, your ELEVO Accountant™. Upload a financial document or ask me anything about your business finances — invoices, tax, expenses, cash flow. How can I help?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState('')
  const [docText, setDocText] = useState('')
  const [docName, setDocName] = useState('')
  const [uploading, setUploading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const isOrbit = plan === 'orbit' || plan === 'galaxy' || isAdmin

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
        setMessages(prev => [...prev, { role: 'assistant', content: `📄 Document loaded: **${fileName}**\n\nI've extracted the content (${text.length.toLocaleString()} characters). Ask me anything about this document, or click a quick action below.` }])
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
      const res = await fetch('/api/accountant', {
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
      {ctxLoading ? (
        <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
      ) : !isOrbit ? (
        <div className="flex-1 flex items-center justify-center p-8"><div className="max-w-2xl text-center"><Calculator size={48} className="text-accent mx-auto mb-4 opacity-50" /><h1 className="text-2xl font-bold text-dashText mb-2">ELEVO Accountant™</h1><p className="text-dashMuted mb-6">Available on Orbit plan and above.</p><a href={`/${locale}/pricing`} className="inline-block px-6 py-3 bg-accent text-white font-semibold rounded-xl">Upgrade to Orbit →</a></div></div>
      ) : (<>
      {/* Header */}
      <div className="px-6 py-4 border-b border-dashSurface2 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-dashText flex items-center gap-2"><Calculator size={20} className="text-green-400" /> ELEVO Accountant™</h1>
          <p className="text-xs text-dashMuted">Theo — Your AI financial analyst</p>
        </div>
        <div className="flex gap-1 bg-dashCard rounded-lg border border-dashSurface2 p-1">
          {([['upload', 'Upload'], ['chat', 'Ask Theo'], ['tax', 'Tax'], ['expenses', 'Expenses']] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-colors', tab === id ? 'bg-accent text-white' : 'text-dashMuted hover:text-dashText')}>{label}</button>
          ))}
        </div>
      </div>

      {/* Upload tab */}
      {tab === 'upload' && (
        <div className="flex-1 p-6 flex items-center justify-center">
          <label className="border-2 border-dashed border-dashSurface2 rounded-xl p-12 text-center cursor-pointer hover:border-accent/50 transition-colors max-w-lg w-full">
            {uploading ? <Loader2 className="mx-auto h-12 w-12 text-accent animate-spin mb-4" /> : <Upload className="mx-auto h-12 w-12 text-dashMuted mb-4" />}
            <h3 className="text-lg font-semibold text-dashText">Upload Financial Documents</h3>
            <p className="text-dashMuted mt-1">Invoices, P&L statements, bank statements, tax forms, receipts</p>
            <p className="text-sm text-dashMuted mt-2">PDF, XLSX, CSV, or image — max 10MB</p>
            {docName && <p className="text-sm text-green-400 mt-3">✓ {docName} loaded</p>}
            <input type="file" accept=".pdf,.xlsx,.csv,.png,.jpg,.jpeg" onChange={handleUpload} className="hidden" />
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
          {/* Quick actions */}
          <div className="px-6 py-2 flex gap-2 flex-wrap border-t border-dashSurface2">
            {QUICK_ACTIONS.map(a => (
              <button key={a.label} onClick={() => sendMessage(a.prompt)} className="flex items-center gap-1.5 px-3 py-1.5 bg-dashCard border border-dashSurface2 rounded-lg text-xs text-dashMuted hover:text-dashText transition-colors">
                <a.icon size={12} /> {a.label}
              </button>
            ))}
          </div>
          {/* Input */}
          <div className="px-6 py-3 border-t border-dashSurface2 shrink-0">
            <form onSubmit={e => { e.preventDefault(); sendMessage() }} className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask Theo about your finances..." className="flex-1 bg-dashCard border border-dashSurface2 rounded-lg px-4 py-2.5 text-sm text-dashText focus:outline-none focus:ring-2 focus:ring-accent" />
              <button type="submit" disabled={loading || !input.trim()} className="px-4 py-2.5 bg-accent text-white rounded-lg disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </div>
        </>
      )}

      {/* Tax tab */}
      {tab === 'tax' && (
        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto text-center py-16">
            <Calculator size={48} className="text-dashMuted mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-dashText mb-2">Tax Overview</h2>
            <p className="text-dashMuted mb-4">Upload financial documents first, then ask Theo to generate your tax summary.</p>
            <button onClick={() => { setTab('chat'); sendMessage('Generate a comprehensive tax overview based on my uploaded documents') }} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium">Generate Tax Summary →</button>
          </div>
        </div>
      )}

      {/* Expenses tab */}
      {tab === 'expenses' && (
        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto text-center py-16">
            <PieChart size={48} className="text-dashMuted mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-dashText mb-2">Expense Tracker</h2>
            <p className="text-dashMuted mb-4">Upload receipts or bank statements to auto-categorise your expenses.</p>
            <button onClick={() => { setTab('chat'); sendMessage('Categorise and summarise all expenses from my uploaded documents') }} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium">Analyse Expenses →</button>
          </div>
        </div>
      )}
      </>)}
    </div>
  )
}
