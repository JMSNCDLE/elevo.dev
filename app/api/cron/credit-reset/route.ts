import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createServerClient()

  // Reset credits_used to 0 for all active paid subscribers
  const { error, count } = await supabase
    .from('profiles')
    .update({ credits_used: 0 })
    .in('plan', ['launch', 'orbit', 'galaxy'])

  if (error) {
    console.error('credit-reset cron error:', error)
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, reset: count ?? 0 })
}
