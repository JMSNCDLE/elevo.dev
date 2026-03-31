import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { scanAILandscape } from '@/lib/agents/aiUpdateAgent'
import { ADMIN_IDS } from '@/lib/admin'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  if (!ADMIN_IDS.includes(user.id)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const report = await scanAILandscape('en')
    return NextResponse.json(report)
  } catch (err) {
    console.error('[admin/updates/scan]', err)
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}
