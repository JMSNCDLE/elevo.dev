export type Currency = 'EUR' | 'GBP' | 'USD'

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: '€',
  GBP: '£',
  USD: '$',
}

export const PLAN_PRICES: Record<string, Record<Currency, { monthly: number; annual: number }>> = {
  launch: {
    EUR: { monthly: 39, annual: 32 },
    GBP: { monthly: 34, annual: 28 },
    USD: { monthly: 39, annual: 32 },
  },
  orbit: {
    EUR: { monthly: 79, annual: 65 },
    GBP: { monthly: 69, annual: 57 },
    USD: { monthly: 79, annual: 65 },
  },
  galaxy: {
    EUR: { monthly: 149, annual: 124 },
    GBP: { monthly: 129, annual: 107 },
    USD: { monthly: 149, annual: 124 },
  },
}

const EU_TIMEZONES = [
  'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Rome',
  'Europe/Amsterdam', 'Europe/Brussels', 'Europe/Vienna', 'Europe/Warsaw',
  'Europe/Prague', 'Europe/Budapest', 'Europe/Bucharest', 'Europe/Athens',
  'Europe/Helsinki', 'Europe/Stockholm', 'Europe/Copenhagen', 'Europe/Oslo',
  'Europe/Lisbon', 'Europe/Dublin', 'Europe/Luxembourg',
]

const UK_TIMEZONES = ['Europe/London']

const US_TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Anchorage', 'America/Adak', 'Pacific/Honolulu',
]

export function detectCurrency(): Currency {
  if (typeof window === 'undefined') return 'EUR'

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (UK_TIMEZONES.includes(tz)) return 'GBP'
    if (US_TIMEZONES.some(t => tz.startsWith(t.split('/')[0] + '/') && US_TIMEZONES.includes(tz))) return 'USD'
    if (EU_TIMEZONES.includes(tz)) return 'EUR'

    // Fallback: check navigator language
    const lang = navigator.language || ''
    if (lang.startsWith('en-GB')) return 'GBP'
    if (lang.startsWith('en-US') || lang.startsWith('en-CA')) return 'USD'
  } catch {
    // ignore
  }

  return 'EUR' // default
}

export function formatPrice(planId: string, currency: Currency, annual = false): string {
  const plan = PLAN_PRICES[planId]
  if (!plan) return ''
  const symbol = CURRENCY_SYMBOLS[currency]
  const price = annual ? plan[currency].annual : plan[currency].monthly
  return `${symbol}${price}`
}
