import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceClient } from '@/lib/supabase/server'
import { isAdminId } from '@/lib/admin'

interface TestResult {
  test_name: string
  status: 'pass' | 'fail' | 'error'
  response_time_ms: number
  error_message: string | null
}

// Test definitions
const API_ROUTES = [
  { name: 'Health check', path: '/api/health', method: 'GET' },
  { name: 'Help bot', path: '/api/help-bot', method: 'POST', body: { message: 'test' } },
  { name: 'PA agent', path: '/api/pa', method: 'GET' },
  { name: 'Generate (content)', path: '/api/generate', method: 'OPTIONS' },
  { name: 'Problem solver', path: '/api/problem-solver', method: 'OPTIONS' },
  { name: 'CRM contacts', path: '/api/crm/contacts', method: 'OPTIONS' },
  { name: 'Analytics summary', path: '/api/analytics/summary', method: 'OPTIONS' },
  { name: 'ROAS', path: '/api/roas', method: 'OPTIONS' },
  { name: 'Sales growth', path: '/api/growth/sales', method: 'OPTIONS' },
  { name: 'SEO audit', path: '/api/seo/audit', method: 'OPTIONS' },
  { name: 'Spy analyse', path: '/api/spy/analyse', method: 'OPTIONS' },
  { name: 'Viral strategy', path: '/api/viral/strategy', method: 'OPTIONS' },
  { name: 'Video studio', path: '/api/video-studio/avatar', method: 'OPTIONS' },
  { name: 'Write pro', path: '/api/write-pro/humanise', method: 'OPTIONS' },
  { name: 'Admin stats', path: '/api/admin/stats', method: 'OPTIONS' },
  { name: 'Stripe checkout', path: '/api/stripe/checkout', method: 'OPTIONS' },
]

async function runTest(baseUrl: string, test: { name: string; path: string; method: string; body?: unknown }): Promise<TestResult> {
  const start = performance.now()
  try {
    const opts: RequestInit = {
      method: test.method,
      headers: { 'Content-Type': 'application/json' },
    }
    if (test.body && test.method === 'POST') {
      opts.body = JSON.stringify(test.body)
    }

    const res = await fetch(`${baseUrl}${test.path}`, opts)
    const elapsed = Math.round(performance.now() - start)

    // OPTIONS returns 204 or 405 depending on whether it's implemented — both are fine
    // For actual endpoints, we accept 200, 401 (auth required), 400, 405
    const acceptable = [200, 204, 400, 401, 405, 307]
    if (acceptable.includes(res.status)) {
      return { test_name: test.name, status: 'pass', response_time_ms: elapsed, error_message: null }
    }

    return {
      test_name: test.name,
      status: 'fail',
      response_time_ms: elapsed,
      error_message: `HTTP ${res.status}`,
    }
  } catch (err) {
    const elapsed = Math.round(performance.now() - start)
    return {
      test_name: test.name,
      status: 'error',
      response_time_ms: elapsed,
      error_message: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

// GET — fetch previous test results
export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminId(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = await createServiceClient()
  const { data } = await admin
    .from('test_results')
    .select('*')
    .order('run_at', { ascending: false })
    .limit(100)

  return NextResponse.json({ results: data || [] })
}

// POST — run all tests
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminId(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Determine base URL
  const host = req.headers.get('host') || 'localhost:3000'
  const proto = req.headers.get('x-forwarded-proto') || 'http'
  const baseUrl = `${proto}://${host}`

  // Run API route tests
  const results: TestResult[] = []
  for (const route of API_ROUTES) {
    const result = await runTest(baseUrl, route)
    results.push(result)
  }

  // Supabase connection test
  const sbStart = performance.now()
  try {
    const admin = await createServiceClient()
    const { error } = await admin.from('profiles').select('id').limit(1)
    const elapsed = Math.round(performance.now() - sbStart)
    results.push({
      test_name: 'Supabase connection',
      status: error ? 'fail' : 'pass',
      response_time_ms: elapsed,
      error_message: error?.message || null,
    })
  } catch (err) {
    results.push({
      test_name: 'Supabase connection',
      status: 'error',
      response_time_ms: Math.round(performance.now() - sbStart),
      error_message: err instanceof Error ? err.message : 'Unknown',
    })
  }

  // Environment variable checks
  const envChecks = [
    { name: 'ANTHROPIC_API_KEY', key: 'ANTHROPIC_API_KEY' },
    { name: 'STRIPE_SECRET_KEY', key: 'STRIPE_SECRET_KEY' },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', key: 'SUPABASE_SERVICE_ROLE_KEY' },
    { name: 'RESEND_API_KEY', key: 'RESEND_API_KEY' },
  ]
  for (const check of envChecks) {
    results.push({
      test_name: `Env: ${check.name}`,
      status: process.env[check.key] ? 'pass' : 'fail',
      response_time_ms: 0,
      error_message: process.env[check.key] ? null : 'Not set',
    })
  }

  // Save results to database
  try {
    const admin = await createServiceClient()
    await admin.from('test_results').insert(
      results.map(r => ({
        test_name: r.test_name,
        status: r.status,
        response_time_ms: r.response_time_ms,
        error_message: r.error_message,
      }))
    )
  } catch {
    // Don't fail the response if we can't save
  }

  const passed = results.filter(r => r.status === 'pass').length
  const failed = results.filter(r => r.status === 'fail').length
  const errors = results.filter(r => r.status === 'error').length

  return NextResponse.json({
    summary: { total: results.length, passed, failed, errors },
    results,
    run_at: new Date().toISOString(),
  })
}
