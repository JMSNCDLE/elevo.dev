import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const t = await getTranslations('about')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('about')

  return (
    <main className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">{t('title')}</h1>
        <div className="space-y-6 text-gray-600 text-base leading-relaxed">
          <p>{t('paragraph1')}</p>
          <p>{t('paragraph2')}</p>
          <p>{t('paragraph3')}</p>
          <p>{t('paragraph4')}</p>
        </div>
        <div className="mt-10 flex gap-4">
          <Link href={`/${locale}/signup`} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm">
            {t('startTrial')}
          </Link>
          <a href="mailto:team@elevo.dev" className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 transition-colors text-sm">
            {t('contactUs')}
          </a>
        </div>
      </div>
    </main>
  )
}
