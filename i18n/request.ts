import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

const locales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'sv', 'ja', 'en-US', 'en-AU']

export default getRequestConfig(async ({ locale }) => {
  // Default to 'en' if locale is missing or unrecognised
  const resolvedLocale = locales.includes(locale as string) ? (locale as string) : 'en'
  if (!locale) notFound()

  // Load messages, fall back to en if locale messages file doesn't exist
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let messages: Record<string, any>
  try {
    messages = (await import(`../messages/${resolvedLocale}.json`)).default
  } catch {
    messages = (await import('../messages/en.json')).default
  }

  return { messages }
})
