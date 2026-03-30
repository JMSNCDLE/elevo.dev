import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers — ELEVO AI',
  description: 'Join the ELEVO AI team. See open positions.',
}

export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <main className="min-h-screen bg-white">
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">💼</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">Careers at ELEVO AI</h1>
          <p className="text-gray-500 text-lg mb-8">
            We&apos;re building the AI operating system for local businesses. No open positions currently — but we&apos;re always looking for exceptional talent.
          </p>
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 mb-8">
            <p className="text-gray-700 font-medium mb-2">Interested in joining?</p>
            <p className="text-gray-500 text-sm">
              Send your CV and a short note about what excites you to{' '}
              <a href="mailto:team@elevo.dev" className="text-indigo-600 font-semibold hover:underline">team@elevo.dev</a>
            </p>
          </div>
          <Link href={`/${locale}`} className="text-sm text-indigo-600 font-medium hover:underline">
            ← Back to home
          </Link>
        </div>
      </section>
    </main>
  )
}
