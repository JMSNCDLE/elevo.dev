import Link from 'next/link'
import { CheckCircle2, Zap, Users, TrendingUp, FileText, BarChart2, Star } from 'lucide-react'

export default function LandingPage({ params }: { params: { locale: string } }) {
  const features = [
    { icon: FileText, title: 'Content that sounds like you', description: 'GBP posts, blogs, social captions, review responses, emails — all in your voice, never generic AI fluff.' },
    { icon: Zap, title: 'Problem Solver AI', description: 'Describe any business challenge. Get expert diagnosis, an action plan, and ready-to-use content — powered by Claude Opus.' },
    { icon: Users, title: 'Smart CRM', description: 'Track customers, log jobs, spot lapsed contacts, and draft personalised follow-up messages automatically.' },
    { icon: TrendingUp, title: 'Growth tools (Orbit+)', description: 'Sales proposals, market research, SWOT strategy, financial health reports, HR documents, and campaign planning.' },
    { icon: BarChart2, title: 'Live web intelligence', description: 'Research and campaign agents search the web in real time, so your insights are always current.' },
    { icon: Star, title: 'Review generation', description: 'Identify your happiest customers and send personalised review requests that actually get responses.' },
  ]

  const plans = [
    { name: 'Trial', price: 'Free', credits: '20 credits', features: ['All content generators', 'CRM (20 contacts)', 'Problem Solver', 'Live AI assistant'] },
    { name: 'Launch', price: '£39/mo', credits: '100 credits/mo', features: ['Everything in Trial', 'CRM (100 contacts)', 'Email sequences', 'Library & calendar'] },
    { name: 'Orbit', price: '£79/mo', credits: '300 credits/mo', highlight: true, features: ['Everything in Launch', 'Growth tools unlocked', 'Unlimited contacts', 'Market research (live web)', 'Sales proposals', 'Campaign planning'] },
    { name: 'Galaxy', price: '£149/mo', credits: '999 credits/mo', features: ['Everything in Orbit', 'Team members (up to 5)', 'White-label reports', 'Priority support', 'API access'] },
  ]

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-indigo-50 to-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Zap size={14} />
            Powered by Claude Opus & Sonnet
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
            The AI that <span className="text-indigo-600">elevates</span> local businesses
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            ELEVO AI creates content, manages customers, solves problems, and drives growth — tailored to your exact business. Not generic. Not robotic. Yours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/${params.locale}/signup`} className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-lg">
              Start free — 20 credits
            </Link>
            <Link href={`/${params.locale}/pricing`} className="px-8 py-3.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-colors text-lg">
              See pricing
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Everything a local business needs</h2>
          <p className="text-gray-500 text-center mb-12">Built specifically for trades, services, and local businesses — not enterprises.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Simple, transparent pricing</h2>
          <p className="text-gray-500 text-center mb-12">Start free. Upgrade when you're ready.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map(plan => (
              <div key={plan.name} className={`rounded-2xl p-5 border ${plan.highlight ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white' : 'border-gray-200 bg-white'}`}>
                {plan.highlight && (
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">Most Popular</div>
                )}
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{plan.price}</p>
                <p className="text-xs text-gray-500 mb-4">{plan.credits}</p>
                <ul className="space-y-1.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <CheckCircle2 size={13} className="text-indigo-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href={`/${params.locale}/pricing`} className="text-indigo-600 font-medium hover:underline text-sm">
              See full plan details →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-indigo-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to elevate your business?</h2>
          <p className="text-indigo-200 mb-8">Join hundreds of local businesses using ELEVO AI to create better content, retain more customers, and grow faster.</p>
          <Link href={`/${params.locale}/signup`} className="px-8 py-3.5 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors text-lg inline-block">
            Start free today
          </Link>
        </div>
      </section>
    </>
  )
}
