import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendSequenceEmail } from '@/lib/email/send'

export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createServerClient()

  // Find trial users whose trial ends within 3 days and haven't been reminded
  const now = new Date()
  const in3Days = new Date()
  in3Days.setDate(in3Days.getDate() + 3)

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, plan, credits_used, trial_reminder_sent_at')
    .eq('plan', 'trial')
    .gte('trial_ends_at', now.toISOString())
    .lte('trial_ends_at', in3Days.toISOString())
    .is('trial_reminder_sent_at', null)
    .limit(100)

  if (error) {
    console.error('trial-reminders cron error:', error)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }

  const results = { sent: 0, errors: 0 }

  for (const user of users ?? []) {
    try {
      const { data: bp } = await supabase
        .from('business_profiles')
        .select('business_name, city')
        .eq('user_id', user.id)
        .single()

      const { count: generationCount } = await supabase
        .from('saved_generations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { count: contactCount } = await supabase
        .from('crm_contacts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const firstName = user.full_name?.split(' ')[0] ?? 'there'

      await sendSequenceEmail('trialEnd', user.email, {
        firstName,
        businessName: bp?.business_name ?? 'your business',
        generationCount: generationCount ?? 0,
        contactCount: contactCount ?? 0,
        reviewRequestsSent: 0,
        roasScore: 'Not yet run',
      })

      // Mark reminder as sent
      await supabase
        .from('profiles')
        .update({ trial_reminder_sent_at: new Date().toISOString() })
        .eq('id', user.id)

      results.sent++
    } catch {
      results.errors++
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
