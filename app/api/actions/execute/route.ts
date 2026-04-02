import { getUserContext } from '@/lib/auth/getUserContext'
import { executeAction } from '@/lib/core/executeAction'
import { NextResponse } from 'next/server'
import type { ActionSource } from '@/lib/core/idempotency'

// Import to register all handlers
import '@/lib/actions'

export async function POST(req: Request) {
  const ctx = await getUserContext()
  if (!ctx.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action, payload, source = 'manual' } = body as {
    action?: string
    payload?: Record<string, unknown>
    source?: ActionSource
  }

  if (!action || !payload) {
    return NextResponse.json({ error: 'Missing action or payload' }, { status: 400 })
  }

  const result = await executeAction(ctx.user.id, action, payload, source)

  if (result.wasDuplicate) {
    return NextResponse.json({
      ...result,
      message: 'This action was already executed. Returning previous result.',
    })
  }

  return NextResponse.json(result, { status: result.success ? 200 : 500 })
}
