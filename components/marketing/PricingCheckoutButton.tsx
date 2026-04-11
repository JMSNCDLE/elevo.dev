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

      const r = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, currency: 'eur', annual }),
      })
      const data = await r.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      console.error('Checkout error:', data.error)
      alert(typeof data.error === 'string' ? data.error : 'Could not start checkout. Please try again.')
    } catch (err) {
      console.error('Checkout failed:', err)
      alert('Connection error. Please try again.')
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
