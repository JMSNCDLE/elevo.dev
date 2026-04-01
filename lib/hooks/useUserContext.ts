'use client'

import { useState, useEffect } from 'react'

interface UserContextState {
  plan: string | null
  isAdmin: boolean
  locale: string
  language: string
  email: string
  userId: string
  creditsUsed: number
  creditsLimit: number
  loading: boolean
}

export function useUserContext(): UserContextState {
  const [state, setState] = useState<UserContextState>({
    plan: null,
    isAdmin: false,
    locale: 'en',
    language: 'English',
    email: '',
    userId: '',
    creditsUsed: 0,
    creditsLimit: 20,
    loading: true,
  })

  useEffect(() => {
    fetch('/api/user/context')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setState({
            plan: data.plan ?? 'trial',
            isAdmin: data.isAdmin ?? false,
            locale: data.locale ?? 'en',
            language: data.language ?? 'English',
            email: data.email ?? '',
            userId: data.userId ?? '',
            creditsUsed: data.creditsUsed ?? 0,
            creditsLimit: data.creditsLimit ?? 20,
            loading: false,
          })
        } else {
          setState(prev => ({ ...prev, loading: false, plan: 'trial' }))
        }
      })
      .catch(() => {
        setState(prev => ({ ...prev, loading: false, plan: 'trial' }))
      })
  }, [])

  return state
}
