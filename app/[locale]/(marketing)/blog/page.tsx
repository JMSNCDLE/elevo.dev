import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isEs = locale === 'es'
  return {
    title: isEs ? 'Blog — Consejos IA para Negocios Locales | ELEVO AI' : 'Blog — AI Tips for Local Businesses | ELEVO AI',
    description: isEs ? 'Artículos, guías y consejos sobre IA para restaurantes, comercios y negocios locales.' : 'Articles, guides and tips on AI for restaurants, trades and local businesses.',
  }
}

interface BlogPost {
  id: string
  slug: string
  locale: string
  title: string
  excerpt?: string
  category?: string
  reading_time: number
  published_at: string
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createServiceClient()

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, slug, locale, title, excerpt, category, reading_time, published_at')
    .eq('locale', locale)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(24)

  const isEs = locale === 'es'

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-indigo-600 py-20 px-6 text-center">
        <h1 className="text-4xl font-extrabold text-white mb-4">
          {isEs ? 'Blog de ELEVO AI™' : 'ELEVO AI™ Blog'}
        </h1>
        <p className="text-indigo-200 text-lg max-w-xl mx-auto">
          {isEs
            ? 'Guías, consejos y estrategias de IA para negocios locales'
            : 'Guides, tips and AI strategies for local businesses'}
        </p>
      </div>

      {/* Posts grid */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        {!posts || posts.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <p className="text-lg">{isEs ? 'Pronto habrá artículos aquí.' : 'Articles coming soon.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(posts as BlogPost[]).map(post => (
              <Link key={post.id} href={`/${locale}/blog/${post.slug}`}
                className="group block bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-indigo-50 h-36 flex items-center justify-center">
                  <span className="text-4xl">📝</span>
                </div>
                <div className="p-5">
                  {post.category && (
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      {post.category}
                    </span>
                  )}
                  <h2 className="text-base font-bold text-gray-900 mt-2 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{new Date(post.published_at).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>{post.reading_time} {isEs ? 'min' : 'min read'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gray-50 py-16 px-6 text-center border-t border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {isEs ? '¿Listo para implementar todo esto?' : 'Ready to put this into practice?'}
        </h3>
        <p className="text-gray-500 mb-6">
          {isEs ? 'ELEVO AI hace todo lo que lees aquí, automáticamente.' : 'ELEVO AI does everything you read here, automatically.'}
        </p>
        <Link href={`/${locale}/signup`}
          className="inline-block px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
          {isEs ? 'Prueba gratis 7 días →' : 'Try free for 7 days →'}
        </Link>
      </div>
    </div>
  )
}
