import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { findAlternatives } from '@/lib/agents/alternativesAgent'
import type { AlternativeRequest } from '@/lib/agents/alternativesAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  situation: z.string().min(1),
  category: z.string().min(1),
  currentCost: z.number().optional(),
  locale: z.string().min(2),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan, credits_used, credits_limit').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if ((profile ?? { credits_used: 0 }).credits_used >= (profile ?? { credits_limit: 9999 }).credits_limit) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { data: bp } = await supabase.from('business_profiles').select('*').eq('id', parsed.data.businessProfileId).eq('user_id', user.id).single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  try {
    const result = await findAlternatives({
      situation: parsed.data.situation,
      category: parsed.data.category as AlternativeRequest['category'],
      currentCost: parsed.data.currentCost,
      businessProfile: bp as BusinessProfile,
      locale: parsed.data.locale,
    })

    const shortSituation = parsed.data.situation.slice(0, 50)
    await supabase.from('growth_reports').insert({
      user_id: user.id,
      business_profile_id: bp.id,
      type: 'alternatives',
      title: `Alternatives: ${shortSituation}`,
      content: result,
    })
    await supabase.from('profiles').update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + 1 }).eq('id', user.id)

    return NextResponse.json({ result })
  } catch (err) {
    console.error('Alternatives agent error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
