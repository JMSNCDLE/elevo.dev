import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { generateImagePrompts } from '@/lib/agents/visionAgent'
import { ADMIN_IDS } from '@/lib/admin'
import type { BusinessProfile } from '@/lib/agents/types'

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  imageType: z.enum([
    'ad_creative', 'social_graphic', 'product_mockup', 'brand_visual',
    'website_hero', 'logo_concept', 'restaurant_promo', 'lifestyle_photo',
  ]),
  description: z.string().min(5).max(1000),
  style: z.string().max(50),
  platform: z.string().max(50).optional(),
  brandColours: z.array(z.string()).optional(),
  locale: z.string().default('en'),
})

const CREDIT_COST = 1

export async function POST(request: Request) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_used, credits_limit')
    .eq('id', user.id)
    .single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  if (!ADMIN_IDS.includes(user.id) && profile.plan !== 'orbit' && profile.plan !== 'galaxy') {
    return NextResponse.json({ error: 'Orbit plan required' }, { status: 403 })
  }

  if (!ADMIN_IDS.includes(user!.id) && profile && (profile ?? { credits_used: 0 }).credits_used + CREDIT_COST > (profile ?? { credits_limit: 9999 }).credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  const { data: bp } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', parsed.data.businessProfileId)
    .eq('user_id', user.id)
    .single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  try {
    const result = await generateImagePrompts(
      {
        businessProfile: bp as BusinessProfile,
        imageType: parsed.data.imageType,
        description: parsed.data.description,
        style: parsed.data.style,
        platform: parsed.data.platform,
        brandColours: parsed.data.brandColours,
        locale: parsed.data.locale,
      },
      parsed.data.locale
    )

    // Deduct credits after success
    await supabase
      .from('profiles')
      .update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + CREDIT_COST })
      .eq('id', user.id)

    return NextResponse.json(result)
  } catch (err) {
    console.error('[vision/generate]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
