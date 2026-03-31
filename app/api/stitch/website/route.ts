import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { generateFullWebsite } from '@/lib/agents/stitchDesignAgent'
import { ADMIN_IDS } from '@/lib/admin'
import type { BusinessProfile } from '@/lib/agents/types'

const CREDIT_COST = 10

const Schema = z.object({
  businessProfileId: z.string().optional(),
  pages: z.array(z.string()).min(1),
  style: z.enum(['modern', 'minimal', 'bold', 'playful', 'luxury']),
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

  if (!ADMIN_IDS.includes(user.id) && (!profile || (profile.plan !== 'orbit' && profile.plan !== 'galaxy'))) {
    return NextResponse.json({ error: 'Orbit plan required' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  if (!ADMIN_IDS.includes(user!.id) && profile && (profile ?? { credits_used: 0 }).credits_used + CREDIT_COST > (profile ?? { credits_limit: 9999 }).credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  let bpQuery = supabase.from('business_profiles').select('*').eq('user_id', user.id)
  if (parsed.data.businessProfileId) {
    bpQuery = bpQuery.eq('id', parsed.data.businessProfileId)
  } else {
    bpQuery = bpQuery.eq('is_primary', true)
  }
  const { data: bp } = await bpQuery.single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  try {
    const result = await generateFullWebsite(
      bp as BusinessProfile,
      parsed.data.pages,
      parsed.data.style,
      parsed.data.locale
    )

    await supabase
      .from('profiles')
      .update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + CREDIT_COST })
      .eq('id', user.id)

    // Save to stitch_designs
    await supabase.from('stitch_designs').insert({
      user_id: user.id,
      business_profile_id: bp.id,
      component_type: 'full-website',
      description: `Full website — pages: ${parsed.data.pages.join(', ')}`,
      code: result,
    })

    return NextResponse.json({ result })
  } catch (err) {
    console.error('Stitch website error:', err)
    return NextResponse.json({ error: 'Agent failed. Please try again.' }, { status: 500 })
  }
}
