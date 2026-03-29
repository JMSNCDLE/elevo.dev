import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Press — ELEVO AI',
  description: 'Press and media inquiries for ELEVO AI.',
}

export default async function PressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <main className="min-h-screen bg-white">
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">📰</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">Press & Media</h1>
          <p className="text-gray-500 text-lg mb-8">
            For press inquiries, interviews, or media assets, please get in touch.
          </p>
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 mb-8">
            <p className="text-gray-700 font-medium mb-2">Media contact</p>
            <p className="text-gray-500 text-sm">
              Email{' '}
              <a href="mailto:hello@elevo.dev" className="text-indigo-600 font-semibold hover:underline">hello@elevo.dev</a>
              {' '}with the subject line &quot;Press Inquiry&quot;
            </p>
          </div>
          <div className="text-left max-w-md mx-auto">
            <h2 className="font-bold text-gray-900 mb-3">Quick facts</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Founded: 2026</li>
              <li>Founder: James Carlin</li>
              <li>Product: AI operating system for local businesses</li>
              <li>47+ AI agents, 12 languages</li>
            </ul>
          </div>
          <Link href={`/${locale}`} className="text-sm text-indigo-600 font-medium hover:underline mt-8 inline-block">
            ← Back to home
          </Link>
        </div>
      </section>
    </main>
  )
}
