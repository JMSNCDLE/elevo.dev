'use client'
import { useState, useEffect } from 'react'

export function PersonalCodeBanner() {
  const [code, setCode] = useState<string | null>(null)
  const [hoursLeft, setHoursLeft] = useState(24)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('elevo_discount_code')
    const expiry = localStorage.getItem('elevo_discount_expiry')
    if (saved && expiry && new Date(expiry) > new Date()) {
      setCode(saved)
      setHoursLeft(Math.max(1, Math.floor((new Date(expiry).getTime() - Date.now()) / 3600000)))
    }
  }, [])

  if (!mounted || !code) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎟</span>
        <div>
          <p className="font-semibold text-gray-900 text-sm">Your personal discount code</p>
          <p className="text-xs text-gray-500">50% off your first month · Expires in {hoursLeft}h</p>
        </div>
      </div>
      <div className="font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-lg text-sm tracking-wider">
        {code}
      </div>
    </div>
  )
}
