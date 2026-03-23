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

type Tab = 'component' | 'analyse' | 'website' | 'preview'
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
      const res = await fetch(`/${locale}/api/stitch/component`, {
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
      const res = await fetch(`/${locale}/api/stitch/analyse`, {
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
      const res = await fetch(`/${locale}/api/stitch/website`, {
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
    </div>
  )
}
