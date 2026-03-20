import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { locale: string } }) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const locale = params.locale || 'en'

  if (code) {
    const supabase = await createServerClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
}
