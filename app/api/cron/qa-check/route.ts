import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { ADMIN_IDS } from '@/lib/admin'

const CRON_SECRET = process.env.CRON_SECRET
const ADMIN_EMAIL = process.env.ELEVO_ADMIN_EMAIL ?? 'team@elevo.dev'
const RESEND_API_KEY = process.env.RESEND_API_KEY
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

interface QAResult {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message: string
  duration?: number
}

async function checkRoute(path: string): Promise<QAResult> {
  const start = Date.now()
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      redirect: 'manual',
      headers: { 'User-Agent': 'ELEVO-QA-Bot/1.0' },
    })
    const duration = Date.now() - start
    // 200 or redirect (302/307) both count as working
    if (res.status < 400) {
      return { name: path, status: 'pass', message: `HTTP ${res.status}`, duration }
    }
    return { name: path, status: 'fail', message: `HTTP ${res.status}`, duration }
  } catch (err) {
    return { name: path, status: 'fail', message: `Error: ${(err as Error).message}`, duration: Date.now() - start }
  }
}

async function checkSupabaseHealth(): Promise<QAResult> {
  const start = Date.now()
  try {
    const supabase = await createServiceClient()
    const { count, error } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
    const duration = Date.now() - start
    if (error) {
      return { name: 'Supabase Connection', status: 'fail', message: `DB error: ${error.message}`, duration }
    }
    return { name: 'Supabase Connection', status: 'pass', message: `OK — ${count ?? 0} profiles`, duration }
  } catch (err) {
    return { name: 'Supabase Connection', status: 'fail', message: `Error: ${(err as Error).message}`, duration: Date.now() - start }
  }
}

async function checkSignupTrigger(): Promise<QAResult> {
  const start = Date.now()
  try {
    const supabase = await createServiceClient()
    // Verify the handle_new_user function exists by checking pg_proc
    const { data, error } = await supabase.rpc('handle_new_user_exists_check').maybeSingle()

    // Fallback: just verify we can query profiles and the trigger schema looks right
    if (error) {
      // Can't use rpc, fall back to checking if profiles table is accessible
      const { error: profileErr } = await supabase.from('profiles').select('id').limit(1)
      if (profileErr) {
        return { name: 'Signup Trigger', status: 'fail', message: `Profiles table inaccessible: ${profileErr.message}`, duration: Date.now() - start }
      }
      return { name: 'Signup Trigger', status: 'warn', message: 'Cannot verify trigger directly — profiles table accessible', duration: Date.now() - start }
    }

    return { name: 'Signup Trigger', status: 'pass', message: 'Trigger function exists', duration: Date.now() - start }
  } catch (err) {
    return { name: 'Signup Trigger', status: 'fail', message: `Error: ${(err as Error).message}`, duration: Date.now() - start }
  }
}

async function checkAdminAccess(): Promise<QAResult> {
  const start = Date.now()
  try {
    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, plan')
      .in('id', ADMIN_IDS)

    if (error || !data || data.length === 0) {
      return { name: 'Admin Account', status: 'fail', message: 'Admin profile missing — run fix-signup-trigger.sql', duration: Date.now() - start }
    }
    const nonAdmin = data.find((d: { role: string }) => d.role !== 'admin')
    if (nonAdmin) {
      return { name: 'Admin Account', status: 'fail', message: `Admin role is "${nonAdmin.role}" — should be "admin"`, duration: Date.now() - start }
    }
    const first = data[0]
    return { name: 'Admin Account', status: 'pass', message: `Admin OK (${data.length} admin(s), ${first.email}, ${first.plan})`, duration: Date.now() - start }
  } catch (err) {
    return { name: 'Admin Account', status: 'fail', message: `Error: ${(err as Error).message}`, duration: Date.now() - start }
  }
}

async function sendCriticalAlert(results: QAResult[]) {
  if (!RESEND_API_KEY) return

  const failures = results.filter(r => r.status === 'fail')
  if (failures.length === 0) return

  const isSignupBroken = failures.some(r =>
    r.name.includes('Signup') || r.name.includes('Supabase') || r.name.includes('Trigger') || r.name.includes('callback')
  )

  const subject = isSignupBroken
    ? 'CRITICAL: Signup broken — ELEVO AI'
    : `QA Alert: ${failures.length} check(s) failed — ELEVO AI`

  const body = `
    <h2 style="color: #dc2626;">${subject}</h2>
    <p>Time: ${new Date().toISOString()}</p>
    <table style="border-collapse: collapse; width: 100%;">
      <tr style="background: #f3f4f6;">
        <th style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">Check</th>
        <th style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">Status</th>
        <th style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">Message</th>
      </tr>
      ${results.map(r => `
        <tr style="background: ${r.status === 'fail' ? '#fef2f2' : r.status === 'warn' ? '#fffbeb' : '#f0fdf4'};">
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${r.name}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; color: ${r.status === 'fail' ? '#dc2626' : r.status === 'warn' ? '#d97706' : '#16a34a'};">${r.status.toUpperCase()}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${r.message}</td>
        </tr>
      `).join('')}
    </table>
    <p style="margin-top: 16px; color: #6b7280; font-size: 12px;">ELEVO QA Cron — automated check</p>
  `

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'ELEVO QA <qa@elevo.dev>',
        to: [ADMIN_EMAIL],
        subject,
        html: body,
      }),
    })
  } catch {
    // Silent fail — don't crash QA for email issues
  }
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: QAResult[] = []

  // 1. Supabase health check
  results.push(await checkSupabaseHealth())

  // 2. Signup trigger check
  results.push(await checkSignupTrigger())

  // 3. Admin account check
  results.push(await checkAdminAccess())

  // 4. Auth routes
  results.push(await checkRoute('/api/auth/callback'))
  results.push(await checkRoute('/en/signup'))
  results.push(await checkRoute('/en/login'))

  // 5. Core dashboard routes
  const dashboardRoutes = [
    '/en/dashboard',
    '/en/agents',
    '/en/admin/qa',
    '/en/admin/updates',
  ]
  for (const route of dashboardRoutes) {
    results.push(await checkRoute(route))
  }

  // 6. API health
  results.push(await checkRoute('/api/health'))

  // Send alert if anything critical failed
  await sendCriticalAlert(results)

  const summary = {
    timestamp: new Date().toISOString(),
    total: results.length,
    passed: results.filter(r => r.status === 'pass').length,
    failed: results.filter(r => r.status === 'fail').length,
    warned: results.filter(r => r.status === 'warn').length,
    results,
  }

  // Save to daily_summaries for admin dashboard
  try {
    const supabase = await createServiceClient()
    await supabase.from('health_checks').insert({
      overall_health: summary.failed > 0 ? 'critical' : summary.warned > 0 ? 'warning' : 'healthy',
      result: summary,
      issues_count: summary.failed + summary.warned,
      critical_count: summary.failed,
    })
  } catch {
    // Don't fail the response
  }

  return NextResponse.json(summary)
}
