import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { runSalesAgent } from '@/lib/agents/salesAgent'
import { ADMIN_IDS } from '@/lib/admin'
import type { BusinessProfile } from '@/lib/agents/types'

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  clientName: z.string().min(1),
  clientBusiness: z.string().optional(),
  projectBrief: z.string().min(10),
  services: z.array(z.string()).default([]),
  budget: z.string().optional(),
  timeline: z.string().optional(),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan, credits_used, credits_limit').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (!ADMIN_IDS.includes(user.id) && profile.plan !== 'orbit' && profile.plan !== 'galaxy') return NextResponse.json({ error: 'Orbit plan required' }, { status: 403 })
  if (!ADMIN_IDS.includes(user.id) && profile && (profile ?? { credits_used: 0 }).credits_used >= (profile ?? { credits_limit: 9999 }).credits_limit) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { data: bp } = await supabase.from('business_profiles').select('*').eq('id', parsed.data.businessProfileId).eq('user_id', user.id).single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  try {
    const result = await runSalesAgent(bp as BusinessProfile, {
      clientName: parsed.data.clientName,
      clientBusiness: parsed.data.clientBusiness,
      projectBrief: parsed.data.projectBrief,
      services: parsed.data.services,
      budget: parsed.data.budget,
      timeline: parsed.data.timeline,
    })

    await supabase.from('growth_reports').insert({ user_id: user.id, business_profile_id: bp.id, type: 'sales_proposal', title: `Proposal for ${parsed.data.clientName}`, content: result })
    await supabase.from('profiles').update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + 1 }).eq('id', user.id)

    return NextResponse.json({ result })
  } catch (err) {
    console.error('Sales agent error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
