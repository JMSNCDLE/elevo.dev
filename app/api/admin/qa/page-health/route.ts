import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { ADMIN_IDS } from '@/lib/admin'

// GET /api/admin/qa/page-health?route=/en/dashboard/...
// Admin only — checks if a dashboard route returns a non-error status

export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  if (!ADMIN_IDS.includes(user.id)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const route = req.nextUrl.searchParams.get('route')

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ??
    'http://localhost:3000'

  if (!route) {
    // Return list of all known routes to check (for batch use)
    return NextResponse.json({ message: 'Provide ?route= param' })
  }

  try {
    const url = `${appUrl}${route}`
    const start = Date.now()

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        // Forward the session cookie so protected routes don't 401
        Cookie: req.headers.get('cookie') ?? '',
      },
      redirect: 'follow',
      // 8s timeout
      signal: AbortSignal.timeout(8000),
    })

    const responseTime = Date.now() - start
    const statusCode = res.status

    // 200–399 = ok, 401/302 redirect to login = also acceptable (route exists)
    const ok = statusCode < 500 && statusCode !== 404

    return NextResponse.json({ route, ok, statusCode, responseTime })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ route, ok: false, statusCode: 0, error: message, responseTime: 0 })
  }
}
