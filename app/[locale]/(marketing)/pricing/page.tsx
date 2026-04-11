'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Check, Minus, ChevronDown, ChevronUp, Star, Zap } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { PLAN_PRICES, CURRENCY_SYMBOLS } from '@/lib/currency';
import PricingCheckoutButton from '@/components/marketing/PricingCheckoutButton';

interface Plan {
  id: string;
  name: string;
  badge?: string;
  description: string;
  credits: string;
  highlighted: boolean;
  features: string[];
  ctaVariant: 'outline' | 'filled';
}

interface FeatureRow {
  feature: string;
  launch: boolean | string;
  orbit: boolean | string;
  galaxy: boolean | string;
}

interface FaqItem {
  question: string;
  answer: string;
}

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check className="w-5 h-5 text-indigo-600 mx-auto" aria-label="Included" />;
  }
  if (value === false) {
    return <Minus className="w-5 h-5 text-gray-300 mx-auto" aria-label="Not included" />;
  }
  return (
    <span className="text-sm text-gray-700 text-center block">{value}</span>
  );
}

export default function PricingPage() {
  const t = useTranslations('pricing');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'en';
  const currency = useCurrency();
  const symbol = CURRENCY_SYMBOLS[currency];

  const [annual, setAnnual] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [tableExpanded, setTableExpanded] = useState<boolean>(false);

  const signupHref = `/${locale}/signup`;

  const PLANS: Plan[] = [
    {
      id: 'launch',
      name: 'Launch',
      description: t('launchDesc'),
      credits: t('launchCredits'),
      highlighted: false,
      ctaVariant: 'outline',
      features: [
        t('launchF1'),
        t('launchF2'),
        t('launchF3'),
        t('launchF4'),
        t('launchF5'),
      ],
    },
    {
      id: 'orbit',
      name: 'Orbit',
      badge: t('mostPopular'),
      description: t('orbitDesc'),
      credits: t('orbitCredits'),
      highlighted: true,
      ctaVariant: 'filled',
      features: [
        t('orbitF1'),
        t('orbitF2'),
        t('orbitF3'),
        t('orbitF4'),
        t('orbitF5'),
        t('orbitF6'),
        t('orbitF7'),
        t('orbitF8'),
      ],
    },
    {
      id: 'galaxy',
      name: 'Galaxy',
      description: t('galaxyDesc'),
      credits: t('galaxyCredits'),
      highlighted: false,
      ctaVariant: 'outline',
      features: [
        t('galaxyF1'),
        t('galaxyF2'),
        t('galaxyF3'),
        t('galaxyF4'),
        t('galaxyF5'),
        t('galaxyF6'),
        t('galaxyF7'),
        t('galaxyF8'),
      ],
    },
  ];

  const FEATURE_ROWS: FeatureRow[] = [
    { feature: t('ftCredits'), launch: '500', orbit: '1,500', galaxy: '5,000' },
    { feature: t('ftProfiles'), launch: '1', orbit: '3', galaxy: '15' },
    { feature: t('ftGBP'), launch: true, orbit: true, galaxy: true },
    { feature: t('ftBlog'), launch: true, orbit: true, galaxy: true },
    { feature: t('ftSocial'), launch: true, orbit: true, galaxy: true },
    { feature: t('ftEmail'), launch: true, orbit: true, galaxy: true },
    { feature: t('ftSEO'), launch: true, orbit: true, galaxy: true },
    { feature: t('ftReviews'), launch: true, orbit: true, galaxy: true },
    { feature: t('ftCRM'), launch: '100', orbit: t('unlimited'), galaxy: t('unlimited') },
    { feature: t('ftProblemSolver'), launch: true, orbit: true, galaxy: true },
    { feature: t('ftLiveAssistant'), launch: true, orbit: true, galaxy: true },
    { feature: t('ftROAS'), launch: false, orbit: true, galaxy: true },
    { feature: t('ftFinancial'), launch: false, orbit: true, galaxy: true },
    { feature: t('ftSocialHub'), launch: false, orbit: true, galaxy: true },
    { feature: t('ftConnect'), launch: false, orbit: true, galaxy: true },
    { feature: t('ftChurn'), launch: false, orbit: true, galaxy: true },
    { feature: t('ftMarketResearch'), launch: false, orbit: true, galaxy: true },
    { feature: t('ftCampaign'), launch: false, orbit: true, galaxy: true },
    { feature: t('ftWhiteLabel'), launch: false, orbit: false, galaxy: true },
    { feature: t('ftAPI'), launch: false, orbit: false, galaxy: true },
    { feature: t('ftWidgets'), launch: false, orbit: false, galaxy: true },
    { feature: t('ftTeam'), launch: false, orbit: false, galaxy: t('upTo5') },
    { feature: t('ftSubdomain'), launch: false, orbit: false, galaxy: true },
    { feature: t('ftSupport'), launch: t('supportEmail'), orbit: t('supportPriority'), galaxy: t('supportDedicated') },
  ];

  const FAQS: FaqItem[] = [
    { question: t('faq1Q'), answer: t('faq1A') },
    { question: t('faq2Q'), answer: t('faq2A') },
    { question: t('faq3Q'), answer: t('faq3A') },
    { question: t('faq4Q'), answer: t('faq4A') },
    { question: t('faq5Q'), answer: t('faq5A') },
    { question: t('faq6Q'), answer: t('faq6A') },
    { question: t('faq7Q'), answer: t('faq7A') },
    { question: t('faq8Q'), answer: t('faq8A') },
  ];

  function getPrice(planId: string): number {
    const p = PLAN_PRICES[planId]?.[currency];
    return p ? (annual ? p.annual : p.monthly) : 0;
  }
  const visibleRows = tableExpanded ? FEATURE_ROWS : FEATURE_ROWS.slice(0, 10);

  return (
    <main className="bg-white min-h-screen">
      {/* -- 1. Header -- */}
      <section className="pt-20 pb-10 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            {t('heroTitle')}
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            {t('heroSubtitle')}
          </p>

          {/* Monthly / Annual toggle */}
          <div className="mt-8 inline-flex items-center gap-3 flex-wrap justify-center">
            <span
              className={`text-sm font-medium transition-colors ${
                !annual ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {t('monthly')}
            </span>
            <button
              type="button"
              onClick={() => setAnnual((v) => !v)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                annual ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
              aria-label="Toggle annual billing"
              aria-checked={annual}
              role="switch"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  annual ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium transition-colors ${
                annual ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {t('annual')}
            </span>
            {annual && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                {t('annualSaving')}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* -- 2. Plan cards -- */}
      <section className="pb-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.highlighted
                  ? 'border-indigo-500 shadow-xl shadow-indigo-100 ring-2 ring-indigo-500'
                  : 'border-gray-200 shadow-sm'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow">
                    <Star className="w-3 h-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <p className="mt-1 text-sm text-gray-500">{plan.description}</p>

                {/* Price */}
                <div className="mt-5 flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {symbol}{getPrice(plan.id)}
                  </span>
                  <span className="mb-1 text-sm text-gray-400">{t('perMonth')}</span>
                </div>
                {annual && (
                  <p className="mt-1 text-xs text-gray-400">
                    Billed annually ({symbol}{getPrice(plan.id) * 12}/yr)
                  </p>
                )}

                {/* Credits pill */}
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1">
                  <Zap className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-xs font-medium text-indigo-700">{plan.credits}</span>
                </div>

                {/* Feature list */}
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="mt-8">
                <PricingCheckoutButton
                  planId={plan.id as 'launch' | 'orbit' | 'galaxy'}
                  annual={annual}
                  className={`block w-full rounded-xl px-5 text-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                    plan.ctaVariant === 'filled'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 text-base py-3.5'
                      : 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-sm py-3'
                  }`}
                >
                  {t('startTrial')}
                </PricingCheckoutButton>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* -- 3. Add-on box -- */}
      <section className="pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border border-dashed border-indigo-300 bg-indigo-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {t('addonTitle')}{' '}
                <span className="text-indigo-600">{t('addonPrice')}</span>
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {t('addonDesc')}
              </p>
            </div>
            <Link
              href={signupHref}
              className="shrink-0 rounded-xl border border-indigo-600 px-5 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors whitespace-nowrap"
            >
              {t('addonCta')}
            </Link>
          </div>
        </div>
      </section>

      {/* -- 4. Feature comparison table -- */}
      <section className="pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t('featureComparison')}
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-4 px-5 text-left font-semibold text-gray-600 w-1/2">
                    {t('featureLabel')}
                  </th>
                  <th className="py-4 px-5 text-center font-semibold text-gray-700">
                    Launch
                  </th>
                  <th className="py-4 px-5 text-center font-bold text-indigo-700 bg-indigo-50/60">
                    Orbit ★
                  </th>
                  <th className="py-4 px-5 text-center font-semibold text-gray-700">
                    Galaxy
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-gray-100 ${
                      i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="py-3 px-5 text-gray-700">{row.feature}</td>
                    <td className="py-3 px-5">
                      <FeatureCell value={row.launch} />
                    </td>
                    <td className="py-3 px-5 bg-indigo-50/30">
                      <FeatureCell value={row.orbit} />
                    </td>
                    <td className="py-3 px-5">
                      <FeatureCell value={row.galaxy} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expand / collapse */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setTableExpanded((v) => !v)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              {tableExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  {t('showLess')}
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  {t('showAll', { count: FEATURE_ROWS.length })}
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* -- 5. FAQ Accordion -- */}
      <section className="pb-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto pt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t('faqTitle')}
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  aria-expanded={openFaq === i}
                >
                  <span className="text-sm font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  {openFaq === i ? (
                    <ChevronUp className="shrink-0 w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="shrink-0 w-4 h-4 text-gray-400" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- 6. Final CTA row -- */}
      <section className="py-20 px-4 bg-white border-t border-gray-100">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-sm text-gray-500 mb-6">
            {t('ctaSubtitle')}
          </p>
          <Link
            href={signupHref}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {t('ctaButton')}
          </Link>
          <p className="mt-4 text-xs text-gray-400">
            {t('ctaFootnote')}
          </p>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">{t('enterpriseTag')}</p>
          <h3 className="text-xl font-bold text-gray-900 mb-3">{t('enterpriseTitle')}</h3>
          <p className="text-sm text-gray-500 mb-6">
            {t('enterpriseDesc')}
          </p>
          <a href="mailto:team@elevo.dev" className="inline-block px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors text-sm">
            {t('enterpriseCta')}
          </a>
        </div>
      </section>
    </main>
  );
}
