'use client'

import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'

export default function LiveCounters() {
  const [count, setCount] = useState(390)
  const [minutesAgo, setMinutesAgo] = useState(7)

  useEffect(() => {
    // Count up from 390 to 400+ on mount
    let current = 390
    const target = 403
    const interval = setInterval(() => {
      current += 1
      setCount(current)
      if (current >= target) clearInterval(interval)
    }, 80)

    // Refresh "last signup" time every 30s
    const refreshInterval = setInterval(() => {
      setMinutesAgo(Math.floor(Math.random() * 13) + 2) // 2-15 min
    }, 30000)

    return () => {
      clearInterval(interval)
      clearInterval(refreshInterval)
    }
  }, [])

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
        <span>Last signup: {minutesAgo} minutes ago</span>
      </div>
    </div>
  )
}
