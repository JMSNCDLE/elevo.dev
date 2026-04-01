import { getUserContext } from '@/lib/auth/getUserContext'
import { createWorkflow } from '@/lib/agents/workflow'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const ctx = await getUserContext()
    if (!ctx.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { goal, agent } = await req.json()
    if (!goal || !agent) return NextResponse.json({ error: 'goal and agent required' }, { status: 400 })

    const workflow = await createWorkflow(goal, agent)
    return NextResponse.json(workflow)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[workflow/create]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
