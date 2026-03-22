'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TIMER_DURATION = 7 * 60 // 7 minutes in seconds

export function CountdownBanner() {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [expired, setExpired] = useState(false)
  const [personalCode, setPersonalCode] = useState<string | null>(null)
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check for existing personal code
    const saved = localStorage.getItem('elevo_discount_code')
    const savedExpiry = localStorage.getItem('elevo_discount_expiry')
    if (saved && savedExpiry && new Date(savedExpiry) > new Date()) {
      setPersonalCode(saved)
      return
    }

    // Session-based countdown
    const started = sessionStorage.getItem('elevo_timer_started')
    if (!started) {
      sessionStorage.setItem('elevo_timer_started', Date.now().toString())
      setSecondsLeft(TIMER_DURATION)
    } else {
      const elapsed = Math.floor((Date.now() - parseInt(started)) / 1000)
      const remaining = TIMER_DURATION - elapsed
      if (remaining <= 0) {
        setExpired(true)
        setSecondsLeft(0)
      } else {
        setSecondsLeft(remaining)
      }
    }
  }, [])

  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0 || personalCode) return
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev === null || prev <= 1) {
          setExpired(true)
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [secondsLeft, personalCode])

  const handleUnlock = useCallback(async () => {
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch('/api/discount/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.code) {
        setPersonalCode(data.code)
        localStorage.setItem('elevo_discount_code', data.code)
        localStorage.setItem('elevo_discount_expiry', data.expiresAt)
        setShowEmailInput(false)
      }
    } finally {
      setLoading(false)
    }
  }, [email])

  if (!mounted) return null

  if (personalCode) {
    const expiryStr = localStorage.getItem('elevo_discount_expiry')
    const hoursLeft = expiryStr
      ? Math.max(0, Math.floor((new Date(expiryStr).getTime() - Date.now()) / 3600000))
      : 24
    return (
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-3 px-4 text-sm">
        🎟 Your personal code: <strong className="font-mono bg-white/20 px-2 py-0.5 rounded mx-1">{personalCode}</strong>
        — 50% off first month · Expires in {hoursLeft}h
        <span className="mx-2">·</span>
        <a href="/pricing" className="underline font-semibold">Claim now →</a>
      </div>
    )
  }

  const mins = Math.floor((secondsLeft ?? 0) / 60).toString().padStart(2, '0')
  const secs = ((secondsLeft ?? 0) % 60).toString().padStart(2, '0')

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white py-3 px-4"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          {expired ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <span className="font-medium">⌛ Offer expired</span>
              {!showEmailInput ? (
                <button
                  onClick={() => setShowEmailInput(true)}
                  className="bg-white text-indigo-600 font-semibold px-4 py-1.5 rounded-lg text-xs hover:bg-indigo-50 transition-colors"
                >
                  Enter email to unlock personal code →
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="text-gray-900 px-3 py-1.5 rounded-lg text-xs w-48 focus:outline-none"
                  />
                  <button
                    onClick={handleUnlock}
                    disabled={loading}
                    className="bg-white text-indigo-600 font-semibold px-4 py-1.5 rounded-lg text-xs hover:bg-indigo-50 disabled:opacity-50 transition-colors"
                  >
                    {loading ? '...' : 'Unlock →'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <span>🚀 <strong>Launch offer</strong> — 50% off your first month</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-mono text-xl font-bold bg-black/20 px-3 py-1 rounded-lg">
                  {mins}:{secs}
                </div>
                <a
                  href="/pricing"
                  className="bg-white text-indigo-600 font-semibold px-5 py-1.5 rounded-lg text-sm hover:bg-indigo-50 transition-colors whitespace-nowrap"
                >
                  Claim offer →
                </a>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
