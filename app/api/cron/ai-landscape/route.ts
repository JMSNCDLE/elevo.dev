import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { scanAILandscape } from '@/lib/agents/aiUpdateAgent'
import { sendEmail } from '@/lib/email/send'

export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const report = await scanAILandscape('en')

    const supabase = await createServerClient()

    await supabase.from('strategy_documents').insert({
      user_id: process.env.ELEVO_ADMIN_USER_ID ?? '00000000-0000-0000-0000-000000000000',
      type: 'ai_landscape',
      title: `AI Landscape Report — ${new Date().toLocaleDateString('en-GB')}`,
      content: JSON.stringify(report),
    })

    // Email James
    const adminEmail = process.env.ELEVO_ADMIN_EMAIL ?? 'james@elevo.ai'
    await sendEmail({
      to: adminEmail,
      subject: `ELEVO Update™ — Weekly AI Landscape Score: ${report.weeklyScore}/100`,
      body: `Weekly AI landscape scan complete.

Score: ${report.weeklyScore}/100

Summary: ${report.summary}

New models found: ${report.newModels.length}
New tools found: ${report.newTools.length}
Market trends: ${report.marketTrends.length}
Competitor updates: ${report.competitorUpdates.length}

Recommended next phase: ${report.recommendedPhase.title}
Priority: ${report.recommendedPhase.priority.toUpperCase()}
Reason: ${report.recommendedPhase.reason}

Log in to ELEVO to see the full report:
[View Full Report →] ${process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev'}/admin/updates`,
    })

    return NextResponse.json({ ok: true, score: report.weeklyScore, timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('[ai-landscape]', err)
    return NextResponse.json({ error: 'Landscape scan failed' }, { status: 500 })
  }
}
