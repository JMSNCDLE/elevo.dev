import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Careers | ELEVO AI',
  description: 'Join the ELEVO AI team. View open positions.',
}

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Careers</h1>
        <p className="text-gray-500 text-lg mb-8">
          We&apos;re building the AI operating system for local businesses.
        </p>

        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-10">
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💼</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No open positions currently
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Check back soon — we&apos;re growing fast and will be hiring shortly.
          </p>
          <p className="text-gray-400 text-sm">
            Want to be notified?{' '}
            <a href="mailto:hello@elevo.dev" className="text-indigo-600 hover:underline">
              hello@elevo.dev
            </a>
          </p>
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
