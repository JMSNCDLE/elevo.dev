'use client'

import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { CURRENCY_SYMBOLS, PLAN_PRICES } from '@/lib/currency'

export function HomePricingCards() {
  const currency = useCurrency()
  const symbol = CURRENCY_SYMBOLS[currency]

  const plans = [
    {
      name: 'Launch',
      price: `${symbol}${PLAN_PRICES.launch[currency].monthly}`,
      period: '/mo',
      desc: 'Perfect for solo operators',
      features: ['GBP Posts + Blog Writer', 'Social Captions + Reviews', 'Email + SEO Copy', '500 credits/mo', 'Content library'],
      cta: 'Start free trial',
      highlight: false,
    },
    {
      name: 'Orbit',
      price: `${symbol}${PLAN_PRICES.orbit[currency].monthly}`,
      period: '/mo',
      desc: 'For growing businesses',
      badge: '★ Most Popular',
      features: ['Everything in Launch', 'All Growth tools', 'ELEVO Spy™ + Market™', 'ELEVO Viral™ + SMM™', '1,500 credits/mo'],
      cta: 'Start free trial',
      highlight: true,
    },
    {
      name: 'Galaxy',
      price: `${symbol}${PLAN_PRICES.galaxy[currency].monthly}`,
      period: '/mo',
      desc: 'Every aspect taken care of',
      features: ['Everything in Orbit', 'ELEVO CEO™', 'ELEVO Drop™ (e-commerce)', 'Store Analytics', '5,000 credits/mo'],
      cta: 'Start free trial',
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
            href="/en/signup"
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
