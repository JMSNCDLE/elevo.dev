'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Loader2, Sparkles, Wrench, Bug, Megaphone } from 'lucide-react'

interface Update {
  id: string
  title: string
  description: string
  category: 'feature' | 'improvement' | 'fix' | 'announcement'
  version: string | null
  published_at: string
}

const CATEGORY_CONFIG = {
  feature: { label: 'New Feature', icon: Sparkles, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  improvement: { label: 'Improvement', icon: Wrench, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  fix: { label: 'Fix', icon: Bug, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  announcement: { label: 'Announcement', icon: Megaphone, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
}

// Fallback updates shown when DB is empty
const FALLBACK_UPDATES: Update[] = [
  {
    id: '100',
    title: 'ELEVO CEO™ — AI Chief Executive Officer',
    description: 'Your AI CEO powered by Opus 4.6. Strategic planning, business analysis, and executive decision-making across your entire operation.',
    category: 'feature',
    version: 'Phase 46',
    published_at: '2026-04-10T00:00:00Z',
  },
  {
    id: '99',
    title: 'Agent Council — Autonomous Coordination',
    description: 'Daily autonomous agent coordination. Your AI agents now collaborate, share insights, and coordinate actions without manual intervention.',
    category: 'feature',
    version: 'Phase 45',
    published_at: '2026-04-09T00:00:00Z',
  },
  {
    id: '98',
    title: 'Voice Agents — AI Voice Calling',
    description: 'Voice calling and transcription capabilities. AI agents can now make and receive calls, transcribe conversations, and log them to CRM.',
    category: 'feature',
    version: 'Phase 44',
    published_at: '2026-04-08T00:00:00Z',
  },
  {
    id: '97',
    title: 'ELEVO Stitch™ — AI Web Design Studio',
    description: 'Design and build complete web pages with AI. Visual editor, component library, and one-click publish.',
    category: 'feature',
    version: 'Phase 43',
    published_at: '2026-04-07T00:00:00Z',
  },
  {
    id: '96',
    title: 'ELEVO Build™ — Full Website/App Builder',
    description: 'Build a complete website or web app from a single prompt. AI generates pages, components, styling, and deploys automatically.',
    category: 'feature',
    version: 'Phase 42',
    published_at: '2026-04-06T00:00:00Z',
  },
  {
    id: '95',
    title: 'Growth Tools Suite — Cold Email, Cold Call, Proposals & More',
    description: 'Five new growth tools: Cold Email Machine, Cold Call Script Generator, Proposal Builder, Client Onboarding Kit, and Cost Reducer.',
    category: 'feature',
    version: 'Phase 41',
    published_at: '2026-04-05T00:00:00Z',
  },
  {
    id: '94',
    title: 'Sales Pipeline & CRM Upgrades',
    description: 'Visual Kanban sales pipeline with deal tracking, drag-and-drop stages, revenue forecasting, and automated follow-ups.',
    category: 'improvement',
    version: 'Phase 40',
    published_at: '2026-04-04T00:00:00Z',
  },
  {
    id: '93',
    title: 'ELEVO Deep™ — Complex Business Execution',
    description: 'Multi-step business execution agent powered by Opus. Handles complex, interconnected tasks that span multiple departments.',
    category: 'feature',
    version: 'Phase 39',
    published_at: '2026-04-03T00:00:00Z',
  },
  {
    id: '92',
    title: 'ELEVO Accountant™ — AI Financial Analyst',
    description: 'Invoice scanning, tax estimation, expense categorisation, cash flow forecasting, and profit/loss reporting.',
    category: 'feature',
    version: 'Phase 38',
    published_at: '2026-04-02T00:00:00Z',
  },
  {
    id: '91',
    title: 'ELEVO Lawyer™ — AI Legal Assistant',
    description: 'Contract review, terms generation, GDPR compliance checks, and legal risk analysis for your business.',
    category: 'feature',
    version: 'Phase 37',
    published_at: '2026-04-01T00:00:00Z',
  },
  {
    id: '90',
    title: 'Threads Growth Suite — 7 Tools',
    description: 'Complete Threads growth toolkit: Strategy, Audience Analysis, Hook Generator, 30-Day Content Plan, Thread Writer, Engagement Booster, and Monetisation.',
    category: 'feature',
    version: 'Phase 36',
    published_at: '2026-03-31T00:00:00Z',
  },
  {
    id: '89',
    title: 'ELEVO Creator™ — YouTube & TikTok Strategist',
    description: 'Title optimiser, thumbnail briefs, editing briefs, channel audits, traffic strategy, and content calendars for creators.',
    category: 'feature',
    version: 'Phase 35',
    published_at: '2026-03-30T00:00:00Z',
  },
  {
    id: '88',
    title: 'ELEVO Viral™ — Viral Content Strategy',
    description: 'Real-time trend tracking, viral formula builder, 30-day viral content calendar with 50 scroll-stopping hooks.',
    category: 'feature',
    version: 'Phase 34',
    published_at: '2026-03-29T00:00:00Z',
  },
  {
    id: '87',
    title: 'ELEVO Clip™ — AI Video Content Extraction',
    description: 'Extract viral clips from long-form video. Auto-generates captions, hooks, and hashtags for each platform.',
    category: 'feature',
    version: 'Phase 33',
    published_at: '2026-03-29T00:00:00Z',
  },
  {
    id: '86',
    title: 'ELEVO Drop™ — Dropshipping Suite',
    description: 'Complete dropshipping command centre: product finder, supplier finder, store builder, and ad creator.',
    category: 'feature',
    version: 'Phase 32',
    published_at: '2026-03-28T00:00:00Z',
  },
  {
    id: '85',
    title: 'Facebook Ads, Instagram Client & LinkedIn Tools',
    description: 'Facebook Ads Machine, Instagram Client Generator, LinkedIn Client outreach, and Facebook Group growth tools.',
    category: 'feature',
    version: 'Phase 30',
    published_at: '2026-03-27T00:00:00Z',
  },
  {
    id: '84',
    title: 'ELEVO Write Pro™ & ELEVO Route™',
    description: 'AI-to-human text rewriting that bypasses AI detectors. Intelligent prompt routing that picks the best agent for each task.',
    category: 'feature',
    version: 'Phase 28',
    published_at: '2026-03-27T00:00:00Z',
  },
  {
    id: '1',
    title: 'App Integrations Hub',
    description: 'Connect 30+ third-party apps to your ELEVO dashboard — Slack, Instagram, HubSpot, Google Analytics, and more. Search and filter by category.',
    category: 'feature',
    version: 'Phase 26',
    published_at: '2026-03-26T00:00:00Z',
  },
  {
    id: '2',
    title: 'Automated QA Testing Bot',
    description: 'Admin-only testing dashboard that runs automated checks across all API routes, Supabase connectivity, and environment configuration.',
    category: 'feature',
    version: 'Phase 26',
    published_at: '2026-03-26T00:00:00Z',
  },
  {
    id: '3',
    title: 'Dashboard Help Bot with Streaming',
    description: 'Mira, your ELEVO guide, now responds in real-time with streaming text. Knows all 60+ agents, plans, and troubleshooting steps.',
    category: 'improvement',
    version: 'Phase 26',
    published_at: '2026-03-26T00:00:00Z',
  },
  {
    id: '4',
    title: 'Currency Geo-Detection',
    description: 'Pricing now automatically displays in your local currency — EUR for Europe, GBP for UK, USD for US — based on your timezone.',
    category: 'improvement',
    version: 'Phase 26',
    published_at: '2026-03-26T00:00:00Z',
  },
  {
    id: '5',
    title: 'New Brand Slogan and SEO Overhaul',
    description: 'Updated all meta tags, structured data, and brand messaging. Dynamic sitemap now covers all pages and blog posts.',
    category: 'improvement',
    version: 'Phase 26',
    published_at: '2026-03-26T00:00:00Z',
  },
  {
    id: '6',
    title: 'ELEVO PA — Personal Assistant',
    description: 'Task management, daily planning, and AI chat with Aria. Create tasks, set priorities, and let Aria help plan your day.',
    category: 'feature',
    version: 'Phase 26',
    published_at: '2026-03-26T00:00:00Z',
  },
]

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/updates')
      .then(res => res.json())
      .then(data => {
        const items = data.updates ?? []
        setUpdates(items.length > 0 ? items : FALLBACK_UPDATES)
      })
      .catch(() => setUpdates(FALLBACK_UPDATES))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">What&apos;s New</h1>
          <p className="text-gray-500 text-lg">
            The latest updates and improvements to ELEVO AI.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-0">
            {updates.map((update, i) => {
              const config = CATEGORY_CONFIG[update.category] || CATEGORY_CONFIG.improvement
              const Icon = config.icon
              const date = new Date(update.published_at)
              const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

              return (
                <div key={update.id} className="relative pl-8 pb-10">
                  {/* Timeline line */}
                  {i < updates.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gray-200" />
                  )}
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1 w-[23px] h-[23px] bg-white border-2 border-indigo-300 rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${config.color}`}>
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </span>
                    {update.version && (
                      <span className="text-[11px] text-gray-400 font-medium">{update.version}</span>
                    )}
                    <span className="text-[11px] text-gray-400">{dateStr}</span>
                  </div>

                  <h2 className="text-lg font-semibold text-gray-900 mb-1">{update.title}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{update.description}</p>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-indigo-600 hover:underline text-sm">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </main>
  )
}
