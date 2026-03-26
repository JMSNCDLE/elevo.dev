import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Partners | ELEVO AI',
  description: 'Partnership opportunities with ELEVO AI.',
}

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Partners</h1>
        <p className="text-gray-500 text-lg mb-8">
          Build with ELEVO AI. Grow together.
        </p>

        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-10">
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Partnership enquiries
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            We work with agencies, consultants, and technology partners. If you&apos;re interested in integrating with or reselling ELEVO AI, get in touch.
          </p>
          <a
            href="mailto:hello@elevo.dev"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm"
          >
            hello@elevo.dev
          </a>
        </div>

        <div className="mt-10">
          <Link href="/" className="text-indigo-600 hover:underline text-sm">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </main>
  )
}
