import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateDailySummary } from '@/lib/agents/paEngineerAgent'
import { sendEmail } from '@/lib/email/send'
import { sendWhatsAppToJames, JAMES_ALERTS } from '@/lib/notifications/whatsapp'

export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const adminUserId = process.env.ELEVO_ADMIN_USER_ID ?? '00000000-0000-0000-0000-000000000000'
    const summary = await generateDailySummary(adminUserId)

    const supabase = await createServerClient()

    // Save to daily_summaries table (upsert by date)
    await supabase.from('daily_summaries').upsert({
      date: new Date().toISOString().split('T')[0],
      summary: summary as unknown as Record<string, unknown>,
      new_users: summary.todayStats.newUsers,
      revenue: summary.todayStats.revenue,
      credits_used: summary.todayStats.credits_used,
      errors_detected: summary.todayStats.errors,
    }, { onConflict: 'date' })

    // Email James
    const adminEmail = process.env.ELEVO_ADMIN_EMAIL ?? 'james@elevo.ai'
    const winsText = summary.wins.map(w => `✅ ${w}`).join('\n')
    const recsText = summary.recommendations.map(r => `→ ${r}`).join('\n')
    const tasksText = summary.upcomingTasks.map(t => `• ${t}`).join('\n')

    await sendEmail({
      to: adminEmail,
      subject: `ELEVO PA™ — Daily Summary ${new Date().toLocaleDateString('en-GB')}`,
      body: `${summary.greeting}

TODAY'S STATS
New Users: ${summary.todayStats.newUsers}
Revenue: £${summary.todayStats.revenue.toFixed(2)}
Credits Used: ${summary.todayStats.credits_used}
Errors: ${summary.todayStats.errors}

TODAY'S WINS
${winsText}

RECOMMENDATIONS
${recsText}

UPCOMING TASKS
${tasksText}

${summary.motivationalNote}

View full dashboard: ${process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.ai'}/admin/pa`,
    })

    // WhatsApp daily summary to James
    const totalUsers = summary.todayStats.newUsers
    const revenueStr = `£${summary.todayStats.revenue.toFixed(2)}`
    sendWhatsAppToJames(JAMES_ALERTS.dailySummary(totalUsers, revenueStr, totalUsers)).catch(console.error)

    return NextResponse.json({ ok: true, date: new Date().toISOString().split('T')[0] })
  } catch (err) {
    console.error('[cron/daily-summary]', err)
    return NextResponse.json({ error: 'Daily summary failed' }, { status: 500 })
  }
}
