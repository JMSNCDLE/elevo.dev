import type { MetadataRoute } from 'next'

const BASE_URL = 'https://elevo.dev'
const LOCALES = ['en', 'es']

const MARKETING_PAGES = [
  '',
  '/pricing',
  '/blog',
  '/privacy',
  '/terms',
  '/refunds',
  '/cookies',
  '/careers',
  '/press',
  '/partners',
  '/changelog',
  '/status',
]

const BLOG_SLUGS = [
  'why-73-percent-local-businesses-waste-ad-budget',
  'only-5-things-local-business-needs-online-every-week',
  'manchester-plumber-saved-340-per-month',
  'google-business-profile-complete-guide-2026',
  'how-to-get-more-google-reviews-for-your-restaurant',
  'manychat-vs-elevo-connect',
  'ai-transforming-local-business-marketing-2026',
  '38-ai-agents-run-your-business',
  'why-local-businesses-need-ai-operating-system',
  'elevo-ai-vs-chatgpt',
  'complete-guide-ai-powered-local-business-growth',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of LOCALES) {
    // Marketing pages
    for (const page of MARKETING_PAGES) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1 : page === '/pricing' ? 0.9 : 0.7,
      })
    }

    // Blog posts
    for (const slug of BLOG_SLUGS) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  }

  return entries
}
