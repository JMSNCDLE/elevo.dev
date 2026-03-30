import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Press — ELEVO AI',
  description: 'Press and media inquiries for ELEVO AI.',
}

export default async function PressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('press')
  return (
    <main className="min-h-screen bg-white">
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">📰</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-gray-500 text-lg mb-8">{t('description')}</p>
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 mb-8">
            <p className="text-gray-700 font-medium mb-2">{t('mediaContact')}</p>
            <p className="text-gray-500 text-sm">
              {t('emailUs')}{' '}
              <a href="mailto:team@elevo.dev" className="text-indigo-600 font-semibold hover:underline">team@elevo.dev</a>
              {' '}{t('emailSubject')}
            </p>
          </div>
          <div className="text-left max-w-md mx-auto">
            <h2 className="font-bold text-gray-900 mb-3">{t('quickFacts')}</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>{t('founded')}</li>
              <li>{t('founder')}</li>
              <li>{t('product')}</li>
              <li>{t('agents')}</li>
            </ul>
          </div>
          <Link href={`/${locale}`} className="text-sm text-indigo-600 font-medium hover:underline mt-8 inline-block">
            {t('backHome')}
          </Link>
        </div>
      </section>
    </main>
  )
}
