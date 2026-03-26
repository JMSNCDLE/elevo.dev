import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Changelog | ELEVO AI',
  description: 'Latest updates and improvements to ELEVO AI.',
}

const ENTRIES = [
  {
    date: 'March 2026',
    version: 'Phase 25',
    title: 'SEO blog engine, currency detection, and language fixes',
    items: [
      'Added 11 SEO-optimised blog posts for organic traffic',
      'Geo-detected currency display (€/£/$) on pricing',
      'Fixed all language defaults to English',
      'Improved cookie consent with GDPR-compliant preferences',
      'New footer pages: Careers, Affiliate, Press, Partners, Status',
    ],
  },
  {
    date: 'March 2026',
    version: 'Phase 23',
    title: 'Dark design system, legal pages, and PWA support',
    items: [
      'Vercel-inspired dark hero with beam and glow effects',
      'Privacy policy, terms of service, refund and cookie policy pages',
      'Progressive Web App manifest and mobile optimisations',
      'Performance improvements and security headers',
    ],
  },
  {
    date: 'March 2026',
    version: 'Phase 21',
    title: 'WhatsApp notifications, agent search, and new tools',
    items: [
      'WhatsApp notifications via Twilio for key events',
      'Command+K agent search across all 38 agents',
      'ELEVO Write Pro™ for human-sounding copy',
      'ELEVO Deep™ for comprehensive business analysis',
      'Return briefing when you come back after time away',
    ],
  },
  {
    date: 'March 2026',
    version: 'Phase 17',
    title: 'ELEVO Market™ — full marketing automation',
    items: [
      'AI-powered 30-day marketing calendar',
      'Auto-execution of daily marketing tasks',
      'Weekly performance review and plan updates',
      'Social media setup wizard',
    ],
  },
]

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Changelog</h1>
          <p className="text-gray-500 text-lg">
            Latest updates and improvements to ELEVO AI.
          </p>
        </div>

        <div className="space-y-10">
          {ENTRIES.map((entry, i) => (
            <div key={i} className="relative pl-6 border-l-2 border-indigo-100">
              <div className="absolute -left-[7px] top-1 w-3 h-3 bg-indigo-600 rounded-full" />
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {entry.version}
                </span>
                <span className="text-xs text-gray-400">{entry.date}</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{entry.title}</h2>
              <ul className="space-y-1.5">
                {entry.items.map((item, j) => (
                  <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-indigo-400 mt-1 shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-indigo-600 hover:underline text-sm">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </main>
  )
}
