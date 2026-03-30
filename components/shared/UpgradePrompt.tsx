'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Rocket, Lock } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { ADMIN_IDS } from '@/lib/admin'

interface UpgradePromptProps {
  locale?: string
  feature?: string
  featureName?: string
  description?: string
  requiredPlan?: string
}

export default function UpgradePrompt({ locale = 'en', feature, featureName, description, requiredPlan }: UpgradePromptProps) {
  const router = useRouter()
  const displayFeature = featureName || feature || 'this feature'
  const plan = requiredPlan || 'orbit'
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1)

  // Admins never see upgrade prompts
  const [isAdmin, setIsAdmin] = useState(false)
  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && ADMIN_IDS.includes(user.id)) setIsAdmin(true)
    })
  }, [])
  if (isAdmin) return null

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mb-4">
        <Lock size={24} className="text-accent" />
      </div>
      <h3 className="text-lg font-semibold text-dashText mb-2">{planLabel} plan required</h3>
      <p className="text-dashMuted text-sm max-w-sm mb-6">
        {description || `${displayFeature.charAt(0).toUpperCase() + displayFeature.slice(1)} is available on the ${planLabel} plan and above. Upgrade to unlock all Growth tools.`}
      </p>
      <button
        onClick={() => router.push(`/${locale}/pricing`)}
        className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors"
      >
        <Rocket size={15} />
        Upgrade to {planLabel}
      </button>
    </div>
  )
}
