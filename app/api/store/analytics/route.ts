import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getShopifyAnalytics } from '@/lib/integrations/shopify'

export async function GET(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const integrationId = searchParams.get('integrationId')
  const period = searchParams.get('period') ?? '30d'

  if (!integrationId) return NextResponse.json({ error: 'integrationId required' }, { status: 400 })

  // Fetch integration and verify ownership
  const { data: integration } = await supabase
    .from('store_integrations')
    .select('*')
    .eq('id', integrationId)
    .eq('user_id', user.id)
    .single()

  if (!integration) return NextResponse.json({ error: 'Integration not found' }, { status: 404 })

  try {
    let analytics: Awaited<ReturnType<typeof getShopifyAnalytics>> | null = null

    if (integration.platform === 'shopify') {
      analytics = await getShopifyAnalytics(
        { shopDomain: integration.store_url, accessToken: integration.access_token },
        period
      )

      // Cache today's snapshot
      const today = new Date().toISOString().slice(0, 10)
      await supabase.from('store_analytics_daily').upsert({
        integration_id: integrationId,
        date: today,
        revenue: analytics.totalRevenue,
        orders: analytics.totalOrders,
        sessions: 0,
        conversion_rate: analytics.conversionRate,
        avg_order_value: analytics.avgOrderValue,
        top_products: analytics.topProducts,
        traffic_sources: analytics.trafficSources,
      }, { onConflict: 'integration_id,date' })

      // Update last synced
      await supabase
        .from('store_integrations')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', integrationId)
    }

    return NextResponse.json({ analytics, platform: integration.platform })
  } catch (err) {
    console.error('[store/analytics]', err)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
