import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { generateViralPost } from '@/lib/agents/viralMarketingAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  platform: z.string().min(1),
  trendToRide: z.string().optional(),
  format: z.string().min(1),
  hook: z.string().optional(),
  locale: z.string().default('en'),
})

const CREDIT_COST = 1

export async function POST(request: Request) {
  // 1. Auth check
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // 2. Zod validate
  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  // 3. Credit check
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_used, credits_limit')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (profile.credits_used + CREDIT_COST > profile.credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  // 4. Fetch business profile
  const { data: bp } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', parsed.data.businessProfileId)
    .eq('user_id', user.id)
    .single()

  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  try {
    // 5. Call agent
    const post = await generateViralPost({
      businessProfile: bp as BusinessProfile,
      platform: parsed.data.platform,
      trendToRide: parsed.data.trendToRide,
      format: parsed.data.format,
      hook: parsed.data.hook,
      locale: parsed.data.locale,
    })

    // 6. Save to saved_generations
    const title = parsed.data.hook ?? post.hook ?? 'Viral Post'
    await supabase.from('saved_generations').insert({
      user_id: user.id,
      business_profile_id: bp.id,
      type: 'viral_post',
      content: JSON.stringify(post),
      metadata: {
        platform: parsed.data.platform,
        format: parsed.data.format,
        hook: post.hook,
        trendToRide: parsed.data.trendToRide,
      },
    })

    // 7. Deduct credits after success
    await supabase
      .from('profiles')
      .update({ credits_used: profile.credits_used + CREDIT_COST })
      .eq('id', user.id)

    return NextResponse.json({ success: true, post, title })
  } catch (err) {
    console.error('[viral/post]', err)
    return NextResponse.json({ error: 'Post generation failed' }, { status: 500 })
  }
}
