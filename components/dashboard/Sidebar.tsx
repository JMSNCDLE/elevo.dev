'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, MessageSquare, Zap, Share2, Globe,
  Video, Scissors, TrendingUp, Film, Palette, Eye, PenLine, Wrench,
  Crown, Shield, Search, RefreshCw,
  FileText, Brain, Bot,
  ShoppingCart, Store,
  Target, Mail, Settings as SettingsIcon,
  Users2, BarChart2, DollarSign, TrendingDown, Rocket,
  ChevronRight, Library, Star, Paintbrush, ClipboardList, FlaskConical, Plug, Bell, Megaphone, Activity, ShoppingBag, Monitor, Camera, Phone, Server, UserPlus, GitBranch, Gift, CreditCard, Award, Package, Linkedin, Calendar, Scale, Calculator,
} from 'lucide-react'
import { isAdminId } from '@/lib/admin'
import { useTranslations } from 'next-intl'
import { useAgentSearch } from '@/hooks/useAgentSearch'
import AgentSearch from './AgentSearch'

interface SidebarProps {
  locale: string
  plan: string
  creditsUsed: number
  creditsLimit: number
  businessName?: string
  userId?: string
}

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  orbitOnly?: boolean
  galaxyOnly?: boolean
  adminOnly?: boolean
  badge?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

export default function Sidebar({ locale, plan, creditsUsed, creditsLimit, businessName, userId }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isOrbit = plan === 'orbit' || plan === 'galaxy'
  const isGalaxy = plan === 'galaxy'
  const creditsRemaining = creditsLimit - creditsUsed
  const creditsPct = Math.max(0, (creditsRemaining / creditsLimit) * 100)
  const { open: openSearch } = useAgentSearch()
  const ts = useTranslations('sidebar')

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const sections: NavSection[] = [
    {
      title: ts('overview'),
      items: [
        { href: `/${locale}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
        { href: `/${locale}/chat`, label: 'Chat', icon: MessageSquare },
        { href: `/${locale}/referrals`, label: 'Refer & Earn', icon: Gift },
        { href: `/${locale}/billing`, label: 'Billing', icon: CreditCard },
        { href: `/${locale}/lawyer`, label: 'ELEVO Lawyer™', icon: Scale, orbitOnly: true, badge: 'NEW' },
        { href: `/${locale}/accountant`, label: 'ELEVO Accountant™', icon: Calculator, orbitOnly: true, badge: 'NEW' },
      ],
    },
    {
      title: ts('marketing'),
      items: [
        { href: `/${locale}/market`, label: 'ELEVO Market™', icon: Zap, orbitOnly: true, badge: 'SUPER' },
        { href: `/${locale}/smm`, label: 'ELEVO SMM™', icon: Share2, orbitOnly: true },
        { href: `/${locale}/market/setup`, label: 'Social Setup', icon: Globe },
        { href: `/${locale}/ad-accounts`, label: 'Ad Accounts', icon: Monitor, orbitOnly: true },
        { href: `/${locale}/tools/facebook-ads`, label: 'Facebook Ads', icon: Monitor, orbitOnly: true },
        { href: `/${locale}/tools/instagram-client`, label: 'Instagram Client', icon: Camera, orbitOnly: true },
        { href: `/${locale}/tools/facebook-group`, label: 'FB Groups', icon: Users2, orbitOnly: true },
      ],
    },
    {
      title: ts('contentMarketing'),
      items: [
        { href: `/${locale}/creator`, label: 'ELEVO Creator™', icon: Video, orbitOnly: true },
        { href: `/${locale}/clip`, label: 'ELEVO Clip™', icon: Scissors, orbitOnly: true },
        { href: `/${locale}/viral`, label: 'ELEVO Viral™', icon: TrendingUp, orbitOnly: true },
        { href: `/${locale}/video-studio`, label: 'Video Studio', icon: Film },
        { href: `/${locale}/tools/case-study`, label: 'Case Study Builder', icon: Award },
        { href: `/${locale}/tools/digital-product`, label: 'Digital Product', icon: Package, galaxyOnly: true, badge: 'GALAXY' },
      ],
    },
    {
      title: ts('salesOutreach'),
      items: [
        { href: `/${locale}/tools/linkedin-client`, label: 'LinkedIn Client', icon: Linkedin, orbitOnly: true },
      ],
    },
    {
      title: ts('threadsGrowth'),
      items: [
        { href: `/${locale}/tools/threads-strategy`, label: 'Strategy', icon: TrendingUp, orbitOnly: true },
        { href: `/${locale}/tools/threads-audience`, label: 'Audience', icon: Users2, orbitOnly: true },
        { href: `/${locale}/tools/threads-hooks`, label: 'Hook Generator', icon: Zap },
        { href: `/${locale}/tools/threads-content-plan`, label: '30-Day Plan', icon: Calendar, orbitOnly: true },
        { href: `/${locale}/tools/threads-writer`, label: 'Thread Writer', icon: PenLine },
        { href: `/${locale}/tools/threads-engagement`, label: 'Engagement', icon: TrendingUp },
        { href: `/${locale}/tools/threads-monetization`, label: 'Monetization', icon: DollarSign, galaxyOnly: true, badge: 'GALAXY' },
      ],
    },
    {
      title: ts('designCreate'),
      items: [
        { href: `/${locale}/create`, label: 'ELEVO Create™', icon: Palette, orbitOnly: true },
        { href: `/${locale}/vision`, label: 'ELEVO Vision™', icon: Eye, orbitOnly: true },
        { href: `/${locale}/stitch`, label: 'ELEVO Stitch™', icon: Paintbrush, orbitOnly: true },
        { href: `/${locale}/build-app`, label: 'ELEVO Build™', icon: Wrench, orbitOnly: true },
      ],
    },
    {
      title: ts('intelligence'),
      items: [
        { href: `/${locale}/ceo`, label: 'ELEVO CEO™', icon: Crown, galaxyOnly: true },
        { href: `/${locale}/spy`, label: 'ELEVO Spy™', icon: Shield, orbitOnly: true },
        { href: `/${locale}/competitive-intel`, label: 'Competitive Intel', icon: Shield, galaxyOnly: true, badge: 'GALAXY' },
        { href: `/${locale}/tools/hosting-automations`, label: 'Hosting Automations', icon: Server, galaxyOnly: true, badge: 'GALAXY' },
        { href: `/${locale}/seo`, label: 'ELEVO Rank™', icon: Search },
      ],
    },
    {
      title: ts('tools'),
      items: [
        { href: `/${locale}/docs`, label: 'ELEVO Docs™', icon: FileText },
        { href: `/${locale}/chat`, label: 'ELEVO Route™', icon: Bot },
        { href: `/${locale}/write-pro`, label: 'ELEVO Write Pro™', icon: PenLine },
        { href: `/${locale}/deep`, label: 'ELEVO Deep™', icon: Brain, galaxyOnly: true },
        { href: `/${locale}/pa`, label: 'ELEVO PA™', icon: ClipboardList },
        { href: `/${locale}/integrations`, label: 'Integrations', icon: Plug },
      ],
    },
    {
      title: ts('marketplace'),
      items: [
        { href: `/${locale}/marketplace`, label: 'Marketplace', icon: ShoppingBag },
      ],
    },
    {
      title: ts('ecommerce'),
      items: [
        { href: `/${locale}/drop`, label: 'ELEVO Drop™', icon: ShoppingCart, galaxyOnly: true },
        { href: `/${locale}/store`, label: 'Store Analytics', icon: Store, galaxyOnly: true },
      ],
    },
    {
      title: ts('salesTools'),
      items: [
        { href: `/${locale}/prospect`, label: 'ELEVO Prospect™', icon: Target, galaxyOnly: true },
        { href: `/${locale}/prospect/agent-builder`, label: 'Agent Builder', icon: Bot, galaxyOnly: true },
      ],
    },
    {
      title: ts('customersSection'),
      items: [
        { href: `/${locale}/dashboard/customers`, label: 'All Contacts', icon: Users2 },
        { href: `/${locale}/customers/pipeline`, label: 'Sales Pipeline', icon: TrendingUp, orbitOnly: true },
        { href: `/${locale}/conversations`, label: 'Conversations', icon: MessageSquare, orbitOnly: true },
        { href: `/${locale}/dashboard/customers/review-requests`, label: 'Reviews', icon: Star },
        { href: `/${locale}/analytics`, label: 'Analytics', icon: BarChart2 },
        { href: `/${locale}/web-vitals`, label: 'Web Vitals', icon: Activity },
      ],
    },
    {
      title: ts('growthTools'),
      items: [
        { href: `/${locale}/sales-pipeline`, label: 'Sales Pipeline', icon: GitBranch, orbitOnly: true },
        { href: `/${locale}/tools/researcher`, label: 'Researcher', icon: Search, orbitOnly: true },
        { href: `/${locale}/sales-strategist`, label: 'Sales Strategist', icon: Target, orbitOnly: true },
        { href: `/${locale}/marketing-planner`, label: 'Marketing Planner', icon: Megaphone, orbitOnly: true },
        { href: `/${locale}/execution-coach`, label: 'Execution Coach', icon: Rocket, orbitOnly: true },
        { href: `/${locale}/tools/cold-email`, label: 'Cold Email Machine', icon: Mail, orbitOnly: true },
        { href: `/${locale}/tools/cold-call`, label: 'Cold Call Script', icon: Phone, orbitOnly: true },
        { href: `/${locale}/tools/proposal-builder`, label: 'Proposal Builder', icon: FileText, orbitOnly: true },
        { href: `/${locale}/tools/onboarding-kit`, label: 'Onboarding Kit', icon: UserPlus, orbitOnly: true },
        { href: `/${locale}/tools/cost-reducer`, label: 'Cost Reducer', icon: TrendingDown, orbitOnly: true },
        { href: `/${locale}/roas`, label: 'ROAS Analysis', icon: DollarSign },
        { href: `/${locale}/finances`, label: 'Finances', icon: TrendingDown },
        { href: `/${locale}/dashboard/advisor`, label: 'Market Intel', icon: Search },
      ],
    },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* Mobile hamburger bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-dashSurface border-b border-dashSurface2 px-3 h-14 flex items-center justify-between safe-top">
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="w-11 h-11 flex items-center justify-center rounded-lg bg-dashCard text-dashMuted hover:text-white transition-colors no-min"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          )}
        </button>
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="ELEVO AI™" width={28} height={28} className="rounded-lg logo-spin" />
          <span className="font-bold text-dashText text-sm">ELEVO AI</span>
        </div>
        <div className="w-11 h-11" />
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setMobileOpen(false)} />
      )}

    <aside className={`
      ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0
      fixed md:sticky top-0 left-0 z-50
      w-64 md:w-60 shrink-0 bg-dashSurface border-r border-dashSurface2 h-screen
      flex flex-col overflow-y-auto transition-transform duration-200 ease-out
    `}>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-dashSurface2">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="ELEVO AI™" width={32} height={32} className="rounded-lg logo-spin" priority />
          <span className="font-bold text-dashText text-base">ELEVO AI</span>
        </div>
        {businessName && (
          <p className="text-xs text-dashMuted mt-1 truncate">{businessName}</p>
        )}
        {/* Agent search bar */}
        <button
          onClick={openSearch}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-dashCard text-dashMuted text-sm hover:bg-dashSurface2 transition-colors mt-3"
        >
          <Search className="w-4 h-4" />
          <span>Search agents...</span>
          <kbd className="ml-auto text-xs bg-[#0D1219] px-1.5 py-0.5 rounded border border-dashSurface2">⌘K</kbd>
        </button>
      </div>

      {/* Agent Search Modal */}
      <AgentSearch userPlan={plan} locale={locale} />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {sections.map(section => (
          <div key={section.title}>
            <p className="text-xs font-semibold text-dashMuted uppercase tracking-wider px-2 mb-1.5">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(item => {
                const active = isActive(item.href)
                const locked = (item.orbitOnly && !isOrbit) || (item.galaxyOnly && !isGalaxy)
                const lockLabel = item.galaxyOnly && !isGalaxy ? 'Galaxy' : 'Orbit+'
                // adminOnly items shown to all — destination handles role check

                return (
                  <li key={`${section.title}-${item.href}`}>
                    <Link
                      href={locked ? `/${locale}/dashboard/upgrade` : item.href}
                      className={`flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors group ${
                        active
                          ? 'bg-accentDim text-accent font-medium'
                          : locked
                          ? 'text-dashMuted cursor-pointer opacity-60'
                          : 'text-dashMuted hover:text-dashText hover:bg-dashCard'
                      }`}
                    >
                      <item.icon size={15} className={active ? 'text-accent' : ''} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {locked && (
                        <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded font-medium">
                          {lockLabel}
                        </span>
                      )}
                      {!locked && item.badge && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-medium">
                          {item.badge}
                        </span>
                      )}
                      {active && !locked && !item.badge && (
                        <ChevronRight size={14} className="text-accent" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {/* Settings & Library — always at bottom of nav */}
        <div>
          <p className="text-xs font-semibold text-dashMuted uppercase tracking-wider px-2 mb-1.5">Account</p>
          <ul className="space-y-0.5">
            {[
              { href: `/${locale}/dashboard/library`, label: 'Library', icon: Library },
              { href: `/${locale}/dashboard/settings`, label: 'Settings', icon: SettingsIcon },
              { href: `/${locale}/agents`, label: 'All Agents', icon: Bot },
            ].map(item => {
              const active = isActive(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors ${
                      active ? 'bg-accentDim text-accent font-medium' : 'text-dashMuted hover:text-dashText hover:bg-dashCard'
                    }`}
                  >
                    <item.icon size={15} className={active ? 'text-accent' : ''} />
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight size={14} className="text-accent" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Admin — only visible to James */}
        {userId && isAdminId(userId) && <div>
          <p className="text-xs font-semibold text-dashMuted uppercase tracking-wider px-2 mb-1.5">Admin</p>
          <ul className="space-y-0.5">
            {[
              { href: `/${locale}/admin`, label: 'Overview', icon: LayoutDashboard },
              { href: `/${locale}/admin/users`, label: 'Users', icon: Users2 },
              { href: `/${locale}/admin/revenue`, label: 'Revenue', icon: DollarSign },
              { href: `/${locale}/admin/emails`, label: 'Emails', icon: Mail },
              { href: `/${locale}/admin/agents`, label: 'Agents', icon: Bot },
              { href: `/${locale}/admin/testing`, label: 'QA Testing', icon: FlaskConical },
              { href: `/${locale}/admin/health`, label: 'System Health', icon: Shield },
              { href: `/${locale}/admin/notifications`, label: 'Notifications', icon: Bell },
              { href: `/${locale}/admin/pa`, label: 'ELEVO PA™', icon: ClipboardList },
              { href: `/${locale}/admin/email-campaigns`, label: 'Email Campaigns', icon: Megaphone },
              { href: `/${locale}/admin/seo`, label: 'SEO Monitor', icon: Globe },
              { href: `/${locale}/admin/build-agent`, label: 'Build Agent', icon: Server },
            ].map(item => {
              const active = isActive(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors ${
                      active ? 'bg-accentDim text-accent font-medium' : 'text-dashMuted hover:text-dashText hover:bg-dashCard'
                    }`}
                  >
                    <item.icon size={15} className={active ? 'text-accent' : ''} />
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight size={14} className="text-accent" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>}
      </nav>

      {/* Credits bar */}
      <div className="px-4 py-4 border-t border-dashSurface2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-dashMuted">{ts('credits')}</span>
          <span className={`text-xs font-medium ${
            (userId && isAdminId(userId)) ? 'text-indigo-400' : creditsPct > 20 ? 'text-green-400' : creditsPct > 10 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {(userId && isAdminId(userId)) ? '∞' : `${creditsRemaining} ${ts('left')}`}
          </span>
        </div>
        {!(userId && isAdminId(userId)) && (
          <div className="w-full bg-dashCard rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                creditsPct > 20 ? 'bg-green-500' : creditsPct > 10 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${creditsPct}%` }}
            />
          </div>
        )}
        {!isOrbit && !(userId && isAdminId(userId)) && (
          <Link
            href={`/${locale}/pricing`}
            className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-accent/10 text-accent text-xs font-semibold rounded-lg hover:bg-accent/20 transition-colors"
          >
            <TrendingUp size={13} />
            {ts('upgradeToOrbit')}
          </Link>
        )}
      </div>
    </aside>
    </>
  )
}
