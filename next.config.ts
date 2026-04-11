import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    deviceSizes: [390, 430, 768, 1024, 1280, 1920],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  experimental: {
    optimizeCss: true,
    serverActions: {
      allowedOrigins: ['localhost:3000', 'elevo.dev'],
    },
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      '@supabase/supabase-js',
      '@supabase/ssr',
      'date-fns',
      'recharts',
    ],
  },
  redirects: async () => [
    {
      source: '/:locale/blog/38-ai-agents-run-your-business',
      destination: '/:locale/blog/60-plus-ai-agents-run-your-business',
      permanent: true,
    },
    {
      source: '/:locale/customers/pipeline',
      destination: '/:locale/sales-pipeline',
      permanent: true,
    },
    {
      source: '/:locale/review-requests',
      destination: '/:locale/dashboard/customers/review-requests',
      permanent: true,
    },
    {
      source: '/:locale/clip-bot',
      destination: '/:locale/clip',
      permanent: true,
    },
    {
      source: '/:locale/route',
      destination: '/:locale/chat',
      permanent: true,
    },
    {
      source: '/:locale/rank',
      destination: '/:locale/seo',
      permanent: true,
    },
    {
      source: '/:locale/waitlist',
      destination: '/:locale/pricing',
      permanent: false,
    },
    {
      source: '/:locale/features',
      destination: '/:locale/#features',
      permanent: false,
    },
    {
      source: '/:locale/settings',
      destination: '/:locale/dashboard/settings',
      permanent: false,
    },
  ],
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
    {
      source: '/_next/static/(.*)',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
    {
      source: '/static/(.*)',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
  ],
}

export default withNextIntl(nextConfig)
