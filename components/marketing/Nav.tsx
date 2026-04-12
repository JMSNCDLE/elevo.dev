'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import DemoRequestModal from '@/components/marketing/DemoRequestModal'

interface NavProps {
  locale: string
}

export default function Nav({ locale }: NavProps) {
  const t = useTranslations('marketing')
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    // Set initial scroll state in case page loaded mid-scroll
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: `/${locale}/#features`, label: t('navFeatures') },
    { href: `/${locale}/#how-it-works`, label: t('navHowItWorks') },
    { href: `/${locale}/pricing`, label: t('navPricing') },
    { href: `/${locale}/compare`, label: t('navCompare') },
    { href: `/${locale}/blog`, label: t('navBlog') },
  ]

  const headerStyle = mounted && scrolled
    ? {
        background: 'rgba(5, 5, 7, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }
    : {
        background: 'transparent',
      }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={headerStyle}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
          <Image src="/logo.svg" alt="ELEVO AI™" width={32} height={32} unoptimized className="shrink-0" priority />
          <span className="text-xl font-black tracking-tight text-white">
            ELEVO AI™
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={() => setDemoOpen(true)}
            className="text-sm font-medium text-white/70 hover:text-white transition-colors px-3 py-2"
          >
            Request demo
          </button>
          <Link
            href={`/${locale}/login`}
            className="text-sm font-medium text-white/70 hover:text-white transition-colors px-3 py-2"
          >
            {t('navSignIn')}
          </Link>
          <Link
            href={`/${locale}/signup`}
            className="text-sm font-semibold px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            {t('navStartTrial')}
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-3">
          <Link href={`/${locale}/signup`} className="text-sm font-semibold px-3 py-1.5 bg-indigo-600 text-white rounded-lg">
            {t('navTryFree')}
          </Link>
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="md:hidden bg-[#050507] border-b border-white/10 px-6 py-4 space-y-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-white/70 hover:text-white py-2.5 border-b border-white/5 last:border-0"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => { setMobileOpen(false); setDemoOpen(true) }}
            className="block w-full text-left text-sm font-medium text-white/70 hover:text-white py-2.5 border-b border-white/5"
          >
            Request demo
          </button>
          <div className="pt-3 flex gap-3">
            <Link href={`/${locale}/login`} className="flex-1 text-center py-2.5 text-sm font-medium text-white/70 border border-white/15 rounded-lg">
              {t('navSignIn')}
            </Link>
            <Link href={`/${locale}/signup`} className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg">
              {t('navStartTrial')}
            </Link>
          </div>
          <div className="pt-3 border-t border-white/10 flex items-center justify-center">
            <LanguageSwitcher />
          </div>
        </div>
      )}
      <DemoRequestModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </header>
  )
}
