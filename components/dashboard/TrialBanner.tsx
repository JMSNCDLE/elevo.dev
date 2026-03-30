'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Clock, Zap, X } from 'lucide-react'
import { ADMIN_IDS } from '@/lib/admin'

interface TrialBannerProps {
  locale: string
  plan: string
  trialEndsAt: string | null
  userId: string
}

export default function TrialBanner({ locale, plan, trialEndsAt, userId }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  // Never show for admins or paid users
  if (ADMIN_IDS.includes(userId)) return null
  if (plan !== 'trial') return null
  if (dismissed) return null
  if (!trialEndsAt) return null

  const now = new Date()
  const end = new Date(trialEndsAt)
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000))
  const hoursLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 3600000))
  const expired = daysLeft <= 0

  const bgColor = expired ? 'bg-red-500/10 border-red-500/30'
    : daysLeft <= 2 ? 'bg-orange-500/10 border-orange-500/30'
    : 'bg-indigo-500/10 border-indigo-500/30'

  const textColor = expired ? 'text-red-400' : daysLeft <= 2 ? 'text-orange-400' : 'text-indigo-400'

  return (
    <div className={`mx-6 mt-4 px-4 py-3 rounded-xl border ${bgColor} flex items-center justify-between gap-3`}>
      <div className="flex items-center gap-3 min-w-0">
        <Clock size={16} className={`${textColor} shrink-0`} />
        <p className="text-sm text-dashText">
          {expired ? (
            <span className="font-semibold text-red-400">Your free trial has ended.</span>
          ) : daysLeft <= 1 ? (
            <span><span className="font-semibold text-orange-400">Less than {hoursLeft} hours left</span> on your free trial.</span>
          ) : (
            <span><span className={`font-semibold ${textColor}`}>{daysLeft} days left</span> on your free trial.</span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/${locale}/pricing`}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
        >
          <Zap size={13} />
          {expired ? 'Choose a plan' : 'Upgrade now'}
        </Link>
        {!expired && (
          <button onClick={() => setDismissed(true)} className="p-1 text-dashMuted hover:text-dashText">
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
