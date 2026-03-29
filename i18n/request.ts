import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale } from '../lib/i18n/routing'

// Only these locales have translation files in /messages
const AVAILABLE_TRANSLATIONS = ['en', 'es']

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale
  }

  // Fall back to English if no translation file exists for this locale
  const messageLocale = AVAILABLE_TRANSLATIONS.includes(locale) ? locale : 'en'

  return {
    locale,
    messages: (await import('../messages/' + messageLocale + '.json')).default,
  }
})
