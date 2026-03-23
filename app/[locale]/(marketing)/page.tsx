'use client'

import { use } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles, Eye, ChevronRight } from 'lucide-react'
import { FadeInWhenVisible } from '@/components/shared/FadeInWhenVisible'
import { LogoScroll } from '@/components/marketing/LogoScroll'
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
  { name: 'Orbit', price: '£79', period: '/mo', credits: '300 credits/mo', highlight: true, features: ['Everything in Launch', 'All 21 agents unlocked', 'ELEVO Ads Pro™ ROAS Intel', 'ELEVO Rank™ Google audit', 'ELEVO Echo™ DM automation', 'ELEVO Studio™ Video', 'ELEVO Spy™ Competitor Intel'] },
  { name: 'Galaxy', price: '£149', period: '/mo', credits: '999 credits/mo', features: ['Everything in Orbit', 'Team members (up to 5)', 'White-label reports', 'Priority support', 'API access'] },
]

const FAQ_ITEMS = [
  { q: 'What is ELEVO AI™?', a: "ELEVO AI™ is the AI operating system for local businesses. 21 specialist AI agents handle your content, ads, SEO, CRM, finances, and more — all from one dashboard." },
  { q: 'How quickly does it work?', a: 'Onboarding takes 3 minutes. Your first piece of content generates in under 30 seconds. Most businesses see measurable results in their first week.' },
  { q: 'Does it replace my marketing agency?', a: "For most local businesses, yes. ELEVO AI™ generates more content, more consistently, for a fraction of the cost. From £39/month." },
  { q: 'Is my data secure?', a: 'Yes. ELEVO AI™ is GDPR-compliant, uses bank-grade encryption, and your business data is never used to train AI models.' },
]

export default function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const isSpanish = locale === 'es'

  return (
    <div style={{ background: '#FFFEF9' }}>
      {/* HERO */}
      <FadeInWhenVisible delay={0}>
        <section className="bg-gradient-to-b from-indigo-50 via-[#FFFEF9] to-[#FFFEF9] py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
            >
              <Sparkles size={14} />
              {isSpanish ? '21 agentes IA. Todos trabajando para tu negocio.' : 'Launching 2026 — 400+ businesses already inside'}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl font-black text-gray-900 leading-[1.05] tracking-tight mb-6"
            >
              {isSpanish
                ? 'El sistema operativo IA™ para negocios locales'
                : <>The AI operating system™<br className="hidden sm:block" /> for local businesses</>}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              {isSpanish
                ? '21 agentes IA especialistas. Un panel de control. Content, ROAS, CRM, SEO, videos, campañas — todo automatizado.'
                : '21 specialist AI agents. One dashboard. Content, ROAS, CRM, SEO, video, campaigns — all automated.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href={`/${locale}/signup`}
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-indigo-200"
                >
                  Start free trial — 7 days, no card
                  <ChevronRight size={18} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href={`/${locale}/pricing`}
                  className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-700 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
                >
                  See pricing →
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-400"
            >
              No card required · Cancel anytime · GDPR compliant
            </motion.div>
          </div>
        </section>
      </FadeInWhenVisible>

      {/* LOGO SCROLL */}
      <FadeInWhenVisible delay={0} y={20}>
        <div className="py-4 border-y border-gray-100">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Integrates with everything you already use</p>
          <LogoScroll />
        </div>
      </FadeInWhenVisible>

      {/* LIVE COUNTERS */}
      <FadeInWhenVisible delay={0} y={20}>
        <div className="py-8 px-6">
          <LiveCounters />
        </div>
      </FadeInWhenVisible>

      {/* TRUST BAR */}
      <FadeInWhenVisible delay={0} y={16}>
        <div className="py-4 border-b border-gray-100">
          <TrustBar />
        </div>
      </FadeInWhenVisible>

      {/* STATS */}
      <FadeInWhenVisible delay={0} y={24}>
        <section className="py-16 px-6 bg-indigo-600">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {STATS.map((stat, i) => (
              <FadeInWhenVisible key={stat.label} delay={i * 0.08} y={16}>
                <div>
                  <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-indigo-200">{stat.label}</div>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </section>
      </FadeInWhenVisible>

      {/* PAIN POINTS */}
      <FadeInWhenVisible delay={0} y={32}>
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">Sound familiar?</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">The gap between knowing and doing is costing you money.</h2>
            </div>
            <div className="space-y-4">
              {PAIN_POINTS.map((item, i) => (
                <FadeInWhenVisible key={i} delay={i * 0.06} y={16}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-red-400 text-sm">✗</span>
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">{item.problem}</p>
                      <p className="text-gray-400 text-sm mt-0.5 italic">{item.reality}</p>
                    </div>
                  </motion.div>
                </FadeInWhenVisible>
              ))}
            </div>
            <FadeInWhenVisible delay={0.3} y={20}>
              <div className="mt-10 text-center">
                <p className="text-gray-500 mb-4">ELEVO AI™ does all of this for you. Automatically.</p>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href={`/${locale}/signup`}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold transition-colors"
                  >
                    Start free trial →
                  </Link>
                </motion.div>
              </div>
            </FadeInWhenVisible>
          </div>
        </section>
      </FadeInWhenVisible>

      {/* AGENT TEAM */}
      <FadeInWhenVisible delay={0} y={32}>
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <FadeInWhenVisible delay={0} y={20}>
              <div className="text-center mb-12">
                <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">Your AI Team</p>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">21 specialist agents, always on.</h2>
                <p className="text-gray-500 max-w-xl mx-auto">Each agent is built for one job. Together they cover every part of your business.</p>
              </div>
            </FadeInWhenVisible>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {AGENTS.map((agent, i) => (
                <FadeInWhenVisible key={agent.brand} delay={i * 0.07} y={20}>
                  <motion.div
                    whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(99,102,241,0.10)' }}
                    className="bg-white rounded-2xl p-5 border border-gray-100 transition-all"
                  >
                    <div className="text-2xl mb-3">{agent.emoji}</div>
                    <div className="text-sm font-bold text-indigo-600 mb-0.5">{agent.brand}</div>
                    <div className="text-xs font-medium text-gray-500 mb-2">{agent.role}</div>
                    <p className="text-xs text-gray-400 leading-relaxed">{agent.desc}</p>
                  </motion.div>
                </FadeInWhenVisible>
              ))}
            </div>
            <FadeInWhenVisible delay={0.2} y={20}>
              <div className="text-center mt-10">
                <Link href={`/${locale}/en/agents`} className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm underline underline-offset-2">
                  See all 21 agents →
                </Link>
              </div>
            </FadeInWhenVisible>
          </div>
        </section>
      </FadeInWhenVisible>

      {/* ELEVO SPY SECTION */}
      <FadeInWhenVisible delay={0} y={40}>
        <section className="py-20 px-6 bg-[#080C14]">
          <div className="max-w-4xl mx-auto">
            <FadeInWhenVisible delay={0} y={24}>
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                  <Eye size={14} />
                  NEW — ELEVO Spy™
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                  Know everything your competitor does.<br className="hidden sm:block" /> Before they do it.
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  ELEVO Spy™ monitors your competitors 24/7 — their content, ads, reviews, SEO, and pricing. Every week, we tell you exactly how to beat them.
                </p>
              </div>
            </FadeInWhenVisible>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
              {[
                { icon: '🔍', title: 'See their ad campaigns', desc: 'Find out exactly what ads they\'re running, their messaging angles, and where they\'re spending.' },
                { icon: '📊', title: 'Read their complaints', desc: 'Their 1-star reviews are your selling points. We surface every weakness for your counter-strategy.' },
                { icon: '⚡', title: 'Get a weekly battle plan', desc: 'Every Monday: a prioritised action list with specific ELEVO features to execute each move.' },
              ].map((feat, i) => (
                <FadeInWhenVisible key={feat.title} delay={i * 0.1} y={20}>
                  <motion.div
                    whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(99,102,241,0.15)' }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6"
                  >
                    <div className="text-3xl mb-3">{feat.icon}</div>
                    <div className="font-bold text-white mb-2">{feat.title}</div>
                    <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
                  </motion.div>
                </FadeInWhenVisible>
              ))}
            </div>

            {/* Testimonial */}
            <FadeInWhenVisible delay={0.2} y={20}>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => <span key={i} className="text-amber-400">★</span>)}
                </div>
                <p className="text-gray-300 italic mb-4 leading-relaxed">
                  "I found out my competitor was running Facebook ads targeting my exact keywords. Switched my strategy in 24 hours."
                </p>
                <div className="text-sm text-gray-500">Anonymous, Restaurant Owner, London</div>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.1} y={20}>
              <div className="text-center">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href={`/${locale}/signup`}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors"
                  >
                    Start monitoring competitors free →
                  </Link>
                </motion.div>
                <p className="text-gray-600 text-sm mt-3">Available on Orbit plan · 7-day free trial</p>
              </div>
            </FadeInWhenVisible>
          </div>
        </section>
      </FadeInWhenVisible>

      {/* ELEVO Viral™ Section */}
      <FadeInWhenVisible>
        <section className="py-24 bg-[#080C14]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Go viral. Grow organically. <span className="text-[#6366F1]">ELEVO Viral™</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                The algorithm favours consistency and timing. ELEVO Viral™ tracks what is trending right now in your niche and tells you exactly what to post, when to post it, and how to make it shareable.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#6366F1] mb-2">340%</div>
                <div className="text-gray-300">Average reach increase in 30 days</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#6366F1] mb-2">2,400+</div>
                <div className="text-gray-300">Trending topics analysed daily</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#6366F1] mb-2">50</div>
                <div className="text-gray-300">Viral hooks per business</div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="flex items-start gap-4 p-6 rounded-xl bg-[#141B24]">
                <span className="text-2xl">📈</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Trending topics for your niche</h3>
                  <p className="text-gray-400">Updated daily with real-time trend data specific to your industry.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-xl bg-[#141B24]">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">50 viral hooks for your business</h3>
                  <p className="text-gray-400">Written for your exact niche, audience, and goals.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-xl bg-[#141B24]">
                <span className="text-2xl">📅</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">30-day viral calendar</h3>
                  <p className="text-gray-400">Every post planned — hook, script, hashtags, and best time to post.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-xl bg-[#141B24]">
                <span className="text-2xl">🚀</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Paid boost timing</h3>
                  <p className="text-gray-400">Know exactly when to spend — boost only content already going viral.</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <a href={`/${locale}/signup`} className="inline-block bg-[#6366F1] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-500 transition-colors">
                Get your viral strategy →
              </a>
            </div>
          </div>
        </section>
      </FadeInWhenVisible>

      {/* ELEVO Create™ Section */}
      <FadeInWhenVisible delay={0} y={40}>
        <section className="py-24 bg-[#080C14]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-[#6366F1] via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ELEVO Create™
                </span>
                <span className="text-white block mt-2">Every AI creative tool. One prompt.</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Describe what you want in plain English. ELEVO Create™ writes the perfect prompt for Sora 2, Veo 3, Kling 3, Higgsfield, Midjourney, DALL·E 3, and ElevenLabs simultaneously.
              </p>
            </div>

            {/* Comparison table */}
            <div className="overflow-x-auto mb-16">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400">Feature</th>
                    <th className="py-3 px-4 text-gray-400">Canva</th>
                    <th className="py-3 px-4 text-gray-400">Figma</th>
                    <th className="py-3 px-4 text-gray-400">Midjourney</th>
                    <th className="py-3 px-4 text-[#6366F1] font-bold">ELEVO Create™</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ['AI image prompts', false, false, true, true],
                      ['AI video prompts', false, false, false, true],
                      ['Speech generation', false, false, false, true],
                      ['Brand kit', true, true, false, true],
                      ['Social graphics', true, false, false, true],
                      ['Business-aware', false, false, false, true],
                      ['CRM integration', false, false, false, true],
                    ] as [string, boolean, boolean, boolean, boolean][]
                  ).map(([feature, canva, figma, mj, elevo]) => (
                    <tr key={feature} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 px-4 text-gray-300">{feature}</td>
                      <td className="py-3 px-4 text-center">{canva ? '✓' : <span className="text-gray-600">✗</span>}</td>
                      <td className="py-3 px-4 text-center">{figma ? '✓' : <span className="text-gray-600">✗</span>}</td>
                      <td className="py-3 px-4 text-center">{mj ? '✓' : <span className="text-gray-600">✗</span>}</td>
                      <td className="py-3 px-4 text-center text-[#6366F1] font-bold">{elevo ? '✓' : '✗'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tools strip */}
            <div className="text-center mb-8">
              <p className="text-gray-400 mb-4">Generates prompts for:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {['Sora 2','Veo 3','Kling 3','Higgsfield','Midjourney','DALL·E 3','Runway','ElevenLabs','Stable Diffusion','Ideogram','Pika'].map(tool => (
                  <span key={tool} className="px-3 py-1.5 rounded-full bg-[#141B24] text-gray-300 text-sm border border-white/10">{tool}</span>
                ))}
              </div>
            </div>

            <div className="text-center">
              <a href={`/${locale}/signup`} className="inline-block bg-gradient-to-r from-[#6366F1] to-purple-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity">
                Create your first asset free →
              </a>
            </div>
          </div>
        </section>
      </FadeInWhenVisible>

      {/* ELEVO Creator™ section */}
      <FadeInWhenVisible delay={0} y={40}>
        <section className="py-24 bg-[#0A0D14]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">ELEVO Creator™</span>
              <h2 className="mt-3 text-4xl font-bold text-white">Built for YouTubers, TikTokers, and Influencers</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div className="bg-[#1A2332] rounded-2xl border border-white/5 p-8">
                <h3 className="text-xl font-bold text-red-400 mb-4">The problem</h3>
                <p className="text-gray-300 text-lg leading-relaxed">You spend 3 hours editing. Your thumbnail gets 4% CTR. Your title was a guess. Your analytics tab is open but not helping.</p>
              </div>
              <div className="bg-[#1A2332] rounded-2xl border border-white/5 p-8">
                <h3 className="text-xl font-bold text-green-400 mb-4">ELEVO Creator™ in 60 seconds</h3>
                <ul className="space-y-3 text-gray-300">
                  {['Title virality score — know before you publish','Thumbnail concepts with Midjourney prompts','Editing brief — every cut, every transition, planned','Channel audit — why you\'re not growing and how to fix it','Traffic strategy — YouTube + TikTok algorithm decoded'].map((item) => (
                    <li key={item} className="flex items-start gap-3"><span className="text-green-400 mt-1">✓</span><span>{item}</span></li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex justify-center gap-8 mb-12 flex-wrap">
              {['YouTube','TikTok','Instagram','LinkedIn','Podcast'].map((p) => (
                <span key={p} className="text-gray-400 font-medium text-sm px-3 py-1 rounded-full border border-white/10">{p}</span>
              ))}
            </div>
            <div className="max-w-2xl mx-auto bg-[#1A2332] rounded-2xl border border-white/5 p-8 text-center mb-10">
              <p className="text-gray-300 italic text-lg mb-4">&ldquo;I used to spend Sunday planning my week. Now I paste my idea into ELEVO Creator and have 5 title options, 3 thumbnail concepts, and a full editing brief in 4 minutes.&rdquo;</p>
              <p className="text-sm text-gray-500">— Anonymous, 180k YouTube Subscriber</p>
              <div className="flex justify-center gap-1 mt-3">{'★★★★★'.split('').map((s,i) => <span key={i} className="text-yellow-400">{s}</span>)}</div>
            </div>
            <div className="text-center">
              <a href={`/${locale}/signup`} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors">Start growing your channel free →</a>
            </div>
          </div>
        </section>
      </FadeInWhenVisible>

      {/* TESTIMONIALS */}
      <FadeInWhenVisible delay={0} y={32}>
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <FadeInWhenVisible delay={0} y={20}>
              <div className="text-center mb-12">
                <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">Real results</p>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Local businesses. Real numbers.</h2>
              </div>
            </FadeInWhenVisible>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <FadeInWhenVisible key={i} delay={i * 0.1} y={20}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
                  >
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: t.stars }).map((_, j) => <span key={j} className="text-amber-400">★</span>)}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                      <div className="text-gray-400 text-xs">{t.role}</div>
                    </div>
                  </motion.div>
                </FadeInWhenVisible>
              ))}
            </div>
          </div>
        </section>
      </FadeInWhenVisible>

      {/* PRICING */}
      <FadeInWhenVisible delay={0} y={32}>
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <FadeInWhenVisible delay={0} y={20}>
              <div className="text-center mb-12">
                <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">Simple pricing</p>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">Less than a daily coffee.</h2>
                <p className="text-gray-500">All plans include a 7-day free trial. No card required.</p>
              </div>
            </FadeInWhenVisible>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANS.map((plan, i) => (
                <FadeInWhenVisible key={plan.name} delay={i * 0.08} y={20}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className={`rounded-2xl p-6 transition-all relative ${
                      plan.highlight
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
                        : 'bg-white border border-gray-100 shadow-sm'
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </div>
                    )}
                    <div className={`text-sm font-bold mb-1 ${plan.highlight ? 'text-indigo-200' : 'text-gray-500'}`}>{plan.name}</div>
                    <div className={`text-3xl font-black mb-0.5 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}<span className={`text-base font-normal ${plan.highlight ? 'text-indigo-200' : 'text-gray-400'}`}>{plan.period}</span>
                    </div>
                    <div className={`text-xs mb-5 ${plan.highlight ? 'text-indigo-200' : 'text-gray-400'}`}>{plan.credits}</div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map(f => (
                        <li key={f} className={`flex items-start gap-2 text-xs ${plan.highlight ? 'text-indigo-100' : 'text-gray-600'}`}>
                          <CheckCircle2 size={12} className={`mt-0.5 shrink-0 ${plan.highlight ? 'text-indigo-200' : 'text-indigo-500'}`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href={`/${locale}/signup?plan=${plan.name.toLowerCase()}`}
                        className={`block text-center py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors ${
                          plan.highlight
                            ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        Start free trial →
                      </Link>
                    </motion.div>
                  </motion.div>
                </FadeInWhenVisible>
              ))}
            </div>
          </div>
        </section>
      </FadeInWhenVisible>

      {/* FAQ */}
      <FadeInWhenVisible delay={0} y={32}>
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto">
            <FadeInWhenVisible delay={0} y={20}>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-black text-gray-900">Questions? Answered.</h2>
              </div>
            </FadeInWhenVisible>
            <div className="space-y-4">
              {FAQ_ITEMS.map((item, i) => (
                <FadeInWhenVisible key={i} delay={i * 0.07} y={16}>
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">{item.q}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
                  </div>
                </FadeInWhenVisible>
              ))}
            </div>
          </div>
        </section>
      </FadeInWhenVisible>

      {/* FINAL CTA */}
      <FadeInWhenVisible delay={0} y={40}>
        <section className="py-24 px-6 bg-indigo-600">
          <div className="max-w-2xl mx-auto text-center">
            <FadeInWhenVisible delay={0} y={20}>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Start your free 7-day trial.
              </h2>
              <p className="text-indigo-200 text-lg mb-8">
                Join 400+ local businesses already using ELEVO AI™. No card needed.
              </p>
            </FadeInWhenVisible>
            <FadeInWhenVisible delay={0.1} y={20}>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href={`/${locale}/signup`}
                  className="inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 px-10 py-4 rounded-xl font-black text-xl transition-colors shadow-xl"
                >
                  Start free trial — no card needed
                  <ChevronRight size={20} />
                </Link>
              </motion.div>
              <p className="text-indigo-300 text-sm mt-4">7 days free · All features unlocked · Cancel anytime</p>
            </FadeInWhenVisible>
          </div>
        </section>
      </FadeInWhenVisible>
    </div>
  )
}
