import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { monitorCompetitor } from '@/lib/agents/competitorSpyAgent'

export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createServerClient()

  // Find competitors due for refresh
  const { data: rows, error } = await supabase
    .from('competitor_intel')
    .select('id, user_id, competitor_name, business_profile_id')
    .eq('alert_enabled', true)
    .lte('next_refresh_at', new Date().toISOString())
    .limit(20)

  if (error) {
    console.error('[spy-monitor]', error)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }

  const results = { monitored: 0, changesFound: 0, errors: 0 }

  for (const row of rows ?? []) {
    try {
      const result = await monitorCompetitor(
        row.competitor_name,
        row.business_profile_id ?? '',
        'en',
      )

      // Update refresh timestamps
      await supabase
        .from('competitor_intel')
        .update({
          last_refreshed_at: new Date().toISOString(),
          next_refresh_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', row.id)

      if (result.changes.length > 0) {
        results.changesFound += result.changes.length
        // Store notification for the user
        await supabase.from('analytics_events').insert({
          user_id: row.user_id,
          event_type: 'competitor_alert',
          metadata: {
            competitor_intel_id: row.id,
            competitor_name: row.competitor_name,
            changes: result.changes,
            summary: result.summary,
          },
        })
      }

      results.monitored++
    } catch (err) {
      console.error(`[spy-monitor] failed for ${row.competitor_name}:`, err)
      results.errors++
    }
  }

  return NextResponse.json({ ...results, timestamp: new Date().toISOString() })
}
