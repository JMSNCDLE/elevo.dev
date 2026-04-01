'use client'

import { useState, useEffect } from 'react'

interface UserContext {
  plan: string
  isAdmin: boolean
  locale: string
  language: string
  email: string
  userId: string
  creditsUsed: number
  creditsLimit: number
}

export function useUserContext() {
  const [ctx, setCtx] = useState<UserContext | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/context')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setCtx(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { ctx, loading }
}
