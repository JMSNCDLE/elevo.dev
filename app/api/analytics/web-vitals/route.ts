import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceClient } from '@/lib/supabase/server'

const ADMIN_USER_ID = '5dc15dea-4633-441b-b37a-5406e7235114'

// POST — store a web vital metric (fire-and-forget, no auth required)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url, metric_name, metric_value, rating, device_type } = body

    if (!url || !metric_name || metric_value === undefined) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Try to get user ID if authenticated
    let userId: string | null = null
    try {
      const supabase = await createServerClient()
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id ?? null
    } catch {
      // Anonymous user — that's fine
    }

    const admin = await createServiceClient()
    await admin.from('web_vitals').insert({
      user_id: userId,
      url,
      metric_name,
      metric_value,
      rating: rating || null,
      device_type: device_type || 'desktop',
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

// GET — return aggregated metrics for dashboard
export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') || '7', 10)
  const since = new Date(Date.now() - days * 86400000).toISOString()

  // Admin sees all, regular users see their own
  const isAdmin = user.id === ADMIN_USER_ID
  const client = isAdmin ? await createServiceClient() : supabase

  let query = client
    .from('web_vitals')
    .select('metric_name, metric_value, rating, url, device_type, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(2000)

  if (!isAdmin) {
    query = query.eq('user_id', user.id)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const metrics = data || []

  // Aggregate by metric name
  const aggregated: Record<string, { values: number[]; ratings: Record<string, number> }> = {}
  for (const m of metrics) {
    if (!aggregated[m.metric_name]) {
      aggregated[m.metric_name] = { values: [], ratings: { good: 0, 'needs-improvement': 0, poor: 0 } }
    }
    aggregated[m.metric_name].values.push(m.metric_value)
    if (m.rating) aggregated[m.metric_name].ratings[m.rating]++
  }

  const summary: Record<string, { p75: number; median: number; count: number; rating: string }> = {}
  for (const [name, data] of Object.entries(aggregated)) {
    const sorted = data.values.sort((a, b) => a - b)
    const p75 = sorted[Math.floor(sorted.length * 0.75)] ?? 0
    const median = sorted[Math.floor(sorted.length * 0.5)] ?? 0
    const topRating = Object.entries(data.ratings).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'good'
    summary[name] = { p75, median, count: sorted.length, rating: topRating }
  }

  // Per-page breakdown
  const pageMap: Record<string, Record<string, number[]>> = {}
  for (const m of metrics) {
    if (!pageMap[m.url]) pageMap[m.url] = {}
    if (!pageMap[m.url][m.metric_name]) pageMap[m.url][m.metric_name] = []
    pageMap[m.url][m.metric_name].push(m.metric_value)
  }

  const pages = Object.entries(pageMap).map(([url, metricsMap]) => ({
    url,
    metrics: Object.fromEntries(
      Object.entries(metricsMap).map(([name, vals]) => [
        name,
        vals.sort((a, b) => a - b)[Math.floor(vals.length * 0.75)] ?? 0,
      ])
    ),
  })).sort((a, b) => (b.metrics.LCP ?? 0) - (a.metrics.LCP ?? 0))

  return NextResponse.json({ summary, pages, totalSamples: metrics.length })
}
