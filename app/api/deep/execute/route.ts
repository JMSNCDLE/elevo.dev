import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { runDeepExecution } from '@/lib/agents/deepExecutionAgent'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_used, credits_limit')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Galaxy only
  if (profile.plan !== 'galaxy') {
    return NextResponse.json({ error: 'ELEVO Deep™ requires the Galaxy plan' }, { status: 403 })
  }

  const creditsRemaining = (profile.credits_limit ?? 20) - (profile.credits_used ?? 0)
  if (creditsRemaining < 10) {
    return NextResponse.json({ error: 'Insufficient credits. ELEVO Deep™ costs 10 credits.' }, { status: 402 })
  }

  const body = await request.json()
  const { task, outputFormat } = body

  if (!task?.trim()) {
    return NextResponse.json({ error: 'task is required' }, { status: 400 })
  }

  const { data: bp } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .single()

  const result = await runDeepExecution({
    task,
    businessProfile: (bp ?? {}) as Record<string, unknown>,
    outputFormat: outputFormat ?? 'report',
    locale: 'en',
  })

  // Deduct 10 credits after success
  await supabase
    .from('profiles')
    .update({ credits_used: (profile.credits_used ?? 0) + 10 })
    .eq('id', user.id)

  // Save to library
  await supabase.from('saved_generations').insert({
    user_id: user.id,
    type: 'deep_execution',
    content: result.downloadableContent.slice(0, 2000),
    metadata: { outputFormat, sectionsCount: result.sections.length },
  })

  return NextResponse.json({ result })
}
