export type Currency = 'EUR' | 'GBP' | 'USD'

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: '€',
  GBP: '£',
  USD: '$',
}

export const PLAN_PRICES: Record<string, Record<Currency, { monthly: number; annual: number }>> = {
  launch: {
    EUR: { monthly: 29.99, annual: 24.99 },
    GBP: { monthly: 25.99, annual: 21.99 },
    USD: { monthly: 29.99, annual: 24.99 },
  },
  orbit: {
    EUR: { monthly: 49.99, annual: 41.99 },
    GBP: { monthly: 43.99, annual: 36.99 },
    USD: { monthly: 49.99, annual: 41.99 },
  },
  galaxy: {
    EUR: { monthly: 79.99, annual: 66.99 },
    GBP: { monthly: 69.99, annual: 58.99 },
    USD: { monthly: 79.99, annual: 66.99 },
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
