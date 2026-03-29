import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { runDailySMMWorkflow } from '@/lib/agents/superSMMAgent'

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  locale: z.string().default('en'),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan, credits_used, credits_limit').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (profile.plan !== 'orbit' && profile.plan !== 'galaxy') return NextResponse.json({ error: 'Orbit plan required' }, { status: 403 })
  if (profile.credits_used + 2 > profile.credits_limit) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  try {
    const result = await runDailySMMWorkflow({
      businessProfileId: parsed.data.businessProfileId,
      userId: user.id,
      date: new Date().toISOString().split('T')[0],
      connectedPlatforms: [],
      activeMissions: [],
      locale: parsed.data.locale,
    })

    await supabase.from('profiles').update({ credits_used: profile.credits_used + 2 }).eq('id', user.id)

    return NextResponse.json({ result })
  } catch (err) {
    console.error('SMM daily workflow error:', err)
    return NextResponse.json({ error: 'Workflow failed' }, { status: 500 })
  }
}
