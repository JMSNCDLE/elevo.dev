import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'
import LiveAssistantPanel from '@/components/dashboard/LiveAssistantPanel'
import AnalyticsTracker from '@/components/dashboard/AnalyticsTracker'
import HelperBot from '@/components/dashboard/HelperBot'

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
    .select('plan, credits_used, credits_limit')
    .eq('id', user.id)
    .single()

  if (!profile) redirect(`/${locale}/login`)

  const { data: primaryBp } = await supabase
    .from('business_profiles')
    .select('id, business_name, onboarding_complete')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .single()

  // Redirect to onboarding if not complete
  if (!primaryBp?.onboarding_complete) {
    const { pathname } = new URL(`http://x/${locale}/dashboard`)
    if (!pathname.includes('onboarding')) {
      redirect(`/${locale}/onboarding`)
    }
  }

  return (
    <div data-theme="dark" className="flex min-h-screen bg-dashBg">
      <Sidebar
        locale={locale}
        plan={profile.plan}
        creditsUsed={profile.credits_used}
        creditsLimit={profile.credits_limit}
        businessName={primaryBp?.business_name}
      />

      <main className="flex-1 overflow-auto">
        {children}
      </main>

      <LiveAssistantPanel businessProfileId={primaryBp?.id} />
      <AnalyticsTracker businessProfileId={primaryBp?.id} />
      <HelperBot />
    </div>
  )
}
