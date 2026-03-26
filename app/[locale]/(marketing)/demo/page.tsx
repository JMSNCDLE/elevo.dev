'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Phone, DollarSign, TrendingUp, Users, FileText, BarChart2,
  Star, Mail, CheckCircle, ArrowRight, Zap, Eye, Lock
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Demo static data for Mario's Plumbing ───────────────────────────────────

const DEMO_BUSINESS = {
  name: "Mario's Emergency Plumbing",
  city: 'Manchester',
  plan: 'Orbit',
  creditsUsed: 53,
  creditsLimit: 300,
}

const DEMO_METRICS = [
  { label: 'Monthly calls', value: '41', icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Avg cost/lead', value: '£19', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'ROAS', value: '4.8:1', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Monthly ad spend', value: '£460', icon: BarChart2, color: 'text-orange-600', bg: 'bg-orange-50' },
]

const DEMO_RECENT_GENS = [
  { type: 'GBP Post', snippet: '"Emergency Plumber Manchester — available 24/7..."', time: '2 hours ago' },
  { type: 'Review Response', snippet: '"Thank you Sarah, we\'re glad we could fix your burst pipe..."', time: '1 day ago' },
  { type: 'Blog Post', snippet: '"5 Signs You Need an Emergency Plumber in Manchester"', time: '3 days ago' },
]

const DEMO_CAMPAIGNS = [
  { name: 'Manchester Emergency Plumber', platform: 'Google', spend: '£180', calls: 18, roas: '5.2:1', status: 'winning' },
  { name: 'Boiler Repair — Greater Manchester', platform: 'Google', spend: '£120', calls: 12, roas: '4.8:1', status: 'winning' },
  { name: 'Plumber Near Me — Meta', platform: 'Meta', spend: '£100', calls: 8, roas: '3.1:1', status: 'paused' },
  { name: 'Emergency Drain Unblocking', platform: 'Meta', spend: '£60', calls: 3, roas: '1.9:1', status: 'paused' },
]

const DEMO_CONTACTS = [
  { name: 'Sarah K.', type: 'Residential', lastContact: '3 days ago', status: 'active' },
  { name: 'David M.', type: 'Commercial', lastContact: '1 week ago', status: 'at_risk' },
  { name: 'Emma R.', type: 'Residential', lastContact: '2 weeks ago', status: 'lapsed' },
]

type DemoTab = 'mission-control' | 'content' | 'roas' | 'crm'

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function DisabledOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-xl group cursor-not-allowed">
      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/80 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
        <Lock size={11} />
        Sign up to use
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [tab, setTab] = useState<DemoTab>('mission-control')

  const TABS: Array<{ key: DemoTab; label: string }> = [
    { key: 'mission-control', label: 'Mission Control' },
    { key: 'content', label: 'Content Generator' },
    { key: 'roas', label: 'ROAS Analysis' },
    { key: 'crm', label: 'CRM' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Top banner */}
      <div className="bg-indigo-600 text-white py-3 px-4 text-center">
        <p className="text-sm font-medium">
          This is a live demo — no login required. See ELEVO AI™ in action.{' '}
          <Link href="/signup" className="underline font-semibold hover:text-indigo-200 ml-2">
            Start your free trial →
          </Link>
        </p>
      </div>

      {/* Demo header */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{DEMO_BUSINESS.name}</p>
              <p className="text-xs text-gray-500">{DEMO_BUSINESS.city} · {DEMO_BUSINESS.plan} plan</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Credits bar */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${((DEMO_BUSINESS.creditsLimit - DEMO_BUSINESS.creditsUsed) / DEMO_BUSINESS.creditsLimit) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {DEMO_BUSINESS.creditsLimit - DEMO_BUSINESS.creditsUsed} credits left
                </span>
              </div>
            </div>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Zap size={13} />
              Try free
            </Link>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-0 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
                tab === t.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Mission Control ── */}
        {tab === 'mission-control' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Mission Control</h2>
              <p className="text-sm text-gray-500 mt-0.5">Good morning — here&apos;s how Mario&apos;s Plumbing is performing.</p>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {DEMO_METRICS.map(m => {
                const Icon = m.icon
                return (
                  <div key={m.label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', m.bg)}>
                      <Icon size={16} className={m.color} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
                  </div>
                )
              })}
            </div>

            {/* Recent generations */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Recent AI generations</h3>
              <div className="space-y-3">
                {DEMO_RECENT_GENS.map((g, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={12} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700">{g.type}</p>
                      <p className="text-xs text-gray-500 truncate">{g.snippet}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{g.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions — disabled */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['GBP Post', 'Blog Post', 'Review Response', 'ROAS Analysis'].map(action => (
                  <div key={action} className="relative">
                    <button
                      disabled
                      className="w-full flex items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-400 cursor-not-allowed opacity-60"
                    >
                      <Zap size={14} className="text-gray-300" />
                      {action}
                    </button>
                    <DisabledOverlay />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                <Link href="/signup" className="text-indigo-600 underline">Sign up free</Link> to use all generators
              </p>
            </div>
          </div>
        )}

        {/* ── Content Generator ── */}
        {tab === 'content' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">ELEVO Write™ — GBP Post</h2>
              <p className="text-sm text-gray-500 mt-0.5">Pre-generated example for Mario&apos;s Emergency Plumbing</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Input side */}
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Input</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Content type</label>
                      <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                        Google Business Profile Post
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Topic</label>
                      <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                        Emergency plumber available 24/7 in Manchester
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tone</label>
                      <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                        Professional, urgent, local
                      </div>
                    </div>
                  </div>
                  <div className="relative mt-3">
                    <button
                      disabled
                      className="w-full py-2.5 bg-indigo-200 text-white text-sm font-semibold rounded-xl cursor-not-allowed opacity-60"
                    >
                      Generate with ELEVO Write™
                    </button>
                    <DisabledOverlay />
                  </div>
                </div>
              </div>

              {/* Output side */}
              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                      <CheckCircle size={11} className="text-white" />
                    </div>
                    <span className="text-xs font-semibold text-indigo-700">Generated by ELEVO Write™</span>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-sm text-gray-800 leading-relaxed shadow-sm">
                    <p className="font-bold text-gray-900 mb-2">🔧 Emergency Plumber Manchester — Available 24/7</p>
                    <p>
                      Burst pipe at 2am? Boiler breakdown before work? Mario&apos;s Emergency Plumbing is Manchester&apos;s
                      most trusted 24/7 plumber — same-day response guaranteed.
                    </p>
                    <br />
                    <p>
                      ✅ Burst pipes &amp; leaks<br />
                      ✅ Boiler emergencies<br />
                      ✅ Blocked drains &amp; toilets<br />
                      ✅ Central heating faults
                    </p>
                    <br />
                    <p>
                      Covering Manchester, Salford, Trafford &amp; surrounding areas. No call-out fee before 10pm.
                      Fully insured, Gas Safe registered.
                    </p>
                    <br />
                    <p className="font-semibold">📞 Call now: 0161 XXX XXXX</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Quality: 94/100</span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">SEO: Optimised</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">238 chars</span>
                  </div>
                </div>

                <div className="bg-indigo-600 rounded-xl p-5 text-white">
                  <p className="text-sm font-bold mb-1">Like what you see?</p>
                  <p className="text-xs text-indigo-200 mb-3">
                    Sign up free and generate unlimited GBP posts, blog articles, social captions, email sequences and more.
                  </p>
                  <Link
                    href="/signup"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-indigo-700 text-sm font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
                  >
                    Sign up to use ELEVO Write™
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ROAS Analysis ── */}
        {tab === 'roas' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">ELEVO ROAS™ Analysis</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Mario&apos;s Plumbing · Total spend: <strong className="text-gray-700">£460</strong> ·
                Overall ROAS: <strong className="text-green-700">4.8:1</strong> ·
                Monthly calls: <strong className="text-gray-700">41</strong>
              </p>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
                <p className="text-3xl font-black text-indigo-600">4.8:1</p>
                <p className="text-xs text-gray-500 mt-1">Overall ROAS</p>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1 inline-block">Excellent</span>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
                <p className="text-3xl font-black text-gray-900">£460</p>
                <p className="text-xs text-gray-500 mt-1">Total ad spend</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
                <p className="text-3xl font-black text-gray-900">41</p>
                <p className="text-xs text-gray-500 mt-1">Calls generated</p>
              </div>
            </div>

            {/* Campaign table */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800">Campaigns</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Campaign</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Platform</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Spend</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Calls</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">ROAS</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_CAMPAIGNS.map((c, i) => (
                      <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-gray-800 font-medium">{c.name}</td>
                        <td className="px-4 py-3 text-gray-500">{c.platform}</td>
                        <td className="px-4 py-3 text-gray-800">{c.spend}</td>
                        <td className="px-4 py-3 text-gray-800">{c.calls}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{c.roas}</td>
                        <td className="px-4 py-3">
                          {c.status === 'winning' ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                              Winning
                            </span>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                              Paused
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
              <p className="text-sm font-semibold text-indigo-800 mb-1">
                💡 ELEVO Recommendation
              </p>
              <p className="text-sm text-indigo-700">
                Scale your 2 winning Google campaigns by 30% (from £300 → £390 combined budget).
                Your Meta campaigns are below break-even — pause them and reallocate to Google Search.
                Projected: +8 calls/month at the same cost-per-call.
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
              >
                Get ROAS analysis for your business
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* ── CRM ── */}
        {tab === 'crm' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">ELEVO Sage™ — CRM</h2>
              <p className="text-sm text-gray-500 mt-0.5">3 contacts shown · AI-powered follow-up recommendations</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">
                  <Users size={14} className="inline mr-1.5 text-indigo-500" />
                  Contacts
                </h3>
                <div className="relative">
                  <button
                    disabled
                    className="px-3 py-1.5 text-xs text-white bg-indigo-300 rounded-lg cursor-not-allowed flex items-center gap-1"
                  >
                    <Mail size={11} />
                    AI Follow-up
                  </button>
                  <DisabledOverlay />
                </div>
              </div>
              <div>
                {DEMO_CONTACTS.map((c, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-b-0',
                      i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-sm font-bold">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.type} · Last contact {c.lastContact}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full border',
                        c.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                        c.status === 'at_risk' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-gray-100 text-gray-500 border-gray-200'
                      )}>
                        {c.status === 'active' ? 'Active' : c.status === 'at_risk' ? 'At risk' : 'Lapsed'}
                      </span>
                      <div className="relative">
                        <button
                          disabled
                          className="p-1.5 text-gray-300 cursor-not-allowed"
                        >
                          <Eye size={13} />
                        </button>
                        <DisabledOverlay />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CRM CTA */}
            <div className="bg-indigo-600 rounded-xl p-6 text-white text-center">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users size={20} />
              </div>
              <p className="text-base font-bold mb-1">Sign up to unlock the full CRM</p>
              <p className="text-sm text-indigo-200 mb-4">
                Manage unlimited contacts, log interactions, get AI-drafted follow-up messages, and never lose a customer again.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-indigo-700 text-sm font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
              >
                Sign up to unlock full CRM →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA bar */}
      <div className="border-t border-gray-100 bg-white py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-2xl font-black text-gray-900 mb-2">
            Ready to grow your business like Mario&apos;s?
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Start your 7-day free trial. Cancel any time.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/signup"
              className="px-8 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-2"
            >
              <Zap size={15} />
              Start free trial
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 text-sm font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 rounded-xl transition-colors"
            >
              View pricing
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1"><CheckCircle size={11} className="text-green-500" /> 7-day free trial</span>
            <span className="flex items-center gap-1"><Star size={11} className="text-yellow-400" /> 4.9/5 rating</span>
          </p>
        </div>
      </div>
    </div>
  )
}
