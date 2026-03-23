import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getTrendingNow } from '@/lib/agents/viralMarketingAgent'

export async function GET(request: Request) {
  // Check cron secret
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  // Get all Orbit+ users
  const { data: orbitUsers } = await supabase
    .from('profiles')
    .select('id, plan')
    .in('plan', ['orbit', 'galaxy'])

  if (!orbitUsers || orbitUsers.length === 0) {
    return NextResponse.json({ success: true, processed: 0 })
  }

  let processed = 0

  for (const user of orbitUsers) {
    try {
      // Get their primary business profile for niche detection
      const { data: bp } = await supabase
        .from('business_profiles')
        .select('category, city, country')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single()

      const niche = bp?.category ?? 'local business'
      const platforms = ['TikTok', 'Instagram', 'Facebook']

      // Fetch trending for their niche
      const trends = await getTrendingNow(niche, platforms, 'en')

      // Save fresh trends for this user
      await supabase.from('saved_generations').insert({
        user_id: user.id,
        type: 'viral_trending',
        content: JSON.stringify(trends),
        metadata: { niche, platforms, source: 'cron', city: bp?.city, country: bp?.country },
      })

      console.log(`[viral-trends cron] Refreshed trends for user ${user.id} (${niche})`)
      processed++
    } catch (err) {
      console.error(`[viral-trends cron] Failed for user ${user.id}:`, err)
    }
  }

  return NextResponse.json({ success: true, processed })
}
