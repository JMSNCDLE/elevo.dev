'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Zap } from 'lucide-react'

const STORAGE_KEY = 'elevo_exit_popup_v1'
const COOLDOWN_DAYS = 1

const BUSINESS_TYPES = [
  'Plumber',
  'Electrician',
  'Roofer',
  'Builder',
  'Restaurant',
  'Café',
  'Salon',
  'Dental',
  'Retail',
  'Other',
]

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

export default function ExitIntentPopup() {
  const [shown, setShown] = useState(false)
  const [email, setEmail] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [city, setCity] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY < 10) {
      if (!isCooledDown()) {
        setShown(true)
      }
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  useEffect(() => {
    if (isCooledDown()) return

    // Exit intent: fire when mouse leaves viewport (desktop)
    const exitTimeout = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave)
    }, 3000)

    // Timer: show after 15 seconds on page if not already shown
    const timerTimeout = setTimeout(() => {
      if (!isCooledDown()) {
        setShown(true)
      }
    }, 15000)

    return () => {
      clearTimeout(exitTimeout)
      clearTimeout(timerTimeout)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseLeave])

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
          businessName,
          city,
          businessType,
          source: 'exit_intent',
          consentGiven: true,
        }),
      })
      setSubmitted(true)
      setCooldown()
    } catch {
      // Fail silently — still show success
      setSubmitted(true)
      setCooldown()
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">You&apos;re on the list!</h2>
            <p className="text-gray-500 text-sm">
              We&apos;ll send your audit within 24 hours. ✓
            </p>
            <button
              onClick={handleClose}
              className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Close
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
                <h2 className="text-xl font-bold text-gray-900">Wait — before you go</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Get a free personalised audit of your business&apos;s online presence.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-5">
              We&apos;ll analyse your Google Business profile, social presence, and local SEO — completely free.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Business name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Mario's Plumbing"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Manchester"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Business type</label>
                <select
                  value={businessType}
                  onChange={e => setBusinessType(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors bg-white text-gray-700"
                >
                  <option value="">Select a type…</option>
                  {BUSINESS_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors mt-1"
              >
                {loading ? 'Sending…' : 'Get my free audit →'}
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-3">
              No spam. Unsubscribe any time.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
