import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sendSequenceEmail } from '@/lib/email/send'

export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createServerClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    // Send welcome email to new users (fire-and-forget)
    if (data?.user?.email) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, created_at')
        .eq('id', data.user.id)
        .single()

      // Only send if account is less than 5 minutes old (new signup, not returning login)
      const createdAt = profile?.created_at ? new Date(profile.created_at) : null
      const isNew = createdAt && (Date.now() - createdAt.getTime()) < 5 * 60 * 1000

      if (isNew) {
        const firstName = (profile?.full_name as string | null)?.split(' ')[0] ?? 'there'
        sendSequenceEmail('welcome', data.user.email, {
          firstName,
          businessName: 'your business',
        }).catch(console.error)
      }
    }
  }

  return NextResponse.redirect(new URL(`/${locale || 'en'}/dashboard`, request.url))
}
