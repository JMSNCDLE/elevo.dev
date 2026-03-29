'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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
    else { router.push(`/${locale}/dashboard`) }
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
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your ELEVO AI account</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              autoComplete="email" required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              autoComplete="current-password" required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              placeholder="••••••••" />
          </div>
          <div className="flex justify-end">
            <Link href={`/${locale}/forgot-password`} className="text-sm text-indigo-600 hover:underline">Forgot password?</Link>
          </div>
          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href={`/${locale}/signup`} className="text-indigo-600 font-medium hover:underline">Sign up free</Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-6">
          SSL encrypted · GDPR compliant · ™ ELEVO AI
        </p>
      </div>
    </div>
  )
}
