'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Phone, Cpu, Mail, ChevronRight, Instagram } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { ADMIN_IDS } from '@/lib/admin'
import UpgradePrompt from '@/components/shared/UpgradePrompt'

interface RecentAudit {
  id: string
  instagram_handle: string
  business_name: string
  page_slug: string
  created_at: string
}

const TOOL_CARDS = [
  {
    icon: Instagram,
    iconBg: 'bg-gradient-to-br from-pink-500 to-purple-600',
    iconColor: 'text-white',
    title: 'Instagram Client Machine',
    sub: 'Audit any Instagram profile. Build a personalised demo page. Send the link. Close the deal.',
    steps: ['Enter handle', 'Generate audit', 'Send link'],
    btnLabel: 'Start Instagram Audit →',
    href: '/prospect/instagram',
    badge: null,
  },
  {
    icon: Phone,
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
    title: 'Cold Call Script Generator',
    sub: 'Generate a natural cold call script with 8 objection handlers and a closing framework.',
    steps: ['Enter details', 'Generate script', 'Make the call'],
    btnLabel: 'Build Cold Call Script →',
    href: '/prospect/cold-call',
    badge: 'Soon',
  },
  {
    icon: Cpu,
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
    title: 'AI Agent Build Brief',
    sub: "Turn any client's problem into a complete AI build brief. What agencies charge £5,000–£50,000 for.",
    steps: ['Enter problem', 'Build brief', 'Send to client'],
    btnLabel: 'Build Agent Brief →',
    href: '/prospect/agent-builder',
    badge: 'Soon',
  },
  {
    icon: Mail,
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
    title: 'Cold Email Machine',
    sub: 'Research-backed 5-email sequences that get replies. Not templates — personalised to each prospect.',
    steps: ['Enter prospect', 'Research + write', 'Send sequence'],
    btnLabel: 'Write Email Sequence →',
    href: '/prospect/cold-email',
    badge: 'Soon',
  },
]

export default function ProspectPage() {
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [plan, setPlan] = useState<string>('trial')
  const [loading, setLoading] = useState(true)
  const [recentAudits, setRecentAudits] = useState<RecentAudit[]>([])

  const fetchData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }
    const [profileRes, auditsRes] = await Promise.all([
      supabase.from('profiles').select('plan').eq('id', user.id).single(),
      supabase
        .from('prospect_audits')
        .select('id, instagram_handle, business_name, page_slug, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ])
    setPlan(ADMIN_IDS.includes(user.id) ? 'galaxy' : (profileRes.data?.plan ?? 'trial'))
    setRecentAudits((auditsRes.data as RecentAudit[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const isGalaxy = plan === 'galaxy'

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-dashCard rounded w-48" />
          <div className="h-4 bg-dashCard rounded w-72" />
          <div className="grid grid-cols-2 gap-4 mt-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-52 bg-dashCard rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isGalaxy) {
    return (
      <div className="p-6">
        <UpgradePrompt
          locale={locale}
          featureName="ELEVO Prospect™"
          description="The Instagram Client Machine, Cold Call Generator, AI Agent Build Brief, and Cold Email Machine are exclusive to the Galaxy plan. Your complete sales machine — all in one place."
          requiredPlan="galaxy"
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-black text-dashText tracking-tight">ELEVO Prospect™</h1>
          <span className="text-xs font-bold bg-accent text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
            Galaxy
          </span>
        </div>
        <p className="text-xl font-semibold text-accent">Your Sales Machine</p>
        <p className="text-dashMuted text-sm max-w-xl">
          Audit any prospect. Build a personalised demo. Close the client.
        </p>
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {TOOL_CARDS.map(card => {
          const Icon = card.icon
          const isDisabled = card.badge === 'Soon'
          const inner = (
            <div className="bg-dashCard border border-[#1E2D42] rounded-xl p-5 space-y-4 hover:border-accent/40 transition-colors h-full flex flex-col">
              {/* Icon + badge */}
              <div className="flex items-start justify-between">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.iconBg}`}
                >
                  <Icon size={22} className={card.iconColor} />
                </div>
                {card.badge && (
                  <span className="text-xs font-semibold bg-dashSurface2 text-dashMuted px-2 py-0.5 rounded-full">
                    {card.badge}
                  </span>
                )}
              </div>

              {/* Title + sub */}
              <div className="space-y-1 flex-1">
                <h2 className="text-base font-bold text-dashText">{card.title}</h2>
                <p className="text-sm text-dashMuted leading-relaxed">{card.sub}</p>
              </div>

              {/* Steps */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {card.steps.map((step, idx) => (
                  <div key={step} className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs text-dashMuted whitespace-nowrap">{step}</span>
                    </div>
                    {idx < card.steps.length - 1 && (
                      <ChevronRight size={12} className="text-dashMuted shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                disabled={isDisabled}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isDisabled
                    ? 'bg-dashSurface2 text-dashMuted cursor-not-allowed'
                    : 'bg-accent text-white hover:bg-accentLight'
                }`}
              >
                {isDisabled ? 'Coming soon' : card.btnLabel}
              </button>
            </div>
          )

          if (isDisabled) {
            return (
              <div key={card.title} className="opacity-60 cursor-not-allowed">
                {inner}
              </div>
            )
          }

          return (
            <Link key={card.title} href={`/${locale}${card.href}`} className="block h-full">
              {inner}
            </Link>
          )
        })}
      </div>

      {/* Recent Audits */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-dashText">Recent Audits</h2>
        {recentAudits.length === 0 ? (
          <div className="bg-dashCard border border-[#1E2D42] rounded-xl p-8 text-center">
            <p className="text-dashMuted text-sm">
              No audits yet. Start with the Instagram Audit above.
            </p>
            <Link
              href={`/${locale}/prospect/instagram`}
              className="mt-3 inline-block text-accent text-sm hover:underline"
            >
              Start your first audit →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentAudits.map(audit => (
              <div
                key={audit.id}
                className="bg-dashCard border border-[#1E2D42] rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                    <Instagram size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dashText">{audit.instagram_handle}</p>
                    <p className="text-xs text-dashMuted">
                      {new Date(audit.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <a
                  href={`https://elevo.dev/en/demo/${audit.page_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  View demo <ChevronRight size={12} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
