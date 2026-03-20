import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const COOKIE_NAMES = {
  REF_CODE: 'elevo_ref_code',
  FROM_AD: 'elevo_from_ad',
  DEMO_COUNT: 'elevo_demo_count',
  CONSENT: 'elevo_consent',
  CRM_DISMISSED: 'elevo_crm_dismissed',
  TRIAL_BANNER_DISMISSED: 'elevo_trial_banner_dismissed',
} as const

export type CookieName = (typeof COOKIE_NAMES)[keyof typeof COOKIE_NAMES]

const isProduction = process.env.NODE_ENV === 'production'

export interface CookieOptions {
  maxAge?: number
  expires?: Date
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'lax' | 'strict' | 'none'
  path?: string
}

export const COOKIE_OPTIONS = {
  long: {
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
  },
  day: {
    maxAge: 60 * 60 * 24,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
  },
  session: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
  },
  client: {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
  },
} as const

// Server-side: read cookie using next/headers
export async function getCookieValue(name: string): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(name)?.value
}

// Set a cookie on a NextResponse
export function setResponseCookie(
  response: NextResponse,
  name: string,
  value: string,
  options: CookieOptions = COOKIE_OPTIONS.long
): NextResponse {
  response.cookies.set({
    name,
    value,
    ...options,
  })
  return response
}

// Delete a cookie on a NextResponse
export function deleteResponseCookie(response: NextResponse, name: string): NextResponse {
  response.cookies.set({
    name,
    value: '',
    maxAge: 0,
    path: '/',
  })
  return response
}

// Read affiliate ref from request
export function getAffiliateRef(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAMES.REF_CODE)?.value ?? null
}

const DEMO_LIMIT = 3

// Check if demo generation is allowed
export function checkDemoLimit(request: NextRequest): {
  allowed: boolean
  remaining: number
  count: number
} {
  const raw = request.cookies.get(COOKIE_NAMES.DEMO_COUNT)?.value
  const count = raw ? parseInt(raw, 10) : 0
  const remaining = Math.max(0, DEMO_LIMIT - count)
  return {
    allowed: count < DEMO_LIMIT,
    remaining,
    count,
  }
}

// Increment demo count on a response
export function incrementDemoCount(response: NextResponse, currentCount: number): NextResponse {
  return setResponseCookie(
    response,
    COOKIE_NAMES.DEMO_COUNT,
    String(currentCount + 1),
    COOKIE_OPTIONS.client
  )
}

// Check if user has given consent
export function hasConsent(request: NextRequest): boolean {
  const val = request.cookies.get(COOKIE_NAMES.CONSENT)?.value
  return val === 'true' || val === 'false' // either choice counts as having decided
}

// Set consent on a response
export function giveConsent(response: NextResponse, acceptAll = true): NextResponse {
  return setResponseCookie(
    response,
    COOKIE_NAMES.CONSENT,
    acceptAll ? 'true' : 'false',
    {
      ...COOKIE_OPTIONS.long,
      httpOnly: false, // consent must be readable client-side
    }
  )
}

// ─── Client-side helpers ─────────────────────────────────────────────────────

export function getClientCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith(name + '='))
  if (!match) return undefined
  return decodeURIComponent(match.substring(name.length + 1))
}

export function setClientCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return
  const expires = new Date()
  expires.setDate(expires.getDate() + days)
  const secure = isProduction ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secure}`
}

export function deleteClientCookie(name: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

export function shouldShowCRMModal(): boolean {
  return !getClientCookie(COOKIE_NAMES.CRM_DISMISSED)
}

export function dismissCRMModal(): void {
  setClientCookie(COOKIE_NAMES.CRM_DISMISSED, 'true', 30)
}

export function dismissTrialBanner(): void {
  setClientCookie(COOKIE_NAMES.TRIAL_BANNER_DISMISSED, 'true', 1)
}

export function isTrialBannerDismissed(): boolean {
  return getClientCookie(COOKIE_NAMES.TRIAL_BANNER_DISMISSED) === 'true'
}
