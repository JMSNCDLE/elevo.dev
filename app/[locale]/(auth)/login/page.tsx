'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const t = useTranslations('login')
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else {
      if (rememberMe) localStorage.setItem('elevo-remember-me', 'true')
      router.push(`/${locale}/dashboard`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFEF9]">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Image src="/logo.svg" alt="ELEVO AI™" width={32} height={32} className="rounded-lg logo-spin" priority />
            <span className="font-bold text-gray-900">ELEVO AI</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500 mt-1">{t('subtitle')}</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('emailLabel')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              autoComplete="email" required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              placeholder={t('emailPlaceholder')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('passwordLabel')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              autoComplete="current-password" required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              placeholder="••••••••" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="rounded border-gray-300" />
              {t('keepMeSignedIn')}
            </label>
            <Link href={`/${locale}/forgot-password`} className="text-sm text-indigo-600 hover:underline">{t('forgotPassword')}</Link>
          </div>
          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
            {loading ? t('signingIn') : t('signInButton')}
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-6">
          {t('noAccount')}{' '}
          <Link href={`/${locale}/signup`} className="text-indigo-600 font-medium hover:underline">{t('signUpLink')}</Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-6">
          {t('securityNote')}
        </p>
      </div>
    </div>
  )
}
