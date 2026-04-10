'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { X, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

const SESSION_KEY = 'elevo_exit_shown'
const MIN_DELAY_MS = 15000

export default function ExitIntentPopup() {
  const [shown, setShown] = useState(false)
  const [email, setEmail] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [city, setCity] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()

  const t = useTranslations('exitPopup')
  const BUSINESS_TYPES = [t('typePlumber'), t('typeElectrician'), t('typeRoofer'), t('typeBuilder'), t('typeRestaurant'), t('typeCafe'), t('typeSalon'), t('typeDental'), t('typeRetail'), t('typeOther')]

  // Only enable on homepage (e.g. /en, /es, /fr — path is /locale only)
  const isHomepage = /^\/[a-z]{2}$/.test(pathname)

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY < 10) {
      setShown(true)
      sessionStorage.setItem(SESSION_KEY, 'true')
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  useEffect(() => {
    if (!isHomepage) return
    if (sessionStorage.getItem(SESSION_KEY)) return

    // Only attach exit-intent listener after 15 seconds on page
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        document.addEventListener('mouseleave', handleMouseLeave)
      }
    }, MIN_DELAY_MS)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isHomepage, handleMouseLeave])

  function handleClose() {
    sessionStorage.setItem(SESSION_KEY, 'true')
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
          businessName,
          city,
          businessType,
          source: 'exit_intent',
          consentGiven: true,
        }),
      })
      setSubmitted(true)
      sessionStorage.setItem(SESSION_KEY, 'true')
    } catch {
      setSubmitted(true)
      sessionStorage.setItem(SESSION_KEY, 'true')
    } finally {
      setLoading(false)
    }
  }

  if (!shown) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-8 w-full"
        style={{ maxWidth: 480 }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t('successTitle')}</h2>
            <p className="text-gray-500 text-sm">
              {t('successMessage')}
            </p>
            <button
              onClick={handleClose}
              className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              {t('close')}
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                <Zap size={20} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t('title')}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {t('subtitle')}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-5">
              {t('description')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('emailLabel')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('businessNameLabel')}</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder={t('businessNamePlaceholder')}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('cityLabel')}</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder={t('cityPlaceholder')}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('businessTypeLabel')}</label>
                <select
                  value={businessType}
                  onChange={e => setBusinessType(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors bg-white text-gray-700"
                >
                  <option value="">{t('selectType')}</option>
                  {BUSINESS_TYPES.map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors mt-1"
              >
                {loading ? t('sending') : t('submitButton')}
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-3">
              {t('noSpam')}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
