'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const COOKIE_NAME = 'elevo_consent'

interface ConsentData {
  essential: true
  analytics: boolean
  marketing: boolean
  timestamp: number
}

export default function CookieConsent() {
  const [shown, setShown] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasConsent = document.cookie.split(';').some(c => c.trim().startsWith(COOKIE_NAME + '='))
      if (!hasConsent) setShown(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  function saveConsent(ana: boolean, mkt: boolean) {
    const data: ConsentData = {
      essential: true,
      analytics: ana,
      marketing: mkt,
      timestamp: Date.now(),
    }
    // Store in cookie (365 days, not localStorage)
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
    setShown(false)
    setModalOpen(false)
  }

  if (!shown) return null

  return (
    <>
      {/* Banner */}
      {!modalOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-md border-t border-gray-200 px-4 pt-3"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        >
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <p className="text-sm text-gray-800 flex-1 min-w-0">
              We use cookies to improve your experience.{' '}
              <Link href="/en/privacy" className="underline text-indigo-600 hover:text-indigo-700">
                Privacy Policy
              </Link>
            </p>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => setModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors whitespace-nowrap"
              >
                Manage preferences
              </button>
              <button
                onClick={() => saveConsent(false, false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors whitespace-nowrap"
              >
                Essential only
              </button>
              <button
                onClick={() => saveConsent(true, true)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl p-6"
            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">Cookie preferences</h2>
                <p className="text-xs text-gray-500">Control what data we collect</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {/* Essential — locked */}
              <div className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Essential</p>
                  <p className="text-xs text-gray-500 mt-0.5">Required for the site to work. Cannot be disabled.</p>
                </div>
                <div className="shrink-0 w-10 h-6 bg-indigo-600 rounded-full flex items-center justify-end pr-0.5 cursor-not-allowed opacity-70">
                  <div className="w-5 h-5 bg-white rounded-full shadow" />
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Analytics</p>
                  <p className="text-xs text-gray-500 mt-0.5">Helps us understand how visitors use the site.</p>
                </div>
                <button
                  onClick={() => setAnalytics(v => !v)}
                  className={`shrink-0 w-10 h-6 rounded-full flex items-center transition-colors duration-200 ${analytics ? 'bg-indigo-600 justify-end pr-0.5' : 'bg-gray-200 justify-start pl-0.5'}`}
                  aria-checked={analytics}
                  role="switch"
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow" />
                </button>
              </div>

              {/* Marketing */}
              <div className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Marketing</p>
                  <p className="text-xs text-gray-500 mt-0.5">Used to deliver personalised advertisements.</p>
                </div>
                <button
                  onClick={() => setMarketing(v => !v)}
                  className={`shrink-0 w-10 h-6 rounded-full flex items-center transition-colors duration-200 ${marketing ? 'bg-indigo-600 justify-end pr-0.5' : 'bg-gray-200 justify-start pl-0.5'}`}
                  aria-checked={marketing}
                  role="switch"
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow" />
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => saveConsent(false, false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                Essential only
              </button>
              <button
                onClick={() => saveConsent(analytics, marketing)}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
              >
                Save preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
