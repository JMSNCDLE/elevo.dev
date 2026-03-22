'use client'

import { useState, useEffect } from 'react'
import { Gift, Copy, Check, Loader2, TrendingUp, DollarSign, Users } from 'lucide-react'

interface AffiliateData {
  joined: boolean
  affiliate?: {
    code: string
    tier: number
    total_referrals: number
    pending_commission: number
    paid_commission: number
    active: boolean
  }
  stats?: {
    code: string
    totalReferrals: number
    pendingCommission: number
    paidCommission: number
    conversionRate: number
  }
}

interface Payout {
  id: string
  amount: number
  currency: string
  status: string
  paid_at: string | null
  created_at: string
}

export default function AffiliatePage() {
  const [data, setData] = useState<AffiliateData | null>(null)
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [affiliateRes, statsRes] = await Promise.all([
          fetch('/api/affiliate'),
          fetch('/api/affiliate/stats'),
        ])

        if (affiliateRes.ok) {
          const d: AffiliateData = await affiliateRes.json()
          setData(d)
        }

        if (statsRes.ok) {
          const s: { payouts: Payout[] } = await statsRes.json()
          setPayouts(s.payouts ?? [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleJoin() {
    setJoining(true)
    setError(null)

    try {
      const r = await fetch('/api/affiliate/join', { method: 'POST' })
      const d = await r.json()

      if (!r.ok) throw new Error(d.error ?? 'Failed to join')

      setData(prev => ({
        ...prev,
        joined: true,
        affiliate: {
          code: d.code,
          tier: 1,
          total_referrals: 0,
          pending_commission: 0,
          paid_commission: 0,
          active: true,
        },
      }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join')
    } finally {
      setJoining(false)
    }
  }

  function copyLink() {
    const code = data?.affiliate?.code ?? data?.stats?.code
    if (!code) return
    const url = `${window.location.origin}/en/signup?ref=${code}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-dashMuted" size={24} />
      </div>
    )
  }

  const code = data?.affiliate?.code ?? data?.stats?.code
  const stats = data?.stats ?? {
    totalReferrals: data?.affiliate?.total_referrals ?? 0,
    pendingCommission: data?.affiliate?.pending_commission ?? 0,
    paidCommission: data?.affiliate?.paid_commission ?? 0,
    conversionRate: 0,
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
          <Gift size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-dashText">Affiliate Program</h1>
          <p className="text-dashMuted text-sm">Earn commission by referring new customers</p>
        </div>
      </div>

      {!data?.joined ? (
        /* Join CTA */
        <div className="bg-dashCard border border-accent/20 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Gift size={28} className="text-accent" />
          </div>
          <h2 className="text-lg font-bold text-dashText mb-2">Join the ELEVO Affiliate Program</h2>
          <p className="text-dashMuted text-sm max-w-md mx-auto mb-2">
            Earn 20–30% recurring commission for every customer you refer. Get paid every month as long as they stay subscribed.
          </p>

          <div className="grid grid-cols-3 gap-3 my-6">
            {[
              { tier: 'Tier 1', commission: '20%', desc: '1–5 referrals' },
              { tier: 'Tier 2', commission: '25%', desc: '6–20 referrals' },
              { tier: 'Tier 3', commission: '30%', desc: '21+ referrals' },
            ].map(t => (
              <div key={t.tier} className="bg-dashSurface rounded-xl p-3">
                <p className="text-xs text-dashMuted">{t.tier}</p>
                <p className="text-xl font-bold text-accent">{t.commission}</p>
                <p className="text-xs text-dashMuted">{t.desc}</p>
              </div>
            ))}
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <button
            onClick={handleJoin}
            disabled={joining}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accentLight transition-colors mx-auto disabled:opacity-50"
          >
            {joining ? <Loader2 size={15} className="animate-spin" /> : <Gift size={15} />}
            {joining ? 'Joining...' : 'Join Affiliate Program'}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Referral Link */}
          <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-dashText mb-3">Your Referral Link</h2>
            <div className="flex gap-2">
              <div className="flex-1 bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashMuted font-mono truncate">
                {`https://elevo.ai/en/signup?ref=${code}`}
              </div>
              <button
                onClick={copyLink}
                className="flex items-center gap-2 px-4 py-2.5 bg-accent/10 text-accent text-sm font-semibold rounded-lg hover:bg-accent/20 transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-dashMuted mt-2">Code: <span className="font-mono text-dashText">{code}</span></p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Referrals', value: stats.totalReferrals, icon: Users, color: 'text-blue-400' },
              { label: 'Pending', value: `£${(stats.pendingCommission ?? 0).toFixed(2)}`, icon: DollarSign, color: 'text-amber-400' },
              { label: 'Paid', value: `£${(stats.paidCommission ?? 0).toFixed(2)}`, icon: TrendingUp, color: 'text-green-400' },
            ].map(s => (
              <div key={s.label} className="bg-dashCard border border-dashSurface2 rounded-2xl p-4">
                <s.icon size={16} className={`${s.color} mb-2`} />
                <p className="text-xl font-bold text-dashText">{s.value}</p>
                <p className="text-xs text-dashMuted">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Commission Tiers */}
          <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-dashText mb-3">Commission Tiers</h2>
            <div className="space-y-2">
              {[
                { tier: 1, rate: '20%', range: '1–5 referrals', active: (data?.affiliate?.tier ?? 1) === 1 },
                { tier: 2, rate: '25%', range: '6–20 referrals', active: (data?.affiliate?.tier ?? 1) === 2 },
                { tier: 3, rate: '30%', range: '21+ referrals', active: (data?.affiliate?.tier ?? 1) === 3 },
              ].map(t => (
                <div
                  key={t.tier}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    t.active ? 'bg-accent/10 border border-accent/20' : 'bg-dashSurface'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {t.active && <Check size={14} className="text-accent" />}
                    <span className={`text-sm ${t.active ? 'text-dashText font-semibold' : 'text-dashMuted'}`}>
                      Tier {t.tier} — {t.range}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${t.active ? 'text-accent' : 'text-dashMuted'}`}>
                    {t.rate}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payout History */}
          <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-dashText mb-3">Payout History</h2>
            {payouts.length === 0 ? (
              <p className="text-sm text-dashMuted text-center py-4">No payouts yet. Keep referring!</p>
            ) : (
              <div className="space-y-2">
                {payouts.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-dashSurface2 last:border-0">
                    <div>
                      <p className="text-sm text-dashText">£{p.amount.toFixed(2)} {p.currency}</p>
                      <p className="text-xs text-dashMuted">
                        {p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-GB') : new Date(p.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.status === 'paid'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
