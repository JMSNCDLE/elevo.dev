import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'
import LiveAssistantPanel from '@/components/dashboard/LiveAssistantPanel'
import AnalyticsTracker from '@/components/dashboard/AnalyticsTracker'
import HelperBot from '@/components/dashboard/HelperBot'
import SessionTracker from '@/components/dashboard/SessionTracker'
import DeviceAdaptiveLayout from '@/components/dashboard/DeviceAdaptiveLayout'
import ClientStageBadge from '@/components/dashboard/ClientStageBadge'
import CreditsDepleted from '@/components/shared/CreditsDepleted'
import TrialBanner from '@/components/dashboard/TrialBanner'
import { getEffectivePlan } from '@/lib/admin'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, plan, credits_used, credits_limit, trial_ends_at, subscription_status, created_at, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!profile) redirect(`/${locale}/login`)

  const { data: primaryBp } = await supabase
    .from('business_profiles')
    .select('id, business_name, onboarding_complete')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .single()

  // Redirect to onboarding if neither flag is set (new user, never started or finished the wizard)
  const hasOnboarded = profile.onboarding_completed === true || primaryBp?.onboarding_complete === true
  if (!hasOnboarded) {
    redirect(`/${locale}/onboarding`)
  }

  const effectivePlan = getEffectivePlan(user.id, profile.plan)

  const stageBadgeProfile = {
    plan: effectivePlan,
    trialEndsAt: profile.trial_ends_at,
    subscriptionStatus: profile.subscription_status,
    createdAt: profile.created_at,
  }

  return (
    <div data-theme="dark" className="flex min-h-screen bg-dashBg">
      <Sidebar
        locale={locale}
        plan={effectivePlan}
        creditsUsed={profile.credits_used}
        creditsLimit={profile.credits_limit}
        businessName={primaryBp?.business_name}
        userId={user.id}
      />

      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <div className="flex items-center justify-end px-6 pt-4">
          <ClientStageBadge profile={stageBadgeProfile} />
        </div>
        <TrialBanner locale={locale} plan={effectivePlan} trialEndsAt={profile.trial_ends_at} userId={user.id} />
        <div className="px-6 pt-2">
          <CreditsDepleted plan={effectivePlan} creditsUsed={profile.credits_used} creditsLimit={profile.credits_limit} userId={user.id} />
        </div>
        <DeviceAdaptiveLayout userId={profile.id}>
          {children}
        </DeviceAdaptiveLayout>
      </main>

      <LiveAssistantPanel businessProfileId={primaryBp?.id} />
      <AnalyticsTracker businessProfileId={primaryBp?.id} />
      <SessionTracker />
      <HelperBot />
    </div>
  )
}
