import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'System Status | ELEVO AI',
  description: 'Current system status for ELEVO AI services.',
}

const SERVICES = [
  { name: 'ELEVO Dashboard', status: 'operational' },
  { name: 'AI Agents (Content, Growth, Intelligence)', status: 'operational' },
  { name: 'Authentication & Accounts', status: 'operational' },
  { name: 'Stripe Billing', status: 'operational' },
  { name: 'CRM & Contacts', status: 'operational' },
  { name: 'API', status: 'operational' },
  { name: 'Blog & Marketing Pages', status: 'operational' },
]

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">System Status</h1>
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-green-700">All systems operational</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 overflow-hidden">
          {SERVICES.map((service, i) => (
            <div
              key={service.name}
              className={`flex items-center justify-between px-5 py-4 ${
                i < SERVICES.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <span className="text-sm font-medium text-gray-800">{service.name}</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs font-medium text-green-600 capitalize">{service.status}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="mt-10 text-center">
          <Link href="/" className="text-indigo-600 hover:underline text-sm">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </main>
  )
}
