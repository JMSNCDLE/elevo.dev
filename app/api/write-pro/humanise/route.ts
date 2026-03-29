import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { humaniseText } from '@/lib/agents/humanCopyAgent'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_used, credits_limit')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const creditsRemaining = (profile.credits_limit ?? 20) - (profile.credits_used ?? 0)
  if (creditsRemaining < 1) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  const body = await request.json()
  const { text, targetTone, brandVoice, platform } = body

  if (!text?.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }

  const { data: bp } = await supabase
    .from('business_profiles')
    .select('locale')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .single()

  const result = await humaniseText({
    text,
    targetTone: targetTone ?? 'conversational',
    brandVoice: brandVoice ?? undefined,
    platform: platform ?? undefined,
    locale: bp?.locale ?? 'en',
  })

  // Deduct credit after success
  await supabase
    .from('profiles')
    .update({ credits_used: (profile.credits_used ?? 0) + 1 })
    .eq('id', user.id)

  // Save to library
  await supabase.from('saved_generations').insert({
    user_id: user.id,
    type: 'write_pro',
    content: result.rewritten,
    metadata: { tone: targetTone, humanScore: result.humanScore },
  })

  return NextResponse.json({ result })
}
