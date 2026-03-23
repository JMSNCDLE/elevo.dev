import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { createSocialPresenceFromScratch } from '@/lib/agents/superSMMAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  platforms: z.array(z.string()).min(1),
  goal: z.string().min(5),
  style: z.string().min(1),
  locale: z.string().default('en'),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan, credits_used, credits_limit').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (profile.credits_used + 5 > profile.credits_limit) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { data: bp } = await supabase.from('business_profiles').select('*').eq('id', parsed.data.businessProfileId).eq('user_id', user.id).single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  try {
    const result = await createSocialPresenceFromScratch({
      businessProfile: bp as BusinessProfile,
      platforms: parsed.data.platforms,
      goal: parsed.data.goal,
      style: parsed.data.style,
      locale: parsed.data.locale,
    })

    await supabase.from('saved_generations').insert({
      user_id: user.id,
      business_profile_id: bp.id,
      type: 'social_caption',
      title: `Social Presence: ${parsed.data.platforms.join(', ')}`,
      content: result,
    })

    await supabase.from('profiles').update({ credits_used: profile.credits_used + 5 }).eq('id', user.id)

    return NextResponse.json({ result })
  } catch (err) {
    console.error('Build presence error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
