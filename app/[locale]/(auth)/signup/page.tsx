'use client'

import { useLocale } from 'next-intl'
import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Lock, CheckCircle2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { signInWithGoogle, signInWithApple } from '@/lib/auth/oauth'

const testimonials = [
  { stars: 5, text: 'Saved me £2,400/mo', name: 'Mario', role: 'Plumber, Manchester' },
  { stars: 5, text: 'Replaced my marketing agency', name: 'Sarah', role: 'Dentist, Dublin' },
  { stars: 5, text: 'Best decision for my café', name: 'Jean-Paul', role: 'Café owner, Madrid' },
]

const chips = ['ELEVO Write™', 'ELEVO Ads™', 'ELEVO Spy™', 'ELEVO CEO™', 'ELEVO Market™', 'ELEVO Stitch™']

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
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(true)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const strength = getPasswordStrength(password)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) { setError('Please agree to the Terms of Service to continue.'); return }
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  const handleGoogle = async () => {
    setOauthLoading('google')
    await signInWithGoogle()
  }

  const handleApple = async () => {
    setOauthLoading('apple')
    await signInWithApple()
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#FFFEF9] flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5 animate-bounce-slow">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#0D0F1A] mb-2">Check your inbox</h2>
          <p className="text-gray-500 text-sm mb-1">We sent a confirmation link to</p>
          <p className="font-semibold text-indigo-600 mb-5">{email}</p>
          <p className="text-gray-500 text-sm mb-6">Click the link to activate your account and start your 7-day free trial.</p>
          <div className="space-y-2">
            {email.includes('@gmail') && (
              <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 h-11 bg-[#EA4335] text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Open Gmail
              </a>
            )}
            {(email.includes('@outlook') || email.includes('@hotmail') || email.includes('@live')) && (
              <a href="https://outlook.live.com" target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 h-11 bg-[#0078d4] text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">
                Open Outlook
              </a>
            )}
            <a href={`mailto:${email}`}
              className="w-full flex items-center justify-center gap-2 h-11 border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">
              Open Mail App
            </a>
          </div>
          <p className="mt-5 text-xs text-gray-400">Didn&apos;t receive it? Check your spam folder first.</p>
          <p className="mt-1 text-xs text-gray-400">Email expires in 24 hours · sent from hello@elevo.ai</p>
        </div>
        <style jsx>{`
          @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
          .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        `}</style>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT BRAND PANEL (hidden on mobile) ─────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#080C14] flex-col justify-between px-10 py-10 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.04] auth-dot-grid" />

        {/* Indigo glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/40">
            <span className="text-white font-bold text-base">E</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">ELEVO AI™</span>
        </div>

        {/* Centre content */}
        <div className="relative space-y-8">
          {/* Floating chips */}
          <div className="flex flex-wrap gap-2">
            {chips.map((chip, i) => (
              <span
                key={chip}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 animate-float"
                style={{ animationDelay: `${i * 0.4}s` }}
              >
                {chip}
              </span>
            ))}
          </div>

          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              The AI operating system™<br />for your business
            </h2>
            <p className="mt-3 text-indigo-200/70 text-base">
              7 days free · No card required · Cancel anytime
            </p>
          </div>

          {/* Testimonials */}
          <div className="space-y-3">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-white text-sm font-medium">&ldquo;{t.text}&rdquo;</p>
                <p className="text-indigo-300/60 text-xs mt-0.5">— {t.name}, {t.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust */}
        <div className="relative flex items-center gap-2 text-xs text-indigo-300/50">
          <Lock size={12} />
          <span>SSL encrypted · GDPR compliant · ™ ELEVO AI</span>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ─────────────────────────────────────── */}
      <div className="flex-1 bg-[#FFFEF9] flex flex-col">
        {/* Mobile header strip */}
        <div className="lg:hidden bg-indigo-600 px-6 py-4 flex items-center gap-2">
          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="text-white font-bold text-base">ELEVO AI™</span>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            {/* Header */}
            <div className="mb-7">
              <h1 className="text-[28px] font-bold text-[#0D0F1A]">Start your free trial</h1>
              <p className="mt-1 text-sm text-gray-500">7 days free · No card required · Cancel anytime</p>
            </div>

            {/* Social login */}
            <div className="space-y-3 mb-5">
              <button
                onClick={handleGoogle}
                disabled={oauthLoading !== null}
                className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm hover:scale-[1.02] hover:shadow-md transition-all disabled:opacity-60"
              >
                {oauthLoading === 'google' ? (
                  <Loader2 size={18} className="animate-spin text-gray-400" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Sign up with Google <span className="text-xs text-gray-400 font-normal">(recommended)</span>
              </button>

              <button
                onClick={handleApple}
                disabled={oauthLoading !== null}
                className="w-full h-12 flex items-center justify-center gap-3 bg-black border border-black rounded-xl text-sm font-medium text-white shadow-sm hover:scale-[1.02] hover:shadow-md transition-all disabled:opacity-60"
              >
                {oauthLoading === 'apple' ? (
                  <Loader2 size={18} className="animate-spin text-white/60" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                )}
                Sign up with Apple
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 whitespace-nowrap">or continue with email</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Email form */}
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder=" "
                  className="peer w-full px-3 pt-5 pb-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                />
                <label
                  htmlFor="email"
                  className="absolute left-3 top-1 text-xs text-gray-400 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs"
                >
                  Email address
                </label>
              </div>

              <div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder=" "
                    className="peer w-full px-3 pt-5 pb-2 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  />
                  <label
                    htmlFor="password"
                    className="absolute left-3 top-1 text-xs text-gray-400 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs"
                  >
                    Password (min. 8 characters)
                  </label>
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
                      <span className="text-xs text-gray-400">Password strength</span>
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
                <div className="relative mt-0.5">
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
                  <Link href="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
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
                className="w-full h-12 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 hover:scale-[1.01] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Creating account...' : 'Create free account →'}
              </button>
            </form>

            {/* Password manager hint */}
            <p className="mt-4 text-center text-xs text-gray-400">
              🔒 Compatible with Apple Keychain, 1Password &amp; Google Passwords
            </p>

            <p className="mt-5 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href={`/${locale}/login`} className="text-indigo-600 font-medium hover:underline">
                Sign in →
              </Link>
            </p>

            {/* Bottom trust */}
            <p className="mt-6 text-center text-xs text-gray-300">
              SSL encrypted · GDPR compliant · ™ ELEVO AI
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
