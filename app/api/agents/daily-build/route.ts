import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const HEALTH_CHECKS = [
  { name: 'Homepage', url: 'https://www.elevo.dev/en', expect: 200 },
  { name: 'Pricing', url: 'https://www.elevo.dev/en/pricing', expect: 200 },
  { name: 'Blog', url: 'https://www.elevo.dev/en/blog', expect: 200 },
  { name: 'Compare', url: 'https://www.elevo.dev/en/compare', expect: 200 },
  { name: 'About', url: 'https://www.elevo.dev/en/about', expect: 200 },
  { name: 'Changelog', url: 'https://www.elevo.dev/en/changelog', expect: 200 },
  { name: 'Status', url: 'https://www.elevo.dev/en/status', expect: 200 },
  { name: 'Compare Jasper', url: 'https://www.elevo.dev/en/compare/jasper', expect: 200 },
  { name: 'Compare HubSpot', url: 'https://www.elevo.dev/en/compare/hubspot', expect: 200 },
  { name: 'Compare Copy.ai', url: 'https://www.elevo.dev/en/compare/copy-ai', expect: 200 },
  { name: 'Compare ChatGPT', url: 'https://www.elevo.dev/en/compare/chatgpt', expect: 200 },
]

const AGENT_ROUTES = [
  '/en/market', '/en/creator', '/en/spy', '/en/drop',
  '/en/clip', '/en/viral', '/en/seo',
  '/en/write-pro', '/en/deep', '/en/prospect',
  '/en/analytics', '/en/finances', '/en/roas',
]

const API_CHECKS = [
  '/api/health',
]

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const results: Array<{ name: string; url: string; status: number; passed: boolean }> = []
    const issues: Array<{ type: string; severity: string; name: string; url?: string; expected?: number; actual?: number; status?: number; error?: string }> = []

    // 1. Health check all pages
    for (const check of HEALTH_CHECKS) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)
        const res = await fetch(check.url, { method: 'HEAD', redirect: 'follow', signal: controller.signal })
        clearTimeout(timeout)
        const passed = res.status === check.expect
        results.push({ name: check.name, url: check.url, status: res.status, passed })
        if (!passed) {
          issues.push({
            type: 'broken_page',
            severity: 'high',
            name: check.name,
            url: check.url,
            expected: check.expect,
            actual: res.status,
          })
        }
      } catch (err: unknown) {
        results.push({ name: check.name, url: check.url, status: 0, passed: false })
        issues.push({
          type: 'unreachable',
          severity: 'critical',
          name: check.name,
          url: check.url,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    // 2. Check all agent routes
    for (const route of AGENT_ROUTES) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)
        const res = await fetch(`https://www.elevo.dev${route}`, { method: 'HEAD', redirect: 'follow', signal: controller.signal })
        clearTimeout(timeout)
        if (res.status !== 200 && res.status !== 307 && res.status !== 308) {
          issues.push({
            type: 'agent_down',
            severity: 'medium',
            name: route,
            status: res.status,
          })
        }
      } catch (err: unknown) {
        issues.push({
          type: 'agent_unreachable',
          severity: 'high',
          name: route,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    // 3. Check API routes
    for (const api of API_CHECKS) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)
        const res = await fetch(`https://www.elevo.dev${api}`, { signal: controller.signal })
        clearTimeout(timeout)
        if (res.status >= 500) {
          issues.push({
            type: 'api_error',
            severity: 'high',
            name: api,
            status: res.status,
          })
        }
      } catch (err: unknown) {
        issues.push({
          type: 'api_unreachable',
          severity: 'medium',
          name: api,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    // 4. Check env vars
    if (!process.env.STRIPE_SECRET_KEY) {
      issues.push({ type: 'env_missing', severity: 'critical', name: 'STRIPE_SECRET_KEY' })
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      issues.push({ type: 'env_missing', severity: 'critical', name: 'ANTHROPIC_API_KEY' })
    }

    // 5. Build report
    const report = {
      timestamp: new Date().toISOString(),
      total_checks: results.length + AGENT_ROUTES.length + API_CHECKS.length,
      passed: results.filter(r => r.passed).length,
      failed: issues.length,
      issues,
      results,
    }

    // 6. Log to Supabase
    const { data: inserted } = await supabase.from('build_agent_reports').insert({
      report,
      issues_count: issues.length,
      critical_count: issues.filter(i => i.severity === 'critical').length,
      created_at: new Date().toISOString(),
    }).select('id').single()

    // 7. If critical/high issues, generate fix plan with AI
    const severeIssues = issues.filter(i => i.severity === 'critical' || i.severity === 'high')
    let fixPlan = ''

    if (severeIssues.length > 0 && process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: `You are Aria, the ELEVO AI build agent. Analyse these issues and generate a prioritised fix plan:\n\n${JSON.stringify(severeIssues, null, 2)}\n\nFor each issue, provide:\n1. What's broken\n2. Likely cause\n3. Fix priority (P0/P1/P2)\n4. Suggested fix (file path + change description)`
          }],
        })

        fixPlan = message.content[0].type === 'text' ? message.content[0].text : ''

        if (inserted?.id) {
          await supabase.from('build_agent_reports').update({ fix_plan: fixPlan }).eq('id', inserted.id)
        }
      } catch {
        // AI analysis failed, continue without fix plan
      }
    }

    // 8. Send Telegram notification for critical issues
    const criticalCount = issues.filter(i => i.severity === 'critical').length
    if (criticalCount > 0 && process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const telegramMsg = `🚨 ELEVO Build Agent Alert\n\n${issues.length} issues found (${criticalCount} critical)\n\nTop issues:\n${issues.slice(0, 5).map(i => `• [${i.severity.toUpperCase()}] ${i.name}: ${i.type}`).join('\n')}\n\nCheck: https://www.elevo.dev/en/admin/build-agent`

      try {
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: telegramMsg,
          }),
        })
      } catch {
        // Telegram notification failed, non-critical
      }
    }

    // 9. Log to agent_communications if table exists
    try {
      await supabase.from('agent_communications').insert({
        from_agent: 'build-agent',
        to_agent: 'aria-pa',
        message: issues.length === 0
          ? 'Daily health check: All systems operational.'
          : `Daily health check: ${issues.length} issues found (${criticalCount} critical).\n\n${fixPlan ? `Fix Plan:\n${fixPlan}` : ''}`,
        priority: criticalCount > 0 ? 'high' : issues.length > 0 ? 'medium' : 'low',
      })
    } catch {
      // agent_communications table may not exist yet
    }

    return NextResponse.json({
      status: issues.length === 0 ? 'all_clear' : 'issues_found',
      summary: issues.length === 0
        ? `All ${report.total_checks} checks passed`
        : `${issues.length} issues found (${criticalCount} critical)`,
      issues,
      fix_plan: fixPlan || undefined,
      results,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET handler for cron
export async function GET() {
  return POST()
}
