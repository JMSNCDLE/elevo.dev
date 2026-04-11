'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Sparkles, ArrowRight, Check } from 'lucide-react'

interface AgentLandingPageProps {
  brandName: string
  characterName: string
  tagline: string
  emoji: string
  description: string
  capabilities: string[]
  creditsPerUse: number
  availableFrom: 'trial' | 'launch' | 'orbit' | 'galaxy' | 'admin'
  ctaHref?: string
  ctaLabel?: string
}

export default function AgentLandingPage(props: AgentLandingPageProps) {
  const locale = useLocale()
  const {
    brandName,
    characterName,
    tagline,
    emoji,
    description,
    capabilities,
    creditsPerUse,
    availableFrom,
    ctaHref,
    ctaLabel,
  } = props

  const planLabel: Record<string, string> = {
    trial: 'All plans',
    launch: 'Launch and up',
    orbit: 'Orbit and up',
    galaxy: 'Galaxy only',
    admin: 'Admin only',
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 bg-accent/15 border border-accent/30 rounded-2xl flex items-center justify-center text-3xl shrink-0">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl font-bold text-white">{brandName}™</h1>
            <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              {characterName}
            </span>
          </div>
          <p className="text-dashMuted">{tagline}</p>
        </div>
      </div>

      {/* Description */}
      <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-6 mb-6">
        <p className="text-dashText leading-relaxed">{description}</p>
      </div>

      {/* Capabilities */}
      <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide">What it does</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {capabilities.map((cap) => (
            <div key={cap} className="flex items-center gap-2 text-sm text-dashText">
              <Check className="w-4 h-4 text-green-400 shrink-0" />
              <span>{cap}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plan + credits */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-dashCard border border-dashSurface2 rounded-xl p-4">
          <p className="text-xs text-dashMuted uppercase tracking-wide mb-1">Available on</p>
          <p className="text-sm font-semibold text-white">{planLabel[availableFrom]}</p>
        </div>
        <div className="bg-dashCard border border-dashSurface2 rounded-xl p-4">
          <p className="text-xs text-dashMuted uppercase tracking-wide mb-1">Credits per use</p>
          <p className="text-sm font-semibold text-white">{creditsPerUse === 0 ? 'Free' : `${creditsPerUse} credit${creditsPerUse > 1 ? 's' : ''}`}</p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-accent/15 to-purple-500/10 border border-accent/30 rounded-2xl p-6 text-center">
        <h2 className="text-lg font-bold text-white mb-2">Ready to use {brandName}™?</h2>
        <p className="text-sm text-dashMuted mb-4">
          Open the chat and ask {characterName} to help you with your business.
        </p>
        <Link
          href={ctaHref ?? `/${locale}/chat`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accentLight text-white font-semibold rounded-xl transition-colors"
        >
          {ctaLabel ?? `Open ${characterName}`}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
