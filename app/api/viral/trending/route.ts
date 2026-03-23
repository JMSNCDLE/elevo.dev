import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getTrendingNow } from '@/lib/agents/viralMarketingAgent'

const CREDIT_COST = 1
const CACHE_HOURS = 4

export async function GET(request: Request) {
  // 1. Auth check
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const niche = searchParams.get('niche') ?? 'local business'
  const platformsParam = searchParams.get('platforms') ?? 'TikTok,Instagram'
  const locale = searchParams.get('locale') ?? 'en'
  const platforms = platformsParam.split(',').map(p => p.trim()).filter(Boolean)

  // 2. Credit check
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_used, credits_limit')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (profile.credits_used + CREDIT_COST > profile.credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  // 3. Check cache — look for viral_trending in saved_generations from last 4 hours
  const cacheThreshold = new Date(Date.now() - CACHE_HOURS * 60 * 60 * 1000).toISOString()
  const { data: cached } = await supabase
    .from('saved_generations')
    .select('content, created_at')
    .eq('user_id', user.id)
    .eq('type', 'viral_trending')
    .gte('created_at', cacheThreshold)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (cached) {
    try {
      const trends = JSON.parse(cached.content)
      return NextResponse.json({ success: true, trends, cached: true })
    } catch {
      // Cache corrupted — continue to fetch fresh
    }
  }

  try {
    // 4. Fetch fresh trends
    const trends = await getTrendingNow(niche, platforms, locale)

    // 5. Save to saved_generations as cache
    await supabase.from('saved_generations').insert({
      user_id: user.id,
      type: 'viral_trending',
      content: JSON.stringify(trends),
      metadata: { niche, platforms, locale },
    })

    // 6. Deduct credits after success
    await supabase
      .from('profiles')
      .update({ credits_used: profile.credits_used + CREDIT_COST })
      .eq('id', user.id)

    return NextResponse.json({ success: true, trends, cached: false })
  } catch (err) {
    console.error('[viral/trending]', err)
    return NextResponse.json({ error: 'Trend fetch failed' }, { status: 500 })
  }
}
