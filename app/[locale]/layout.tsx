import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import CookieConsent from '@/components/shared/CookieConsent'
import WebVitalsReporter from '@/components/shared/WebVitalsReporter'
import '../globals.css'

const locales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'sv', 'ja', 'en-US', 'en-AU']

export const metadata: Metadata = {
  title: {
    default: 'ELEVO AI™ — Create and Boost Your Business Powered by AI',
    template: '%s | ELEVO AI™',
  },
  description: '54+ AI agents that replace your entire team — content, marketing, sales, CRM, analytics. Lower your customer acquisition cost. From €39/month.',
  keywords: ['AI', 'business AI', 'local business', 'marketing AI', 'content creation', 'CRM AI', 'ELEVO AI', 'boost your business'],
  metadataBase: new URL('https://elevo.dev'),
  verification: {
    google: 'VPTyVYNKRhrrI4p3lesQcE9atx67usOvG4ZnjMiLWUg',
    other: {
      'msvalidate.01': '0B660C8218156BF38E8053FFB13524F6',
    },
  },
  other: {
    'google-site-verification': 'VPTyVYNKRhrrI4p3lesQcE9atx67usOvG4ZnjMiLWUg',
    'msvalidate.01': '0B660C8218156BF38E8053FFB13524F6',
    'yandex-verification': process.env.YANDEX_VERIFICATION_CODE ?? '',
    'dcterms.rightsHolder': 'ELEVO AI Ltd™',
    'dcterms.rights': '© 2026 ELEVO AI Ltd™. All rights reserved.',
  },
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
          <WebVitalsReporter />
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
