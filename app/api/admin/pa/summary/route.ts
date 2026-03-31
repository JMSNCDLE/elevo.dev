import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateDailySummary } from '@/lib/agents/paEngineerAgent'
import { ADMIN_IDS } from '@/lib/admin'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  if (!ADMIN_IDS.includes(user.id)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const summary = await generateDailySummary(user.id)
    return NextResponse.json(summary)
  } catch (err) {
    console.error('[admin/pa/summary]', err)
    return NextResponse.json({ error: 'Summary generation failed' }, { status: 500 })
  }
}
