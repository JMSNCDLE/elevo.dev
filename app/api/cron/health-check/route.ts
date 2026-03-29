import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { runHealthCheck } from '@/lib/agents/paEngineerAgent'
import { sendEmail } from '@/lib/email/send'
import { sendWhatsAppToJames, JAMES_ALERTS } from '@/lib/notifications/whatsapp'

export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev'
    const result = await runHealthCheck(appUrl)

    const supabase = await createServerClient()

    const issuesCount = result.issues.length
    const criticalCount = result.issues.filter(i => i.severity === 'critical').length

    await supabase.from('health_checks').insert({
      overall_health: result.overallHealth,
      result: result as unknown as Record<string, unknown>,
      issues_count: issuesCount,
      critical_count: criticalCount,
    })

    // WhatsApp + Email James only if critical
    if (result.overallHealth === 'critical' || criticalCount > 0) {
      const firstCritical = result.issues.find(i => i.severity === 'critical')
      if (firstCritical) {
        sendWhatsAppToJames(JAMES_ALERTS.criticalError(firstCritical.description, firstCritical.affectedFile ?? 'unknown')).catch(console.error)
      }
      const adminEmail = process.env.ELEVO_ADMIN_EMAIL ?? 'james@elevo.dev'
      const criticalIssues = result.issues
        .filter(i => i.severity === 'critical')
        .map(i => `• ${i.description}\n  Fix: ${i.proposedFix}`)
        .join('\n\n')

      await sendEmail({
        to: adminEmail,
        subject: `🚨 ELEVO PA™ — CRITICAL: ${criticalCount} critical issue(s) detected`,
        body: `ELEVO PA™ Health Check Alert

Overall Health: ${result.overallHealth.toUpperCase()}
Checked at: ${result.timestamp}

Critical Issues:
${criticalIssues}

Summary: ${result.summary}

Log in to ELEVO to see the full report:
${appUrl}/admin/pa`,
      })
    }

    return NextResponse.json({
      ok: true,
      overallHealth: result.overallHealth,
      issuesCount,
      criticalCount,
      timestamp: result.timestamp,
    })
  } catch (err) {
    console.error('[cron/health-check]', err)
    return NextResponse.json({ error: 'Health check failed' }, { status: 500 })
  }
}
