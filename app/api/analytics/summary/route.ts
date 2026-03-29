import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { AnalyticsSummary } from '@/lib/analytics'

function getPeriodDates(period: string): { start: Date; prevStart: Date; prevEnd: Date } {
  const now = new Date()
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365

  const start = new Date(now)
  start.setDate(now.getDate() - days)

  const prevEnd = new Date(start)
  const prevStart = new Date(start)
  prevStart.setDate(prevStart.getDate() - days)

  return { start, prevStart, prevEnd }
}

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const businessProfileId = searchParams.get('businessProfileId')
  const period = searchParams.get('period') ?? '30d'

  const { start, prevStart, prevEnd } = getPeriodDates(period)

  const startStr = start.toISOString().slice(0, 10)
  const prevStartStr = prevStart.toISOString().slice(0, 10)
  const prevEndStr = prevEnd.toISOString().slice(0, 10)

  // Revenue snapshots — current period
  let revenueQuery = supabase
    .from('revenue_snapshots')
    .select('*')
    .eq('user_id', user.id)
    .gte('snapshot_date', startStr)
    .order('snapshot_date', { ascending: true })

  if (businessProfileId) {
    revenueQuery = revenueQuery.eq('business_profile_id', businessProfileId)
  }

  const { data: currentRevenue } = await revenueQuery

  // Revenue snapshots — previous period
  let prevRevenueQuery = supabase
    .from('revenue_snapshots')
    .select('*')
    .eq('user_id', user.id)
    .gte('snapshot_date', prevStartStr)
    .lte('snapshot_date', prevEndStr)

  if (businessProfileId) {
    prevRevenueQuery = prevRevenueQuery.eq('business_profile_id', businessProfileId)
  }

  const { data: prevRevenue } = await prevRevenueQuery

  // Analytics events — current period
  let eventsQuery = supabase
    .from('analytics_events')
    .select('event_type, agent_name, feature, created_at')
    .eq('user_id', user.id)
    .gte('created_at', start.toISOString())

  if (businessProfileId) {
    eventsQuery = eventsQuery.eq('business_profile_id', businessProfileId)
  }

  const { data: events } = await eventsQuery

  // Aggregate current period
  const totalRevenue = (currentRevenue ?? []).reduce((s, r) => s + (r.total_revenue ?? 0), 0)
  const totalJobs = (currentRevenue ?? []).reduce((s, r) => s + (r.total_jobs ?? 0), 0)
  const newCustomers = (currentRevenue ?? []).reduce((s, r) => s + (r.new_customers ?? 0), 0)
  const contentPublished = (currentRevenue ?? []).reduce((s, r) => s + (r.content_published ?? 0), 0)
  const reviewsReceived = (currentRevenue ?? []).reduce((s, r) => s + (r.reviews_received ?? 0), 0)
  const avgJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0

  // Previous period
  const prevTotalRevenue = (prevRevenue ?? []).reduce((s, r) => s + (r.total_revenue ?? 0), 0)
  const prevTotalJobs = (prevRevenue ?? []).reduce((s, r) => s + (r.total_jobs ?? 0), 0)
  const prevNewCustomers = (prevRevenue ?? []).reduce((s, r) => s + (r.new_customers ?? 0), 0)
  const prevAvgJobValue = prevTotalJobs > 0 ? prevTotalRevenue / prevTotalJobs : 0

  function pctChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  // Top agents
  const agentCounts: Record<string, number> = {}
  for (const e of events ?? []) {
    if (e.agent_name) {
      agentCounts[e.agent_name] = (agentCounts[e.agent_name] ?? 0) + 1
    }
  }
  const topAgentsUsed = Object.entries(agentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([agentName, uses]) => ({ agentName, uses }))

  // Top features
  const featureCounts: Record<string, number> = {}
  for (const e of events ?? []) {
    if (e.feature) {
      featureCounts[e.feature] = (featureCounts[e.feature] ?? 0) + 1
    }
  }
  const topFeatures = Object.entries(featureCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([feature, count]) => ({ feature, count }))

  // Revenue by day
  const revenueByDay = (currentRevenue ?? []).map(r => ({
    date: r.snapshot_date,
    revenue: r.total_revenue ?? 0,
    jobs: r.total_jobs ?? 0,
  }))

  const summary: AnalyticsSummary = {
    totalRevenue,
    revenueChange: pctChange(totalRevenue, prevTotalRevenue),
    totalJobs,
    jobsChange: pctChange(totalJobs, prevTotalJobs),
    newCustomers,
    customersChange: pctChange(newCustomers, prevNewCustomers),
    avgJobValue,
    avgJobValueChange: pctChange(avgJobValue, prevAvgJobValue),
    contentPublished,
    reviewsReceived,
    topAgentsUsed,
    revenueByDay,
    topFeatures,
  }

  return NextResponse.json({ summary })
}
