import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { buildProduct } from '@/lib/agents/appBuilderAgent'
import { ADMIN_IDS } from '@/lib/admin'
import type { BusinessProfile } from '@/lib/agents/types'

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  buildType: z.enum([
    'landing_page', 'full_website', 'web_app', 'mobile_concept',
    'internal_tool', 'booking_system',
  ]),
  description: z.string().min(10).max(2000),
  style: z.string().max(50).optional(),
  pages: z.array(z.string()).optional(),
  locale: z.string().default('en'),
})

const CREDIT_COST = 5

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
    const result = await buildProduct(
      {
        businessProfile: bp as BusinessProfile,
        buildType: parsed.data.buildType,
        description: parsed.data.description,
        style: parsed.data.style,
        pages: parsed.data.pages,
        locale: parsed.data.locale,
      },
      parsed.data.locale
    )

    // Deduct credits after success
    await supabase
      .from('profiles')
      .update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + CREDIT_COST })
      .eq('id', user.id)

    // Save to saved_generations
    await supabase
      .from('saved_generations')
      .insert({
        user_id: user.id,
        business_profile_id: parsed.data.businessProfileId,
        type: 'seo',
        title: result.projectName,
        content: result.htmlOutput || JSON.stringify(result),
        metadata: { buildType: parsed.data.buildType, source: 'elevo_build' },
      })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[build-app/generate]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
