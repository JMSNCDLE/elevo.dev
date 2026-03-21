import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { PLANS } from '@/lib/stripe/pricing'
import { getCurrencyFromLocale } from '@/lib/i18n/routing'

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const currency = getCurrencyFromLocale(locale)
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'

  const faqs = [
    { q: 'What counts as a credit?', a: 'One credit = one AI generation. Most content types cost 1 credit. The Problem Solver costs 2 credits because it uses Claude Opus, our most powerful model.' },
    { q: 'What happens when I run out of credits?', a: 'Credits reset at the start of each billing cycle. If you run out early, you can upgrade to a higher plan or wait for the reset.' },
    { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your account settings and you\'ll retain access until the end of your billing period.' },
    { q: 'Is there a free trial?', a: 'Yes — every new account starts with 20 free credits. No credit card required.' },
    { q: 'What is the Orbit plan?', a: 'Orbit unlocks all Growth tools: sales proposals, market research, SWOT strategy, financial health reports, HR documents, and campaign planning — plus unlimited contacts.' },
  ]

  return (
    <div className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Pricing</h1>
          <p className="text-gray-500">Start free. Upgrade when you need more.</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PLANS.map(plan => {
            const price = currency === 'USD' ? plan.prices.usd : currency === 'EUR' ? plan.prices.eur : plan.prices.gbp
            const annualPrice = currency === 'USD' ? plan.annualPrices.usd : currency === 'EUR' ? plan.annualPrices.eur : plan.annualPrices.gbp

            return (
              <div key={plan.id} className={`rounded-2xl p-6 border ${plan.highlight ? 'border-indigo-500 ring-2 ring-indigo-500/20 relative' : 'border-gray-200'}`}>
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${plan.highlight ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    {plan.badge}
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h2>
                <div className="mb-1">
                  <span className="text-3xl font-bold text-gray-900">{currencySymbol}{price}</span>
                  <span className="text-gray-500 text-sm">/month</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">or {currencySymbol}{annualPrice}/year (save ~16%)</p>
                <p className="text-sm text-indigo-600 font-medium mb-4">{plan.credits === 999 ? '999 credits/month' : `${plan.credits} credits/month`}</p>

                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={15} className="text-indigo-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/${locale}/signup`}
                  className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${plan.highlight ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'border border-gray-300 text-gray-700 hover:border-indigo-400 hover:text-indigo-600'}`}
                >
                  Get started
                </Link>
              </div>
            )
          })}
        </div>

        {/* Trial */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-16 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Start with a free trial</h3>
          <p className="text-gray-500 text-sm mb-4">20 credits. All features. No credit card required.</p>
          <Link href={`/${locale}/signup`} className="inline-block px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            Create free account
          </Link>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map(faq => (
              <div key={faq.q} className="border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Money-back guarantee */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 max-w-2xl mx-auto text-center">
          <div className="text-2xl mb-2">🛡️</div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">14-day money-back guarantee</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Not happy in your first 14 days? We&apos;ll refund you in full, no questions asked.
            Just email <span className="font-medium text-gray-700">hello@elevo.ai</span> and we&apos;ll sort it immediately.
          </p>
        </div>

        {/* Enterprise CTA */}
        <div className="bg-gray-900 rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-2">Need more than Galaxy?</h3>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            For agencies, franchises, and multi-location businesses. Custom agent training, white-label portal,
            dedicated account manager, and unlimited everything.
          </p>
          <a
            href="mailto:hello@elevo.ai?subject=Enterprise enquiry"
            className="inline-block px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors text-sm"
          >
            Talk to us about Enterprise →
          </a>
        </div>
      </div>
    </div>
  )
}
