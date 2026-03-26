import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/marketing/Nav'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'
import ClientPopups from '@/components/marketing/ClientPopups'
import { ScrollProgress } from '@/components/shared/ScrollProgress'
import { CustomCursor } from '@/components/shared/CustomCursor'
import { PageTransition } from '@/components/marketing/PageTransition'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const base = 'https://elevo.dev'

  return {
    title: {
      default: 'ELEVO AI™ — The AI Operating System for Local Businesses',
      template: '%s | ELEVO AI™',
    },
    description: '21 AI specialists that write your content, run your ads, manage your customers, and solve any business problem. In seconds. From €39/month.',
    keywords: [
      'AI for local businesses', 'business AI', 'marketing AI', 'ROAS analysis',
      'Google Business Profile', 'local SEO AI', 'content automation', 'CRM AI',
      'ELEVO AI', 'AI operating system for business',
    ],
    metadataBase: new URL(base),
    alternates: {
      canonical: `/${locale}`,
      languages: { en: '/en', es: '/es' },
    },
    openGraph: {
      type: 'website',
      locale: 'en_GB',
      url: `${base}/${locale}`,
      siteName: 'ELEVO AI™',
      title: 'ELEVO AI™ — The AI Operating System for Local Businesses',
      description: '21 AI specialists. Content, ads, CRM, SEO, finance. From €39/month.',
      images: [{ url: `${base}/api/og?title=The+AI+Operating+System+for+Local+Businesses`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'ELEVO AI™ — The AI Operating System for Local Businesses',
      description: '21 AI specialists. From €39/month.',
      images: [`${base}/api/og?title=The+AI+Operating+System+for+Local+Businesses`],
      creator: '@elevo_ai',
    },
    robots: { index: true, follow: true },
    viewport: { width: 'device-width', initialScale: 1, viewportFit: 'cover' },
    themeColor: '#050507',
    appleWebApp: { capable: true, title: 'ELEVO AI' },
    manifest: '/manifest.json',
    icons: {
      apple: '/icon-192.png',
    },
  }
}

// ─── JSON-LD ──────────────────────────────────────────────────────────────────

function JsonLd() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'ELEVO AI™',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://elevo.dev',
      description: 'The AI operating system for local businesses. 21 specialist AI agents for content, ROAS, SEO, CRM, financial intelligence, and more.',
      offers: [
        { '@type': 'Offer', name: 'Trial', price: '0', priceCurrency: 'EUR' },
        { '@type': 'Offer', name: 'Launch', price: '39', priceCurrency: 'EUR' },
        { '@type': 'Offer', name: 'Orbit', price: '79', priceCurrency: 'EUR' },
        { '@type': 'Offer', name: 'Galaxy', price: '149', priceCurrency: 'EUR' },
      ],
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '400', bestRating: '5' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'ELEVO AI Ltd',
      url: 'https://elevo.dev',
      description: 'ELEVO AI™ builds the AI operating system for local businesses.',
      founder: { '@type': 'Person', name: 'James Carlin' },
      sameAs: ['https://twitter.com/elevo_ai', 'https://www.instagram.com/elevo.ai', 'https://www.linkedin.com/company/elevo-ai'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is ELEVO AI™?', acceptedAnswer: { '@type': 'Answer', text: 'ELEVO AI™ is the AI operating system for local businesses. 21 specialist AI agents handle your content, ads, SEO, CRM, finances, and more.' } },
        { '@type': 'Question', name: 'How much does ELEVO AI cost?', acceptedAnswer: { '@type': 'Answer', text: 'Plans start at €39/month with a 7-day free trial.' } },
        { '@type': 'Question', name: 'Does ELEVO AI replace a marketing agency?', acceptedAnswer: { '@type': 'Answer', text: 'For most local businesses, yes. ELEVO AI generates more content, more consistently, at a fraction of the agency cost.' } },
        { '@type': 'Question', name: 'Is ELEVO AI GDPR compliant?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. GDPR-compliant, bank-grade encryption, data never used for AI training.' } },
      ],
    },
  ]

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

const FOOTER_COLS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Blog', href: '/blog' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Status', href: '/status' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Partners', href: '/partners' },
      { label: 'Affiliates', href: '/signup' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Refund Policy', href: '/refunds' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'GDPR', href: '/privacy' },
    ],
  },
]

// ─── Layout ───────────────────────────────────────────────────────────────────

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <SmoothScrollProvider>
    <div className="min-h-screen bg-white flex flex-col">
      <JsonLd />
      <ScrollProgress />
      <CustomCursor />
      <Nav locale={locale} />
      <main className="flex-1 pt-[72px]">
        <PageTransition>{children}</PageTransition>
      </main>

      {/* Footer */}
      <footer className="bg-[#080C14] text-gray-400 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
            {/* Brand col */}
            <div className="md:col-span-2">
              <Link href={`/${locale}`} className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-sm">E</span>
                </div>
                <span className="text-lg font-black text-white">ELEVO AI™</span>
              </Link>
              <p className="text-sm leading-relaxed max-w-xs mb-5">
                The AI operating system for local businesses. 21 specialist agents, one dashboard.
              </p>
              <p className="text-xs text-gray-600 mb-4">
                🔒 SSL encrypted &nbsp;·&nbsp; GDPR compliant &nbsp;·&nbsp; Payments by Stripe
              </p>
              {/* Social icons */}
              <div className="flex gap-3">
                {[
                  { label: 'TikTok', icon: '🎵' },
                  { label: 'Instagram', icon: '📷' },
                  { label: 'LinkedIn', icon: '💼' },
                  { label: 'YouTube', icon: '▶️' },
                  { label: 'Twitter', icon: '🐦' },
                ].map(s => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="w-9 h-9 bg-white/5 hover:bg-indigo-600/20 rounded-lg flex items-center justify-center text-sm transition-colors"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Link cols */}
            {FOOTER_COLS.map(col => (
              <div key={col.title}>
                <p className="text-sm font-semibold text-white mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map(link => (
                    <li key={link.label}>
                      <Link
                        href={link.href.startsWith('/') ? `/${locale}${link.href}` : link.href}
                        className="text-sm hover:text-indigo-400 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <p>© {new Date().getFullYear()} ELEVO AI Ltd™ · All rights reserved · ELEVO AI™ is a registered trademark.</p>
            <p>Made with ♥ for local businesses worldwide</p>
          </div>
        </div>
      </footer>
      <ClientPopups />
    </div>
    </SmoothScrollProvider>
  )
}
