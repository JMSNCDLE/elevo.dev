import { NextResponse } from 'next/server'
import { ADMIN_IDS } from '@/lib/admin'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { generateSocialProfileKit } from '@/lib/agents/socialProfileAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const CREDIT_COST = 1

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  platform: z.enum(['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok', 'google']).default('instagram'),
  goal: z.string().min(3).default('grow followers and attract local customers'),
  locale: z.string().default('en'),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_used, credits_limit')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

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
    const result = await generateSocialProfileKit({
      businessProfile: bp as BusinessProfile,
      platform: parsed.data.platform,
      goal: parsed.data.goal,
      locale: parsed.data.locale,
    })

    await supabase
      .from('profiles')
      .update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + CREDIT_COST })
      .eq('id', user.id)

    // Save to saved_generations for library
    await supabase.from('saved_generations').insert({
      user_id: user.id,
      type: 'social_profile',
      content: JSON.stringify(result),
      title: `Social Profile Kit — ${parsed.data.platform}`,
    })

    return NextResponse.json({ result })
  } catch (err) {
    console.error('SMM create-profile error:', err)
    return NextResponse.json({ error: 'Agent failed. Please try again.' }, { status: 500 })
  }
}
