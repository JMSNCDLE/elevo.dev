'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, BookOpen, Share2, Star, Mail, Search,
  TrendingUp, Briefcase, BarChart2, Target, DollarSign, Users2, Megaphone,
  UserSquare2, Zap, Library, Settings, ChevronRight, Rocket,
  BarChart3, Package, TrendingDown, MapPin, Repeat2, MessageSquare, Bot,
  Film, Video, UserCheck, Megaphone as Campaign, Eye,
} from 'lucide-react'

interface SidebarProps {
  locale: string
  plan: string
  creditsUsed: number
  creditsLimit: number
  businessName?: string
}

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  orbitOnly?: boolean
  badge?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

export default function Sidebar({ locale, plan, creditsUsed, creditsLimit, businessName }: SidebarProps) {
  const pathname = usePathname()
  const isOrbit = plan === 'orbit' || plan === 'galaxy'
  const creditsRemaining = creditsLimit - creditsUsed
  const creditsPct = Math.max(0, (creditsRemaining / creditsLimit) * 100)

  const sections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { href: `/${locale}/chat`, label: 'Chat with ELEVO', icon: MessageSquare, badge: 'NEW' },
        { href: `/${locale}/dashboard`, label: 'Mission Control', icon: LayoutDashboard },
        { href: `/${locale}/analytics`, label: 'Analytics', icon: BarChart2 },
      ],
    },
    {
      title: 'Content',
      items: [
        { href: `/${locale}/dashboard/content/gbp-posts`, label: 'GBP Posts', icon: FileText },
        { href: `/${locale}/dashboard/content/blog`, label: 'Blog', icon: BookOpen },
        { href: `/${locale}/dashboard/content/social`, label: 'Social', icon: Share2 },
        { href: `/${locale}/dashboard/content/reviews`, label: 'Reviews', icon: Star },
        { href: `/${locale}/dashboard/content/email`, label: 'Email', icon: Mail },
        { href: `/${locale}/dashboard/content/seo`, label: 'SEO', icon: Search },
      ],
    },
    {
      title: 'Growth',
      items: [
        { href: `/${locale}/dashboard/growth/sales`, label: 'Sales & Proposals', icon: Briefcase, orbitOnly: true },
        { href: `/${locale}/dashboard/growth/research`, label: 'Market Research', icon: BarChart2, orbitOnly: true },
        { href: `/${locale}/dashboard/growth/strategy`, label: 'Strategy & SWOT', icon: Target, orbitOnly: true },
        { href: `/${locale}/dashboard/growth/financial`, label: 'Financial Health', icon: DollarSign, orbitOnly: true },
        { href: `/${locale}/dashboard/growth/management`, label: 'Management & HR', icon: Users2, orbitOnly: true },
        { href: `/${locale}/dashboard/growth/campaigns`, label: 'Campaigns', icon: Megaphone, orbitOnly: true },
      ],
    },
    {
      title: 'Intelligence',
      items: [
        { href: `/${locale}/roas`, label: 'ROAS Analysis', icon: BarChart3, orbitOnly: true },
        { href: `/${locale}/finances`, label: 'Finances', icon: TrendingDown, orbitOnly: true },
        { href: `/${locale}/inventory`, label: 'Inventory', icon: Package, orbitOnly: true },
        { href: `/${locale}/customer-trends`, label: 'Customer Trends', icon: TrendingUp, orbitOnly: true },
        { href: `/${locale}/google-optimisation`, label: 'Google Optimisation', icon: MapPin },
        { href: `/${locale}/alternatives`, label: 'Find Alternatives', icon: Repeat2, orbitOnly: true },
        { href: `/${locale}/spy`, label: 'ELEVO Spy™', icon: Eye, orbitOnly: true, badge: 'NEW' },
      ],
    },
    {
      title: 'Social & Video',
      items: [
        { href: `/${locale}/social`, label: 'Social Hub', icon: Share2, orbitOnly: true },
        { href: `/${locale}/video-studio`, label: 'Video Studio', icon: Film, orbitOnly: true },
        { href: `/${locale}/ugc`, label: 'UGC Pipeline', icon: Video, orbitOnly: true },
        { href: `/${locale}/conversations`, label: 'Conversations', icon: MessageSquare, orbitOnly: true },
        { href: `/${locale}/social/profiles`, label: 'Profile Generator', icon: UserCheck },
        { href: `/${locale}/ads`, label: 'Ad Campaigns', icon: Target, orbitOnly: true },
        { href: `/${locale}/seo`, label: 'SEO & Rankings', icon: Search },
      ],
    },
    {
      title: 'Customers',
      items: [
        { href: `/${locale}/dashboard/customers`, label: 'All Contacts', icon: UserSquare2 },
        { href: `/${locale}/dashboard/customers/pipeline`, label: 'Sales Pipeline', icon: BarChart2, orbitOnly: true },
        { href: `/${locale}/dashboard/customers/review-requests`, label: 'Review Requests', icon: Star },
        { href: `/${locale}/dashboard/customers/campaigns`, label: 'Campaigns', icon: Campaign, orbitOnly: true },
      ],
    },
    {
      title: 'Tools',
      items: [
        { href: `/${locale}/dashboard/advisor`, label: 'Problem Solver', icon: Zap },
        { href: `/${locale}/agents`, label: 'All Agents', icon: Bot },
        { href: `/${locale}/dashboard/library`, label: 'Library', icon: Library },
        { href: `/${locale}/dashboard/settings`, label: 'Settings', icon: Settings },
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
      </div>

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
                const locked = item.orbitOnly && !isOrbit

                return (
                  <li key={item.href}>
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
                      <span className="flex-1">{item.label}</span>
                      {locked && (
                        <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded font-medium">
                          Orbit+
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
