import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { scanAILandscape } from '@/lib/agents/aiUpdateAgent'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
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
