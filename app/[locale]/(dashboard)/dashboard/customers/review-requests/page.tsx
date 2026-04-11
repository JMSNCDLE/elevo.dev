'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Star, Send, Mail, MessageSquare } from 'lucide-react'

export default function ReviewRequestsPage() {
  const locale = useLocale()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-yellow-500/15 border border-yellow-500/30 rounded-xl flex items-center justify-center">
          <Star className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Review Requests</h1>
          <p className="text-sm text-dashMuted">Send and track review requests for happy customers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-dashMuted uppercase tracking-wide">Sent</span>
            <Send className="w-4 h-4 text-dashMuted" />
          </div>
          <p className="text-3xl font-bold text-white">0</p>
          <p className="text-xs text-dashMuted mt-1">all time</p>
        </div>
        <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-dashMuted uppercase tracking-wide">Pending</span>
            <Mail className="w-4 h-4 text-dashMuted" />
          </div>
          <p className="text-3xl font-bold text-white">0</p>
          <p className="text-xs text-dashMuted mt-1">awaiting response</p>
        </div>
        <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-dashMuted uppercase tracking-wide">Reviews</span>
            <Star className="w-4 h-4 text-dashMuted" />
          </div>
          <p className="text-3xl font-bold text-white">0</p>
          <p className="text-xs text-dashMuted mt-1">received</p>
        </div>
      </div>

      <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-10 text-center">
        <div className="w-16 h-16 bg-dashSurface2 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <MessageSquare className="w-7 h-7 text-dashMuted" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">No review requests yet</h2>
        <p className="text-sm text-dashMuted max-w-md mx-auto mb-6">
          Pick a happy customer from your CRM and send them a polite review request via email or SMS.
          Track responses and watch your reviews grow.
        </p>
        <Link
          href={`/${locale}/dashboard/customers`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accentLight text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Send className="w-4 h-4" />
          Pick a customer
        </Link>
      </div>
    </div>
  )
}
