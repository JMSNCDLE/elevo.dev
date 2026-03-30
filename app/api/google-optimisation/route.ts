import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { runGoogleOptimisation } from '@/lib/agents/googleOptAgent'
import type { BusinessProfile } from '@/lib/agents/types'

export async function GET(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan, credits_used, credits_limit').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if ((profile ?? { credits_used: 0 }).credits_used >= (profile ?? { credits_limit: 9999 }).credits_limit) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })

  const { searchParams } = new URL(request.url)
  const businessProfileId = searchParams.get('businessProfileId')
  if (!businessProfileId) return NextResponse.json({ error: 'businessProfileId is required' }, { status: 400 })

  const { data: bp } = await supabase.from('business_profiles').select('*').eq('id', businessProfileId).eq('user_id', user.id).single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  const acceptLanguage = request.headers.get('accept-language') ?? ''
  const locale = acceptLanguage.split(',')[0]?.split(';')[0]?.trim().slice(0, 5) || 'en'

  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: cached } = await supabase
      .from('growth_reports')
      .select('*')
      .eq('type', 'google_opt')
      .eq('business_profile_id', businessProfileId)
      .eq('user_id', user.id)
      .gt('created_at', cutoff)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (cached) {
      return NextResponse.json({ result: cached.content, cached: true })
    }

    const result = await runGoogleOptimisation(bp as BusinessProfile, locale)

    await supabase.from('growth_reports').insert({
      user_id: user.id,
      business_profile_id: bp.id,
      type: 'google_opt',
      title: 'Google Optimisation',
      content: result,
    })
    await supabase.from('profiles').update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + 1 }).eq('id', user.id)

    return NextResponse.json({ result, cached: false })
  } catch (err) {
    console.error('Google optimisation agent error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
