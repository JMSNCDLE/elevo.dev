'use client'
import Link from 'next/link'
import { useClientStage } from '@/lib/hooks/useClientStage'

interface Props {
  profile: {
    plan?: string
    trialEndsAt?: string
    subscriptionStatus?: string
    createdAt?: string
  } | null
  currentFeatureRequires?: 'orbit' | 'galaxy'
}

export default function StagePrompt({ profile, currentFeatureRequires }: Props) {
  const stage = useClientStage(profile)

  if (stage.stage === 'trial_expired') {
    return (
      <div className="mx-6 mt-4 flex items-center justify-between gap-4 px-4 py-3 bg-red-900/30 border border-red-500/30 rounded-xl">
        <div>
          <p className="text-red-300 text-sm font-medium">Your trial has ended. Your agents are paused.</p>
          <p className="text-red-400/70 text-xs mt-0.5">Choose a plan to reactivate your full AI team.</p>
        </div>
        <Link
          href="/en/pricing"
          className="shrink-0 px-4 py-2 bg-red-500 hover:bg-red-400 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Choose plan →
        </Link>
      </div>
    )
  }

  if (stage.stage === 'trial_expiring') {
    return (
      <div className="mx-6 mt-4 flex items-center justify-between gap-4 px-4 py-3 bg-amber-900/30 border border-amber-500/30 rounded-xl">
        <div>
          <p className="text-amber-300 text-sm font-medium">{stage.label} — don&apos;t lose your agents.</p>
          <p className="text-amber-400/70 text-xs mt-0.5">Upgrade now to keep everything and lock in your price.</p>
        </div>
        <Link
          href="/en/pricing"
          className="shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Upgrade now →
        </Link>
      </div>
    )
  }

  if (currentFeatureRequires === 'orbit' && (stage.stage === 'trial' || stage.stage === 'trial_active' || stage.stage === 'launch')) {
    return (
      <div className="mx-6 mt-4 flex items-center justify-between gap-4 px-4 py-3 bg-indigo-900/30 border border-indigo-500/30 rounded-xl">
        <p className="text-indigo-300 text-sm font-medium">This feature needs Orbit — upgrade for €79/month</p>
        <Link
          href="/en/pricing"
          className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Upgrade now →
        </Link>
      </div>
    )
  }

  if (currentFeatureRequires === 'galaxy' && stage.stage !== 'galaxy') {
    return (
      <div className="mx-6 mt-4 flex items-center justify-between gap-4 px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-xl">
        <p className="text-purple-300 text-sm font-medium">This feature needs Galaxy — upgrade for €149/month</p>
        <Link
          href="/en/pricing"
          className="shrink-0 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Upgrade now →
        </Link>
      </div>
    )
  }

  return null
}
