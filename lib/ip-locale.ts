import type { NextRequest } from 'next/server'

const COUNTRY_TO_LOCALE: Record<string, string> = {
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es',
  EC: 'es', BO: 'es', PY: 'es', UY: 'es', CR: 'es', PA: 'es', GT: 'es',
  HN: 'es', SV: 'es', NI: 'es', DO: 'es', CU: 'es',
  FR: 'fr', BE: 'fr', CH: 'fr', LU: 'fr', MC: 'fr',
  DE: 'de', AT: 'de',
  IT: 'it',
  PT: 'pt', BR: 'pt',
  NL: 'nl',
  GB: 'en', US: 'en', CA: 'en', AU: 'en', NZ: 'en', IE: 'en',
}

const SUPPORTED = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl']

export function detectLocaleFromRequest(request: NextRequest): string {
  // 1. Check elevo_locale cookie (user preference)
  const cookieLocale = request.cookies.get('elevo_locale')?.value
  if (cookieLocale && SUPPORTED.includes(cookieLocale)) return cookieLocale

  // 2. Vercel geo header
  const country = request.headers.get('x-vercel-ip-country') || ''
  if (COUNTRY_TO_LOCALE[country]) return COUNTRY_TO_LOCALE[country]

  // 3. Accept-Language header
  const acceptLang = request.headers.get('accept-language') || ''
  const browserLang = acceptLang.split(',')[0].split('-')[0].toLowerCase()
  if (SUPPORTED.includes(browserLang)) return browserLang

  return 'en'
}
