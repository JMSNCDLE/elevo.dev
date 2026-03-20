'use client'

import { useRouter } from 'next/navigation'
import { Rocket, Lock } from 'lucide-react'

interface UpgradePromptProps {
  locale: string
  feature?: string
}

export default function UpgradePrompt({ locale, feature = 'this feature' }: UpgradePromptProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mb-4">
        <Lock size={24} className="text-accent" />
      </div>
      <h3 className="text-lg font-semibold text-dashText mb-2">Orbit plan required</h3>
      <p className="text-dashMuted text-sm max-w-sm mb-6">
        {feature.charAt(0).toUpperCase() + feature.slice(1)} is available on the Orbit plan and above. Upgrade to unlock all Growth tools.
      </p>
      <button
        onClick={() => router.push(`/${locale}/pricing`)}
        className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors"
      >
        <Rocket size={15} />
        Upgrade to Orbit
      </button>
    </div>
  )
}
