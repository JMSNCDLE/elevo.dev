import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { runCustomerTrendsAnalysis } from '@/lib/agents/customerTrendsAgent'
import type { BusinessProfile } from '@/lib/agents/types'

export async function GET(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan, credits_used, credits_limit').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (profile.plan !== 'orbit' && profile.plan !== 'galaxy') return NextResponse.json({ error: 'Orbit plan required' }, { status: 403 })
  if (profile.credits_used >= profile.credits_limit) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })

  const { searchParams } = new URL(request.url)
  const businessProfileId = searchParams.get('businessProfileId')
  if (!businessProfileId) return NextResponse.json({ error: 'businessProfileId is required' }, { status: 400 })

  const { data: bp } = await supabase.from('business_profiles').select('*').eq('id', businessProfileId).eq('user_id', user.id).single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  const acceptLanguage = request.headers.get('accept-language') ?? ''
  const locale = acceptLanguage.split(',')[0]?.split(';')[0]?.trim().slice(0, 5) || 'en'

  try {
    const { data: contacts } = await supabase
      .from('contacts')
      .select('status, total_jobs, total_revenue, last_contact_date, tags')
      .eq('user_id', user.id)

    const result = await runCustomerTrendsAnalysis(bp as BusinessProfile, { contacts: contacts ?? [] }, locale)

    await supabase.from('growth_reports').insert({
      user_id: user.id,
      business_profile_id: bp.id,
      type: 'customer_trends',
      title: 'Customer Trends Analysis',
      content: result,
    })
    await supabase.from('profiles').update({ credits_used: profile.credits_used + 2 }).eq('id', user.id)

    return NextResponse.json({ result })
  } catch (err) {
    console.error('Customer trends agent error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
