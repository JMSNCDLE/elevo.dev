import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { runCRMBriefing } from '@/lib/agents/crmAgent'
import type { BusinessProfile } from '@/lib/agents/types'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Parallel queries
  const [
    { count: total },
    { count: active },
    { count: vip },
    { count: lapsed },
    { count: atRisk },
    { count: reviewReady },
    { data: revenueData },
    { data: bp },
  ] = await Promise.all([
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active'),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'vip'),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'lapsed'),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'at_risk'),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).not('review_completed_at', 'is', null),
    supabase.from('contacts').select('total_revenue, total_jobs').eq('user_id', user.id),
    supabase.from('business_profiles').select('*').eq('user_id', user.id).eq('is_primary', true).single(),
  ])

  const totalRevenue = revenueData?.reduce((sum, c) => sum + (c.total_revenue ?? 0), 0) ?? 0
  const totalJobs = revenueData?.reduce((sum, c) => sum + (c.total_jobs ?? 0), 0) ?? 0
  const avgJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0

  const stats = {
    totalContacts: total ?? 0,
    activeContacts: active ?? 0,
    vipContacts: vip ?? 0,
    lapsedContacts: lapsed ?? 0,
    atRiskContacts: atRisk ?? 0,
    reviewReady: reviewReady ?? 0,
    totalRevenue,
    avgJobValue,
  }

  if (!bp) {
    return NextResponse.json({ brief: { ...stats, topSuggestion: '', urgentActions: [], campaignIdea: '' } })
  }

  try {
    const brief = await runCRMBriefing(bp as BusinessProfile, stats)
    return NextResponse.json({ brief })
  } catch {
    return NextResponse.json({ brief: { ...stats, topSuggestion: '', urgentActions: [], campaignIdea: '' } })
  }
}
