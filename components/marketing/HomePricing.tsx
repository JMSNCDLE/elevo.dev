'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { useTranslations } from 'next-intl'
import { CURRENCY_SYMBOLS, PLAN_PRICES } from '@/lib/currency'

export function HomePricingCards() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'
  const currency = useCurrency()
  const symbol = CURRENCY_SYMBOLS[currency]
  const t = useTranslations('homePricing')

  const plans = [
    {
      name: 'Launch',
      price: `${symbol}${PLAN_PRICES.launch[currency].monthly}`,
      period: t('perMonth'),
      desc: t('launchDesc'),
      features: [t('launchF1'), t('launchF2'), t('launchF3'), t('launchF4'), t('launchF5')],
      cta: t('startTrial'),
      highlight: false,
    },
    {
      name: 'Orbit',
      price: `${symbol}${PLAN_PRICES.orbit[currency].monthly}`,
      period: t('perMonth'),
      desc: t('orbitDesc'),
      badge: t('orbitBadge'),
      features: [t('orbitF1'), t('orbitF2'), t('orbitF3'), t('orbitF4'), t('orbitF5')],
      cta: t('startTrial'),
      highlight: true,
    },
    {
      name: 'Galaxy',
      price: `${symbol}${PLAN_PRICES.galaxy[currency].monthly}`,
      period: t('perMonth'),
      desc: t('galaxyDesc'),
      features: [t('galaxyF1'), t('galaxyF2'), t('galaxyF3'), t('galaxyF4'), t('galaxyF5')],
      cta: t('startTrial'),
      highlight: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {plans.map(plan => (
        <div
          key={plan.name}
          className={`rounded-2xl p-6 ${plan.highlight ? 'border-2 border-indigo-600 bg-white shadow-xl shadow-indigo-100' : 'border border-gray-200 bg-white'}`}
        >
          {'badge' in plan && plan.badge && (
            <span className="text-xs font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full mb-3 inline-block">
              {plan.badge}
            </span>
          )}
          <h3 className="font-black text-xl text-gray-900 mb-1">{plan.name}</h3>
          <p className="text-sm text-gray-500 mb-4">{plan.desc}</p>
          <div className="mb-6">
            <span className="text-4xl font-black text-gray-900">{plan.price}</span>
            <span className="text-sm text-gray-400">{plan.period}</span>
          </div>
          <ul className="space-y-2 mb-6">
            {plan.features.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle2 size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href={`/${locale}/signup`}
            className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${plan.highlight ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
          >
            {plan.cta}
          </Link>
        </div>
      ))}
    </div>
  )
}

export function HomeComparisonPrice() {
  const currency = useCurrency()
  const symbol = CURRENCY_SYMBOLS[currency]
  const launchPrice = PLAN_PRICES.launch[currency].monthly
  return <>{symbol}{launchPrice}/mo</>
}

export function HomeOrbitPrice() {
  const currency = useCurrency()
  const symbol = CURRENCY_SYMBOLS[currency]
  const orbitPrice = PLAN_PRICES.orbit[currency].monthly
  return <span className="text-green-400">{symbol}{orbitPrice}/mo</span>
}
