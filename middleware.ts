import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { COOKIE_NAMES, COOKIE_OPTIONS } from '@/lib/cookies'
import { detectLocaleFromRequest } from '@/lib/ip-locale'

const locales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'sv', 'ja', 'en-US', 'en-AU']
const defaultLocale = 'en'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Skip API routes, static files, and SEO files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/manifest.json'
  ) {
    return NextResponse.next()
  }

  // Handle affiliate ref code — if ?ref=CODE in URL, capture it
  const refCode = searchParams.get('ref')
  if (refCode) {
    const redirectUrl = new URL(request.url)
    redirectUrl.searchParams.delete('ref')
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set({
      name: COOKIE_NAMES.REF_CODE,
      value: refCode,
      ...COOKIE_OPTIONS.client,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
    return response
  }

  // Track ad traffic on homepage
  const isHomepage =
    pathname === '/' ||
    locales.some(l => pathname === `/${l}` || pathname === `/${l}/`)
  if (isHomepage && (searchParams.get('utm_source') || searchParams.get('src') === 'ad')) {
    const response = NextResponse.next()
    response.cookies.set({
      name: COOKIE_NAMES.FROM_AD,
      value: 'true',
      ...COOKIE_OPTIONS.day,
    })
    return response
  }

  // Detect locale from IP/cookie/Accept-Language and redirect root path visits
  if (pathname === '/') {
    const detectedLocale = detectLocaleFromRequest(request)
    return NextResponse.redirect(new URL(`/${detectedLocale}`, request.url))
  }

  // Update Supabase session
  const supabaseResponse = await updateSession(request)
  if (supabaseResponse) return supabaseResponse

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
