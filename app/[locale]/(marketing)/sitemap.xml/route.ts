import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const BASE_URL = 'https://elevo.dev'
const LOCALES = ['en', 'es', 'fr', 'de', 'nl', 'pt', 'it']

const STATIC_PAGES = [
  '',
  '/pricing',
  '/blog',
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params
  const supabase = await createServiceClient()

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('locale', locale)
    .eq('published', true)

  const urls: string[] = []

  // Static pages
  for (const page of STATIC_PAGES) {
    urls.push(`
    <url>
      <loc>${BASE_URL}/${locale}${page}</loc>
      <changefreq>${page === '' ? 'weekly' : 'monthly'}</changefreq>
      <priority>${page === '' ? '1.0' : '0.8'}</priority>
      ${LOCALES.map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="${BASE_URL}/${l}${page}" />`).join('\n      ')}
    </url>`)
  }

  // Blog posts
  for (const post of posts ?? []) {
    urls.push(`
    <url>
      <loc>${BASE_URL}/${locale}/blog/${post.slug}</loc>
      <lastmod>${new Date(post.updated_at).toISOString().split('T')[0]}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${urls.join('')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
