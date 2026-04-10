import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { sendEmail } from '@/lib/email/send'
import { buildWelcomeEmail } from '@/lib/email/flows'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  // Get locale from cookie or default to 'en'
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'en'

  if (!code) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  const supabase = await createServerClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=oauth`, request.url))
  }

  // Check if user has a business profile (existing user vs new user)
  const { data: profile } = await supabase
    .from('business_profiles')
    .select('id')
    .eq('user_id', data.user.id)
    .limit(1)
    .maybeSingle()

  if (profile) {
    // Existing user — go to dashboard
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
  }

  // New user — send welcome email once, then go to onboarding
  try {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('email_welcome_sent, full_name')
      .eq('id', data.user.id)
      .maybeSingle()

    if (!userProfile?.email_welcome_sent && data.user.email) {
      const firstName = (userProfile?.full_name as string | null)?.split(' ')[0]
        ?? (data.user.user_metadata?.full_name as string | undefined)?.split(' ')[0]
        ?? 'there'
      const { subject, html } = buildWelcomeEmail(data.user.id, firstName, locale)
      await sendEmail({
        to: data.user.email,
        subject,
        html,
        agentName: 'Welcome',
        userId: data.user.id,
      })
      await supabase
        .from('profiles')
        .update({ email_welcome_sent: true, last_active_at: new Date().toISOString() })
        .eq('id', data.user.id)
    }
  } catch (err) {
    console.error('[auth/callback] welcome email error:', err)
    // Never block signup if welcome email fails
  }

  return NextResponse.redirect(new URL(`/${locale}/onboarding`, request.url))
}
