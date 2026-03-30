'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Play } from 'lucide-react'
import { useTranslations } from 'next-intl'

const STORAGE_KEY = 'elevo_scroll_popup_v1'
const COOLDOWN_DAYS = 7
const SCROLL_THRESHOLD = 0.5

function isCooledDown(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return false
    const ts = parseInt(stored, 10)
    const daysSince = (Date.now() - ts) / (1000 * 60 * 60 * 24)
    return daysSince < COOLDOWN_DAYS
  } catch {
    return false
  }
}

function setCooldown() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {
    // localStorage not available
  }
}

export default function ScrollTriggerPopup() {
  const [shown, setShown] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const t = useTranslations('demoPopup')

  const handleScroll = useCallback(() => {
    if (isCooledDown()) return
    const scrollRatio = window.scrollY / document.body.scrollHeight
    if (scrollRatio > SCROLL_THRESHOLD) {
      setShown(true)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    // Wait a few seconds before enabling scroll trigger
    const timeout = setTimeout(() => {
      window.addEventListener('scroll', handleScroll, { passive: true })
    }, 5000)

    return () => {
      clearTimeout(timeout)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  function handleClose() {
    setCooldown()
    setShown(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'scroll_popup',
          consentGiven: true,
        }),
      })
      setSubmitted(true)
      setCooldown()
    } catch {
      setSubmitted(true)
      setCooldown()
    } finally {
      setLoading(false)
    }
  }

  if (!shown) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-40 w-80 bg-white rounded-2xl shadow-2xl border border-indigo-100"
      style={{ maxWidth: 320 }}
    >
      <div className="p-5">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {submitted ? (
          <div className="text-center py-2">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">✓</span>
            </div>
            <p className="text-sm font-semibold text-gray-800">{t('successTitle')}</p>
            <p className="text-xs text-gray-500 mt-1">{t('successMessage')}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                <Play size={14} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{t('title')}</p>
                <p className="text-xs text-gray-500">{t('subtitle')}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors"
              >
                {loading ? t('sending') : t('submitButton')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
