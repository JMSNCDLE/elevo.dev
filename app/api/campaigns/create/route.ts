import { NextRequest, NextResponse } from 'next/server'
import { getUserContext } from '@/lib/auth/getUserContext'
import { createMessage, MODELS } from '@/lib/agents/client'

export async function POST(req: NextRequest) {
  const ctx = await getUserContext()
  if (!ctx.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { goal, channels = ['email', 'social'], duration = '7 days' } = await req.json()
  if (!goal) return NextResponse.json({ error: 'goal required' }, { status: 400 })

  try {
    const response = await createMessage({
      model: MODELS.AGENT,
      max_tokens: 3000,
      system: `You are ELEVO Campaign Planner. Create a ${duration} marketing campaign plan. Return ONLY valid JSON array of steps. Each step: { "day": number, "channel": string, "action": string, "description": string, "time": string }. Respond in ${ctx.language}.`,
      messages: [{
        role: 'user',
        content: `Business: ${ctx.profile?.full_name || 'My business'}. Goal: ${goal}. Channels: ${channels.join(', ')}.`,
      }],
    })

    const text = response.content.filter((c: { type: string }) => c.type === 'text').map((c: { type: string; text?: string }) => c.text ?? '').join('')

    let plan
    try {
      plan = JSON.parse(text)
    } catch {
      const match = text.match(/\[[\s\S]*\]/)
      plan = match ? JSON.parse(match[0]) : [{ day: 1, channel: 'social', action: 'create_content', description: text.slice(0, 500) }]
    }

    // Save campaign
    const { data: campaign, error } = await ctx.supabase.from('campaigns').insert({
      user_id: ctx.user.id,
      goal,
      channels,
      duration,
      plan,
      status: 'draft',
    }).select().single()

    if (error) {
      // Table may not exist — return plan without saving
      return NextResponse.json({ plan, saved: false })
    }

    return NextResponse.json({ campaign, plan, saved: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[campaigns/create]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
