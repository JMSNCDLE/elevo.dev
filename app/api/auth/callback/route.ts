import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

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
  } else {
    // New user — go to onboarding
    return NextResponse.redirect(new URL(`/${locale}/onboarding`, request.url))
  }
}
