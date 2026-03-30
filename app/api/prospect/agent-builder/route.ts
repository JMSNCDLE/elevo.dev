import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateAgentBuildBrief } from '@/lib/agents/agentBuilderAgent'
import { ADMIN_IDS } from '@/lib/admin'
import type { AgentBuildInput } from '@/lib/agents/agentBuilderAgent'

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

  if (!ADMIN_IDS.includes(user.id) && profile.plan !== 'galaxy') {
    return NextResponse.json({ error: 'Galaxy plan required' }, { status: 403 })
  }
  if ((profile.credits_remaining ?? 0) < 5) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  let body: { input: AgentBuildInput; locale?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { input, locale } = body
  if (!input?.clientName || !input?.businessType || !input?.mainProblem) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const brief = await generateAgentBuildBrief(input, locale ?? 'en')

    await supabase
      .from('profiles')
      .update({ credits_remaining: (profile.credits_remaining ?? 0) - 5 })
      .eq('id', user.id)

    return NextResponse.json({ brief })
  } catch (err) {
    console.error('Agent builder error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
