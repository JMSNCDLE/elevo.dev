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
}

const colorMap: Record<string, string> = {
  gray: 'bg-gray-100 text-gray-600',
  green: 'bg-green-100 text-green-700',
  orange: 'bg-orange-100 text-orange-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  purple: 'bg-purple-100 text-purple-700',
}

export default function ClientStageBadge({ profile }: Props) {
  const stage = useClientStage(profile)

  if (stage.stage === 'trial_expired') {
    return (
      <Link href="/en/pricing" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition-colors">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        {stage.label} · Choose a plan
      </Link>
    )
  }

  if (stage.stage === 'trial_expiring') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
        {stage.label}
      </span>
    )
  }

  const colorClass = colorMap[stage.color] ?? colorMap.gray

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current opacity-70`} />
      {stage.label}
    </span>
  )
}
