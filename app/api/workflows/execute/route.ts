import { getUserContext } from '@/lib/auth/getUserContext'
import { executeNextStep } from '@/lib/agents/workflow'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const ctx = await getUserContext()
    if (!ctx.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { workflowId } = await req.json()
    if (!workflowId) return NextResponse.json({ error: 'workflowId required' }, { status: 400 })

    await executeNextStep(workflowId)

    const { data: workflow } = await ctx.supabase
      .from('workflows')
      .select('*, workflow_steps(*)')
      .eq('id', workflowId)
      .single()

    return NextResponse.json(workflow)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[workflow/execute]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
