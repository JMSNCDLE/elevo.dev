'use client'

import { useState, useEffect } from 'react'
import {
  Gift, Copy, Check, Loader2, Users, DollarSign, TrendingUp,
  Share2, MessageSquare, Mail, Link2,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ReferralData {
  code: string
  link: string
  stats: {
    totalReferrals: number
    subscribed: number
    pendingEarnings: number
    paidEarnings: number
  }
  referrals: Array<{
    id: string
    status: string
    created_at: string
    converted_at: string | null
  }>
}

const SHARE_MESSAGES = [
  "I've been using ELEVO AI to run my business and it's incredible. 54+ AI agents handle my marketing, sales, content, and more — 24/7. Try it free:",
  "Forget hiring. ELEVO AI gives you an entire team of AI agents for less than the cost of one employee. I use it every day:",
  "Just discovered ELEVO AI — it's like having a marketing manager, sales rep, and content writer all in one platform. Check it out:",
]

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/referrals')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  function copyLink() {
    if (!data) return
    navigator.clipboard.writeText(data.link)
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  function shareWhatsApp() {
    if (!data) return
    window.open(`https://wa.me/?text=${encodeURIComponent(SHARE_MESSAGES[0] + ' ' + data.link)}`, '_blank')
  }

  function shareTwitter() {
    if (!data) return
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_MESSAGES[1] + ' ' + data.link)}`, '_blank')
  }

  function shareEmail() {
    if (!data) return
    window.open(`mailto:?subject=${encodeURIComponent('Check out ELEVO AI')}&body=${encodeURIComponent(SHARE_MESSAGES[2] + '\n\n' + data.link)}`)
  }

  function shareLinkedIn() {
    if (!data) return
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.link)}`, '_blank')
  }

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Refer & Earn</h1>
          <p className="text-sm text-dashMuted">Earn 20% recurring commission for every user you refer</p>
        </div>
      </div>

      {/* Referral link */}
      <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-xl p-6">
        <p className="text-sm font-semibold text-white mb-3">Your referral link</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-dashBg border border-white/10 rounded-lg px-4 py-3 text-sm text-white font-mono truncate">
            {data?.link ?? '...'}
          </div>
          <button onClick={copyLink}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2 shrink-0">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Share buttons */}
        <div className="flex gap-2 mt-4">
          <button onClick={shareWhatsApp} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-colors">
            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
          </button>
          <button onClick={shareTwitter} className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg transition-colors">
            <Share2 className="w-3.5 h-3.5" /> Twitter
          </button>
          <button onClick={shareLinkedIn} className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors">
            <Link2 className="w-3.5 h-3.5" /> LinkedIn
          </button>
          <button onClick={shareEmail} className="flex items-center gap-1.5 px-3 py-2 bg-dashCard border border-white/10 text-dashMuted hover:text-white text-xs font-medium rounded-lg transition-colors">
            <Mail className="w-3.5 h-3.5" /> Email
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Referrals" value={data?.stats.totalReferrals ?? 0} />
        <StatCard icon={TrendingUp} label="Subscribed" value={data?.stats.subscribed ?? 0} color="text-green-400" />
        <StatCard icon={DollarSign} label="Pending Earnings" value={`€${(data?.stats.pendingEarnings ?? 0).toFixed(2)}`} color="text-amber-400" />
        <StatCard icon={DollarSign} label="Total Paid" value={`€${(data?.stats.paidEarnings ?? 0).toFixed(2)}`} color="text-green-400" />
      </div>

      {/* How it works */}
      <div className="bg-dashCard border border-white/5 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">How it works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Share your link', desc: 'Send your unique referral link to friends, clients, or your audience' },
            { step: '2', title: 'They sign up', desc: 'When someone signs up using your link, we track the referral automatically' },
            { step: '3', title: 'You earn 20%', desc: 'For every referred user who subscribes, you earn 20% recurring commission for 12 months' },
          ].map(item => (
            <div key={item.step} className="flex gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">{item.step}</div>
              <div>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-xs text-dashMuted mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share templates */}
      <div className="bg-dashCard border border-white/5 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Share templates</h3>
        <div className="space-y-3">
          {SHARE_MESSAGES.map((msg, i) => (
            <div key={i} className="bg-dashBg border border-white/5 rounded-lg p-3 flex items-start gap-3">
              <p className="text-xs text-dashMuted flex-1 leading-relaxed">{msg}</p>
              <button onClick={() => { navigator.clipboard.writeText(msg + ' ' + (data?.link ?? '')); toast.success('Copied!') }}
                className="text-dashMuted hover:text-white shrink-0"><Copy className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Referral history */}
      {(data?.referrals?.length ?? 0) > 0 && (
        <div className="bg-dashCard border border-white/5 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white">Referral History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Converted</th>
                </tr>
              </thead>
              <tbody>
                {data?.referrals.map(ref => (
                  <tr key={ref.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 text-dashMuted text-xs">
                      {new Date(ref.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        ref.status === 'subscribed' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                        ref.status === 'signed_up' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                        'text-gray-400 bg-gray-500/10 border-gray-500/20'
                      }`}>{ref.status}</span>
                    </td>
                    <td className="px-4 py-3 text-dashMuted text-xs">
                      {ref.converted_at ? new Date(ref.converted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-dashCard border border-white/5 rounded-xl p-4">
      <Icon className={`w-4 h-4 ${color ?? 'text-dashMuted'} mb-2`} />
      <p className={`text-xl font-bold ${color ?? 'text-white'}`}>{value}</p>
      <p className="text-xs text-dashMuted mt-0.5">{label}</p>
    </div>
  )
}
