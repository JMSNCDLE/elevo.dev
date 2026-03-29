import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Launch, Orbit & Galaxy Plans',
  description: 'ELEVO AI pricing plans from €39/month. Launch for solo operators, Orbit for growing businesses, Galaxy for agencies. 7-day free trial on every plan.',
  keywords: ['ELEVO AI pricing', 'AI business tools pricing', 'marketing AI cost', 'affordable AI for business'],
}

const pricingSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'ELEVO AI™',
  description: 'AI operating system for local businesses — 47+ AI agents for content, marketing, sales, CRM, and analytics.',
  brand: { '@type': 'Brand', name: 'ELEVO AI' },
  offers: [
    { '@type': 'Offer', name: 'Launch', price: '39', priceCurrency: 'EUR', priceValidUntil: '2027-12-31', availability: 'https://schema.org/InStock', url: 'https://elevo.dev/en/pricing' },
    { '@type': 'Offer', name: 'Orbit', price: '79', priceCurrency: 'EUR', priceValidUntil: '2027-12-31', availability: 'https://schema.org/InStock', url: 'https://elevo.dev/en/pricing' },
    { '@type': 'Offer', name: 'Galaxy', price: '149', priceCurrency: 'EUR', priceValidUntil: '2027-12-31', availability: 'https://schema.org/InStock', url: 'https://elevo.dev/en/pricing' },
  ],
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '400', bestRating: '5' },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }} />
      {children}
    </>
  )
}
