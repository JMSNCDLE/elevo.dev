import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { generateCreativePrompts } from '@/lib/agents/creativeStudioAgent'
import type { BusinessProfile } from '@/lib/agents/types'
import type { CreativeOutputType } from '@/lib/agents/creativeStudioAgent'

const CREDIT_COSTS: Record<CreativeOutputType, number> = {
  text_to_image: 1,
  text_to_video: 2,
  image_to_video: 2,
  text_to_speech: 1,
  speech_to_text: 1,
  image_edit: 1,
  brand_design: 3,
  social_graphic: 1,
  ad_creative: 2,
  logo_concept: 3,
  product_mockup: 2,
}

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  outputType: z.enum([
    'text_to_image', 'text_to_video', 'image_to_video', 'text_to_speech',
    'speech_to_text', 'image_edit', 'brand_design', 'social_graphic',
    'ad_creative', 'logo_concept', 'product_mockup',
  ]),
  description: z.string().min(5),
  style: z.string().optional(),
  platform: z.string().optional(),
  locale: z.string().default('en'),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const { businessProfileId, outputType, description, style, platform, locale } = parsed.data
  const creditCost = CREDIT_COSTS[outputType as CreativeOutputType] ?? 1

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_used, credits_limit')
    .eq('id', user.id)
    .single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (profile.credits_used + creditCost > profile.credits_limit) {
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
    const result = await generateCreativePrompts(
      {
        businessProfile: bp as BusinessProfile,
        outputType: outputType as CreativeOutputType,
        description,
        style,
        platform,
        locale,
      },
      locale
    )

    const { data: project } = await supabase
      .from('creative_projects')
      .insert({
        user_id: user.id,
        business_profile_id: bp.id,
        title: description.slice(0, 100),
        output_type: outputType,
        description,
        prompts: result.prompts,
        brand_consistency: result.brandConsistency,
        status: 'ready',
      })
      .select()
      .single()

    await supabase
      .from('profiles')
      .update({ credits_used: profile.credits_used + creditCost })
      .eq('id', user.id)

    return NextResponse.json({ success: true, project, result })
  } catch (err) {
    console.error('Creative generate error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
