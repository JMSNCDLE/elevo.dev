'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Sparkles, Eye, ChevronRight, Crown, Shield, TrendingUp, Zap, Users, BarChart2, Share2, Bot } from 'lucide-react'
import { FadeInWhenVisible } from '@/components/shared/FadeInWhenVisible'
import { LogoScroll } from '@/components/marketing/LogoScroll'
import TrustBar from '@/components/shared/TrustBar'
import LiveCounters from '@/components/shared/LiveCounters'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ locale: string }>
}

// ─── Plans ─────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: 'trial',
    name: 'Trial',
    price: 0,
    credits: '50 credits',
    description: '7 days free to explore ELEVO',
    features: ['GBP Posts', 'Blog Writer', 'Social Captions', 'Review Responses', '50 AI credits'],
    cta: 'Start free trial',
    highlighted: false,
  },
  {
    id: 'launch',
    name: 'Launch',
    price: 39,
    credits: '500 credits/mo',
    description: 'Perfect for solo operators',
    features: ['Everything in Trial', 'Email Generator', 'SEO Copy', '500 credits/mo', 'Library & history'],
    cta: 'Get Launch',
    highlighted: false,
  },
  {
    id: 'orbit',
    name: 'Orbit',
    price: 79,
    credits: '1,500 credits/mo',
    description: 'For growing businesses',
    badge: '★ Most Popular',
    features: ['Everything in Launch', 'All Growth tools', 'ELEVO Spy™', 'ELEVO Market™', 'ELEVO SMM™', 'ELEVO Viral™', '1,500 credits/mo'],
    cta: 'Get Orbit',
    highlighted: true,
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    price: 149,
    credits: '5,000 credits/mo',
    description: 'Full AI operating system',
    features: ['Everything in Orbit', 'ELEVO CEO™', 'ELEVO Drop™', 'Store Analytics', 'Priority support', '5,000 credits/mo'],
    cta: 'Get Galaxy',
    highlighted: false,
  },
]

const AGENTS = [
  { name: 'ELEVO CEO™', role: 'Chief Executive Officer', icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/10', plan: 'Galaxy' },
  { name: 'ELEVO Spy™', role: 'Competitor Intelligence', icon: Eye, color: 'text-red-400', bg: 'bg-red-500/10', plan: 'Orbit+' },
  { name: 'ELEVO Market™', role: 'Marketing Strategist', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10', plan: 'Orbit+' },
  { name: 'ELEVO SMM™', role: 'Social Media Manager', icon: Share2, color: 'text-blue-400', bg: 'bg-blue-500/10', plan: 'Orbit+' },
  { name: 'ELEVO Viral™', role: 'Viral Content Creator', icon: Sparkles, color: 'text-pink-400', bg: 'bg-pink-500/10', plan: 'Orbit+' },
  { name: 'ELEVO Rank™', role: 'SEO Specialist', icon: BarChart2, color: 'text-purple-400', bg: 'bg-purple-500/10', plan: 'All plans' },
]

const DOT_GRID = {
  backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.15) 1px, transparent 1px)',
  backgroundSize: '24px 24px',
}

export default function HomePage({ params: _params }: PageProps) {
  const [billingAnnual, setBillingAnnual] = useState(false)

  return (
    <main className="overflow-hidden">

      {/* ── HERO ── warm white, left text, dashboard mockup ─────────────────── */}
      <section className="bg-[#FFFEF9] pt-24 pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeInWhenVisible>
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 max-w-xl">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full mb-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  400+ businesses · Launch offer active
                </div>
                <h1 className="text-7xl font-black text-gray-900 tracking-tighter leading-none mb-6">
                  The AI team your business needs.
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  21 AI specialists. One platform. From £39/month.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <Link
                    href="/en/signup"
                    className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-7 py-4 rounded-xl font-bold text-base hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                  >
                    Start free — no card required →
                  </Link>
                </div>
                <p className="text-sm text-gray-400">Used by 400+ businesses in 12 countries</p>
              </div>

              {/* Dashboard mockup */}
              <div
                className="flex-1 max-w-lg"
                style={{ transform: 'perspective(1000px) rotateX(5deg)' }}
              >
                <div className="bg-gray-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    <span className="ml-3 text-xs text-gray-500">Mission Control — ELEVO AI</span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Credits left', value: '1,243', color: 'text-green-400' },
                        { label: 'Content saved', value: '87', color: 'text-indigo-400' },
                        { label: 'Active agents', value: '21', color: 'text-purple-400' },
                      ].map(stat => (
                        <div key={stat.label} className="bg-white/5 rounded-xl p-3">
                          <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                          <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    {[
                      { agent: 'ELEVO Spy™', action: 'Competitor alert detected', time: '2m ago', dot: 'bg-red-400' },
                      { agent: 'ELEVO Market™', action: 'Strategy ready to review', time: '5m ago', dot: 'bg-green-400' },
                      { agent: 'ELEVO SMM™', action: '3 posts scheduled for today', time: '12m ago', dot: 'bg-blue-400' },
                    ].map(item => (
                      <div key={item.agent} className="flex items-center gap-3 bg-white/3 rounded-lg p-3">
                        <div className={`w-2 h-2 rounded-full ${item.dot} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white">{item.agent}</p>
                          <p className="text-xs text-gray-500 truncate">{item.action}</p>
                        </div>
                        <span className="text-xs text-gray-600">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      <LogoScroll />
      <TrustBar />

      {/* ── SECTION 1: Content — light ──────────────────────────────────────── */}
      <FadeInWhenVisible>
        <section className="bg-[#FFFEF9] py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-16">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-4">Content</span>
              <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">
                Content that ranks,<br />converts, and spreads.
              </h2>
              <p className="text-xl text-gray-600 max-w-xl">
                Six AI content specialists ready to write for your business — every day, in your voice.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { name: 'GBP Posts', desc: 'Google Business posts that drive foot traffic', icon: '📍' },
                { name: 'Blog Articles', desc: 'SEO-optimised posts that rank and convert', icon: '✍️' },
                { name: 'Social Captions', desc: 'Scroll-stopping copy for every platform', icon: '📱' },
                { name: 'Review Responses', desc: 'Professional replies that build trust', icon: '⭐' },
                { name: 'Email Campaigns', desc: 'Subject lines and copy that get opens', icon: '📧' },
                { name: 'SEO Copy', desc: 'Pages that search engines love', icon: '🔍' },
              ].map(item => (
                <div key={item.name} className="border border-gray-100 rounded-2xl p-5 hover:border-indigo-100 hover:shadow-sm transition-all">
                  <span className="text-2xl mb-3 block">{item.icon}</span>
                  <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeInWhenVisible>

      {/* ── SECTION 2: ELEVO Spy™ — dark dot grid ───────────────────────────── */}
      <FadeInWhenVisible>
        <section className="bg-[#080C14] py-32 px-6" style={DOT_GRID}>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-xs font-bold text-red-400 uppercase tracking-widest block mb-4">Intelligence</span>
                <h2 className="text-5xl font-black text-white tracking-tighter mb-6">
                  Know your competitors better than they know themselves.
                </h2>
                <p className="text-lg text-gray-400 mb-8">
                  ELEVO Spy™ monitors competitor content, ads, SEO, and sentiment in real time. Get weekly intelligence reports with a battle plan to outmanoeuvre them.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Live competitor content monitoring',
                    'Ad campaign analysis & reverse engineering',
                    'SEO gap identification',
                    'Weekly battle plan with exact tactics',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle2 size={16} className="text-red-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/en/signup"
                  className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors"
                >
                  <Eye size={16} /> Try ELEVO Spy™ →
                </Link>
              </div>
              <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Competitor Alert</span>
                  <span className="text-xs text-gray-500">2 minutes ago</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'New viral post detected', severity: 'HIGH', color: 'text-red-400 bg-red-500/10' },
                    { label: 'Ad spend increased by 40%', severity: 'MEDIUM', color: 'text-yellow-400 bg-yellow-500/10' },
                    { label: 'New keyword ranking #3', severity: 'WATCH', color: 'text-blue-400 bg-blue-500/10' },
                  ].map(alert => (
                    <div key={alert.label} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${alert.color}`}>{alert.severity}</span>
                      <span className="text-sm text-gray-300">{alert.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs text-gray-500 mb-2">Battle plan update ready</p>
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                    <p className="text-sm text-indigo-300">Counter their viral post with a behind-the-scenes reel today. Post at 6pm for maximum reach.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeInWhenVisible>

      {/* ── SECTION 3: ELEVO CEO™ — light ───────────────────────────────────── */}
      <FadeInWhenVisible>
        <section className="bg-[#FFFEF9] py-32 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest block mb-4">Galaxy Plan</span>
            <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-6">
              Your AI Chief Executive Officer.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              Fortune 500 strategy. McKinsey analysis. Goldman Sachs financial modelling. All for your business, on demand.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { title: 'CEO Sessions', desc: 'Get board-level advice on pricing, hiring, pivots, and partnerships', icon: '💼' },
                { title: 'Growth Strategy', desc: 'Full 12-month growth plan with revenue projections and milestones', icon: '📈' },
                { title: 'Investor Prep', desc: 'Complete pitch deck, objection handlers, and term sheet guidance', icon: '🤝' },
              ].map(feature => (
                <div key={feature.title} className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6 text-left">
                  <span className="text-3xl mb-4 block">{feature.icon}</span>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Link
                href="/en/signup"
                className="inline-flex items-center gap-2 bg-yellow-500 text-white px-7 py-4 rounded-xl font-bold text-base hover:bg-yellow-600 transition-colors"
              >
                <Crown size={18} /> Try ELEVO CEO™ — Galaxy plan →
              </Link>
            </div>
          </div>
        </section>
      </FadeInWhenVisible>

      {/* ── SECTION 4: Agents — dark dot grid ───────────────────────────────── */}
      <FadeInWhenVisible>
        <section className="bg-[#080C14] py-32 px-6" style={DOT_GRID}>
          <div className="max-w-5xl mx-auto">
            <div className="mb-16">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-4">AI Agents</span>
              <h2 className="text-5xl font-black text-white tracking-tighter mb-4">
                21 AI agents. Ready to work.
              </h2>
              <p className="text-xl text-gray-400 max-w-xl">
                Each agent is a specialist. Together they cover every aspect of running and growing your business.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
              {AGENTS.map(agent => (
                <div key={agent.name} className="bg-white/3 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
                  <div className={`w-10 h-10 rounded-xl ${agent.bg} flex items-center justify-center mb-3`}>
                    <agent.icon size={18} className={agent.color} />
                  </div>
                  <h3 className="font-bold text-white text-sm mb-0.5">{agent.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{agent.role}</p>
                  <span className="text-xs text-gray-600">{agent.plan}</span>
                </div>
              ))}
            </div>
            <Link
              href="/en/agents"
              className="inline-flex items-center gap-2 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
            >
              <Bot size={16} /> View all 21 agents <ChevronRight size={14} />
            </Link>
          </div>
        </section>
      </FadeInWhenVisible>

      {/* ── SECTION 5: Pricing — light ──────────────────────────────────────── */}
      <FadeInWhenVisible>
        <section className="bg-[#FFFEF9] py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-4">Pricing</span>
              <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">
                Simple, honest pricing.
              </h2>
              <p className="text-xl text-gray-600">Start free. Scale when you're ready. Cancel anytime.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANS.map(plan => (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-6 border ${
                    plan.highlighted
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                      : 'bg-white border-gray-100 text-gray-900'
                  }`}
                >
                  {plan.badge && (
                    <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full mb-3 inline-block">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className={`font-black text-xl mb-1 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.highlighted ? 'text-indigo-100' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                  <div className="mb-4">
                    <span className={`text-4xl font-black ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                      £{plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className={`text-sm ml-1 ${plan.highlighted ? 'text-indigo-200' : 'text-gray-400'}`}>/mo</span>
                    )}
                  </div>
                  <p className={`text-xs mb-5 ${plan.highlighted ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {plan.credits}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className={`flex items-start gap-2 text-xs ${plan.highlighted ? 'text-indigo-100' : 'text-gray-600'}`}>
                        <CheckCircle2 size={12} className={`mt-0.5 shrink-0 ${plan.highlighted ? 'text-white' : 'text-indigo-600'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/en/signup"
                    className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                      plan.highlighted
                        ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-400 text-sm mt-8">
              All plans include 30-day money-back guarantee · No contracts · Cancel anytime
            </p>
          </div>
        </section>
      </FadeInWhenVisible>

      {/* ── SECTION 6: Final CTA — dark ─────────────────────────────────────── */}
      <FadeInWhenVisible>
        <section className="bg-[#080C14] py-32 px-6" style={DOT_GRID}>
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center gap-10 mb-12">
              {[
                { value: '400+', label: 'Businesses' },
                { value: '£1.2M', label: 'Revenue driven' },
                { value: '21', label: 'AI agents' },
                { value: '99.9%', label: 'Uptime' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
            <h2 className="text-6xl font-black text-white tracking-tighter mb-6">
              The last tool<br />you'll ever need.
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">
              Join 400+ businesses using ELEVO AI to work smarter, grow faster, and win more.
            </p>
            <Link
              href="/en/signup"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-600/30"
            >
              <Zap size={20} /> Start free — no card required →
            </Link>
            <p className="text-gray-600 text-sm mt-4">7-day free trial · Cancel anytime · 30-day money-back</p>
          </div>
        </section>
      </FadeInWhenVisible>

      <LiveCounters />
    </main>
  )
}
