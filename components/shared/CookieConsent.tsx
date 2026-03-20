'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { setClientCookie, getClientCookie, COOKIE_NAMES } from '@/lib/cookies'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const locale = useLocale()

  useEffect(() => {
    const consent = getClientCookie(COOKIE_NAMES.CONSENT)
    if (!consent) {
      setVisible(true)
    }
  }, [])

  function handleEssentialOnly() {
    setClientCookie(COOKIE_NAMES.CONSENT, 'false', 30)
    setVisible(false)
  }

  function handleAcceptAll() {
    setClientCookie(COOKIE_NAMES.CONSENT, 'true', 365)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-6 py-4"
      style={{ background: '#0F1623', borderTop: '1px solid #1A2332' }}
      role="banner"
      aria-label="Cookie consent"
    >
      <p className="text-sm text-gray-300 max-w-xl">
        We use cookies to improve your experience.{' '}
        <Link
          href={`/${locale}/privacy`}
          className="underline text-gray-400 hover:text-white transition-colors"
        >
          Learn more
        </Link>
      </p>
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={handleEssentialOnly}
          className="px-4 py-2 text-sm font-medium text-gray-300 border border-gray-600 rounded-lg hover:border-gray-400 hover:text-white transition-colors"
        >
          Essential only
        </button>
        <button
          onClick={handleAcceptAll}
          className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
          style={{ background: '#6366F1' }}
          onMouseEnter={e => ((e.target as HTMLButtonElement).style.background = '#4F46E5')}
          onMouseLeave={e => ((e.target as HTMLButtonElement).style.background = '#6366F1')}
        >
          Accept all
        </button>
      </div>
    </div>
  )
}
