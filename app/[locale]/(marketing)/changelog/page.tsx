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
    description: 'Mira, your ELEVO guide, now responds in real-time with streaming text. Knows all 38 agents, plans, and troubleshooting steps.',
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
