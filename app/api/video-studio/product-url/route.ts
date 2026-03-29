import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateProductVideoFromUrl } from '@/lib/agents/videoStudioAgent'

const schema = z.object({
  businessProfileId: z.string().uuid(),
  productUrl: z.string().url(),
  platform: z.string().default('Instagram'),
  objective: z.enum(['sales', 'awareness', 'traffic']).default('sales'),
  locale: z.string().default('en'),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { businessProfileId, productUrl, platform, objective, locale } = parsed.data

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
  if (!profile || profile.credits_used + 2 > profile.credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  const result = await generateProductVideoFromUrl({
    productUrl,
    businessProfile: bp,
    platform,
    objective,
    locale,
  })

  await supabase.from('ai_videos').insert({
    user_id: user.id,
    business_profile_id: businessProfileId,
    title: `Product Video — ${new URL(productUrl).hostname}`,
    video_type: 'product_url_ad',
    platform,
    product_url: productUrl,
    script: result.fullScript,
    ai_prompts: { higgsfield: result.higgsfieldScenes, elevenlabs: result.elevenLabsPrompt },
  })

  await supabase
    .from('profiles')
    .update({ credits_used: profile.credits_used + 2 })
    .eq('id', user.id)

  return NextResponse.json({ result })
}
