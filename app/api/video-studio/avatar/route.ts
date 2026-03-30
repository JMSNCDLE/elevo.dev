import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateAvatarAdScript } from '@/lib/agents/videoStudioAgent'

const schema = z.object({
  businessProfileId: z.string().uuid(),
  productOrService: z.string().min(1),
  painPoint: z.string().min(1),
  platform: z.string().default('Instagram'),
  duration: z.enum(['15s', '30s', '60s']).default('30s'),
  tone: z.enum(['conversational', 'energetic', 'authoritative', 'friendly']).default('conversational'),
  locale: z.string().default('en'),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { businessProfileId, productOrService, painPoint, platform, duration, tone, locale } = parsed.data

  // Load business profile
  const { data: bp } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', businessProfileId)
    .eq('user_id', user.id)
    .single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  // Credit check (2 credits — Opus powered)
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_used, credits_limit')
    .eq('id', user.id)
    .single()
  if (!profile || (profile ?? { credits_used: 0 }).credits_used + 2 > (profile ?? { credits_limit: 9999 }).credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  const result = await generateAvatarAdScript({
    businessProfile: bp,
    productOrService,
    painPoint,
    platform,
    duration,
    tone,
    locale,
  })

  // Save to ai_videos
  await supabase.from('ai_videos').insert({
    user_id: user.id,
    business_profile_id: businessProfileId,
    title: `${platform} Avatar Ad — ${productOrService.slice(0, 40)}`,
    video_type: 'avatar_ad',
    platform,
    script: result.script,
    voice_style: tone,
    ai_prompts: { dId: result.dIdPrompt, heygen: result.heygenPrompt, elevenlabs: result.elevenLabsVoicePrompt },
  })

  // Deduct credits after success
  await supabase
    .from('profiles')
    .update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + 2 })
    .eq('id', user.id)

  return NextResponse.json({ result })
}
