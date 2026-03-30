import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { generateTrafficStrategy } from '@/lib/agents/creatorStudioAgent'
import { ADMIN_IDS } from '@/lib/admin'

const Schema = z.object({
  platform: z.enum(['youtube', 'tiktok', 'instagram', 'linkedin']).default('youtube'),
  channelHandle: z.string().min(1),
  recentVideos: z.array(z.object({
    title: z.string(),
    views: z.number(),
    ctr: z.number(),
    avgWatchTime: z.string(),
  })).min(1).max(10),
  goal: z.enum(['subscribers', 'views', 'revenue', 'brand_deals']).default('views'),
  locale: z.string().default('en'),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_used, credits_limit')
    .eq('id', user.id)
    .single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (!ADMIN_IDS.includes(user.id) && profile.plan !== 'orbit' && profile.plan !== 'galaxy') {
    return NextResponse.json({ error: 'Orbit plan required' }, { status: 403 })
  }
  if (!ADMIN_IDS.includes(user.id) && profile && (profile ?? { credits_used: 0 }).credits_used + 2 > (profile ?? { credits_limit: 9999 }).credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  try {
    const result = await generateTrafficStrategy(parsed.data)

    await supabase
      .from('profiles')
      .update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + 2 })
      .eq('id', user.id)

    return NextResponse.json({ result })
  } catch (err) {
    console.error('[creator/traffic]', err)
    return NextResponse.json({ error: 'Traffic strategy generation failed' }, { status: 500 })
  }
}
