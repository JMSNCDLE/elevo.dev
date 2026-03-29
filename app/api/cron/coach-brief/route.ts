import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendSequenceEmail } from '@/lib/email/send'

export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createServerClient()

  // Get all active paid users
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, plan, credits_used')
    .in('plan', ['launch', 'orbit', 'galaxy'])
    .limit(200)

  if (error) {
    console.error('coach-brief cron error:', error)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }

  const results = { sent: 0, errors: 0 }

  for (const user of users ?? []) {
    try {
      const { data: bp } = await supabase
        .from('business_profiles')
        .select('business_name, city, business_category')
        .eq('user_id', user.id)
        .single()

      const { count: generationCount } = await supabase
        .from('saved_generations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const firstName = user.full_name?.split(' ')[0] ?? 'there'

      await sendSequenceEmail('monthlyReview', user.email, {
        firstName,
        businessName: bp?.business_name ?? 'your business',
        city: bp?.city ?? '',
        businessCategory: bp?.business_category ?? '',
        generationCount: generationCount ?? 0,
        reviewCount: 0,
        reviewRequestsSent: 0,
        campaigns: 0,
        contactCount: 0,
        topContentType: 'GBP Posts',
        leoPriority: 'Run a ROAS analysis on your ad campaigns',
        geoPriority: 'Post at least twice this week on Google Business Profile',
      })

      results.sent++
    } catch {
      results.errors++
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
