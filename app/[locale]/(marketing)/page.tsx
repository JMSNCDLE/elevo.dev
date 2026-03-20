import Link from 'next/link'
import { CheckCircle2, Zap, BarChart3, MapPin, FileText, Users, TrendingUp, Package, Repeat2 } from 'lucide-react'

const AGENTS = [
  { emoji: '📊', name: 'Leo', role: 'ROAS & Ad Analyst', desc: 'Knows if every £1 of ad spend is working.' },
  { emoji: '💰', name: 'Flora', role: 'Financial Intelligence', desc: 'P&L, cash flow, cost savings from any data.' },
  { emoji: '📍', name: 'Geo', role: 'Google & Local Search', desc: 'GBP audit, Maps ranking, local pack domination.' },
  { emoji: '✍️', name: 'Sol', role: 'Content Writer', desc: 'GBP posts, blogs, reviews, social — your voice.' },
  { emoji: '💬', name: 'Sage', role: 'CRM & Customers', desc: 'Segments, follow-ups, and who to call this week.' },
  { emoji: '⚡', name: 'Echo', role: 'Conversation Flows', desc: 'WhatsApp, SMS, email automation sequences.' },
  { emoji: '🧠', name: 'Max', role: 'Problem Solver', desc: 'Handles any business challenge you describe.' },
]

const FEATURES = [
  { icon: BarChart3, title: 'ROAS & Ad Intelligence', desc: 'Know if every £1 is working. Leo analyses every campaign and tells you exactly what to cut and where to scale.' },
  { icon: TrendingUp, title: 'Financial Analysis', desc: 'P&L, cash flow, cost savings from any data you paste. No accountant needed.' },
  { icon: MapPin, title: 'Google Optimisation', desc: 'GBP audit, Maps ranking score, local pack strategy, and a 30-day action plan.' },
  { icon: FileText, title: 'Content Engine', desc: 'GBP posts, blogs, reviews, social captions — written for your city and your services.' },
  { icon: Users, title: 'Customer Intelligence', desc: 'Churn prediction, segment analysis, retention campaigns, and win-back sequences.' },
  { icon: Package, title: 'Inventory & Supply', desc: 'Stock alerts, demand forecasting, reorder point calculations, and cheaper supplier sourcing.' },
]

const TESTIMONIALS = [
  {
    quote: 'I was spending £800/month on Google Ads and had no idea if it was working. Leo ran my ROAS analysis in 60 seconds and showed me I was wasting £340/month on two campaigns. Fixed it. Now I spend £460/month and get twice the calls.',
    name: 'Mario T.',
    role: 'Emergency Plumber, Manchester',
    stars: 5,
  },
  {
    quote: 'ELEVO replaced my marketing agency. I was paying €1,800/month for someone to post 4 times on Instagram. Now I get 40 posts a month across every channel, a full Google strategy, and review automation — for €89/month.',
    name: 'Dr. Sarah K.',
    role: 'Dental Practice, Dublin',
    stars: 5,
  },
  {
    quote: "L'agent Flora a analysé notre P&L et trouvé €900 d'économies mensuelles en 25 secondes. Notre directeur financier n'avait pas trouvé ça en 6 mois.",
    name: 'Jean-Paul M.',
    role: 'Restaurant Owner, Paris',
    stars: 5,
  },
]

const PLANS = [
  { name: 'Trial', price: 'Free', credits: '20 credits', features: ['All content generators', 'CRM (20 contacts)', 'Problem Solver', 'Live AI assistant'] },
  { name: 'Launch', price: '£39/mo', credits: '100 credits/mo', features: ['Everything in Trial', 'CRM (100 contacts)', 'Email sequences', 'Library & calendar'] },
  { name: 'Orbit', price: '£79/mo', credits: '300 credits/mo', highlight: true, features: ['Everything in Launch', 'All 21 agents unlocked', 'ROAS & Financial Intelligence', 'Google Optimisation audit', 'Customer Trends & churn', 'Conversation flows (WA/SMS)'] },
  { name: 'Galaxy', price: '£149/mo', credits: '999 credits/mo', features: ['Everything in Orbit', 'Team members (up to 5)', 'White-label reports', 'Priority support', 'API access'] },
]

export default function LandingPage({ params }: { params: { locale: string } }) {
  return (
    <>
      {/* ── SECTION 1: HERO ──────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-indigo-50 to-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-8">
            <Zap size={14} />
            21 AI agents. All working for your business.
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
            Your competitor is showing up<br className="hidden sm:block" /> on Google.{' '}
            <span className="text-indigo-600">You&apos;re not.</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            ELEVO is 21 AI agents working for your business — writing your content, analysing your finances,
            tracking your ad spend, managing your customers, and solving any business problem you describe.
            In seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link
              href={`/${params.locale}/signup`}
              className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-lg shadow-lg shadow-indigo-200"
            >
              Start free — 7 days, no card
            </Link>
            <Link
              href={`/${params.locale}/pricing`}
              className="px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-colors text-lg"
            >
              See ELEVO working →
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-gray-500">
            <span>★★★★★ &ldquo;Saved me £2,400/mo in wasted ad spend&rdquo; — Mario, Plumber, Manchester</span>
            <span className="hidden sm:block text-gray-300">|</span>
            <span>★★★★★ &ldquo;Page 3 to top 3 in 6 weeks&rdquo; — Sarah, Salon, Dublin</span>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: THE PAIN ──────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="space-y-4 text-xl text-gray-600 leading-relaxed mb-12">
            <p>You know you should be posting on Google every week. <span className="text-gray-400">You haven&apos;t in months.</span></p>
            <p>You know you should be replying to reviews. <span className="text-gray-400">17 are sitting unanswered.</span></p>
            <p>You know your ad spend might be wasted. <span className="text-gray-400">You have no idea what your ROAS is.</span></p>
            <p>You know a blog would help. <span className="text-gray-400">You haven&apos;t written one since last year.</span></p>
            <p>You know you should be following up with customers. <span className="text-gray-400">Most of them have gone quiet.</span></p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ELEVO handles <span className="text-indigo-600">ALL of it.</span> In seconds. Every week.<br className="hidden sm:block" />
            While you get on with your business.
          </p>
        </div>
      </section>

      {/* ── SECTION 3: AGENT TEAM ─────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">21 AI agents. All working for you.</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Each one is a specialist. Together, they run your entire business operation.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {AGENTS.map(agent => (
              <div key={agent.name} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 hover:border-indigo-200 hover:shadow-sm transition-all">
                <span className="text-3xl">{agent.emoji}</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{agent.name} <span className="font-normal text-gray-400">— {agent.role}</span></p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{agent.desc}</p>
                </div>
              </div>
            ))}
            <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5 flex items-center justify-center">
              <Link href={`/${params.locale}/signup`} className="text-indigo-600 font-semibold text-sm hover:underline">
                See all 21 agents →
              </Link>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm">
            Every agent knows your business, your city, and your customers. They don&apos;t just give advice — they do the work.
          </p>
        </div>
      </section>

      {/* ── SECTION 4: ROAS SPOTLIGHT ─────────────────────────────── */}
      <section className="py-24 px-6 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-indigo-300 font-semibold uppercase tracking-widest text-xs mb-4">The biggest differentiator</p>
          <h2 className="text-4xl font-extrabold mb-6">Stop guessing. Start knowing.</h2>

          <div className="bg-white/10 rounded-2xl p-8 mb-8 max-w-sm mx-auto">
            <p className="text-indigo-200 text-sm mb-2">ROAS benchmark most businesses never hit</p>
            <p className="text-7xl font-black">4:1</p>
            <p className="text-indigo-300 text-sm mt-2">Most local businesses are at 1.8:1</p>
          </div>

          <p className="text-indigo-100 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Most local businesses spend money on ads without knowing if it&apos;s working. Leo, your ROAS agent,
            analyses every campaign, every channel, every pound. He tells you exactly where to cut, where to scale,
            and where you&apos;re losing money.
          </p>

          <div className="bg-white/10 rounded-xl px-6 py-4 inline-block mb-8">
            <p className="text-white font-semibold">Average ELEVO user saves <span className="text-yellow-300">£1,200/month</span> in wasted ad spend in their first analysis.</p>
          </div>

          <div className="block">
            <Link
              href={`/${params.locale}/signup`}
              className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors text-lg inline-block"
            >
              Run My ROAS Analysis Free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: HOW IT WORKS ───────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Tell ELEVO about your business',
                desc: '3 minutes. Conversational setup. Your 21 agents are briefed on your business, city, customers, and goals.',
              },
              {
                step: '2',
                title: 'Paste your data or click generate',
                desc: 'Ad spend, finances, inventory, customer list — paste anything. Or just click to generate content. No formatting needed.',
              },
              {
                step: '3',
                title: 'Get results, copy, act',
                desc: 'Full reports, ready-to-use content, action plans with priorities. Copy, paste, publish. Done.',
              },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-black text-xl flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: FEATURE GRID ───────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">Everything your business needs. Nothing it doesn&apos;t.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-indigo-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-indigo-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: TESTIMONIALS ───────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">Real businesses. Real results.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-gray-50 rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
                <div className="text-yellow-400 text-sm">{'★'.repeat(t.stars)}</div>
                <p className="text-gray-700 text-sm leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 8: DEMO CTA ───────────────────────────────────── */}
      <section className="py-24 px-6 bg-indigo-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Try ELEVO on your actual business.</h2>
          <p className="text-gray-500 mb-8 text-lg">See what your Google profile looks like to ELEVO in 60 seconds. No signup required.</p>
          <Link
            href={`/${params.locale}/signup`}
            className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-lg inline-block shadow-lg shadow-indigo-200"
          >
            Generate My First Post Free →
          </Link>
          <p className="text-gray-400 text-sm mt-4">This is real. This is what ELEVO generates for your business every week.</p>
        </div>
      </section>

      {/* ── SECTION 9: PRICING TEASER ─────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-gray-500 text-lg mb-2">From £39/month. Less than one hour with a marketing consultant.</p>
            <h2 className="text-3xl font-bold text-gray-900">Simple, transparent pricing</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`rounded-2xl p-5 border ${
                  plan.highlight
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white'
                    : 'border-gray-200 bg-white'
                }`}
              >
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

      {/* ── SECTION 10: FINAL CTA ─────────────────────────────────── */}
      <section className="py-24 px-6 bg-indigo-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Your competitors are posting right now.
          </h2>
          <p className="text-indigo-200 text-lg mb-10">
            Every day without ELEVO is a day they rank higher than you.
          </p>
          <Link
            href={`/${params.locale}/signup`}
            className="px-10 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors text-lg inline-block shadow-lg"
          >
            Start your free 7-day trial →
          </Link>
          <p className="text-indigo-300 text-sm mt-5">No card required to start · 7 days free · Cancel anytime</p>
        </div>
      </section>
    </>
  )
}
