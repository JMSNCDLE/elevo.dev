import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare ELEVO AI™ vs Hootsuite, Jasper & HubSpot',
  description: 'See how ELEVO AI™ compares to Hootsuite, Jasper, and HubSpot. More features, lower price, 60+ AI agents. 7-day free trial on every plan.',
}

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function ComparePage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations('marketing')

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="pt-20 pb-12 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            {t('compareTitle')}
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            {t('compareSubtitle')}
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-5 text-gray-500 font-medium">{t('compareFeature')}</th>
                  <th className="py-4 px-5 text-indigo-600 font-black">ELEVO AI&#8482;</th>
                  <th className="py-4 px-5 text-gray-400 font-medium">Hootsuite</th>
                  <th className="py-4 px-5 text-gray-400 font-medium">Jasper</th>
                  <th className="py-4 px-5 text-gray-400 font-medium">HubSpot</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [t('compareContent'), '✓', '✗', '✓', '✓'],
                  [t('compareMarket'), '✓', '✗', '✗', '✗'],
                  [t('compareSpy'), '✓', '✗', '✗', '✗'],
                  [t('compareCRM'), '✓', '✗', '✗', '✓'],
                  [t('compareFinancial'), '✓', '✗', '✗', '✗'],
                  [t('compareROAS'), '✓', '✗', '✗', '✗'],
                  [t('compareStripe'), '✓', '✗', '✗', '✗'],
                  [t('compareLanguages'), '✓', '✗', '✗', '✗'],
                  [t('compareTrial'), '✓', '✓', '✓', '✗'],
                  [t('comparePrice'), 'From €39/mo', '€99/mo', '€39/mo', '€720/mo'],
                ].map(([feature, elevo, hs, jasper, hub], i) => (
                  <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="py-3 px-5 text-gray-700 font-medium">{feature}</td>
                    <td className={`py-3 px-5 text-center font-bold ${elevo === '✓' ? 'text-indigo-600' : 'text-gray-900'}`}>{elevo}</td>
                    <td className={`py-3 px-5 text-center ${hs === '✓' ? 'text-green-600' : 'text-gray-400'}`}>{hs}</td>
                    <td className={`py-3 px-5 text-center ${jasper === '✓' ? 'text-green-600' : 'text-gray-400'}`}>{jasper}</td>
                    <td className={`py-3 px-5 text-center ${hub === '✓' ? 'text-green-600' : 'text-gray-400'}`}>{hub}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to switch?
          </h2>
          <Link
            href={`/${locale}/signup`}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
          >
            Start free trial &rarr;
          </Link>
          <p className="mt-4 text-sm text-gray-400">
            {t('trialNote')}
          </p>
        </div>
      </section>
    </main>
  )
}
