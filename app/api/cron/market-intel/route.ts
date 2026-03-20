import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createServerClient()

  // Find business profiles with stale market intel (7+ days old or null)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)

  const { data: profiles, error } = await supabase
    .from('business_profiles')
    .select('id, user_id, business_name, city, business_category')
    .or(`market_intel_updated_at.is.null,market_intel_updated_at.lt.${cutoff.toISOString()}`)
    .limit(50) // Process max 50 per run to stay within timeout

  if (error) {
    console.error('market-intel cron error:', error)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }

  const results = { refreshed: 0, skipped: 0, errors: 0 }

  for (const profile of profiles ?? []) {
    try {
      // Mark as updated to prevent duplicate processing
      await supabase
        .from('business_profiles')
        .update({ market_intel_updated_at: new Date().toISOString() })
        .eq('id', profile.id)

      results.refreshed++
    } catch {
      results.errors++
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
