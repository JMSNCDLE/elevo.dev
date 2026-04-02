'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AlertTriangle, Zap, ArrowUp, Clock, Mail } from 'lucide-react'

interface CreditsDepletedProps {
  plan: string
  creditsUsed: number
  creditsLimit: number
  userId?: string
}

const PLAN_CONFIG: Record<string, { refreshTime: string; upgradeTo?: string; price: string }> = {
  trial: { refreshTime: '24 hours', upgradeTo: 'Launch', price: '€29.99/mo' },
  launch: { refreshTime: '12 hours', upgradeTo: 'Orbit', price: '€49.99/mo' },
  orbit: { refreshTime: '6–8 hours', upgradeTo: 'Galaxy', price: '€79.99/mo' },
  galaxy: { refreshTime: '2–3 hours', price: '€79.99/mo' },
}

export default function CreditsDepleted({ plan, creditsUsed, creditsLimit, userId }: CreditsDepletedProps) {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'
  const config = PLAN_CONFIG[plan] ?? PLAN_CONFIG.launch

  // Admins have unlimited credits — never show depletion
  const { isAdminId } = require('@/lib/admin')
  if (userId && isAdminId(userId)) return null
  if (creditsUsed < creditsLimit) return null

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white mb-1">Credits depleted</h3>
          <p className="text-xs text-gray-400 mb-4">
            You&apos;ve used {creditsUsed} of {creditsLimit} credits this month.
          </p>

          <div className="space-y-2">
            {/* Option 1: Buy more */}
            <Link
              href={`/${locale}/pricing`}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors w-full justify-center"
            >
              <Zap size={14} />
              Buy more credits now
            </Link>

            {/* Option 2: Wait for refresh */}
            <div className="flex items-center gap-2 bg-white/5 text-gray-300 text-sm px-4 py-2.5 rounded-lg">
              <Clock size={14} className="text-gray-500" />
              <span>Wait {config.refreshTime} for automatic refresh</span>
            </div>

            {/* Option 3: Upgrade or contact */}
            {config.upgradeTo ? (
              <Link
                href={`/${locale}/pricing`}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm px-4 py-2.5 rounded-lg transition-colors w-full justify-center"
              >
                <ArrowUp size={14} className="text-indigo-400" />
                Upgrade to {config.upgradeTo} ({config.price})
              </Link>
            ) : (
              <a
                href="mailto:team@elevo.dev"
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm px-4 py-2.5 rounded-lg transition-colors w-full justify-center"
              >
                <Mail size={14} className="text-gray-500" />
                Contact support
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
