import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

const locales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'sv', 'ja', 'en-US', 'en-AU']

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as string)) notFound()

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
