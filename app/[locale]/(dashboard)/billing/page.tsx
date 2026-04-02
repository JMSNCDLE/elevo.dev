'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  CreditCard, ExternalLink, Loader2, AlertTriangle,
  CheckCircle, Crown, Zap, Rocket,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Profile {
  plan: string
  credits_used: number
  credits_limit: number
  subscription_status: string | null
  trial_ends_at: string | null
}

interface DunningEvent {
  id: string
  amount_due: number
  currency: string
  step: number
  status: string
  failed_at: string
}

const PLAN_INFO: Record<string, { label: string; price: string; icon: React.ElementType; color: string }> = {
  trial: { label: 'Free Trial', price: '€0', icon: Zap, color: 'text-gray-400' },
  launch: { label: 'Launch', price: '€29.99/mo', icon: Rocket, color: 'text-blue-400' },
  orbit: { label: 'Orbit', price: '€49.99/mo', icon: Zap, color: 'text-indigo-400' },
  galaxy: { label: 'Galaxy', price: '€79.99/mo', icon: Crown, color: 'text-purple-400' },
}

export default function BillingPage() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'
  const supabase = createBrowserClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [dunning, setDunning] = useState<DunningEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      Promise.all([
        supabase.from('profiles').select('plan, credits_used, credits_limit, subscription_status, trial_ends_at').eq('id', user.id).single(),
        supabase.from('dunning_events').select('*').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false }).limit(1),
      ]).then(([profileRes, dunningRes]) => {
        setProfile(profileRes.data as Profile | null)
        setDunning((dunningRes.data?.[0] as DunningEvent) ?? null)
        setLoading(false)
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function openBillingPortal() {
    setRedirecting(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error ?? 'Could not open billing portal')
        setRedirecting(false)
      }
    } catch {
      toast.error('Connection error')
      setRedirecting(false)
    }
  }

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>

  const planInfo = PLAN_INFO[profile?.plan ?? 'trial'] ?? PLAN_INFO.trial
  const PlanIcon = planInfo.icon

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="w-5 h-5 text-indigo-400" />
        <h1 className="text-xl font-bold text-white">Billing</h1>
      </div>

      {/* Dunning warning */}
      {dunning && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">Payment failed</p>
            <p className="text-xs text-dashMuted mt-1">
              Your payment of €{(dunning.amount_due / 100).toFixed(2)} failed on {new Date(dunning.failed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}. Please update your payment method to keep your AI agents running.
            </p>
            <button onClick={openBillingPortal} disabled={redirecting}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors">
              {redirecting ? 'Redirecting…' : 'Update payment method →'}
            </button>
          </div>
        </div>
      )}

      {/* Current plan */}
      <div className="bg-dashCard border border-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <PlanIcon className={`w-5 h-5 ${planInfo.color}`} />
            <div>
              <p className="text-lg font-bold text-white">{planInfo.label}</p>
              <p className="text-sm text-dashMuted">{planInfo.price}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {profile?.subscription_status === 'active' && (
              <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Active
              </span>
            )}
            {profile?.subscription_status === 'past_due' && (
              <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Past due
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, ((profile?.credits_used ?? 0) / (profile?.credits_limit || 1)) * 100)}%` }} />
          </div>
          <span className="text-xs text-dashMuted">{profile?.credits_used ?? 0}/{profile?.credits_limit ?? 0} credits</span>
        </div>

        <div className="flex gap-3">
          <button onClick={openBillingPortal} disabled={redirecting}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
            <ExternalLink className="w-4 h-4" />
            {redirecting ? 'Opening…' : 'Manage Billing'}
          </button>
          <Link href={`/${locale}/pricing`}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-dashMuted hover:text-white text-sm font-medium rounded-xl transition-colors border border-white/5">
            Change Plan
          </Link>
        </div>
      </div>

      {/* What's included */}
      <div className="bg-dashCard border border-white/5 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-3">What&apos;s included in your plan</h3>
        <div className="space-y-2 text-sm text-dashMuted">
          {profile?.plan === 'trial' && <p>7-day free trial with full access to Launch features</p>}
          {profile?.plan === 'launch' && <p>Content agents, CRM (100 contacts), Problem Solver, 100 credits/month</p>}
          {profile?.plan === 'orbit' && <p>Everything in Launch + Growth Tools, Intelligence, Social & Media, unlimited contacts, 300 credits/month</p>}
          {profile?.plan === 'galaxy' && <p>Everything in Orbit + Galaxy-exclusive agents, API access, white-label, 999 credits/month</p>}
        </div>
      </div>
    </div>
  )
}
