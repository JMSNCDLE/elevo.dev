'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { ADMIN_IDS } from '@/lib/admin'

export function useEffectivePlan() {
  const [plan, setPlan] = useState<string>('trial')
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      setUserId(user.id)

      // Admin override — always galaxy
      if (ADMIN_IDS.includes(user.id)) {
        setPlan('galaxy')
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()

      setPlan(data?.plan ?? 'trial')
      setLoading(false)
    }
    load()
  }, [])

  return { plan, userId, loading, isAdmin: ADMIN_IDS.includes(userId) }
}
