'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

interface NavProps {
  locale: string
}

export default function Nav({ locale }: NavProps) {
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    // Set initial scroll state in case page loaded mid-scroll
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: `/${locale}/#features`, label: 'Features' },
    { href: `/${locale}/#how-it-works`, label: 'How it works' },
    { href: `/${locale}/pricing`, label: 'Pricing' },
    { href: `/${locale}/blog`, label: 'Blog' },
  ]

  const headerStyle = mounted && scrolled
    ? {
        background: 'rgba(255, 252, 248, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
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
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
          >
            <span className="text-white font-black text-sm">E</span>
          </div>
          <span
            className="text-xl font-black tracking-tight"
            style={{ color: '#0f172a' }}
          >
            ELEVO AI™
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="hover:text-indigo-600 transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href={`/${locale}/login`}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2"
          >
            Sign in
          </Link>
          <Link
            href={`/${locale}/signup`}
            className="text-sm font-semibold px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Start free trial
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-3">
          <Link href={`/${locale}/signup`} className="text-sm font-semibold px-3 py-1.5 bg-indigo-600 text-white rounded-lg">
            Try free
          </Link>
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-6 py-4 space-y-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-gray-700 hover:text-indigo-600 py-2.5 border-b border-gray-50 last:border-0"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 flex gap-3">
            <Link href={`/${locale}/login`} className="flex-1 text-center py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg">
              Sign in
            </Link>
            <Link href={`/${locale}/signup`} className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg">
              Start free trial
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
