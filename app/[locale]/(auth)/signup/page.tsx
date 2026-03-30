'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'

function getPasswordStrength(password: string): { label: string; color: string; pct: number } {
  if (!password) return { label: '', color: '', pct: 0 }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', pct: 20 }
  if (score === 2) return { label: 'Good', color: 'bg-amber-500', pct: 50 }
  if (score === 3) return { label: 'Strong', color: 'bg-emerald-500', pct: 75 }
  return { label: 'Excellent', color: 'bg-indigo-500', pct: 100 }
}

export default function SignupPage() {
  const t = useTranslations('signup')
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const strength = getPasswordStrength(password)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) { setError(t('agreeError')); return }
    setError('')
    setLoading(true)

    const supabase = createBrowserClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/${locale}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // If session exists immediately, email confirmation is OFF — go straight to dashboard
    if (data.session) {
      router.push(`/${locale}/dashboard`)
      return
    }

    // Otherwise email confirmation is ON — show "check your inbox" screen
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#FFFEF9] flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('checkInbox')}</h2>
          <p className="text-gray-500 text-sm mb-1">{t('sentLink')}</p>
          <p className="font-semibold text-indigo-600 mb-5">{email}</p>
          <p className="text-gray-500 text-sm mb-6">{t('activateText')}</p>
          <p className="text-xs text-gray-400">{t('spamNote')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFEF9]">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-gray-900">ELEVO AI</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500 mt-1">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('emailLabel')}</label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              placeholder={t('emailPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('passwordLabel')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">{t('passwordStrength')}</span>
                  <span className={`text-xs font-medium ${strength.pct >= 75 ? 'text-emerald-600' : strength.pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.pct}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${agreed ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}>
                {agreed && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
              </div>
            </div>
            <span className="text-xs text-gray-500">
              I agree to the{' '}
              <Link href={`/${locale}/terms`} className="text-indigo-600 hover:underline">{t('termsLink')}</Link>
              {' '}&amp;{' '}
              <Link href={`/${locale}/privacy`} className="text-indigo-600 hover:underline">{t('privacyLink')}</Link>
            </span>
          </label>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? t('creating') : t('createButton')}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          {t('haveAccount')}{' '}
          <Link href={`/${locale}/login`} className="text-indigo-600 font-medium hover:underline">{t('signInLink')}</Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-4">
          {t('securityNote')}
        </p>
      </div>
    </div>
  )
}
