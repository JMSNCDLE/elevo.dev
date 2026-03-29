'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function SessionTracker() {
  const pathname = usePathname()
  const lastPathRef = useRef<string>('')

  useEffect(() => {
    if (pathname === lastPathRef.current) return
    lastPathRef.current = pathname

    // Fire and forget — track page visit
    fetch('/api/project/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: pathname, agent: 'navigation' }),
    }).catch(() => {})
  }, [pathname])

  return null
}
