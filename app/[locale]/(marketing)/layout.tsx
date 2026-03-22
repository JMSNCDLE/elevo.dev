import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const base = 'https://elevo.ai'
  const isEs = locale === 'es'

  return {
    title: {
      default: isEs
        ? 'ELEVO AI™ — El sistema operativo IA para negocios locales'
        : 'ELEVO AI™ — The AI Operating System for Local Businesses',
      template: '%s | ELEVO AI™',
    },
    description: isEs
      ? '21 agentes IA especializados que escriben tu contenido, gestionan tus anuncios, atienden a tus clientes y resuelven cualquier problema. Desde £39/mes.'
      : '21 AI specialists that write your content, run your ads, manage your customers, and solve any business problem. In seconds. From £39/month.',
    keywords: [
      'AI for local businesses', 'business AI', 'marketing AI', 'ROAS analysis',
      'Google Business Profile', 'local SEO AI', 'content automation', 'CRM AI',
      'ELEVO AI', 'AI operating system',
    ],
    authors: [{ name: 'ELEVO AI', url: base }],
    creator: 'ELEVO AI',
    publisher: 'ELEVO AI Ltd',
    metadataBase: new URL(base),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'es': '/es',
      },
    },
    openGraph: {
      type: 'website',
      locale: isEs ? 'es_ES' : 'en_GB',
      url: `${base}/${locale}`,
      siteName: 'ELEVO AI™',
      title: isEs
        ? 'ELEVO AI™ — El sistema operativo IA para negocios locales'
        : 'ELEVO AI™ — The AI Operating System for Local Businesses',
      description: isEs
        ? '21 agentes IA especializados. Desde £39/mes.'
        : '21 AI specialists. Content, ads, CRM, SEO, finance. From £39/month.',
      images: [
        {
          url: `${base}/api/og?title=The+AI+Operating+System+for+Local+Businesses`,
          width: 1200,
          height: 630,
          alt: 'ELEVO AI™ — The AI Operating System for Local Businesses',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'ELEVO AI™ — The AI Operating System for Local Businesses',
      description: '21 AI specialists. Content, ads, CRM, SEO, finance. From £39/month.',
      images: [`${base}/api/og?title=The+AI+Operating+System+for+Local+Businesses`],
      creator: '@elevo_ai',
      site: '@elevo_ai',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  }
}

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────

function SoftwareApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ELEVO AI™',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://elevo.ai',
    description:
      'The AI operating system for local businesses. 21 specialist AI agents for content creation, ROAS analysis, SEO, CRM, financial intelligence, and more.',
    offers: [
      { '@type': 'Offer', name: 'Trial', price: '0', priceCurrency: 'GBP' },
      { '@type': 'Offer', name: 'Launch', price: '39', priceCurrency: 'GBP', billingIncrement: 'P1M' },
      { '@type': 'Offer', name: 'Orbit', price: '79', priceCurrency: 'GBP', billingIncrement: 'P1M' },
      { '@type': 'Offer', name: 'Galaxy', price: '149', priceCurrency: 'GBP', billingIncrement: 'P1M' },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '400',
      bestRating: '5',
      worstRating: '1',
    },
    screenshot: 'https://elevo.ai/api/og?title=Mission+Control+Dashboard',
    featureList: [
      'AI content generation',
      'ROAS and ad spend analysis',
      'Local SEO optimisation',
      'CRM and customer management',
      'Financial health analysis',
      'Conversation automation',
      'AI video studio',
      'Social media management',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ELEVO AI Ltd',
    alternateName: 'ELEVO AI™',
    url: 'https://elevo.ai',
    logo: 'https://elevo.ai/logo.png',
    description:
      'ELEVO AI™ builds the AI operating system for local businesses. 21 specialist AI agents that handle content, ads, SEO, CRM, finances, and more.',
    foundingDate: '2026',
    founder: { '@type': 'Person', name: 'James Carlin' },
    sameAs: [
      'https://twitter.com/elevo_ai',
      'https://www.instagram.com/elevo.ai',
      'https://www.linkedin.com/company/elevo-ai',
      'https://www.tiktok.com/@elevo.ai',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['English', 'Spanish'],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

function FAQSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is ELEVO AI™?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ELEVO AI™ is the AI operating system for local businesses. 21 specialist AI agents handle your content, ads, SEO, CRM, finances, and more — all from one dashboard.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much does ELEVO AI cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ELEVO AI™ starts with a free 7-day trial. Paid plans start at £39/month (Launch), £79/month (Orbit — most popular), and £149/month (Galaxy). No contracts, cancel anytime.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does ELEVO AI replace a marketing agency?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For most local businesses, yes. ELEVO AI™ generates more content, more consistently, for a fraction of the cost of a marketing agency. From £39/month.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is ELEVO AI GDPR compliant?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. ELEVO AI™ is fully GDPR-compliant, uses bank-grade encryption, and your business data is never used to train AI models.',
        },
      },
      {
        '@type': 'Question',
        name: 'What AI models does ELEVO use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ELEVO AI™ uses Claude Opus 4 for complex problem-solving and Claude Sonnet 4 for all specialist agents — the latest generation of Anthropic AI models.',
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

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
    <div className="min-h-screen bg-white flex flex-col">
      <SoftwareApplicationSchema />
      <OrganizationSchema />
      <FAQSchema />

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ELEVO AI™</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href={`/${locale}/blog`} className="hover:text-gray-900 transition-colors">Blog</Link>
            <Link href={`/${locale}/pricing`} className="hover:text-gray-900 transition-colors">Pricing</Link>
            <Link href={`/${locale}/login`} className="hover:text-gray-900 transition-colors">Sign in</Link>
            <Link
              href={`/${locale}/signup`}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Start free trial
            </Link>
          </nav>

          {/* Mobile menu */}
          <div className="flex md:hidden items-center gap-3">
            <Link href={`/${locale}/login`} className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
            <Link href={`/${locale}/signup`} className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
              Try free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-gray-50 border-t border-gray-100 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">E</span>
                </div>
                <span className="font-bold text-gray-900">ELEVO AI™</span>
              </div>
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                The AI operating system for local businesses. 21 specialist agents, one dashboard.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                🔒 SSL encrypted &nbsp;·&nbsp; GDPR compliant &nbsp;·&nbsp; Payments by Stripe
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="font-semibold text-gray-900 mb-3">Product</p>
                <ul className="space-y-2 text-gray-500">
                  <li><Link href={`/${locale}/pricing`} className="hover:text-gray-900">Pricing</Link></li>
                  <li><Link href={`/${locale}/blog`} className="hover:text-gray-900">Blog</Link></li>
                  <li><Link href={`/${locale}/signup`} className="hover:text-gray-900">Free trial</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-3">Company</p>
                <ul className="space-y-2 text-gray-500">
                  <li><Link href="#" className="hover:text-gray-900">Privacy</Link></li>
                  <li><Link href="#" className="hover:text-gray-900">Terms</Link></li>
                  <li><Link href="#" className="hover:text-gray-900">Contact</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} ELEVO AI Ltd. ELEVO AI™ and all agent names are trademarks of ELEVO AI Ltd. All rights reserved.</p>
            <p>Made with ♥ for local businesses worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
