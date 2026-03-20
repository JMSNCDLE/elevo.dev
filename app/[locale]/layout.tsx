import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import '../globals.css'

const locales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'sv', 'ja', 'en-US', 'en-AU']

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ELEVO AI — Elevate Your Business',
    template: '%s | ELEVO AI',
  },
  description: 'ELEVO AI helps local businesses create content, manage customers, and solve challenges with the power of AI.',
  keywords: ['AI', 'business', 'local business', 'marketing', 'content creation', 'CRM'],
}

export default async function RootLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = params

  if (!locales.includes(locale)) notFound()

  const messages = await getMessages()

  return (
    <html lang={locale} className={inter.variable}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
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
