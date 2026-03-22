import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateColdEmailSequence } from '@/lib/agents/coldEmailAgent'
import type { ColdEmailInput } from '@/lib/agents/coldEmailAgent'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_remaining')
    .eq('id', user.id)
    .single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const allowedPlans = ['orbit', 'galaxy']
  if (!allowedPlans.includes(profile.plan ?? '')) {
    return NextResponse.json({ error: 'Orbit+ required' }, { status: 403 })
  }
  if ((profile.credits_remaining ?? 0) < 3) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  let body: { input: ColdEmailInput; locale?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { input, locale } = body
  if (!input?.prospectEmail || !input?.prospectName || !input?.businessName || !input?.yourName || !input?.offer) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const sequence = await generateColdEmailSequence(input, locale ?? 'en')

    await supabase
      .from('profiles')
      .update({ credits_remaining: (profile.credits_remaining ?? 0) - 3 })
      .eq('id', user.id)

    return NextResponse.json({ sequence })
  } catch (err) {
    console.error('Cold email agent error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
