'use client'

import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'

export default function LiveCounters() {
  const [mounted, setMounted] = useState(false)
  const [count, setCount] = useState(390)
  const [lastSignup, setLastSignup] = useState('a few minutes ago')

  useEffect(() => {
    setMounted(true)

    // Count up from 390 to 400+ on mount
    let current = 390
    const target = 403
    const interval = setInterval(() => {
      current += 1
      setCount(current)
      if (current >= target) clearInterval(interval)
    }, 80)

    // Set initial "last signup" time from a fixed set
    const times = ['2 minutes ago', '7 minutes ago', '12 minutes ago', '4 minutes ago']
    setLastSignup(times[Math.floor(Math.random() * times.length)])

    // Refresh "last signup" time every 30s
    const refreshInterval = setInterval(() => {
      setLastSignup(times[Math.floor(Math.random() * times.length)])
    }, 30000)

    return () => {
      clearInterval(interval)
      clearInterval(refreshInterval)
    }
  }, [])

  if (!mounted) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
      <div className="flex items-center gap-2">
        <Users size={16} className="text-indigo-500" />
        <span>
          Join <span className="font-bold text-gray-700">{count}+</span> businesses already using ELEVO
        </span>
      </div>
      <span className="hidden sm:block text-gray-300">·</span>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shrink-0" />
        <span>Last signup: {lastSignup}</span>
      </div>
    </div>
  )
}
