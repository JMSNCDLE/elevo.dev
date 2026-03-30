import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { ADMIN_IDS } from '@/lib/admin'
import type { AdPerformanceSummary } from '@/lib/analytics'

function getPeriodStart(period: string): string {
  const now = new Date()
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365
  const start = new Date(now)
  start.setDate(now.getDate() - days)
  return start.toISOString().slice(0, 10)
}

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (!ADMIN_IDS.includes(user.id) && profile.plan !== 'orbit' && profile.plan !== 'galaxy') {
    return NextResponse.json({ error: 'Orbit plan required' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const businessProfileId = searchParams.get('businessProfileId')
  const period = searchParams.get('period') ?? '30d'

  if (!businessProfileId) {
    return NextResponse.json({ error: 'businessProfileId required' }, { status: 400 })
  }

  // Verify ownership
  const { data: bp } = await supabase.from('business_profiles').select('id').eq('id', businessProfileId).eq('user_id', user.id).single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  const startDate = getPeriodStart(period)

  const { data: rows } = await supabase
    .from('ad_performance')
    .select('*')
    .eq('business_profile_id', businessProfileId)
    .gte('date', startDate)
    .order('date', { ascending: true })

  const data = rows ?? []

  // Totals
  const totalSpend = data.reduce((s, r) => s + (r.spend ?? 0), 0)
  const totalRevenue = data.reduce((s, r) => s + (r.revenue ?? 0), 0)
  const totalImpressions = data.reduce((s, r) => s + (r.impressions ?? 0), 0)
  const totalClicks = data.reduce((s, r) => s + (r.clicks ?? 0), 0)
  const totalConversions = data.reduce((s, r) => s + (r.conversions ?? 0), 0)
  const overallROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0
  const avgCPM = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0
  const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0
  const avgCTR = totalImpressions > 0 ? totalClicks / totalImpressions : 0

  // By platform
  const platformMap: Record<string, {
    spend: number; revenue: number; impressions: number; cpm: number; ctr: number
    clicks: number
  }> = {}

  for (const row of data) {
    const p = row.platform ?? 'Unknown'
    if (!platformMap[p]) {
      platformMap[p] = { spend: 0, revenue: 0, impressions: 0, cpm: 0, ctr: 0, clicks: 0 }
    }
    platformMap[p].spend += row.spend ?? 0
    platformMap[p].revenue += row.revenue ?? 0
    platformMap[p].impressions += row.impressions ?? 0
    platformMap[p].clicks += row.clicks ?? 0
  }

  const byPlatform = Object.entries(platformMap).map(([platform, d]) => ({
    platform,
    spend: d.spend,
    revenue: d.revenue,
    roas: d.spend > 0 ? d.revenue / d.spend : 0,
    impressions: d.impressions,
    cpm: d.impressions > 0 ? (d.spend / d.impressions) * 1000 : 0,
    ctr: d.impressions > 0 ? d.clicks / d.impressions : 0,
  }))

  // By day (aggregate across platforms)
  const dayMap: Record<string, { spend: number; revenue: number; impressions: number }> = {}
  for (const row of data) {
    const d = row.date
    if (!dayMap[d]) dayMap[d] = { spend: 0, revenue: 0, impressions: 0 }
    dayMap[d].spend += row.spend ?? 0
    dayMap[d].revenue += row.revenue ?? 0
    dayMap[d].impressions += row.impressions ?? 0
  }

  const performanceByDay = Object.entries(dayMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, d]) => ({
      date,
      spend: d.spend,
      revenue: d.revenue,
      roas: d.spend > 0 ? d.revenue / d.spend : 0,
      impressions: d.impressions,
    }))

  const summary: AdPerformanceSummary = {
    totalSpend,
    totalRevenue,
    overallROAS,
    totalImpressions,
    totalClicks,
    avgCPM,
    avgCPC,
    avgCTR,
    totalConversions,
    byPlatform,
    performanceByDay,
  }

  return NextResponse.json({ summary })
}
