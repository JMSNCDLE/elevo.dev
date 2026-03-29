'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Users2, Search, Share2, BarChart2, MessageSquare,
  Target, Megaphone, TrendingUp, Palette, Camera,
  Briefcase, PenLine, ClipboardList, Shield, ShoppingCart,
} from 'lucide-react'

interface AgentRecommendation {
  label: string
  href: string
  icon: React.ElementType
  color: string
  desc: string
}

const AGENT_MAP: Record<string, AgentRecommendation[]> = {
  local_business: [
    { label: 'CRM & Contacts', href: '/dashboard/customers', icon: Users2, color: 'bg-blue-500', desc: 'Manage your customers' },
    { label: 'SEO & Rankings', href: '/seo', icon: Search, color: 'bg-green-500', desc: 'Get found on Google' },
    { label: 'Social Media', href: '/smm', icon: Share2, color: 'bg-pink-500', desc: 'Grow your social presence' },
    { label: 'Analytics', href: '/analytics', icon: BarChart2, color: 'bg-indigo-500', desc: 'Track your performance' },
    { label: 'Help Bot', href: '/chat', icon: MessageSquare, color: 'bg-cyan-500', desc: 'Get instant help' },
  ],
  ecommerce: [
    { label: 'Sales Strategist', href: '/sales-strategist', icon: Target, color: 'bg-red-500', desc: 'Boost your sales' },
    { label: 'Marketing Planner', href: '/marketing-planner', icon: Megaphone, color: 'bg-green-500', desc: 'Plan campaigns' },
    { label: 'Analytics', href: '/analytics', icon: BarChart2, color: 'bg-indigo-500', desc: 'Track revenue' },
    { label: 'SEO & Rankings', href: '/seo', icon: Search, color: 'bg-blue-500', desc: 'Organic traffic' },
    { label: 'Execution Coach', href: '/execution-coach', icon: TrendingUp, color: 'bg-orange-500', desc: 'Execute your plan' },
  ],
  pod: [
    { label: 'Create Agent', href: '/create', icon: Palette, color: 'bg-purple-500', desc: 'Design products' },
    { label: 'Marketing Planner', href: '/marketing-planner', icon: Megaphone, color: 'bg-green-500', desc: 'Grow your store' },
    { label: 'Social Media', href: '/smm', icon: Share2, color: 'bg-pink-500', desc: 'Promote designs' },
    { label: 'Analytics', href: '/analytics', icon: BarChart2, color: 'bg-indigo-500', desc: 'Track sales' },
    { label: 'Sales Strategist', href: '/sales-strategist', icon: Target, color: 'bg-red-500', desc: 'Scale revenue' },
  ],
  fashion: [
    { label: 'Create Agent', href: '/create', icon: Palette, color: 'bg-purple-500', desc: 'Design content' },
    { label: 'Viral Agent', href: '/viral', icon: TrendingUp, color: 'bg-orange-500', desc: 'Go viral' },
    { label: 'Social Media', href: '/smm', icon: Share2, color: 'bg-pink-500', desc: 'Build your brand' },
    { label: 'Marketing Planner', href: '/marketing-planner', icon: Megaphone, color: 'bg-green-500', desc: 'Plan launches' },
    { label: 'Sales Strategist', href: '/sales-strategist', icon: Target, color: 'bg-red-500', desc: 'Drive sales' },
  ],
  influencer: [
    { label: 'Viral Agent', href: '/viral', icon: TrendingUp, color: 'bg-orange-500', desc: 'Maximise reach' },
    { label: 'Social Media', href: '/smm', icon: Share2, color: 'bg-pink-500', desc: 'Grow followers' },
    { label: 'Analytics', href: '/analytics', icon: BarChart2, color: 'bg-indigo-500', desc: 'Track engagement' },
    { label: 'Marketing Planner', href: '/marketing-planner', icon: Megaphone, color: 'bg-green-500', desc: 'Plan content' },
    { label: 'Creator Studio', href: '/creator', icon: Camera, color: 'bg-red-500', desc: 'Optimise videos' },
  ],
  freelancer: [
    { label: 'CRM & Contacts', href: '/dashboard/customers', icon: Users2, color: 'bg-blue-500', desc: 'Manage clients' },
    { label: 'Sales Strategist', href: '/sales-strategist', icon: Target, color: 'bg-red-500', desc: 'Win more projects' },
    { label: 'Write Pro', href: '/write-pro', icon: PenLine, color: 'bg-indigo-500', desc: 'Perfect your copy' },
    { label: 'SEO & Rankings', href: '/seo', icon: Search, color: 'bg-green-500', desc: 'Get found online' },
    { label: 'PA Agent', href: '/pa', icon: ClipboardList, color: 'bg-cyan-500', desc: 'Manage your tasks' },
  ],
  agency: [
    { label: 'Sales Strategist', href: '/sales-strategist', icon: Target, color: 'bg-red-500', desc: 'Close more deals' },
    { label: 'Marketing Planner', href: '/marketing-planner', icon: Megaphone, color: 'bg-green-500', desc: 'Plan for clients' },
    { label: 'Competitive Intel', href: '/competitive-intel', icon: Shield, color: 'bg-purple-500', desc: 'Know your market' },
    { label: 'Execution Coach', href: '/execution-coach', icon: TrendingUp, color: 'bg-orange-500', desc: 'Deliver on time' },
    { label: 'CRM & Contacts', href: '/dashboard/customers', icon: Users2, color: 'bg-blue-500', desc: 'Manage clients' },
  ],
  other: [
    { label: 'Marketing Planner', href: '/marketing-planner', icon: Megaphone, color: 'bg-green-500', desc: 'Plan your growth' },
    { label: 'Sales Strategist', href: '/sales-strategist', icon: Target, color: 'bg-red-500', desc: 'Increase revenue' },
    { label: 'Social Media', href: '/smm', icon: Share2, color: 'bg-pink-500', desc: 'Build your brand' },
    { label: 'Analytics', href: '/analytics', icon: BarChart2, color: 'bg-indigo-500', desc: 'Track performance' },
    { label: 'PA Agent', href: '/pa', icon: ClipboardList, color: 'bg-cyan-500', desc: 'Stay organised' },
  ],
}

export default function RecommendedAgents({ businessType, businessName }: { businessType: string; businessName?: string }) {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'

  const agents = AGENT_MAP[businessType] ?? AGENT_MAP.other

  return (
    <div className="mb-6">
      <p className="text-sm text-dashMuted mb-3">
        {businessName ? `Recommended for ${businessName}` : 'Recommended agents for you'}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {agents.map(agent => (
          <Link
            key={agent.label}
            href={`/${locale}${agent.href}`}
            className="bg-dashCard border border-white/5 rounded-xl p-3 hover:border-white/10 transition-colors group"
          >
            <div className={`w-8 h-8 ${agent.color} rounded-lg flex items-center justify-center mb-2`}>
              <agent.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors">{agent.label}</p>
            <p className="text-[10px] text-dashMuted mt-0.5">{agent.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
