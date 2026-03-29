import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { clipContent } from '@/lib/agents/contentClipAgent'
import type { ClipInput } from '@/lib/agents/contentClipAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const Schema = z.object({
  sourceUrl: z.string().optional(),
  transcript: z.string().optional(),
  videoTitle: z.string().optional(),
  businessProfileId: z.string().uuid(),
  targetPlatforms: z.array(z.string()).min(1),
  clipCount: z.number().int().min(1).max(5).default(3),
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

  const CREDIT_COST = 2
  if (profile.credits_used + CREDIT_COST > profile.credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  const { data: bp } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', parsed.data.businessProfileId)
    .eq('user_id', user.id)
    .single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  if (!parsed.data.sourceUrl && !parsed.data.transcript) {
    return NextResponse.json({ error: 'Either sourceUrl or transcript is required' }, { status: 400 })
  }

  try {
    const input: ClipInput = {
      sourceUrl: parsed.data.sourceUrl,
      transcript: parsed.data.transcript,
      videoTitle: parsed.data.videoTitle,
      businessProfile: bp as BusinessProfile,
      targetPlatforms: parsed.data.targetPlatforms,
      clipCount: parsed.data.clipCount,
      locale: parsed.data.locale,
    }

    const result = await clipContent(input, parsed.data.locale)

    // Save to library
    await supabase.from('saved_generations').insert({
      user_id: user.id,
      business_profile_id: bp.id,
      type: 'clip_strategy',
      title: `Clip Strategy: ${result.sourceTitle}`,
      content: JSON.stringify(result),
    })

    await supabase
      .from('profiles')
      .update({ credits_used: profile.credits_used + CREDIT_COST })
      .eq('id', user.id)

    return NextResponse.json(result)
  } catch (err) {
    console.error('[clip/analyse]', err)
    return NextResponse.json({ error: 'Clip analysis failed' }, { status: 500 })
  }
}
