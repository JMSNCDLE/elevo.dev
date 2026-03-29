import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getShopifyAnalytics } from '@/lib/integrations/shopify'

export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createServerClient()

  const { data: integrations, error } = await supabase
    .from('store_integrations')
    .select('*')
    .eq('is_active', true)
    .limit(100)

  if (error) {
    console.error('[store-sync] query error:', error)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }

  const results = { synced: 0, errors: 0 }
  const today = new Date().toISOString().slice(0, 10)

  for (const integration of integrations ?? []) {
    try {
      if (integration.platform === 'shopify' && integration.access_token) {
        const analytics = await getShopifyAnalytics(
          { shopDomain: integration.store_url, accessToken: integration.access_token },
          '30d'
        )

        await supabase.from('store_analytics_daily').upsert({
          integration_id: integration.id,
          date: today,
          revenue: analytics.totalRevenue,
          orders: analytics.totalOrders,
          sessions: 0,
          conversion_rate: analytics.conversionRate,
          avg_order_value: analytics.avgOrderValue,
          top_products: analytics.topProducts,
          traffic_sources: analytics.trafficSources,
        }, { onConflict: 'integration_id,date' })

        await supabase
          .from('store_integrations')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', integration.id)

        results.synced++
      }
    } catch (err) {
      console.error(`[store-sync] failed for integration ${integration.id}:`, err)
      results.errors++
    }
  }

  return NextResponse.json({ ...results, timestamp: new Date().toISOString() })
}
