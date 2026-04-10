'use client'

import Link from 'next/link'
import {
  DollarSign, Briefcase, Users, TrendingUp, Zap, Lock, ArrowRight,
  Megaphone, Calendar, Eye, Receipt, Image as ImageIcon, Crown,
  Mail, BarChart3, Target, Send,
} from 'lucide-react'
import { useParams } from 'next/navigation'

// ─── Demo data — Maria's Bakery ──────────────────────────────────────────────

const DEMO_DATA = {
  user: {
    name: "Maria's Bakery",
    plan: 'Orbit',
    creditsRemaining: 847,
    creditsTotal: 1500,
  },
  stats: {
    revenueThisMonth: 12450,
    jobsThisMonth: 34,
    creditsUsed: 653,
    roas: 4.2,
    contactsInCRM: 287,
    generationsRecent: 156,
    lapsedAtRisk: 3,
  },
  activity: [
    { agent: 'ELEVO Market™', action: 'Published GBP post: Weekend Special 🥐', time: '2h ago', icon: Megaphone, color: 'text-pink-600 bg-pink-50' },
    { agent: 'ELEVO SMM™', action: 'Scheduled 5 Instagram posts for next week', time: '4h ago', icon: Calendar, color: 'text-blue-600 bg-blue-50' },
    { agent: 'ELEVO Spy™', action: "New competitor alert: 'Sweet Treats' opened nearby", time: '6h ago', icon: Eye, color: 'text-red-600 bg-red-50' },
    { agent: 'ELEVO Accountant™', action: 'Scanned 3 invoices, €2,340 total', time: 'Yesterday', icon: Receipt, color: 'text-green-600 bg-green-50' },
    { agent: 'ELEVO Creator™', action: 'Generated 8 social media images', time: 'Yesterday', icon: ImageIcon, color: 'text-purple-600 bg-purple-50' },
    { agent: 'ELEVO CEO™', action: 'Weekly briefing ready — revenue up 18%', time: '2 days ago', icon: Crown, color: 'text-amber-600 bg-amber-50' },
  ],
  recommendedAgents: [
    { name: 'Sales Strategist', desc: 'Close more deals', icon: Target },
    { name: 'Email Machine', desc: 'Nurture leads', icon: Mail },
    { name: 'Analytics', desc: 'Track everything', icon: BarChart3 },
  ],
  contacts: [
    { name: 'Sophie L.', last: 'Ordered birthday cake — 2 days ago', status: 'active' },
    { name: 'James K.', last: 'Inquired about catering — 1 week ago', status: 'active' },
    { name: 'Hannah M.', last: 'Last order 6 weeks ago', status: 'at_risk' },
    { name: 'Ben W.', last: 'No order in 3 months', status: 'lapsed' },
  ],
  campaigns: [
    { name: 'Wedding Cakes — Local', platform: 'Instagram', spend: 240, leads: 18, roas: '5.2x', status: 'winning' },
    { name: 'Sourdough Subscription', platform: 'Google', spend: 180, leads: 12, roas: '4.8x', status: 'winning' },
    { name: 'Birthday Cake Orders', platform: 'Facebook', spend: 120, leads: 9, roas: '3.5x', status: 'good' },
  ],
}

function DisabledHover({ label = 'Sign up to use' }: { label?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-xl group cursor-not-allowed opacity-0 hover:opacity-100 bg-gray-900/40 backdrop-blur-[1px] transition-opacity">
      <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
        <Lock size={11} />
        {label}
      </div>
    </div>
  )
}

export default function DemoPage() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'
  const { user, stats, activity, recommendedAgents, contacts, campaigns } = DEMO_DATA
  const creditsPercent = ((user.creditsTotal - user.creditsRemaining) / user.creditsTotal) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white py-3 px-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm font-medium flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <span>You&apos;re viewing a demo — This is what your dashboard could look like!</span>
          </p>
          <Link
            href={`/${locale}/signup`}
            className="text-sm font-semibold bg-white text-indigo-700 px-4 py-1.5 rounded-full hover:bg-indigo-50 transition-colors whitespace-nowrap"
          >
            Start free trial →
          </Link>
        </div>
      </div>

      {/* Dashboard header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
              M
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.plan} plan · 4.2★ from 287 reviews</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${creditsPercent}%` }} />
                </div>
                <span className="text-xs text-gray-500 font-medium tabular-nums">
                  {user.creditsRemaining}/{user.creditsTotal}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5 text-right">credits remaining</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Mission Control title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Mission Control</h1>
          <p className="text-sm text-gray-500">Welcome back, Maria. Here&apos;s how your bakery is doing.</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue</span>
            </div>
            <p className="text-3xl font-black text-gray-900 tabular-nums">€{stats.revenueThisMonth.toLocaleString()}</p>
            <p className="text-xs text-green-600 font-medium mt-1">↑ 18% vs last month</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Jobs</span>
            </div>
            <p className="text-3xl font-black text-gray-900 tabular-nums">{stats.jobsThisMonth}</p>
            <p className="text-xs text-gray-500 mt-1">this month</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">ROAS</span>
            </div>
            <p className="text-3xl font-black text-gray-900 tabular-nums">{stats.roas}x</p>
            <p className="text-xs text-indigo-600 font-medium mt-1">€4.20 per €1 spent</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contacts</span>
            </div>
            <p className="text-3xl font-black text-gray-900 tabular-nums">{stats.contactsInCRM}</p>
            <p className="text-xs text-amber-600 font-medium mt-1">{stats.lapsedAtRisk} at risk</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity feed */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Agent Activity</h2>
                <p className="text-xs text-gray-500">Your AI team is working 24/7</p>
              </div>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {stats.generationsRecent} actions this week
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {activity.map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="flex items-start gap-3 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.agent}</p>
                        <span className="text-xs text-gray-400 shrink-0">{item.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{item.action}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Recommended agents */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-900 mb-1">Try next</h2>
              <p className="text-xs text-gray-500 mb-4">Recommended for your bakery</p>
              <div className="space-y-2">
                {recommendedAgents.map(agent => {
                  const Icon = agent.icon
                  return (
                    <div key={agent.name} className="relative flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors cursor-pointer">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
                        <p className="text-xs text-gray-500">{agent.desc}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <DisabledHover />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top campaigns */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4">Top campaigns</h2>
              <div className="space-y-3">
                {campaigns.map(c => (
                  <div key={c.name}>
                    <div className="flex items-baseline justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate pr-2">{c.name}</p>
                      <span className="text-xs font-bold text-green-600 tabular-nums">{c.roas}</span>
                    </div>
                    <p className="text-xs text-gray-500">{c.platform} · €{c.spend} spend · {c.leads} leads</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CRM preview */}
        <div className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Customers</h2>
              <p className="text-xs text-gray-500">{stats.contactsInCRM} total · {stats.lapsedAtRisk} need attention</p>
            </div>
            <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View all →</button>
          </div>
          <div className="divide-y divide-gray-50">
            {contacts.map(c => (
              <div key={c.name} className="flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.last}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  c.status === 'active' ? 'text-green-700 bg-green-50' :
                  c.status === 'at_risk' ? 'text-amber-700 bg-amber-50' :
                  'text-red-700 bg-red-50'
                }`}>
                  {c.status === 'active' ? 'Active' : c.status === 'at_risk' ? 'At risk' : 'Lapsed'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Locked chat input */}
        <div className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-900">Chat with your AI team</h2>
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
              <input
                type="text"
                disabled
                placeholder="Sign up to chat with your AI agents..."
                className="flex-1 bg-transparent text-sm text-gray-400 focus:outline-none cursor-not-allowed"
              />
              <button disabled className="w-9 h-9 bg-gray-200 rounded-lg flex items-center justify-center cursor-not-allowed">
                <Send className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-10 shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-2">This could be your dashboard.</h2>
          <p className="text-indigo-100 mb-6">Start your 7-day free trial. No credit card friction. Cancel anytime.</p>
          <Link
            href={`/${locale}/signup`}
            className="inline-flex items-center justify-center bg-white text-indigo-700 font-bold px-8 py-3.5 rounded-full hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Start free trial →
          </Link>
        </div>
      </div>
    </div>
  )
}
