import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Fast path: lightweight health check (default)
  // Use ?deep=true for full diagnostic including live Anthropic API call
  const deep = req.nextUrl.searchParams.get('deep') === 'true'

  if (!deep) {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    })
  }

  // Deep diagnostic mode (slow — calls Anthropic API)
  const checks: Record<string, string> = {}

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    checks.anthropic = 'MISSING — ANTHROPIC_API_KEY not set'
  } else if (!apiKey.startsWith('sk-ant-')) {
    checks.anthropic = 'INVALID — key does not start with sk-ant-'
  } else {
    checks.anthropic = 'Key loaded (sk-ant-...)'

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Say OK' }],
        }),
      })

      if (res.ok) {
        checks.anthropic_live = 'API call succeeded — key is VALID'
      } else {
        const errBody = await res.text()
        checks.anthropic_live = `API call FAILED (${res.status}): ${errBody.slice(0, 200)}`
      }
    } catch (err) {
      checks.anthropic_live = `API call ERROR: ${err instanceof Error ? err.message : String(err)}`
    }
  }

  checks.supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'MISSING'
  checks.supabase_anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'MISSING'
  checks.supabase_service = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'MISSING'
  checks.resend = process.env.RESEND_API_KEY ? 'Set' : 'MISSING'
  checks.stripe_secret = process.env.STRIPE_SECRET_KEY ? 'Set' : 'MISSING'

  const allOk = !Object.values(checks).some(v => v.includes('ERROR') || v.includes('MISSING') || v.includes('INVALID') || v.includes('FAILED'))

  return NextResponse.json({
    status: allOk ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
    version: '10.0-diagnostic',
  })
}
