import { NextResponse } from 'next/server'

export async function GET() {
  const checks: Record<string, string> = {}

  // Check Anthropic API key
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      checks.anthropic = 'MISSING — ANTHROPIC_API_KEY not set'
    } else if (!apiKey.startsWith('sk-ant-')) {
      checks.anthropic = 'INVALID — key does not start with sk-ant-'
    } else {
      checks.anthropic = 'Key loaded (sk-ant-...)'
    }
  } catch (err) {
    checks.anthropic = `ERROR: ${err instanceof Error ? err.message : String(err)}`
  }

  // Check env vars
  checks.supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'MISSING'
  checks.supabase_anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'MISSING'
  checks.supabase_service = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'MISSING'
  checks.resend = process.env.RESEND_API_KEY ? 'Set' : 'MISSING'
  checks.stripe_secret = process.env.STRIPE_SECRET_KEY ? 'Set' : 'MISSING'

  const allOk = !Object.values(checks).some(v => v.includes('ERROR') || v.includes('MISSING') || v.includes('INVALID'))

  return NextResponse.json({
    status: allOk ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
    version: '9.0',
  })
}
