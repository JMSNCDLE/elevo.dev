import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateVoiceoverScript } from '@/lib/agents/videoStudioAgent'

const schema = z.object({
  businessProfileId: z.string().uuid(),
  content: z.string().min(1),
  voiceStyle: z.string().default('conversational'),
  emotion: z.enum(['excited', 'calm', 'urgent', 'warm', 'professional']).default('warm'),
  language: z.string().default('en'),
  platform: z.string().default('Instagram'),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { businessProfileId, content, voiceStyle, emotion, language, platform } = parsed.data

  const { data: bp } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', businessProfileId)
    .eq('user_id', user.id)
    .single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_used, credits_limit')
    .eq('id', user.id)
    .single()
  if (!profile || profile.credits_used + 1 > profile.credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  const result = await generateVoiceoverScript({
    businessProfile: bp,
    content,
    voiceStyle,
    emotion,
    language,
    platform,
  })

  await supabase.from('ai_videos').insert({
    user_id: user.id,
    business_profile_id: businessProfileId,
    title: `Voiceover — ${content.slice(0, 40)}`,
    video_type: 'voiceover_ugc',
    platform,
    script: result.script,
    voice_style: voiceStyle,
    ai_prompts: { ssml: result.ssmlMarkup, voices: result.voiceRecommendations },
  })

  await supabase
    .from('profiles')
    .update({ credits_used: profile.credits_used + 1 })
    .eq('id', user.id)

  return NextResponse.json({ result })
}
