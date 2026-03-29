import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { BLOG_POSTS } from '@/lib/blog/posts'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  await params
  return {
    title: 'Blog — AI Tips for Local Businesses | ELEVO AI',
    description: 'Articles, guides and tips on AI for restaurants, trades and local businesses.',
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  indigo: 'bg-indigo-100 text-indigo-700',
  purple: 'bg-purple-100 text-purple-700',
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
  orange: 'bg-orange-100 text-orange-700',
  teal: 'bg-teal-100 text-teal-700',
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('marketing')
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-b from-indigo-50 to-white py-20 px-6 border-b border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-indigo-600 font-semibold uppercase tracking-widest text-xs mb-4">
            {t('resources')}
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            {t('blogTitle')}
          </h1>
          <p className="text-gray-500 text-lg">
            {t('blogSubtitle')}
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BLOG_POSTS.map(post => (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-indigo-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[post.categoryColor] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">{post.readingTime}</span>
                </div>

                <h2 className="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{post.date}</span>
                  <span className="text-xs font-medium text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                    Read →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 bg-indigo-50 rounded-2xl p-8 text-center border border-indigo-100">
            <p className="text-indigo-600 font-semibold uppercase tracking-widest text-xs mb-3">
              {t('readyToStart')}
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {t('tryFree')}
            </h2>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              {t('onboardingTime')}
            </p>
            <Link
              href={`/${locale}/signup`}
              className="inline-block px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              {t('startFreeArrow')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
