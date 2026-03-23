'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { Brain, Loader2, Download, ChevronDown, ChevronUp, Lock } from 'lucide-react'

type OutputFormat = 'document' | 'presentation' | 'spreadsheet' | 'report'

interface DeepSection {
  title: string
  content: string
}

interface DeepResult {
  sections: DeepSection[]
  keyFindings: string[]
  recommendations: string[]
  downloadableContent: string
}

interface DeepPageProps {
  userPlan?: string
}

export default function DeepPage() {
  const locale = useLocale()
  const [task, setTask] = useState('')
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('report')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DeepResult | null>(null)
  const [error, setError] = useState('')
  const [expandedSection, setExpandedSection] = useState<number | null>(0)
  const [userPlan, setUserPlan] = useState<string | null>(null)
  const isGalaxy = userPlan === null || userPlan === 'galaxy'

  const formats: { value: OutputFormat; label: string; desc: string; icon: string }[] = [
    { value: 'report', label: 'Report', desc: 'Detailed analysis report', icon: '📊' },
    { value: 'document', label: 'Document', desc: 'Structured business document', icon: '📄' },
    { value: 'presentation', label: 'Presentation', desc: 'Slide-ready content', icon: '📽️' },
    { value: 'spreadsheet', label: 'Spreadsheet', desc: 'Data and projections', icon: '📈' },
  ]

  async function handleExecute() {
    if (!task.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/deep/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, outputFormat }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 403) {
          setError('ELEVO Deep™ requires the Galaxy plan. Please upgrade to access this feature.')
          setUserPlan('trial')
          return
        }
        throw new Error(data.error ?? 'Execution failed')
      }
      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function downloadContent() {
    if (!result) return
    const blob = new Blob([result.downloadableContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `elevo-deep-${outputFormat}-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#080C14]">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#6366F1]/10 rounded-2xl flex items-center justify-center shrink-0">
            <Brain size={22} className="text-[#6366F1]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#EEF2FF]">ELEVO Deep™</h1>
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-medium">Galaxy</span>
            </div>
            <p className="text-sm text-[#94A3B8] mt-0.5">Complex multi-step business execution — 10 credits per task</p>
          </div>
        </div>

        {userPlan === 'trial' && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Lock size={20} className="text-amber-400" />
              <h3 className="font-semibold text-amber-400">Galaxy Plan Required</h3>
            </div>
            <p className="text-sm text-[#9CA3AF] mb-4">
              ELEVO Deep™ handles your most complex business challenges using Claude Opus with maximum effort.
              It requires the Galaxy plan (£149/mo).
            </p>
            <Link
              href={`/${locale}/pricing`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white font-semibold rounded-xl text-sm hover:bg-[#5254CC] transition-colors"
            >
              Upgrade to Galaxy →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Input */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#1A2332] rounded-2xl border border-[#161F2E] p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2 block">
                  Describe Your Task
                </label>
                <textarea
                  value={task}
                  onChange={e => setTask(e.target.value)}
                  placeholder="e.g. Create a complete 12-month business growth plan for my plumbing company targeting residential customers in Manchester, including pricing strategy, marketing calendar, team structure, and financial projections..."
                  rows={8}
                  className="w-full bg-[#141B24] border border-[#1E2A3A] rounded-xl px-4 py-3 text-sm text-[#EEF2FF] placeholder:text-[#4B5563] focus:outline-none focus:border-[#6366F1] resize-none"
                />
                <p className="text-xs text-[#4B5563] mt-1">Be as specific as possible for best results</p>
              </div>

              {/* Output format */}
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2 block">Output Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {formats.map(f => (
                    <button
                      key={f.value}
                      onClick={() => setOutputFormat(f.value)}
                      className={`px-3 py-2.5 rounded-xl text-left transition-all border ${
                        outputFormat === f.value
                          ? 'bg-[#6366F1]/10 border-[#6366F1]/40 text-[#6366F1]'
                          : 'bg-[#141B24] border-[#1E2A3A] text-[#94A3B8] hover:border-[#6366F1]/20'
                      }`}
                    >
                      <span className="text-base">{f.icon}</span>
                      <p className="text-sm font-medium mt-0.5">{f.label}</p>
                      <p className="text-xs opacity-70">{f.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleExecute}
                disabled={!task.trim() || loading}
                className="w-full py-3 bg-[#6366F1] hover:bg-[#5254CC] disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Executing (this may take 1-2 min)...</>
                ) : (
                  <><Brain size={16} /> Deep Execute</>
                )}
              </button>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">{error}</div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            {!result && !loading && (
              <div className="bg-[#1A2332] border border-[#161F2E] rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                <Brain size={48} className="text-[#6366F1]/20 mx-auto mb-4" />
                <p className="text-[#EEF2FF] font-semibold text-lg mb-2">Ready for deep execution</p>
                <p className="text-sm text-[#94A3B8] max-w-xs">
                  Describe your task and ELEVO Deep™ will produce a complete, professional-grade deliverable.
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-[#1A2332] border border-[#161F2E] rounded-2xl p-8 text-center">
                <Brain size={40} className="text-[#6366F1] mx-auto mb-4 animate-pulse" />
                <p className="text-[#EEF2FF] font-semibold mb-2">Deep execution in progress...</p>
                <p className="text-sm text-[#94A3B8]">Claude Opus is working at maximum effort. This typically takes 60-90 seconds for complex tasks.</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#1A2332] border border-[#161F2E] rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-[#6366F1]">{result.sections.length}</p>
                    <p className="text-xs text-[#94A3B8]">Sections</p>
                  </div>
                  <div className="bg-[#1A2332] border border-[#161F2E] rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-[#6366F1]">{result.keyFindings.length}</p>
                    <p className="text-xs text-[#94A3B8]">Key Findings</p>
                  </div>
                  <div className="bg-[#1A2332] border border-[#161F2E] rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-[#6366F1]">{result.recommendations.length}</p>
                    <p className="text-xs text-[#94A3B8]">Actions</p>
                  </div>
                </div>

                {/* Download button */}
                <button
                  onClick={downloadContent}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1A2332] border border-[#161F2E] hover:border-[#6366F1]/30 text-[#EEF2FF] text-sm font-medium rounded-xl transition-colors"
                >
                  <Download size={15} className="text-[#6366F1]" />
                  Download as Markdown
                </button>

                {/* Key findings */}
                <div className="bg-[#1A2332] border border-[#161F2E] rounded-xl p-4">
                  <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Key Findings</p>
                  <ul className="space-y-1.5">
                    {result.keyFindings.map((f, i) => (
                      <li key={i} className="text-sm text-[#EEF2FF] flex items-start gap-2">
                        <span className="text-[#6366F1] font-bold shrink-0">{i + 1}.</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sections accordion */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Sections</p>
                  {result.sections.map((section, i) => (
                    <div key={i} className="bg-[#1A2332] border border-[#161F2E] rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedSection(expandedSection === i ? null : i)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#141B24] transition-colors text-left"
                      >
                        <span className="text-sm font-medium text-[#EEF2FF]">{section.title}</span>
                        {expandedSection === i
                          ? <ChevronUp size={14} className="text-[#94A3B8] shrink-0" />
                          : <ChevronDown size={14} className="text-[#94A3B8] shrink-0" />
                        }
                      </button>
                      {expandedSection === i && (
                        <div className="px-4 pb-4">
                          <p className="text-sm text-[#9CA3AF] whitespace-pre-wrap leading-relaxed">{section.content}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div className="bg-[#6366F1]/5 border border-[#6366F1]/20 rounded-xl p-4">
                  <p className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-3">Recommended Actions</p>
                  <ul className="space-y-1.5">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-[#EEF2FF] flex items-start gap-2">
                        <span className="text-[#6366F1] shrink-0">→</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
