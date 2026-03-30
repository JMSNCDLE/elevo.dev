import { NextResponse } from 'next/server'
import { ADMIN_IDS } from '@/lib/admin'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { generateSocialGraphic } from '@/lib/agents/creativeStudioAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const CREDIT_COST = 1

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  platform: z.string().min(1),
  contentType: z.string().min(1),
  topic: z.string().min(3),
  copy: z.string().optional(),
  locale: z.string().default('en'),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const { businessProfileId, platform, contentType, topic, copy, locale } = parsed.data

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_used, credits_limit')
    .eq('id', user.id)
    .single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (!ADMIN_IDS.includes(user!.id) && profile && (profile ?? { credits_used: 0 }).credits_used + CREDIT_COST > (profile ?? { credits_limit: 9999 }).credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  const { data: bp } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', businessProfileId)
    .eq('user_id', user.id)
    .single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  try {
    const graphic = await generateSocialGraphic({
      businessProfile: bp as BusinessProfile,
      platform,
      contentType,
      topic,
      copy,
      locale,
    })

    await supabase
      .from('profiles')
      .update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + CREDIT_COST })
      .eq('id', user.id)

    return NextResponse.json({ success: true, graphic })
  } catch (err) {
    console.error('Social graphic error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
