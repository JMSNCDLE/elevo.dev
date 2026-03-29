import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { optimiseTitle } from '@/lib/agents/creatorStudioAgent'

const Schema = z.object({
  topic: z.string().min(3),
  platform: z.enum(['youtube', 'tiktok', 'instagram', 'linkedin']).default('youtube'),
  targetAudience: z.string().min(3),
  niche: z.string().min(2),
  currentTitle: z.string().optional(),
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
  if (profile.plan !== 'orbit' && profile.plan !== 'galaxy') {
    return NextResponse.json({ error: 'Orbit plan required' }, { status: 403 })
  }
  if (profile.credits_used + 1 > profile.credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  try {
    const result = await optimiseTitle(parsed.data)

    await supabase
      .from('profiles')
      .update({ credits_used: profile.credits_used + 1 })
      .eq('id', user.id)

    return NextResponse.json({ result })
  } catch (err) {
    console.error('[creator/title]', err)
    return NextResponse.json({ error: 'Title optimisation failed' }, { status: 500 })
  }
}
