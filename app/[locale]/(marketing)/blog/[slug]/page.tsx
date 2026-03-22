import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const supabase = await createServiceClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, meta_title, meta_description, target_keyword, published_at')
    .eq('slug', slug)
    .eq('locale', locale)
    .eq('published', true)
    .single()

  if (!post) return { title: 'Not Found' }

  return {
    title: post.meta_title ?? post.title,
    description: post.meta_description ?? undefined,
    keywords: post.target_keyword ? [post.target_keyword] : undefined,
    openGraph: {
      title: post.meta_title ?? post.title,
      description: post.meta_description ?? undefined,
      type: 'article',
      publishedTime: post.published_at,
    },
    alternates: {
      canonical: `https://elevo.ai/${locale}/blog/${slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params
  const supabase = await createServiceClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('locale', locale)
    .eq('published', true)
    .single()

  if (!post) notFound()

  const isEs = locale === 'es'

  // Simple markdown to HTML (basic — headings, bold, bullets)
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

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': post.title,
    'description': post.meta_description ?? post.excerpt,
    'author': { '@type': 'Organization', 'name': 'ELEVO AI' },
    'publisher': { '@type': 'Organization', 'name': 'ELEVO AI', 'url': 'https://elevo.ai' },
    'datePublished': post.published_at,
    'dateModified': post.updated_at,
    'url': `https://elevo.ai/${locale}/blog/${slug}`,
    'keywords': post.target_keyword,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="min-h-screen bg-white">
        {/* Article header */}
        <div className="bg-indigo-600 py-16 px-6">
          <div className="max-w-2xl mx-auto text-center">
            {post.category && (
              <span className="text-indigo-200 text-sm font-semibold uppercase tracking-wider">
                {post.category}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-3 mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-indigo-300 text-sm">
              <span>ELEVO AI</span>
              <span>·</span>
              <span>{new Date(post.published_at).toLocaleDateString(isEs ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span>·</span>
              <span>{post.reading_time} {isEs ? 'min de lectura' : 'min read'}</span>
            </div>
          </div>
        </div>

        {/* Article content */}
        <div className="max-w-2xl mx-auto px-6 py-12">
          <article
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: mdToHtml(post.content) }}
          />

          {/* FAQ section */}
          {post.faq_section && Array.isArray(post.faq_section) && post.faq_section.length > 0 && (
            <div className="mt-12 border-t border-gray-100 pt-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {isEs ? 'Preguntas frecuentes' : 'Frequently Asked Questions'}
              </h2>
              <div className="space-y-6">
                {(post.faq_section as Array<{ question: string; answer: string }>).map((faq, i) => (
                  <div key={i}>
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 bg-indigo-50 rounded-2xl p-8 text-center border border-indigo-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {isEs ? '¿Listo para probarlo?' : 'Ready to try ELEVO AI™?'}
            </h3>
            <p className="text-gray-500 mb-5 text-sm">
              {isEs ? '7 días gratis. Sin tarjeta de crédito.' : 'Free for 7 days. No credit card required.'}
            </p>
            <Link href={`/${locale}/signup`}
              className="inline-block px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
              {isEs ? 'Empezar gratis →' : 'Start free →'}
            </Link>
          </div>

          {/* Related posts / back */}
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
