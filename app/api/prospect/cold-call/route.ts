import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateColdCallScript } from '@/lib/agents/coldCallAgent'
import type { ColdCallInput } from '@/lib/agents/coldCallAgent'

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
  if ((profile.credits_remaining ?? 0) < 2) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  let body: { input: ColdCallInput; locale?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { input, locale } = body
  if (!input?.prospectName || !input?.businessName || !input?.yourName || !input?.offer) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const script = await generateColdCallScript(input, locale ?? 'en')

    await supabase
      .from('profiles')
      .update({ credits_remaining: (profile.credits_remaining ?? 0) - 2 })
      .eq('id', user.id)

    return NextResponse.json({ script })
  } catch (err) {
    console.error('Cold call agent error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
