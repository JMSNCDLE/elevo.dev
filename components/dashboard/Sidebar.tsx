'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, MessageSquare, Zap, Share2, Globe,
  Video, Scissors, TrendingUp, Film, Palette, Eye, PenLine, Wrench,
  Crown, Shield, Search, RefreshCw,
  FileText, Brain, Bot,
  ShoppingCart, Store,
  Target, Mail, Settings as SettingsIcon,
  Users2, BarChart2, DollarSign, TrendingDown, Rocket,
  ChevronRight, Library, Star, Paintbrush, ClipboardList, FlaskConical, Plug, Bell, Megaphone,
} from 'lucide-react'
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
  const isOrbit = plan === 'orbit' || plan === 'galaxy'
  const isGalaxy = plan === 'galaxy'
  const creditsRemaining = creditsLimit - creditsUsed
  const creditsPct = Math.max(0, (creditsRemaining / creditsLimit) * 100)
  const { open: openSearch } = useAgentSearch()

  const sections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { href: `/${locale}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
        { href: `/${locale}/chat`, label: 'Chat', icon: MessageSquare },
      ],
    },
    {
      title: 'Marketing',
      items: [
        { href: `/${locale}/market`, label: 'ELEVO Market™', icon: Zap, orbitOnly: true, badge: 'SUPER' },
        { href: `/${locale}/smm`, label: 'ELEVO SMM™', icon: Share2, orbitOnly: true },
        { href: `/${locale}/market/setup`, label: 'Social Setup', icon: Globe },
      ],
    },
    {
      title: 'Content',
      items: [
        { href: `/${locale}/creator`, label: 'ELEVO Creator™', icon: Video, orbitOnly: true },
        { href: `/${locale}/clip`, label: 'ELEVO Clip™', icon: Scissors, orbitOnly: true },
        { href: `/${locale}/viral`, label: 'ELEVO Viral™', icon: TrendingUp, orbitOnly: true },
        { href: `/${locale}/video-studio`, label: 'Video Studio', icon: Film },
      ],
    },
    {
      title: 'Design & Create',
      items: [
        { href: `/${locale}/create`, label: 'ELEVO Create™', icon: Palette, orbitOnly: true },
        { href: `/${locale}/vision`, label: 'ELEVO Vision™', icon: Eye, orbitOnly: true },
        { href: `/${locale}/stitch`, label: 'ELEVO Stitch™', icon: Paintbrush, orbitOnly: true },
        { href: `/${locale}/build-app`, label: 'ELEVO Build™', icon: Wrench, orbitOnly: true },
      ],
    },
    {
      title: 'Intelligence',
      items: [
        { href: `/${locale}/ceo`, label: 'ELEVO CEO™', icon: Crown, galaxyOnly: true },
        { href: `/${locale}/spy`, label: 'ELEVO Spy™', icon: Shield, orbitOnly: true },
        { href: `/${locale}/seo`, label: 'ELEVO Rank™', icon: Search },
        { href: `/${locale}/admin/updates`, label: 'ELEVO Update™', icon: RefreshCw, adminOnly: true },
      ],
    },
    {
      title: 'Tools',
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
      title: 'Ecommerce',
      items: [
        { href: `/${locale}/drop`, label: 'ELEVO Drop™', icon: ShoppingCart, galaxyOnly: true },
        { href: `/${locale}/store`, label: 'Store Analytics', icon: Store, galaxyOnly: true },
      ],
    },
    {
      title: 'Sales Tools',
      items: [
        { href: `/${locale}/prospect`, label: 'ELEVO Prospect™', icon: Target, galaxyOnly: true },
        { href: `/${locale}/prospect/cold-call`, label: 'Cold Call', icon: MessageSquare, orbitOnly: true },
        { href: `/${locale}/prospect/cold-email`, label: 'Cold Email', icon: Mail, orbitOnly: true },
        { href: `/${locale}/prospect/agent-builder`, label: 'Agent Builder', icon: Bot, galaxyOnly: true },
      ],
    },
    {
      title: 'Customers',
      items: [
        { href: `/${locale}/dashboard/customers`, label: 'All Contacts', icon: Users2 },
        { href: `/${locale}/customers/pipeline`, label: 'Sales Pipeline', icon: TrendingUp, orbitOnly: true },
        { href: `/${locale}/conversations`, label: 'Conversations', icon: MessageSquare, orbitOnly: true },
        { href: `/${locale}/dashboard/customers/review-requests`, label: 'Reviews', icon: Star },
        { href: `/${locale}/analytics`, label: 'Analytics', icon: BarChart2 },
      ],
    },
    {
      title: 'Growth',
      items: [
        { href: `/${locale}/sales-strategist`, label: 'Sales Strategist', icon: Target, orbitOnly: true },
        { href: `/${locale}/marketing-planner`, label: 'Marketing Planner', icon: Megaphone, orbitOnly: true },
        { href: `/${locale}/execution-coach`, label: 'Execution Coach', icon: Rocket, orbitOnly: true },
        { href: `/${locale}/competitive-intel`, label: 'Competitive Intel', icon: Shield, galaxyOnly: true, badge: 'GALAXY' },
        { href: `/${locale}/roas`, label: 'ROAS Analysis', icon: DollarSign },
        { href: `/${locale}/finances`, label: 'Finances', icon: TrendingDown },
        { href: `/${locale}/dashboard/advisor`, label: 'Market Intel', icon: Search },
      ],
    },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="w-60 shrink-0 bg-dashSurface border-r border-dashSurface2 h-screen sticky top-0 flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-dashSurface2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
            <Rocket size={14} className="text-white" />
          </div>
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
        {userId === '5dc15dea-4633-441b-b37a-5406e7235114' && <div>
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
          <span className="text-xs text-dashMuted">Credits</span>
          <span className={`text-xs font-medium ${
            creditsPct > 20 ? 'text-green-400' : creditsPct > 10 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {creditsRemaining} left
          </span>
        </div>
        <div className="w-full bg-dashCard rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              creditsPct > 20 ? 'bg-green-500' : creditsPct > 10 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${creditsPct}%` }}
          />
        </div>
        {!isOrbit && (
          <Link
            href={`/${locale}/pricing`}
            className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-accent/10 text-accent text-xs font-semibold rounded-lg hover:bg-accent/20 transition-colors"
          >
            <TrendingUp size={13} />
            Upgrade to Orbit
          </Link>
        )}
      </div>
    </aside>
  )
}
