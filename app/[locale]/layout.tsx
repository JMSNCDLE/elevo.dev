import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import CookieConsent from '@/components/shared/CookieConsent'
import '../globals.css'

const locales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'sv', 'ja', 'en-US', 'en-AU']

export const metadata: Metadata = {
  title: {
    default: 'ELEVO AI™ — Create and Boost Your Business Powered by AI',
    template: '%s | ELEVO AI™',
  },
  description: 'Create and boost your business powered by AI — every aspect taken care of. 21 AI specialists for content, ads, SEO, CRM, and more.',
  keywords: ['AI', 'business AI', 'local business', 'marketing AI', 'content creation', 'CRM AI', 'ELEVO AI', 'boost your business'],
  metadataBase: new URL('https://elevo.dev'),
}

export default async function RootLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale)) notFound()

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <CookieConsent />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#141B24',
                color: '#EEF2FF',
                border: '1px solid #1A2332',
              },
              success: { iconTheme: { primary: '#6366F1', secondary: '#EEF2FF' } },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
