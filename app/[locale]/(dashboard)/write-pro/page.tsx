'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { PenLine, Loader2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'

type Tone = 'professional' | 'conversational' | 'persuasive' | 'friendly'

interface HumaniseResult {
  rewritten: string
  changes: string[]
  readabilityScore: string
  humanScore: string
  alternativeVersions: string[]
}

export default function WriteProPage() {
  const locale = useLocale()
  const [text, setText] = useState('')
  const [tone, setTone] = useState<Tone>('conversational')
  const [brandVoice, setBrandVoice] = useState('')
  const [platform, setPlatform] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<HumaniseResult | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [showAlts, setShowAlts] = useState(false)

  const tones: { value: Tone; label: string; desc: string }[] = [
    { value: 'professional', label: 'Professional', desc: 'Authoritative, clear, business-ready' },
    { value: 'conversational', label: 'Conversational', desc: 'Natural, warm, like talking to a friend' },
    { value: 'persuasive', label: 'Persuasive', desc: 'Compelling, action-oriented, sales-focused' },
    { value: 'friendly', label: 'Friendly', desc: 'Approachable, positive, community feel' },
  ]

  async function handleHumanise() {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/write-pro/humanise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetTone: tone, brandVoice, platform }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Humanisation failed')
      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function copyText(content: string, key: string) {
    navigator.clipboard.writeText(content)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-[#080C14]">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#6366F1]/10 rounded-2xl flex items-center justify-center shrink-0">
            <PenLine size={22} className="text-[#6366F1]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#EEF2FF]">ELEVO Write Pro™</h1>
            <p className="text-sm text-[#94A3B8] mt-0.5">Make AI text sound naturally human — 1 credit per use</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input panel */}
          <div className="space-y-4">
            <div className="bg-[#1A2332] rounded-2xl border border-[#161F2E] p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2 block">
                  Paste your AI-generated text
                </label>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Paste any AI-generated text here — blog post, social caption, email, product description..."
                  rows={8}
                  className="w-full bg-[#141B24] border border-[#1E2A3A] rounded-xl px-4 py-3 text-sm text-[#EEF2FF] placeholder:text-[#4B5563] focus:outline-none focus:border-[#6366F1] resize-none"
                />
                <p className="text-xs text-[#4B5563] mt-1">{text.length} characters</p>
              </div>

              {/* Tone selector */}
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2 block">Target Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {tones.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      className={`px-3 py-2.5 rounded-xl text-left transition-all border ${
                        tone === t.value
                          ? 'bg-[#6366F1]/10 border-[#6366F1]/40 text-[#6366F1]'
                          : 'bg-[#141B24] border-[#1E2A3A] text-[#94A3B8] hover:border-[#6366F1]/20'
                      }`}
                    >
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="text-xs opacity-70 mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#94A3B8] mb-1 block">Brand Voice (optional)</label>
                  <input
                    type="text"
                    value={brandVoice}
                    onChange={e => setBrandVoice(e.target.value)}
                    placeholder="e.g. bold, witty, trustworthy"
                    className="w-full bg-[#141B24] border border-[#1E2A3A] rounded-xl px-3 py-2 text-sm text-[#EEF2FF] placeholder:text-[#4B5563] focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8] mb-1 block">Platform (optional)</label>
                  <input
                    type="text"
                    value={platform}
                    onChange={e => setPlatform(e.target.value)}
                    placeholder="e.g. Instagram, LinkedIn"
                    className="w-full bg-[#141B24] border border-[#1E2A3A] rounded-xl px-3 py-2 text-sm text-[#EEF2FF] placeholder:text-[#4B5563] focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
              </div>

              <button
                onClick={handleHumanise}
                disabled={!text.trim() || loading}
                className="w-full py-3 bg-[#6366F1] hover:bg-[#5254CC] disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Humanising...</>
                ) : (
                  <><PenLine size={16} /> Humanise Text</>
                )}
              </button>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">{error}</div>
              )}
            </div>
          </div>

          {/* Results panel */}
          <div className="space-y-4">
            {!result && !loading && (
              <div className="bg-[#1A2332] border border-[#161F2E] rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center">
                <PenLine size={40} className="text-[#6366F1]/30 mx-auto mb-3" />
                <p className="text-[#EEF2FF] font-medium mb-1">Your humanised text will appear here</p>
                <p className="text-sm text-[#94A3B8]">Paste text and click Humanise to start</p>
              </div>
            )}

            {loading && (
              <div className="bg-[#1A2332] border border-[#161F2E] rounded-2xl p-8 text-center">
                <Loader2 size={32} className="animate-spin text-[#6366F1] mx-auto mb-3" />
                <p className="text-[#EEF2FF] font-medium">Humanising your text...</p>
                <p className="text-sm text-[#94A3B8] mt-1">Analysing tone, flow, and readability</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Scores */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1A2332] border border-[#161F2E] rounded-xl p-3 text-center">
                    <p className="text-xs text-[#94A3B8] mb-0.5">Readability</p>
                    <p className="text-sm font-semibold text-green-400">{result.readabilityScore}</p>
                  </div>
                  <div className="bg-[#1A2332] border border-[#161F2E] rounded-xl p-3 text-center">
                    <p className="text-xs text-[#94A3B8] mb-0.5">Human Score</p>
                    <p className="text-sm font-semibold text-[#6366F1]">{result.humanScore}</p>
                  </div>
                </div>

                {/* Main rewrite */}
                <div className="bg-[#1A2332] border border-[#161F2E] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Humanised Version</p>
                    <button
                      onClick={() => copyText(result.rewritten, 'main')}
                      className="flex items-center gap-1.5 text-xs text-[#6366F1] hover:text-[#818CF8] transition-colors"
                    >
                      {copied === 'main' ? <Check size={13} /> : <Copy size={13} />}
                      {copied === 'main' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-sm text-[#EEF2FF] leading-relaxed whitespace-pre-wrap">{result.rewritten}</p>
                </div>

                {/* Changes made */}
                {result.changes.length > 0 && (
                  <div className="bg-[#1A2332] border border-[#161F2E] rounded-xl p-4">
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Changes Made</p>
                    <ul className="space-y-1">
                      {result.changes.map((change, i) => (
                        <li key={i} className="text-xs text-[#9CA3AF] flex items-start gap-2">
                          <span className="text-[#6366F1] mt-0.5">•</span>
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Alternative versions */}
                {result.alternativeVersions && result.alternativeVersions.length > 0 && (
                  <div className="bg-[#1A2332] border border-[#161F2E] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowAlts(p => !p)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#141B24] transition-colors"
                    >
                      <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                        {result.alternativeVersions.length} Alternative Version{result.alternativeVersions.length > 1 ? 's' : ''}
                      </p>
                      {showAlts ? <ChevronUp size={14} className="text-[#94A3B8]" /> : <ChevronDown size={14} className="text-[#94A3B8]" />}
                    </button>
                    {showAlts && (
                      <div className="px-4 pb-4 space-y-3">
                        {result.alternativeVersions.map((alt, i) => (
                          <div key={i} className="bg-[#141B24] rounded-xl p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs text-[#6B7280]">Version {i + 2}</p>
                              <button
                                onClick={() => copyText(alt, `alt-${i}`)}
                                className="text-xs text-[#6366F1] hover:text-[#818CF8] transition-colors flex items-center gap-1"
                              >
                                {copied === `alt-${i}` ? <Check size={11} /> : <Copy size={11} />}
                                {copied === `alt-${i}` ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <p className="text-xs text-[#EEF2FF] leading-relaxed">{alt}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
