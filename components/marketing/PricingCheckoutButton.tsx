'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

interface PricingCheckoutButtonProps {
  planId: 'launch' | 'orbit' | 'galaxy'
  annual?: boolean
  className: string
  children: React.ReactNode
}

/**
 * Single source of truth for "Start free trial" buttons.
 * - If user is logged in: POSTs /api/stripe/checkout → redirects to Stripe Checkout
 * - If logged out: routes to /signup?plan=<id> (signup page picks it up post-auth)
 */
export default function PricingCheckoutButton({
  planId,
  annual = false,
  className,
  children,
}: PricingCheckoutButtonProps) {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (loading) return
    setLoading(true)
    try {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Persist the plan choice across the signup flow
        try { sessionStorage.setItem('elevo_pending_plan', planId) } catch {}
        router.push(`/${locale}/signup?plan=${planId}`)
        return
      }

      let r: Response
      try {
        r = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId, currency: 'eur', annual }),
        })
      } catch (netErr) {
        console.error('[checkout] network error:', netErr)
        alert('Network error — please check your connection and try again.')
        return
      }

      // Try JSON first; if the server crashed and returned HTML, surface that too
      let data: { url?: string; error?: string; code?: string } = {}
      const text = await r.text()
      try {
        data = text ? JSON.parse(text) : {}
      } catch {
        console.error('[checkout] non-JSON response:', text.slice(0, 500))
        alert(`Server error (${r.status}). Our team has been notified.`)
        return
      }

      if (r.ok && data.url) {
        window.location.href = data.url
        return
      }

      // Auth error → bounce to login with plan preserved
      if (r.status === 401 || data.code === 'unauthorized') {
        try { sessionStorage.setItem('elevo_pending_plan', planId) } catch {}
        router.push(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/pricing`)}&plan=${planId}`)
        return
      }

      console.error('[checkout] api error:', r.status, data)
      alert(data.error ?? `Could not start checkout (${r.status}). Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? 'Redirecting…' : children}
    </button>
  )
}
