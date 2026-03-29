'use client'

import { useState } from 'react'
import { Wrench, Globe, Monitor, Smartphone, Settings, Calendar, Copy, Check, Download, ExternalLink, ChevronRight, Code2 } from 'lucide-react'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import type { BuildType, BuildOutput } from '@/lib/agents/appBuilderAgent'

// ─── Build types ──────────────────────────────────────────────────────────────

const BUILD_TYPES: Array<{
  type: BuildType
  label: string
  icon: React.ElementType
  desc: string
}> = [
  { type: 'landing_page', label: 'Landing Page', icon: Globe, desc: 'Convert visitors into customers' },
  { type: 'full_website', label: 'Full Website', icon: Monitor, desc: 'Multi-page business website' },
  { type: 'web_app', label: 'Web App', icon: Settings, desc: 'SaaS or web application' },
  { type: 'mobile_concept', label: 'Mobile Concept', icon: Smartphone, desc: 'iOS/Android app concept' },
  { type: 'internal_tool', label: 'Internal Tool', icon: Wrench, desc: 'Staff-facing dashboard or tool' },
  { type: 'booking_system', label: 'Booking System', icon: Calendar, desc: 'Appointment booking page' },
]

const STYLE_OPTIONS = ['Minimal', 'Bold', 'Professional', 'Playful']

type OutputTab = 'preview' | 'code' | 'architecture' | 'deploy' | 'seo'

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

export default function BuildAppPage() {
  const [selectedType, setSelectedType] = useState<BuildType | null>(null)
  const [description, setDescription] = useState('')
  const [style, setStyle] = useState('Professional')
  const [pages, setPages] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BuildOutput | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<OutputTab>('preview')

  const showPages = selectedType === 'full_website' || selectedType === 'web_app'

  const handleGenerate = async () => {
    if (!selectedType || !description) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/build-app/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfileId: 'primary',
          buildType: selectedType,
          description,
          style,
          pages: pages ? pages.split(',').map(p => p.trim()).filter(Boolean) : undefined,
          locale: 'en',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Build failed')
        return
      }
      setResult(data as BuildOutput)
      setActiveTab('preview')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadHTML = () => {
    if (!result?.htmlOutput) return
    const blob = new Blob([result.htmlOutput], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.projectName.replace(/\s+/g, '-').toLowerCase()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedBuildType = BUILD_TYPES.find(b => b.type === selectedType)

  const tabs: Array<{ key: OutputTab; label: string }> = [
    { key: 'preview', label: 'Preview' },
    { key: 'code', label: 'Code' },
    { key: 'architecture', label: 'Architecture' },
    { key: 'deploy', label: 'Deploy Guide' },
    { key: 'seo', label: 'SEO' },
  ]

  return (
    <div className="min-h-screen bg-[#080C14] px-6 py-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <Wrench size={20} className="text-[#6366F1]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#EEF2FF]">ELEVO Build™</h1>
              <p className="text-sm text-[#94A3B8]">Build anything from a prompt · Orbit+</p>
            </div>
          </div>
        </div>

        {!result ? (
          <div className="space-y-6">
            {/* Build type grid */}
            <div>
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">What do you want to build?</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {BUILD_TYPES.map(bt => {
                  const Icon = bt.icon
                  const isSelected = selectedType === bt.type
                  return (
                    <button
                      key={bt.type}
                      onClick={() => setSelectedType(bt.type)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#6366F1] bg-[#6366F1]/10'
                          : 'border-[#1E2A3A] bg-[#1A2332] hover:border-[#6366F1]/40'
                      }`}
                    >
                      <Icon size={20} className={`mb-2 ${isSelected ? 'text-[#6366F1]' : 'text-[#94A3B8]'}`} />
                      <p className={`font-semibold text-sm ${isSelected ? 'text-[#EEF2FF]' : 'text-[#CBD5E1]'}`}>{bt.label}</p>
                      <p className="text-xs text-[#64748B] mt-0.5">{bt.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                Describe what you want to build *
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder={`e.g. A modern ${selectedBuildType?.label || 'website'} for my ${selectedBuildType?.type === 'landing_page' ? 'plumbing business with a hero, services, testimonials, and contact form' : 'business with all standard pages'}`}
                className="w-full bg-[#141B24] border border-[#1E2A3A] rounded-xl px-4 py-3 text-[#EEF2FF] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Style */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">Design Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                        style === s
                          ? 'border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1]'
                          : 'border-[#1E2A3A] bg-[#141B24] text-[#94A3B8] hover:border-[#6366F1]/40'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pages */}
              {showPages && (
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">Pages (comma-separated)</label>
                  <input
                    type="text"
                    value={pages}
                    onChange={e => setPages(e.target.value)}
                    placeholder="Home, About, Services, Contact, Blog"
                    className="w-full bg-[#141B24] border border-[#1E2A3A] rounded-xl px-4 py-3 text-[#EEF2FF] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] text-sm"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !selectedType || !description}
              className="w-full py-4 bg-[#6366F1] hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <AgentStatusIndicator status="analyzing" agentName="Forge" />
              ) : (
                <>
                  <Wrench size={18} />
                  Build it → 5 credits
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top bar */}
            <div className="flex items-center justify-between bg-[#1A2332] rounded-xl px-4 py-3">
              <div>
                <p className="font-semibold text-[#EEF2FF]">{result.projectName}</p>
                <p className="text-xs text-[#64748B]">{result.buildType.replace('_', ' ')}</p>
              </div>
              <div className="flex items-center gap-2">
                {result.htmlOutput && (
                  <>
                    <button
                      onClick={handleDownloadHTML}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6366F1] text-white hover:bg-indigo-500 text-sm transition-colors"
                    >
                      <Download size={14} />
                      Download HTML
                    </button>
                    <a
                      href={`/stitch?prompt=${encodeURIComponent(result.stitchPrompt)}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A2332] text-[#6366F1] border border-[#6366F1]/30 hover:bg-[#6366F1]/10 text-sm transition-colors"
                    >
                      <ExternalLink size={14} />
                      Open in Stitch™
                    </a>
                  </>
                )}
                <button
                  onClick={() => setResult(null)}
                  className="px-3 py-1.5 rounded-lg bg-[#141B24] text-[#94A3B8] hover:text-[#EEF2FF] text-sm transition-colors"
                >
                  New build
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-[#141B24] rounded-xl p-1">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === tab.key
                      ? 'bg-[#1A2332] text-[#EEF2FF]'
                      : 'text-[#64748B] hover:text-[#94A3B8]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-[#0D1219] rounded-xl border border-[#1E2A3A] overflow-hidden">
              {activeTab === 'preview' && (
                result.htmlOutput ? (
                  <iframe
                    srcDoc={result.htmlOutput}
                    className="w-full h-[600px] border-0"
                    title="Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <div className="p-8 text-center text-[#64748B]">
                    <p className="text-sm">No HTML preview available for this build type.</p>
                    <p className="text-xs mt-1">Check the Architecture tab for the project structure.</p>
                  </div>
                )
              )}

              {activeTab === 'code' && (
                <div className="relative">
                  <div className="absolute top-3 right-3">
                    <CopyButton text={result.htmlOutput || ''} label="Copy HTML" />
                  </div>
                  <pre className="p-5 text-xs text-[#94A3B8] overflow-auto max-h-[600px] font-mono leading-relaxed">
                    {result.htmlOutput || 'No code output for this build type.'}
                  </pre>
                </div>
              )}

              {activeTab === 'architecture' && (
                <div className="p-6 space-y-4">
                  {result.architecture ? (
                    <>
                      <div>
                        <h3 className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-3">Tech Stack</h3>
                        <div className="flex flex-wrap gap-2">
                          {result.architecture.techStack.map(t => (
                            <span key={t} className="bg-[#1A2332] border border-[#1E2A3A] text-[#CBD5E1] px-3 py-1 rounded-lg text-xs">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-3">File Structure</h3>
                        <pre className="bg-[#141B24] rounded-lg p-4 text-xs text-[#94A3B8] font-mono overflow-auto">{result.architecture.fileStructure}</pre>
                      </div>
                      {result.architecture.apiRoutes && (
                        <div>
                          <h3 className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-3">API Routes</h3>
                          <ul className="space-y-1">
                            {result.architecture.apiRoutes.map((r, i) => (
                              <li key={i} className="text-xs text-[#94A3B8] font-mono bg-[#141B24] px-3 py-2 rounded-lg">{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : result.mobileScreens ? (
                    <div className="grid grid-cols-2 gap-4">
                      {result.mobileScreens.map((screen, i) => (
                        <div key={i} className="bg-[#1A2332] rounded-xl p-4">
                          <p className="font-semibold text-[#EEF2FF] mb-1 text-sm">{screen.screenName}</p>
                          <p className="text-xs text-[#94A3B8] mb-3">{screen.description}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {screen.components.map(c => (
                              <span key={c} className="bg-[#141B24] text-[#64748B] px-2 py-0.5 rounded text-xs">{c}</span>
                            ))}
                          </div>
                          <p className="text-xs text-[#6366F1]">→ {screen.navigationFlow}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#64748B]">Architecture details not available for this build type.</p>
                  )}
                </div>
              )}

              {activeTab === 'deploy' && (
                <div className="p-6 space-y-4">
                  <div className="bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-xl p-4">
                    <p className="text-sm font-semibold text-[#6366F1] mb-1">{result.deployGuide.hostingOption}</p>
                    <p className="text-xs text-[#94A3B8]">Estimated cost: {result.deployGuide.estimatedCost}</p>
                    <p className="text-xs text-[#94A3B8]">Suggested domain: {result.deployGuide.domainSuggestion}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Deployment Steps</h3>
                    <ol className="space-y-2">
                      {result.deployGuide.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[#CBD5E1]">
                          <span className="w-6 h-6 rounded-full bg-[#6366F1]/20 text-[#6366F1] text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider block mb-1">Page Title</label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-[#EEF2FF] bg-[#141B24] rounded-lg px-3 py-2 flex-1">{result.seoMeta.title}</p>
                      <CopyButton text={result.seoMeta.title} />
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">{result.seoMeta.title.length} / 60 chars</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider block mb-1">Meta Description</label>
                    <div className="flex items-start gap-2">
                      <p className="text-sm text-[#EEF2FF] bg-[#141B24] rounded-lg px-3 py-2 flex-1">{result.seoMeta.description}</p>
                      <CopyButton text={result.seoMeta.description} />
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">{result.seoMeta.description.length} / 155 chars</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider block mb-1">Target Keywords</label>
                    <div className="flex flex-wrap gap-2">
                      {result.seoMeta.keywords.map(k => (
                        <span key={k} className="bg-[#1A2332] border border-[#1E2A3A] text-[#94A3B8] px-3 py-1 rounded-lg text-xs">{k}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider block mb-1">Copy Headlines</label>
                    <div className="space-y-2">
                      <div className="bg-[#141B24] rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-[#64748B] mb-0.5">Headline</p>
                          <p className="text-sm text-[#EEF2FF]">{result.copyContent.headline}</p>
                        </div>
                        <CopyButton text={result.copyContent.headline} />
                      </div>
                      <div className="bg-[#141B24] rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-[#64748B] mb-0.5">Subheadline</p>
                          <p className="text-sm text-[#EEF2FF]">{result.copyContent.subheadline}</p>
                        </div>
                        <CopyButton text={result.copyContent.subheadline} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ELEVO Stitch prompt */}
            <div className="bg-[#1A2332] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#EEF2FF] flex items-center gap-2">
                  <Code2 size={14} className="text-[#6366F1]" />
                  ELEVO Stitch™ Prompt
                </h3>
                <CopyButton text={result.stitchPrompt} label="Copy prompt" />
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">{result.stitchPrompt}</p>
              <a
                href="/stitch"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#6366F1] hover:text-indigo-400 transition-colors"
              >
                <ChevronRight size={12} />
                Open ELEVO Stitch™ →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
