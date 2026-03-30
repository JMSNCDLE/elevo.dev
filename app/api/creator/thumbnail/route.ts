import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { generateThumbnailBrief } from '@/lib/agents/creatorStudioAgent'
import { ADMIN_IDS } from '@/lib/admin'

const Schema = z.object({
  videoTitle: z.string().min(3),
  topic: z.string().min(3),
  platform: z.enum(['youtube', 'tiktok', 'instagram', 'linkedin']).default('youtube'),
  niche: z.string().min(2),
  channelStyle: z.string().optional(),
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
  if (!ADMIN_IDS.includes(user.id) && profile && (profile ?? { credits_used: 0 }).credits_used + 1 > (profile ?? { credits_limit: 9999 }).credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  try {
    const result = await generateThumbnailBrief(parsed.data)

    await supabase
      .from('profiles')
      .update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + 1 })
      .eq('id', user.id)

    return NextResponse.json({ result })
  } catch (err) {
    console.error('[creator/thumbnail]', err)
    return NextResponse.json({ error: 'Thumbnail brief generation failed' }, { status: 500 })
  }
}
