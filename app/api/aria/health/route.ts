import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const pages = [
    { name: 'Homepage', url: 'https://www.elevo.dev/en' },
    { name: 'Pricing', url: 'https://www.elevo.dev/en/pricing' },
    { name: 'Login', url: 'https://www.elevo.dev/en/login' },
    { name: 'Signup', url: 'https://www.elevo.dev/en/signup' },
    { name: 'Blog', url: 'https://www.elevo.dev/en/blog' },
    { name: 'Waitlist', url: 'https://www.elevo.dev/en/launch' },
  ]

  const pageResults: Array<{ name: string; status: number; ok: boolean; latency_ms: number; error?: string }> = []
  for (const page of pages) {
    try {
      const start = Date.now()
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const res = await fetch(page.url, { method: 'HEAD', signal: controller.signal })
      clearTimeout(timeout)
      pageResults.push({ name: page.name, status: res.status, ok: res.status < 400, latency_ms: Date.now() - start })
    } catch (error: unknown) {
      pageResults.push({ name: page.name, status: 0, ok: false, latency_ms: 0, error: error instanceof Error ? error.message : 'Unknown' })
    }
  }

  let supabaseOk = false
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
    supabaseOk = !error
  } catch { /* */ }

  let stripeOk = false
  try {
    if (process.env.STRIPE_SECRET_KEY) {
      const res = await fetch('https://api.stripe.com/v1/balance', {
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      })
      stripeOk = res.ok
    }
  } catch { /* */ }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    overall: pageResults.every(p => p.ok) && supabaseOk ? 'healthy' : 'degraded',
    pages: pageResults,
    services: { supabase: supabaseOk ? 'ok' : 'down', stripe: stripeOk ? 'ok' : 'not_configured' },
  })
}
