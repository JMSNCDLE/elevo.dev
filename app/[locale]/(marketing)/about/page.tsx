import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About ELEVO AI',
  description: 'ELEVO AI — 47+ AI agents that replace your entire team. Built for local businesses, ecommerce, creators, and agencies.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About ELEVO AI</h1>
        <div className="space-y-6 text-gray-600 text-base leading-relaxed">
          <p>
            ELEVO AI is the platform that replaces the need for employees with AI agents that work 24/7. We built it because we believe every business — from a solo freelancer to a growing agency — deserves an AI-powered team without the overhead.
          </p>
          <p>
            With 47+ AI agents across marketing, sales, content, analytics, and operations, ELEVO handles the work that used to require a full team. Each agent is purpose-built for a specific role: writing content, managing social media, running ad campaigns, closing deals, and more.
          </p>
          <p>
            Founded by James Carlin, ELEVO AI is headquartered in the United Kingdom and serves businesses across Europe, the US, and beyond. Our mission is simple: lower your customer acquisition cost and help you grow faster — with AI doing the heavy lifting.
          </p>
          <p>
            Plans start at €39/month. Every plan includes a 7-day free trial.
          </p>
        </div>
        <div className="mt-10 flex gap-4">
          <Link href="/en/signup" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm">
            Start free trial
          </Link>
          <a href="mailto:team@elevo.dev" className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 transition-colors text-sm">
            Contact us
          </a>
        </div>
      </div>
    </main>
  )
}
