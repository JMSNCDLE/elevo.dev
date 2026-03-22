import Link from 'next/link'
import { CheckCircle2, Sparkles } from 'lucide-react'
import TrustBar from '@/components/shared/TrustBar'
import LiveCounters from '@/components/shared/LiveCounters'

const AGENTS = [
  { emoji: '✍️', brand: 'ELEVO Write™', role: 'Content Engine', desc: 'GBP posts, blogs, reviews, social captions, email — written in your voice, for your city.' },
  { emoji: '📊', brand: 'ELEVO Ads Pro™', role: 'ROAS & Ad Intelligence', desc: 'Knows if every £1 of ad spend is working. Finds waste, scales winners.' },
  { emoji: '📍', brand: 'ELEVO Rank™', role: 'SEO & Google Domination', desc: 'GBP audit, Maps ranking, local pack strategy, and a 30-day SEO plan.' },
  { emoji: '💰', brand: 'ELEVO Flora™', role: 'Financial Intelligence', desc: 'P&L, cash flow, cost savings from any data you paste. No accountant needed.' },
  { emoji: '💬', brand: 'ELEVO Sage™', role: 'CRM & Customer Intelligence', desc: 'Segments customers, predicts churn, drafts follow-ups, logs every interaction.' },
  { emoji: '⚡', brand: 'ELEVO Echo™', role: 'Conversation Automation', desc: 'Instagram DMs, WhatsApp, SMS — automated flows that convert comments to bookings.' },
  { emoji: '🧠', brand: 'ELEVO Solve™', role: 'Business Problem Solver', desc: 'Handles any business challenge you describe. Opus-powered deep thinking.' },
  { emoji: '🎬', brand: 'ELEVO Studio™', role: 'AI Video Studio', desc: 'Avatar ads, URL-to-video, voiceovers. Replaces Arcads + Creatify + ElevenLabs.' },
]

const STATS = [
  { value: '400+', label: 'businesses using ELEVO' },
  { value: '£1.2M', label: 'saved in wasted ad spend' },
  { value: '21', label: 'specialist AI agents' },
  { value: '99.9%', label: 'platform uptime' },
]

const PAIN_POINTS = [
  { problem: 'You know you should be posting on Google every week.', reality: "You haven't in 3 months." },
  { problem: 'You know you should be replying to reviews.', reality: '17 are sitting unanswered.' },
  { problem: 'You know your ad spend might be wasted.', reality: "You don't know what your ROAS is." },
  { problem: 'You know a blog would help your ranking.', reality: "You haven't written one since last year." },
  { problem: 'You know you should be following up with customers.', reality: 'Most of them have gone quiet.' },
]

const TESTIMONIALS = [
  {
    quote: 'I was spending £800/month on Google Ads with no idea if it was working. ELEVO Ads Pro™ ran my ROAS analysis in 60 seconds and showed me I was wasting £340/month on two campaigns. Fixed it. Now I spend £460/month and get twice the calls.',
    name: 'Mario T.',
    role: 'Emergency Plumber, Manchester',
    stars: 5,
  },
  {
    quote: 'ELEVO AI™ replaced my marketing agency. I was paying €1,800/month for someone to post 4 times on Instagram. Now I get 40 posts across every channel, a full Google strategy, and review automation — for €89/month.',
    name: 'Dr. Sarah K.',
    role: 'Dental Practice, Dublin',
    stars: 5,
  },
  {
    quote: "ELEVO Flora™ analysed our P&L and found €900 in monthly savings in 25 seconds. Our financial director hadn't found that in 6 months.",
    name: 'Jean-Paul M.',
    role: 'Restaurant Owner, Paris',
    stars: 5,
  },
]

const PLANS = [
  { name: 'Trial', price: 'Free', period: '', credits: '20 credits', features: ['All content generators', 'CRM (20 contacts)', 'ELEVO Solve™ Problem Solver', 'Live AI assistant'] },
  { name: 'Launch', price: '£39', period: '/mo', credits: '100 credits/mo', features: ['Everything in Trial', 'CRM (100 contacts)', 'Email sequences', 'Library & calendar'] },
  { name: 'Orbit', price: '£79', period: '/mo', credits: '300 credits/mo', highlight: true, features: ['Everything in Launch', 'All 21 agents unlocked', 'ELEVO Ads Pro™ ROAS Intel', 'ELEVO Rank™ Google audit', 'ELEVO Echo™ DM automation', 'ELEVO Studio™ Video'] },
  { name: 'Galaxy', price: '£149', period: '/mo', credits: '999 credits/mo', features: ['Everything in Orbit', 'Team members (up to 5)', 'White-label reports', 'Priority support', 'API access'] },
]

const FAQ_ITEMS = [
  { q: 'What is ELEVO AI™?', a: "ELEVO AI™ is the AI operating system for local businesses. 21 specialist AI agents handle your content, ads, SEO, CRM, finances, and more — all from one dashboard." },
  { q: 'How quickly does it work?', a: 'Onboarding takes 3 minutes. Your first piece of content generates in under 30 seconds. Most businesses see measurable results in their first week.' },
  { q: 'Does it replace my marketing agency?', a: "For most local businesses, yes. ELEVO AI™ generates more content, more consistently, for a fraction of the cost. From £39/month." },
  { q: 'Is my data secure?', a: 'Yes. ELEVO AI™ is GDPR-compliant, uses bank-grade encryption, and your business data is never used to train AI models.' },
]

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isSpanish = locale === 'es'

  return (
    <>
      {/* HERO */}
      <section className="bg-gradient-to-b from-indigo-50 via-white to-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-8">
            <Sparkles size={14} />
            {isSpanish ? '21 agentes IA. Todos trabajando para tu negocio.' : 'Launching 2026 — 400+ businesses already inside'}
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-[1.08] mb-6 tracking-tight">
            {isSpanish ? (
              <>El sistema operativo IA<sup className="text-2xl align-super">™</sup> para negocios locales</>
            ) : (
              <>The AI operating system<sup className="text-2xl align-super text-indigo-600">™</sup><br className="hidden sm:block" /> for local businesses</>
            )}
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            {isSpanish
              ? '21 especialistas IA que escriben tu contenido, gestionan tus anuncios, atienden a tus clientes y resuelven cualquier problema. En segundos. Desde £39/mes.'
              : '21 AI specialists that write your content, run your ads, manage your customers, and solve any business problem. In seconds. From £39/month.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link href={`/${locale}/signup`} className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-lg shadow-lg shadow-indigo-200">
              {isSpanish ? 'Empieza gratis — 7 días, sin tarjeta' : 'Start free — 7 days, no card required'}
            </Link>
            <Link href={`/${locale}/pricing`} className="px-8 py-4 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-colors text-lg">
              See how it works →
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center text-sm text-gray-400 mb-8">
            <span>★★★★★ &ldquo;Saved me £2,400/mo in wasted ad spend&rdquo; — Mario, Plumber</span>
            <span className="hidden sm:block">·</span>
            <span>★★★★★ &ldquo;Page 3 to top 3 in 6 weeks&rdquo; — Sarah, Dental</span>
          </div>

          <LiveCounters />
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-gray-100 bg-white py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(stat => (
              <div key={stat.value}>
                <p className="text-3xl font-extrabold text-indigo-600">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrustBar />

      {/* THE PAIN */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-indigo-600 font-semibold uppercase tracking-widest text-xs mb-4">Sound familiar?</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Running a business shouldn&apos;t feel like this.</h2>
          <div className="space-y-4 text-lg text-gray-600 leading-relaxed mb-12">
            {PAIN_POINTS.map(point => (
              <p key={point.problem}>
                {point.problem}{' '}
                <span className="text-gray-400">{point.reality}</span>
              </p>
            ))}
          </div>
          <div className="bg-indigo-50 rounded-2xl p-8 border border-indigo-100">
            <p className="text-2xl font-bold text-gray-900">
              ELEVO AI™ handles <span className="text-indigo-600">all of it.</span><br className="hidden sm:block" />
              In seconds. Every week. While you run your business.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-indigo-600 font-semibold uppercase tracking-widest text-xs mb-4">How it works</p>
            <h2 className="text-3xl font-bold text-gray-900">From setup to results in 3 minutes.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Tell ELEVO™ about your business', desc: '3-minute conversational onboarding. All 21 agents are briefed on your business, city, customers, and goals.' },
              { step: '2', title: 'Paste your data or click generate', desc: 'Ad spend, finances, inventory, customer list — paste anything. Or just click to generate. No formatting needed.' },
              { step: '3', title: 'Get results. Copy. Act.', desc: 'Full reports, ready-to-use content, action plans. Copy, publish, schedule. Done in under a minute.' },
            ].map(item => (
              <div key={item.step} className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-4">{item.step}</div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href={`/${locale}/signup`} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors inline-block">
              Try ELEVO AI™ free →
            </Link>
          </div>
        </div>
      </section>

      {/* AGENT TEAM */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-indigo-600 font-semibold uppercase tracking-widest text-xs mb-4">Your AI team</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">21 named agents. All specialists. All working for you.</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Each agent has a distinct name, expertise, and purpose. Together they run your entire business operation.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {AGENTS.map(agent => (
              <div key={agent.brand} className="bg-gray-50 rounded-2xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-sm hover:bg-white transition-all">
                <span className="text-2xl mb-3 block">{agent.emoji}</span>
                <p className="font-bold text-gray-900 text-sm">{agent.brand}</p>
                <p className="text-xs text-indigo-500 font-medium mb-1.5">{agent.role}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{agent.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5 text-center">
            <p className="text-gray-600 text-sm mb-2">Plus 13 more — ELEVO Rex™ (Inventory), ELEVO Hugo™ (Suppliers), ELEVO Maya™ (Customer Trends), and more.</p>
            <Link href={`/${locale}/signup`} className="text-indigo-600 font-semibold text-sm hover:underline">See all 21 agents after sign-up →</Link>
          </div>
        </div>
      </section>

      {/* ROAS SPOTLIGHT */}
      <section className="py-24 px-6 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-indigo-300 font-semibold uppercase tracking-widest text-xs mb-4">ELEVO Ads Pro™</p>
          <h2 className="text-4xl font-extrabold mb-8">Stop guessing. Start knowing exactly what your ads earn.</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            {[
              { value: '4:1', label: 'Target ROAS', sub: 'Industry benchmark' },
              { value: '1.8:1', label: 'Average ROAS', sub: 'Most local businesses' },
              { value: '£1,200', label: 'Avg. monthly waste found', sub: 'Per first analysis' },
            ].map(stat => (
              <div key={stat.value} className="bg-white/10 rounded-2xl p-5">
                <p className="text-4xl font-black">{stat.value}</p>
                <p className="text-white font-medium text-sm mt-1">{stat.label}</p>
                <p className="text-indigo-300 text-xs">{stat.sub}</p>
              </div>
            ))}
          </div>

          <p className="text-indigo-100 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            ELEVO Ads Pro™ analyses every campaign, every channel, every £. Tells you exactly where to cut, where to scale, and where you&apos;re losing money. Most businesses find £600–£1,200/month in waste on their first run.
          </p>

          <Link href={`/${locale}/signup`} className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors text-lg inline-block">
            Run My Free ROAS Analysis →
          </Link>
        </div>
      </section>

      {/* VIDEO STUDIO */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-indigo-600 font-semibold uppercase tracking-widest text-xs mb-4">ELEVO Studio™</p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Every AI video tool in one subscription.</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Arcads-style avatar ads. Creatify-style URL-to-video. ElevenLabs-style voiceovers. Cinematic UGC.
              All in ELEVO Studio™ — <strong className="text-indigo-600">included in Orbit at £79/month.</strong>
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-4 text-gray-500 font-medium">Feature</th>
                  <th className="text-center px-5 py-4 text-gray-400 font-medium">Arcads</th>
                  <th className="text-center px-5 py-4 text-gray-400 font-medium">Creatify</th>
                  <th className="text-center px-5 py-4 text-gray-400 font-medium">ElevenLabs</th>
                  <th className="text-center px-5 py-4 text-indigo-600 font-bold bg-indigo-50">ELEVO Studio™</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Avatar ad scripts + prompts', arcads: '✓', creatify: '—', el: '—', elevo: '✓' },
                  { feature: 'URL to video brief', arcads: '—', creatify: '✓', el: '—', elevo: '✓' },
                  { feature: 'AI voiceover + SSML', arcads: '—', creatify: '—', el: '✓', elevo: '✓' },
                  { feature: 'Cinematic UGC (Higgsfield)', arcads: '—', creatify: '—', el: '—', elevo: '✓' },
                  { feature: 'CRM integration', arcads: '—', creatify: '—', el: '—', elevo: '✓' },
                  { feature: 'Auto-schedule to social', arcads: '—', creatify: '—', el: '—', elevo: '✓' },
                  { feature: 'Monthly price', arcads: '£99+', creatify: '£99+', el: '£22+', elevo: 'Included' },
                ].map(row => (
                  <tr key={row.feature} className="border-t border-gray-100">
                    <td className="px-6 py-3.5 text-gray-700">{row.feature}</td>
                    <td className="text-center px-5 py-3.5 text-gray-400">{row.arcads}</td>
                    <td className="text-center px-5 py-3.5 text-gray-400">{row.creatify}</td>
                    <td className="text-center px-5 py-3.5 text-gray-400">{row.el}</td>
                    <td className="text-center px-5 py-3.5 text-indigo-600 font-semibold bg-indigo-50/50">{row.elevo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-8">
            <Link href={`/${locale}/signup`} className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors inline-block">
              Try ELEVO Studio™ free →
            </Link>
          </div>
        </div>
      </section>

      {/* MANYCHAT REPLACEMENT */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-indigo-600 font-semibold uppercase tracking-widest text-xs mb-4">ELEVO Echo™</p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Your Instagram DMs are a goldmine.<br className="hidden md:block" /> You&apos;re not using them.
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Someone comments on your post → ELEVO Echo™ sends a personalised DM → they reply →
              Echo books the appointment → contact added to your CRM. All automatic. All night.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 md:gap-4 mb-12 flex-wrap">
            {[
              { label: 'Comment', icon: '💬' },
              { label: 'Auto DM', icon: '📨' },
              { label: 'Echo™ replies', icon: '🤖' },
              { label: 'Booked', icon: '📅' },
              { label: 'CRM added', icon: '✅' },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-2 md:gap-4">
                <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-center shadow-sm min-w-[80px]">
                  <div className="text-2xl mb-1">{step.icon}</div>
                  <p className="text-xs font-semibold text-gray-700">{step.label}</p>
                </div>
                {i < 4 && <span className="text-gray-300 text-xl hidden sm:block">→</span>}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center max-w-2xl mx-auto">
            <p className="text-gray-600 text-base mb-4">
              ManyChat costs <strong className="text-red-500">£99/month</strong> and takes hours to set up.
              ELEVO Echo™ is live in 2 minutes and{' '}
              <strong className="text-indigo-600">included in Orbit at £79/month.</strong>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 mb-6">
              <span>✓ Instagram DMs</span><span>✓ WhatsApp</span><span>✓ SMS</span><span>✓ Email</span>
            </div>
            <Link href={`/${locale}/signup`} className="inline-block px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
              Automate your DMs with Echo™ →
            </Link>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-indigo-600 font-semibold uppercase tracking-widest text-xs mb-4">Real results</p>
            <h2 className="text-3xl font-bold text-gray-900">Real businesses. Real numbers.</h2>
          </div>
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

          <div className="mt-16 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 text-center mb-8">Frequently asked questions</h3>
            <div className="space-y-4">
              {FAQ_ITEMS.map(item => (
                <div key={item.q} className="bg-gray-50 rounded-xl border border-gray-100 p-5">
                  <p className="font-semibold text-gray-900 text-sm mb-2">{item.q}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-indigo-600 font-semibold uppercase tracking-widest text-xs mb-4">Pricing</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Less than one hour with a marketing consultant.</h2>
            <p className="text-gray-500">No contracts. No setup fees. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map(plan => (
              <div key={plan.name} className={`rounded-2xl p-5 border bg-white ${plan.highlight ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' : 'border-gray-200'}`}>
                {plan.highlight && <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">⭐ Most Popular</div>}
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="flex items-end gap-0.5 mt-1 mb-0.5">
                  <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-400 text-sm mb-0.5">{plan.period}</span>
                </div>
                <p className="text-xs text-gray-400 mb-4">{plan.credits}</p>
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
          <div className="text-center mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={`/${locale}/signup`} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">Start free trial →</Link>
            <Link href={`/${locale}/pricing`} className="text-indigo-600 font-medium hover:underline text-sm">Compare all plans in detail →</Link>
          </div>
          <p className="text-center text-gray-400 text-xs mt-4">✓ 7-day free trial &nbsp;·&nbsp; ✓ No card required &nbsp;·&nbsp; ✓ 30-day money-back guarantee</p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 bg-indigo-600">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-indigo-300 font-semibold uppercase tracking-widest text-xs mb-4">Don&apos;t wait</p>
          <h2 className="text-4xl font-extrabold text-white mb-4">Your competitors are posting right now.</h2>
          <p className="text-indigo-200 text-lg mb-10 leading-relaxed">
            Every day without ELEVO AI™ is a day they rank higher, spend your customers, and convert the leads you never followed up.
          </p>
          <Link href={`/${locale}/signup`} className="px-10 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors text-lg inline-block shadow-lg">
            Start your free 7-day trial →
          </Link>
          <p className="text-indigo-300 text-sm mt-5">No card required · 7 days free · 30-day money-back · Cancel anytime</p>
          <p className="text-indigo-400 text-xs mt-3">ELEVO AI™ is a trademark of ELEVO AI Ltd. All rights reserved.</p>
        </div>
      </section>
    </>
  )
}
