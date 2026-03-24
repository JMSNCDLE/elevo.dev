import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BLOG_POSTS, getPostBySlug } from '@/lib/blog/posts'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  return BLOG_POSTS.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Not Found' }

  return {
    title: `${post.title} | ELEVO AI™`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
    },
    alternates: {
      canonical: `https://elevo.dev/en/blog/${slug}`,
    },
  }
}

function mdToHtml(md: string): string {
  return md
    .split('\n')
    .map(line => {
      if (line.startsWith('### ')) return `<h3 class="text-xl font-bold text-gray-900 mt-8 mb-3">${line.slice(4)}</h3>`
      if (line.startsWith('## ')) return `<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-4">${line.slice(3)}</h2>`
      if (line.startsWith('# ')) return `<h1 class="text-3xl font-bold text-gray-900 mb-6">${line.slice(2)}</h1>`
      if (line.startsWith('- ')) return `<li class="text-gray-600">${line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`
      if (line.trim() === '') return '<br />'
      return `<p class="text-gray-600 leading-relaxed mb-4">${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`
    })
    .join('\n')
    .replace(/(<li.*<\/li>\n?)+/g, m => `<ul class="list-disc pl-6 mb-4 space-y-1">${m}</ul>`)
}

const CATEGORY_COLORS: Record<string, string> = {
  indigo: 'bg-indigo-100 text-indigo-700',
  purple: 'bg-purple-100 text-purple-700',
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
  orange: 'bg-orange-100 text-orange-700',
  teal: 'bg-teal-100 text-teal-700',
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params
  const post = getPostBySlug(slug)

  if (!post) notFound()

  const isEs = locale === 'es'

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    author: { '@type': 'Organization', name: 'ELEVO AI' },
    publisher: { '@type': 'Organization', name: 'ELEVO AI', url: 'https://elevo.dev' },
    url: `https://elevo.dev/${locale}/blog/${slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="min-h-screen bg-white">
        {/* Article header */}
        <div className="bg-gradient-to-b from-indigo-50 to-white py-16 px-6 border-b border-gray-100">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Link
                href={`/${locale}/blog`}
                className="text-sm text-gray-400 hover:text-indigo-600 transition-colors"
              >
                ← {isEs ? 'Blog' : 'Blog'}
              </Link>
              <span className="text-gray-200">·</span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[post.categoryColor] ?? 'bg-gray-100 text-gray-600'}`}
              >
                {post.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-6">{post.excerpt}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>ELEVO AI</span>
              <span>·</span>
              <span>{post.date}</span>
              <span>·</span>
              <span>{post.readingTime}</span>
            </div>
          </div>
        </div>

        {/* Article content */}
        <div className="max-w-2xl mx-auto px-6 py-12">
          <article
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: mdToHtml(post.content) }}
          />

          {/* CTA */}
          <div className="mt-16 bg-indigo-50 rounded-2xl p-8 text-center border border-indigo-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {isEs ? '¿Listo para probarlo?' : 'Ready to try ELEVO AI™?'}
            </h3>
            <p className="text-gray-500 mb-5 text-sm">
              {isEs
                ? '7 días gratis. Sin tarjeta de crédito.'
                : 'Free for 7 days. No credit card required.'}
            </p>
            <Link
              href={`/${locale}/signup`}
              className="inline-block px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              {isEs ? 'Empezar gratis →' : 'Start free →'}
            </Link>
          </div>

          {/* Back */}
          <div className="mt-10 text-center">
            <Link href={`/${locale}/blog`} className="text-indigo-600 hover:underline text-sm">
              ← {isEs ? 'Volver al blog' : 'Back to blog'}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
