'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import {
  Paintbrush, Globe, Layers, Wand2, Loader2, Code, Eye,
  Monitor, Smartphone, Moon, Sun, Copy, CheckCircle2, AlertTriangle,
} from 'lucide-react'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import ActionExplanation from '@/components/shared/ActionExplanation'
import CopyButton from '@/components/shared/CopyButton'
import { cn } from '@/lib/utils'
import type {
  UIComponentResult,
  SiteAnalysisResult,
  FullWebsiteResult,
  ComponentType,
  DesignStyle,
} from '@/lib/agents/stitchDesignAgent'

type Tab = 'component' | 'analyse' | 'website' | 'preview' | 'library'
type Status = 'idle' | 'loading' | 'done' | 'error'

const COMPONENT_TYPES: ComponentType[] = [
  'Hero', 'Navbar', 'Pricing', 'CTA', 'Form', 'Card', 'Footer', 'Testimonials', 'Features', 'FAQ', 'Team', 'Gallery',
]

const DESIGN_STYLES: { value: DesignStyle; label: string; desc: string }[] = [
  { value: 'modern', label: 'Modern', desc: 'Clean, professional' },
  { value: 'minimal', label: 'Minimal', desc: 'White space focused' },
  { value: 'bold', label: 'Bold', desc: 'High contrast, strong' },
  { value: 'playful', label: 'Playful', desc: 'Colourful, fun' },
  { value: 'luxury', label: 'Luxury', desc: 'Premium, refined' },
]

const SEVERITY_COLOR = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/20',
  major: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  minor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

const WEBSITE_PAGES = ['Home', 'About', 'Services', 'Contact', 'Pricing', 'Blog', 'FAQ', 'Portfolio']

export default function StitchPage() {
  const locale = useLocale()

  const [tab, setTab] = useState<Tab>('component')

  // Component tab
  const [compStatus, setCompStatus] = useState<Status>('idle')
  const [compError, setCompError] = useState('')
  const [compResult, setCompResult] = useState<UIComponentResult | null>(null)
  const [componentType, setComponentType] = useState<ComponentType>('Hero')
  const [designStyle, setDesignStyle] = useState<DesignStyle>('modern')
  const [compDescription, setCompDescription] = useState('')
  const [framework, setFramework] = useState('HTML + Tailwind CSS')
  const [darkMode, setDarkMode] = useState(false)

  // Analyse tab
  const [analyseStatus, setAnalyseStatus] = useState<Status>('idle')
  const [analyseError, setAnalyseError] = useState('')
  const [analyseResult, setAnalyseResult] = useState<SiteAnalysisResult | null>(null)
  const [siteUrl, setSiteUrl] = useState('')
  const [improvementGoal, setImprovementGoal] = useState('')

  // Website tab
  const [websiteStatus, setWebsiteStatus] = useState<Status>('idle')
  const [websiteError, setWebsiteError] = useState('')
  const [websiteResult, setWebsiteResult] = useState<FullWebsiteResult | null>(null)
  const [selectedPages, setSelectedPages] = useState<string[]>(['Home', 'About', 'Services', 'Contact'])
  const [websiteStyle, setWebsiteStyle] = useState<DesignStyle>('modern')

  // Preview
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewPage, setPreviewPage] = useState(0)

  function togglePage(page: string) {
    setSelectedPages(prev =>
      prev.includes(page) ? prev.filter(p => p !== page) : [...prev, page]
    )
  }

  async function generateComponent() {
    if (!compDescription.trim()) return
    setCompStatus('loading')
    setCompError('')
    setCompResult(null)
    try {
      const res = await fetch(`/api/stitch/component`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentType, style: designStyle, description: compDescription, framework }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setCompResult(data.result)
      setCompStatus('done')
      setPreviewHtml(data.result.html)
      setTab('preview')
    } catch (e: unknown) {
      setCompError(e instanceof Error ? e.message : 'Something went wrong')
      setCompStatus('error')
    }
  }

  async function analyseSite() {
    if (!siteUrl.trim()) return
    setAnalyseStatus('loading')
    setAnalyseError('')
    setAnalyseResult(null)
    try {
      const res = await fetch(`/api/stitch/analyse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteUrl, improvementGoal: improvementGoal || 'improve conversions and design' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setAnalyseResult(data.result)
      setAnalyseStatus('done')
    } catch (e: unknown) {
      setAnalyseError(e instanceof Error ? e.message : 'Something went wrong')
      setAnalyseStatus('error')
    }
  }

  async function generateWebsite() {
    if (selectedPages.length === 0) return
    setWebsiteStatus('loading')
    setWebsiteError('')
    setWebsiteResult(null)
    try {
      const res = await fetch(`/api/stitch/website`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: selectedPages, style: websiteStyle }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setWebsiteResult(data.result)
      setWebsiteStatus('done')
      if (data.result.pages?.[0]) {
        setPreviewHtml(data.result.pages[0].html)
        setPreviewPage(0)
        setTab('preview')
      }
    } catch (e: unknown) {
      setWebsiteError(e instanceof Error ? e.message : 'Something went wrong')
      setWebsiteStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-dashBg p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Paintbrush size={20} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-dashText">ELEVO Stitch™</h1>
            <p className="text-sm text-dashMuted">AI Web Design Studio — by Mila</p>
          </div>
          <span className="ml-auto text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full font-semibold">
            ✏️ Orbit+
          </span>
        </div>
        <p className="text-dashMuted text-sm mt-1">
          Generate stunning UI components, analyse and improve your website, or build a complete multi-page site.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-dashSurface rounded-xl p-1 w-fit flex-wrap">
        {([
          { key: 'component', label: 'Component', icon: Layers },
          { key: 'analyse', label: 'Analyse Site', icon: Globe },
          { key: 'website', label: 'Full Website', icon: Wand2 },
          { key: 'preview', label: 'Preview', icon: Eye },
          { key: 'library', label: 'Component Library', icon: Code },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === t.key ? 'bg-accent text-white' : 'text-dashMuted hover:text-dashText'
            )}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Component Tab ── */}
      {tab === 'component' && (
        <div className="space-y-6">
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
            <h2 className="text-base font-semibold text-dashText mb-4">Generate a UI Component</h2>

            {/* Component type */}
            <div className="mb-4">
              <label className="text-xs text-dashMuted mb-2 block">Component type</label>
              <div className="flex flex-wrap gap-2">
                {COMPONENT_TYPES.map(ct => (
                  <button
                    key={ct}
                    onClick={() => setComponentType(ct)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                      componentType === ct
                        ? 'bg-accent/10 border-accent text-accent'
                        : 'border-dashSurface2 text-dashMuted hover:text-dashText'
                    )}
                  >
                    {ct}
                  </button>
                ))}
              </div>
            </div>

            {/* Design style */}
            <div className="mb-4">
              <label className="text-xs text-dashMuted mb-2 block">Design style</label>
              <div className="flex flex-wrap gap-2">
                {DESIGN_STYLES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setDesignStyle(s.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                      designStyle === s.value
                        ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                        : 'border-dashSurface2 text-dashMuted hover:text-dashText'
                    )}
                  >
                    {s.label}
                    <span className="text-dashMuted ml-1">— {s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Framework */}
            <div className="mb-4">
              <label className="text-xs text-dashMuted mb-1.5 block">Framework</label>
              <select
                value={framework}
                onChange={e => setFramework(e.target.value)}
                className="bg-dashSurface border border-dashSurface2 text-dashText text-sm rounded-lg px-3 py-2"
              >
                {['HTML + Tailwind CSS', 'React + Tailwind', 'Next.js + Tailwind', 'Vue + Tailwind', 'Plain HTML + CSS'].map(f => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <textarea
              value={compDescription}
              onChange={e => setCompDescription(e.target.value)}
              placeholder={`Describe your ${componentType}. e.g. "A hero section for a local plumbing business with a bold headline, trust badges (24/7, licensed, insured), and a large call-now button"`}
              rows={4}
              className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-4 py-3 text-dashText text-sm placeholder:text-dashMuted resize-none mb-4"
            />

            <button
              onClick={generateComponent}
              disabled={compStatus === 'loading' || !compDescription.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {compStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Paintbrush size={16} />}
              {compStatus === 'loading' ? 'Mila is designing…' : 'Generate Component — 2 credits'}
            </button>
          </div>

          {compStatus === 'loading' && <AgentStatusIndicator agentName="ELEVO Stitch™" status="generating" />}
          {compError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">{compError}</div>}

          {compResult && compStatus === 'done' && (
            <div className="space-y-4">
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-dashText flex items-center gap-2"><Code size={16} /> Generated Code</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setPreviewHtml(darkMode ? compResult.darkModeVariant : compResult.html); setTab('preview') }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-dashSurface text-dashMuted text-xs rounded-lg hover:text-dashText transition-colors"
                    >
                      <Eye size={12} /> Preview
                    </button>
                    <CopyButton text={darkMode ? compResult.darkModeVariant : compResult.html} />
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => setDarkMode(false)}
                    className={cn('flex items-center gap-1.5 px-2 py-1 rounded text-xs', !darkMode ? 'bg-accent/10 text-accent' : 'text-dashMuted')}
                  >
                    <Sun size={11} /> Light
                  </button>
                  <button
                    onClick={() => setDarkMode(true)}
                    className={cn('flex items-center gap-1.5 px-2 py-1 rounded text-xs', darkMode ? 'bg-accent/10 text-accent' : 'text-dashMuted')}
                  >
                    <Moon size={11} /> Dark
                  </button>
                </div>
                <pre className="bg-dashSurface rounded-lg p-4 text-xs text-dashMuted overflow-x-auto max-h-64">
                  <code>{(darkMode ? compResult.darkModeVariant : compResult.html).slice(0, 1500)}…</code>
                </pre>
              </div>

              {compResult.imagePrompts.length > 0 && (
                <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
                  <h3 className="font-semibold text-dashText mb-3">Image Prompts (for Midjourney / DALL·E 3)</h3>
                  <div className="space-y-2">
                    {compResult.imagePrompts.map((prompt, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-dashSurface rounded-lg">
                        <span className="text-xs text-dashMuted flex-1">{prompt}</span>
                        <CopyButton text={prompt} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <ActionExplanation
                description="Component designed by Mila using Opus 4.6. Fully responsive, Tailwind-powered, WCAG 2.1 accessible. Paste the HTML into any webpage or Webflow/Framer/WordPress."
              />
            </div>
          )}
        </div>
      )}

      {/* ── Analyse Tab ── */}
      {tab === 'analyse' && (
        <div className="space-y-6">
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
            <h2 className="text-base font-semibold text-dashText mb-4">Analyse & Improve Your Website</h2>
            <div className="mb-4">
              <label className="text-xs text-dashMuted mb-1.5 block">Your website URL</label>
              <input
                type="url"
                value={siteUrl}
                onChange={e => setSiteUrl(e.target.value)}
                placeholder="https://yourbusiness.co.uk"
                className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-dashText text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="text-xs text-dashMuted mb-1.5 block">What do you want to improve?</label>
              <input
                type="text"
                value={improvementGoal}
                onChange={e => setImprovementGoal(e.target.value)}
                placeholder="e.g. increase bookings, look more professional, improve mobile experience"
                className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-dashText text-sm"
              />
            </div>
            <button
              onClick={analyseSite}
              disabled={analyseStatus === 'loading' || !siteUrl.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {analyseStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
              {analyseStatus === 'loading' ? 'Analysing site…' : 'Analyse Website — 3 credits'}
            </button>
          </div>

          {analyseStatus === 'loading' && <AgentStatusIndicator agentName="ELEVO Stitch™" status="analyzing" />}
          {analyseError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">{analyseError}</div>}

          {analyseResult && analyseStatus === 'done' && (
            <div className="space-y-4">
              {/* Issues */}
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                <h3 className="font-semibold text-dashText mb-4">Issues Found</h3>
                <div className="space-y-3">
                  {analyseResult.issues.map((issue, i) => (
                    <div key={i} className={cn('border rounded-lg p-4', SEVERITY_COLOR[issue.severity])}>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={14} />
                        <span className="text-xs font-bold uppercase">{issue.severity}</span>
                      </div>
                      <p className="text-sm text-dashText mb-2">{issue.issue}</p>
                      {issue.codeFix && (
                        <div className="flex items-start gap-2">
                          <pre className="text-xs bg-dashSurface rounded p-2 flex-1 overflow-x-auto">{issue.codeFix.slice(0, 300)}</pre>
                          <CopyButton text={issue.codeFix} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Design Recommendations */}
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                <h3 className="font-semibold text-dashText mb-4">Design Recommendations</h3>
                <div className="space-y-3">
                  {analyseResult.designRecommendations.map((rec, i) => (
                    <div key={i} className="border border-dashSurface2 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div>
                          <p className="text-xs text-red-400 font-semibold mb-1">Before</p>
                          <p className="text-xs text-dashMuted">{rec.before}</p>
                        </div>
                        <div>
                          <p className="text-xs text-green-400 font-semibold mb-1">After</p>
                          <p className="text-xs text-dashText">{rec.after}</p>
                        </div>
                      </div>
                      <p className="text-xs text-dashMuted italic">{rec.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sections to Add */}
              {analyseResult.sectionsToAdd.length > 0 && (
                <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                  <h3 className="font-semibold text-dashText mb-4">Sections to Add</h3>
                  <div className="space-y-3">
                    {analyseResult.sectionsToAdd.map((sec, i) => (
                      <div key={i} className="border border-dashSurface2 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-dashText">{sec.name}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setPreviewHtml(sec.html); setTab('preview') }}
                              className="flex items-center gap-1 text-xs text-dashMuted hover:text-dashText"
                            >
                              <Eye size={11} /> Preview
                            </button>
                            <CopyButton text={sec.html} />
                          </div>
                        </div>
                        <pre className="text-xs bg-dashSurface rounded p-2 overflow-x-auto max-h-32">{sec.html.slice(0, 300)}…</pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <ActionExplanation
                description="Website analysed using Opus 4.6 + web search. Issues prioritised by conversion impact. Copy each code fix and paste directly into your site editor."
              />
            </div>
          )}
        </div>
      )}

      {/* ── Full Website Tab ── */}
      {tab === 'website' && (
        <div className="space-y-6">
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
            <h2 className="text-base font-semibold text-dashText mb-4">Generate a Complete Website</h2>
            <p className="text-sm text-dashMuted mb-4">
              We'll use your business profile to build a production-ready, multi-page website with consistent branding.
            </p>

            {/* Pages */}
            <div className="mb-4">
              <label className="text-xs text-dashMuted mb-2 block">Pages to generate</label>
              <div className="flex flex-wrap gap-2">
                {WEBSITE_PAGES.map(page => (
                  <button
                    key={page}
                    onClick={() => togglePage(page)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                      selectedPages.includes(page)
                        ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                        : 'border-dashSurface2 text-dashMuted hover:text-dashText'
                    )}
                  >
                    {selectedPages.includes(page) && <CheckCircle2 size={10} />}
                    {page}
                  </button>
                ))}
              </div>
              <p className="text-xs text-dashMuted mt-1.5">{selectedPages.length} pages selected</p>
            </div>

            {/* Style */}
            <div className="mb-6">
              <label className="text-xs text-dashMuted mb-2 block">Design style</label>
              <div className="flex flex-wrap gap-2">
                {DESIGN_STYLES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setWebsiteStyle(s.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                      websiteStyle === s.value
                        ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                        : 'border-dashSurface2 text-dashMuted hover:text-dashText'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateWebsite}
              disabled={websiteStatus === 'loading' || selectedPages.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {websiteStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              {websiteStatus === 'loading' ? 'Building website…' : `Generate ${selectedPages.length} Pages — 10 credits`}
            </button>
          </div>

          {websiteStatus === 'loading' && <AgentStatusIndicator agentName="ELEVO Stitch™" status="generating" />}
          {websiteError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">{websiteError}</div>}

          {websiteResult && websiteStatus === 'done' && (
            <div className="space-y-4">
              {/* Pages list */}
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                <h3 className="font-semibold text-dashText mb-4">Your Website Pages</h3>
                <div className="space-y-3">
                  {websiteResult.pages.map((page, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-dashSurface rounded-lg">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                        <Monitor size={14} className="text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-dashText">{page.name}</p>
                        <p className="text-xs text-dashMuted">{page.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setPreviewHtml(page.html); setPreviewPage(i); setTab('preview') }}
                          className="flex items-center gap-1 text-xs text-dashMuted hover:text-dashText px-2 py-1 rounded"
                        >
                          <Eye size={11} /> Preview
                        </button>
                        <CopyButton text={page.html} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deploy instructions */}
              {websiteResult.deployInstructions && (
                <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                  <h3 className="font-semibold text-dashText mb-3">Deploy Instructions</h3>
                  <p className="text-sm text-dashMuted whitespace-pre-line">{websiteResult.deployInstructions}</p>
                </div>
              )}

              <ActionExplanation
                description="Complete website generated by Mila using Opus 4.6. All pages use Tailwind CDN, are mobile-first, and are ready to deploy to Vercel, Netlify, or any web host."
              />
            </div>
          )}
        </div>
      )}

      {/* ── Preview Tab ── */}
      {tab === 'preview' && (
        <div className="space-y-4">
          {previewHtml ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-dashSurface text-dashMuted text-xs rounded-lg">
                    <Monitor size={12} /> Desktop
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-dashSurface text-dashMuted text-xs rounded-lg">
                    <Smartphone size={12} /> Mobile
                  </button>
                </div>
                <CopyButton text={previewHtml} />
              </div>
              <div className="bg-white rounded-xl border border-dashSurface2 overflow-hidden" style={{ height: '70vh' }}>
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full"
                  title="Component Preview"
                  sandbox="allow-scripts"
                />
              </div>
              {websiteResult && websiteResult.pages.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {websiteResult.pages.map((page, i) => (
                    <button
                      key={i}
                      onClick={() => { setPreviewHtml(page.html); setPreviewPage(i) }}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        previewPage === i ? 'bg-accent text-white' : 'bg-dashSurface text-dashMuted hover:text-dashText'
                      )}
                    >
                      {page.name}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-dashMuted">
              <Eye size={32} className="mb-3 opacity-30" />
              <p className="text-sm">Generate a component or website to preview it here</p>
            </div>
          )}
        </div>
      )}

      {/* ── Component Library Tab ── */}
      {tab === 'library' && (
        <div className="space-y-6">
          <p className="text-sm text-dashMuted">Pre-built ELEVO-branded components ready to copy and use.</p>

          {[
            {
              category: 'Hero Sections',
              items: [
                {
                  name: 'Hero — Dark',
                  description: 'Bold dark hero with pill badge and gradient headline',
                  html: `<section class="bg-gray-900 py-24 px-6 text-center">
  <div class="max-w-4xl mx-auto">
    <span class="inline-block text-xs font-semibold text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 px-3 py-1 rounded-full mb-6 uppercase tracking-widest">New</span>
    <h1 class="text-6xl font-black text-white tracking-tighter mb-6 leading-tight">The headline that<br/>changes everything.</h1>
    <p class="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">One powerful sentence about what you do and who you do it for.</p>
    <a href="#" class="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-colors">Get started free →</a>
  </div>
</section>`,
                },
                {
                  name: 'Hero — Light Minimal',
                  description: 'Clean white hero with left-aligned copy and dashboard mockup',
                  html: `<section class="bg-white py-24 px-6">
  <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
    <div>
      <span class="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4 block">Trusted by 400+ businesses</span>
      <h1 class="text-5xl font-black text-gray-900 tracking-tighter mb-6 leading-tight">Your business.<br/>Supercharged.</h1>
      <p class="text-lg text-gray-600 mb-8">Everything your team needs to grow, in one beautifully simple platform.</p>
      <div class="flex gap-3">
        <a href="#" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">Start free trial</a>
        <a href="#" class="text-gray-600 px-6 py-3 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors">See how it works →</a>
      </div>
    </div>
    <div class="bg-gray-900 rounded-2xl p-6 shadow-2xl">
      <div class="space-y-3">
        <div class="flex items-center gap-3 bg-white/5 rounded-lg p-3"><div class="w-2 h-2 rounded-full bg-green-400"></div><span class="text-white text-sm">Revenue this month: €12,400</span></div>
        <div class="flex items-center gap-3 bg-white/5 rounded-lg p-3"><div class="w-2 h-2 rounded-full bg-indigo-400"></div><span class="text-white text-sm">42 new leads generated</span></div>
        <div class="flex items-center gap-3 bg-white/5 rounded-lg p-3"><div class="w-2 h-2 rounded-full bg-yellow-400"></div><span class="text-white text-sm">AI running 12 tasks today</span></div>
      </div>
    </div>
  </div>
</section>`,
                },
                {
                  name: 'Hero — Bold Gradient',
                  description: 'Vibrant gradient background with animated CTA',
                  html: `<section class="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-24 px-6 text-center">
  <div class="max-w-3xl mx-auto">
    <h1 class="text-7xl font-black text-white tracking-tighter mb-6 leading-none">Do more.<br/>Earn more.</h1>
    <p class="text-xl text-white/80 mb-10">The AI platform that works while you sleep. Join 400+ businesses already growing faster.</p>
    <a href="#" class="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">Start your 7-day free trial →</a>
    <p class="text-white/60 text-sm mt-4">7-day free trial · Cancel anytime</p>
  </div>
</section>`,
                },
              ],
            },
            {
              category: 'Feature Cards',
              items: [
                {
                  name: 'Feature Grid — Dark',
                  description: '3-column feature grid with icons on dark background',
                  html: `<section class="bg-gray-900 py-20 px-6">
  <div class="max-w-5xl mx-auto">
    <h2 class="text-4xl font-black text-white text-center mb-3">Everything you need.</h2>
    <p class="text-gray-400 text-center mb-12">One platform. 60+ AI agents. Infinite possibilities.</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div class="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <h3 class="text-white font-bold mb-2">Lightning Fast</h3>
        <p class="text-gray-400 text-sm">Generate content in seconds. Not hours.</p>
      </div>
      <div class="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div class="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
        </div>
        <h3 class="text-white font-bold mb-2">Data-Driven</h3>
        <p class="text-gray-400 text-sm">Real insights from real market research.</p>
      </div>
      <div class="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div class="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h3 class="text-white font-bold mb-2">Always On</h3>
        <p class="text-gray-400 text-sm">Your AI team works 24/7, even weekends.</p>
      </div>
    </div>
  </div>
</section>`,
                },
                {
                  name: 'Feature List — Light',
                  description: 'Simple feature list with checkmarks on white background',
                  html: `<section class="bg-white py-20 px-6">
  <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
    <div>
      <span class="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3 block">Features</span>
      <h2 class="text-4xl font-black text-gray-900 mb-6">Built for businesses that want to win.</h2>
      <p class="text-gray-600 mb-8">Stop juggling 10 tools. Get everything in one place.</p>
      <a href="#" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold inline-block hover:bg-indigo-700 transition-colors">Get started →</a>
    </div>
    <div class="space-y-4">
      ${['AI content generation', 'CRM & customer management', 'Sales proposals', 'Market research', 'Competitor intelligence', 'Social media automation'].map(f => `<div class="flex items-center gap-3"><div class="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><svg class="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg></div><span class="text-gray-700">${f}</span></div>`).join('')}
    </div>
  </div>
</section>`,
                },
              ],
            },
            {
              category: 'CTA Sections',
              items: [
                {
                  name: 'CTA — Dark with stats',
                  description: 'Dark CTA section with social proof stats',
                  html: `<section class="bg-gray-900 py-20 px-6 text-center">
  <div class="max-w-3xl mx-auto">
    <div class="flex justify-center gap-8 mb-10">
      <div><p class="text-3xl font-black text-white">400+</p><p class="text-gray-400 text-sm">Businesses</p></div>
      <div><p class="text-3xl font-black text-white">€1.2M</p><p class="text-gray-400 text-sm">Revenue driven</p></div>
      <div><p class="text-3xl font-black text-white">21</p><p class="text-gray-400 text-sm">AI agents</p></div>
    </div>
    <h2 class="text-5xl font-black text-white mb-6">Ready to grow?</h2>
    <p class="text-xl text-gray-400 mb-8">Join hundreds of businesses already using ELEVO to work smarter, not harder.</p>
    <a href="#" class="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors">Start your free trial →</a>
    <p class="text-gray-500 text-sm mt-4">7-day free trial · Cancel anytime</p>
  </div>
</section>`,
                },
                {
                  name: 'CTA — Light minimal',
                  description: 'Clean light CTA with border emphasis',
                  html: `<section class="bg-gray-50 py-20 px-6">
  <div class="max-w-2xl mx-auto text-center border border-gray-200 bg-white rounded-3xl p-12 shadow-sm">
    <h2 class="text-4xl font-black text-gray-900 mb-4">The last tool you'll ever need.</h2>
    <p class="text-gray-600 mb-8">Start your 7-day free trial. Cancel anytime. Just results.</p>
    <a href="#" class="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg inline-block hover:bg-gray-800 transition-colors">Start free today</a>
  </div>
</section>`,
                },
              ],
            },
          ].map(category => (
            <div key={category.category}>
              <h3 className="text-sm font-bold text-dashMuted uppercase tracking-wider mb-3">{category.category}</h3>
              <div className="space-y-3">
                {category.items.map(item => (
                  <div key={item.name} className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-dashText text-sm">{item.name}</p>
                        <p className="text-xs text-dashMuted mt-0.5">{item.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setPreviewHtml(item.html); setTab('preview') }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-dashSurface text-dashMuted rounded-lg text-xs hover:text-dashText transition-colors"
                        >
                          <Eye size={11} /> Preview
                        </button>
                        <CopyButton text={item.html} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
