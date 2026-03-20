export const locales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'sv', 'ja', 'en-US', 'en-AU'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export function getCurrencyFromLocale(locale: string): 'GBP' | 'USD' | 'EUR' {
  if (locale === 'en-US') return 'USD'
  if (['fr', 'de', 'es', 'it', 'pt', 'nl', 'pl', 'sv'].includes(locale)) return 'EUR'
  return 'GBP'
}
