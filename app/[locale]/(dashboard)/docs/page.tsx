'use client'

import { useState } from 'react'
import { FileText, ChevronRight, Copy, Check, Download, BookOpen, Briefcase, BarChart2, FileSpreadsheet, Building2, Receipt, FileSignature, Megaphone, Newspaper, Mail } from 'lucide-react'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import type { DocumentType, DocumentOutput } from '@/lib/agents/documentAgent'

// ─── Document types ───────────────────────────────────────────────────────────

const DOC_TYPES: Array<{
  type: DocumentType
  label: string
  icon: React.ElementType
  desc: string
}> = [
  { type: 'report', label: 'Report', icon: BarChart2, desc: 'Analytical report with findings & recommendations' },
  { type: 'proposal', label: 'Proposal', icon: Briefcase, desc: 'Professional business proposal' },
  { type: 'presentation', label: 'Presentation', icon: BookOpen, desc: 'Slide-by-slide presentation deck' },
  { type: 'spreadsheet', label: 'Spreadsheet', icon: FileSpreadsheet, desc: 'Structured data template with formulas' },
  { type: 'business_plan', label: 'Business Plan', icon: Building2, desc: 'Full business plan with financials' },
  { type: 'email_sequence', label: 'Email Sequence', icon: Mail, desc: 'Multi-email sequence with subject lines' },
  { type: 'contract', label: 'Contract', icon: FileSignature, desc: 'Legal contract or agreement document' },
  { type: 'marketing_brief', label: 'Marketing Brief', icon: Megaphone, desc: 'Detailed marketing brief with channels' },
  { type: 'press_release', label: 'Press Release', icon: Newspaper, desc: 'Professionally formatted press release' },
]

const TONE_OPTIONS = ['Professional', 'Conversational', 'Persuasive']

// ─── CopyButton ───────────────────────────────────────────────────────────────

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A2332] text-[#94A3B8] hover:text-[#EEF2FF] text-sm transition-colors"
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [audience, setAudience] = useState('')
  const [tone, setTone] = useState('Professional')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DocumentOutput | null>(null)
  const [error, setError] = useState('')
  const [showDownload, setShowDownload] = useState(false)

  const handleSelectType = (type: DocumentType) => {
    setSelectedType(type)
    setStep(2)
  }

  const handleGenerate = async () => {
    if (!selectedType || !title || !description) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/docs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfileId: 'primary', // will be resolved server-side
          documentType: selectedType,
          title,
          description,
          audience,
          tone,
          locale: 'en',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Generation failed')
        return
      }
      setResult(data as DocumentOutput)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadHTML = () => {
    if (!result) return
    const blob = new Blob([result.htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.title.replace(/\s+/g, '-').toLowerCase()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedDocType = DOC_TYPES.find(d => d.type === selectedType)

  return (
    <div className="min-h-screen bg-[#080C14] px-6 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <FileText size={20} className="text-[#6366F1]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#EEF2FF]">ELEVO Docs™</h1>
              <p className="text-sm text-[#94A3B8]">Generate any business document in seconds</p>
            </div>
          </div>
        </div>

        {/* Step 1: Document type selection */}
        {!result && (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-[#6366F1] text-white' : 'bg-[#1A2332] text-[#94A3B8]'}`}>1</div>
                <span className="text-sm font-medium text-[#EEF2FF]">Choose document type</span>
                {selectedType && <ChevronRight size={14} className="text-[#94A3B8]" />}
                {selectedDocType && <span className="text-sm text-[#6366F1]">{selectedDocType.label}</span>}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {DOC_TYPES.map(doc => {
                  const Icon = doc.icon
                  const isSelected = selectedType === doc.type
                  return (
                    <button
                      key={doc.type}
                      onClick={() => handleSelectType(doc.type)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#6366F1] bg-[#6366F1]/10'
                          : 'border-[#1E2A3A] bg-[#1A2332] hover:border-[#6366F1]/40'
                      }`}
                    >
                      <Icon size={20} className={`mb-2 ${isSelected ? 'text-[#6366F1]' : 'text-[#94A3B8]'}`} />
                      <p className={`font-semibold text-sm ${isSelected ? 'text-[#EEF2FF]' : 'text-[#CBD5E1]'}`}>{doc.label}</p>
                      <p className="text-xs text-[#64748B] mt-0.5">{doc.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Step 2: Details */}
            {step === 2 && selectedType && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-[#6366F1] text-white">2</div>
                  <span className="text-sm font-medium text-[#EEF2FF]">Document details</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">Document Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={`e.g. Q4 Business Review, Partnership Proposal, ${selectedDocType?.label}`}
                    className="w-full bg-[#141B24] border border-[#1E2A3A] rounded-xl px-4 py-3 text-[#EEF2FF] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">Description / Purpose *</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    placeholder="What is this document for? What should it cover? Who is it for and what outcome do you want?"
                    className="w-full bg-[#141B24] border border-[#1E2A3A] rounded-xl px-4 py-3 text-[#EEF2FF] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">Target Audience</label>
                    <input
                      type="text"
                      value={audience}
                      onChange={e => setAudience(e.target.value)}
                      placeholder="e.g. Investors, New clients, Staff"
                      className="w-full bg-[#141B24] border border-[#1E2A3A] rounded-xl px-4 py-3 text-[#EEF2FF] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">Tone</label>
                    <div className="flex gap-2">
                      {TONE_OPTIONS.map(t => (
                        <button
                          key={t}
                          onClick={() => setTone(t)}
                          className={`flex-1 py-3 rounded-xl text-xs font-semibold border transition-colors ${
                            tone === t
                              ? 'border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1]'
                              : 'border-[#1E2A3A] bg-[#141B24] text-[#94A3B8] hover:border-[#6366F1]/40'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={loading || !title || !description}
                  className="w-full py-4 bg-[#6366F1] hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <AgentStatusIndicator status="thinking" agentName="Quill" />
                  ) : (
                    <>
                      <FileText size={18} />
                      Generate Document → 2 credits
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Action bar */}
            <div className="flex items-center justify-between bg-[#1A2332] rounded-xl px-4 py-3">
              <div>
                <p className="font-semibold text-[#EEF2FF]">{result.title}</p>
                <p className="text-xs text-[#64748B]">{result.wordCount.toLocaleString()} words · {result.documentType.replace('_', ' ')}</p>
              </div>
              <div className="flex items-center gap-2">
                <CopyButton text={result.markdownContent} label="Copy Markdown" />
                <CopyButton text={result.htmlContent} label="Copy HTML" />
                <button
                  onClick={handleDownloadHTML}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6366F1] text-white hover:bg-indigo-500 text-sm transition-colors"
                >
                  <Download size={14} />
                  Download HTML
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="px-3 py-1.5 rounded-lg bg-[#141B24] text-[#94A3B8] hover:text-[#EEF2FF] text-sm transition-colors"
                >
                  New doc
                </button>
              </div>
            </div>

            {/* Executive summary */}
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-3">Executive Summary</h3>
              <p className="text-sm text-[#CBD5E1] leading-relaxed whitespace-pre-line">{result.executiveSummary}</p>
            </div>

            {/* Key points */}
            <div className="bg-[#1A2332] rounded-xl p-5">
              <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Key Points</h3>
              <ul className="space-y-2">
                {result.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#CBD5E1]">
                    <span className="w-5 h-5 rounded-full bg-[#6366F1]/20 text-[#6366F1] text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Full document */}
            <div className="bg-[#0D1219] rounded-xl border border-[#1E2A3A] overflow-hidden">
              <div className="px-5 py-3 border-b border-[#1E2A3A] flex items-center justify-between">
                <p className="text-sm font-medium text-[#EEF2FF]">Full Document</p>
                <CopyButton text={result.markdownContent} />
              </div>
              <div className="p-5 space-y-6 max-h-[600px] overflow-y-auto">
                {result.sections.map((section, i) => (
                  <div key={i}>
                    <h2 className="text-lg font-bold text-[#EEF2FF] mb-3 pb-2 border-b border-[#1E2A3A]">{section.heading}</h2>
                    <p className="text-sm text-[#CBD5E1] leading-relaxed whitespace-pre-line">{section.content}</p>

                    {section.tableData && section.tableData.length > 0 && (
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr>
                              {Object.keys(section.tableData[0]).map(k => (
                                <th key={k} className="bg-[#6366F1]/20 text-[#6366F1] px-3 py-2 text-left font-semibold">{k}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {section.tableData.map((row, ri) => (
                              <tr key={ri} className={ri % 2 === 0 ? 'bg-[#141B24]' : 'bg-[#1A2332]'}>
                                {Object.values(row).map((v, vi) => (
                                  <td key={vi} className="px-3 py-2 text-[#CBD5E1]">{v}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {section.subsections?.map((sub, si) => (
                      <div key={si} className="mt-4 pl-4 border-l-2 border-[#6366F1]/30">
                        <h3 className="text-sm font-semibold text-[#A5B4FC] mb-2">{sub.heading}</h3>
                        <p className="text-sm text-[#94A3B8] leading-relaxed whitespace-pre-line">{sub.content}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Download instructions */}
            <div className="bg-[#1A2332] rounded-xl p-5">
              <button
                onClick={() => setShowDownload(!showDownload)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-sm font-semibold text-[#EEF2FF]">How to download as Word / PDF / Google Docs</span>
                <ChevronRight size={16} className={`text-[#94A3B8] transition-transform ${showDownload ? 'rotate-90' : ''}`} />
              </button>
              {showDownload && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {Object.entries(result.downloadInstructions).map(([platform, instructions]) => (
                    <div key={platform} className="bg-[#141B24] rounded-lg p-4">
                      <p className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-2 capitalize">{platform.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-xs text-[#94A3B8] leading-relaxed">{instructions}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
