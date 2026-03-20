import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { runManagementAgent } from '@/lib/agents/managementAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  documentType: z.enum(['job_description', 'employment_contract_outline', 'performance_review', 'disciplinary_letter', 'onboarding_checklist', 'staff_handbook_section', 'team_meeting_agenda', 'redundancy_letter_outline']),
  roleName: z.string().optional(),
  employeeName: z.string().optional(),
  specificContext: z.string().min(5),
  companySize: z.number().optional(),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan, credits_used, credits_limit').eq('id', user.id).single()
  if (!profile || (profile.plan !== 'orbit' && profile.plan !== 'galaxy')) return NextResponse.json({ error: 'Orbit plan required' }, { status: 403 })
  if (profile.credits_used >= profile.credits_limit) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { data: bp } = await supabase.from('business_profiles').select('*').eq('id', parsed.data.businessProfileId).eq('user_id', user.id).single()
  if (!bp) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const result = await runManagementAgent(bp as BusinessProfile, {
      documentType: parsed.data.documentType,
      roleName: parsed.data.roleName,
      employeeName: parsed.data.employeeName,
      specificContext: parsed.data.specificContext,
      companySize: parsed.data.companySize,
    })

    await supabase.from('growth_reports').insert({ user_id: user.id, business_profile_id: bp.id, type: 'hr_document', title: result.title, content: result })
    await supabase.from('profiles').update({ credits_used: profile.credits_used + 1 }).eq('id', user.id)

    return NextResponse.json({ result })
  } catch (err) {
    console.error('Management agent error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
