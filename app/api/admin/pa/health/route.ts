import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { runHealthCheck } from '@/lib/agents/paEngineerAgent'

export async function GET() {
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev'
    const result = await runHealthCheck(appUrl)

    const issuesCount = result.issues.length
    const criticalCount = result.issues.filter(i => i.severity === 'critical').length

    await supabase.from('health_checks').insert({
      overall_health: result.overallHealth,
      result: result as unknown as Record<string, unknown>,
      issues_count: issuesCount,
      critical_count: criticalCount,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[admin/pa/health]', err)
    return NextResponse.json({ error: 'Health check failed' }, { status: 500 })
  }
}
