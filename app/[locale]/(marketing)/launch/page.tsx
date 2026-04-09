'use client'

import { useState, useEffect } from 'react'
import { Rocket, CheckCircle2, Loader2 } from 'lucide-react'

export default function LaunchPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [count, setCount] = useState(0)

  useEffect(() => {
    fetch('/api/waitlist')
      .then(r => r.json())
      .then(d => setCount(d.count || 0))
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'launch-page' }),
      })
      if (res.ok) {
        setStatus('success')
        setCount(c => c + 1)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-[#050507] flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">
      <div className="hero-beam" />
      <div className="grid-overlay" />

      <div className="relative z-10 max-w-xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8">
          <Rocket className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-indigo-400">LAUNCHING APRIL 28</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-none mb-6">
          ELEVO AI<br />
          <span className="gradient-text-hero">launches April 28</span>
        </h1>

        <p className="text-white/50 text-lg mb-4 max-w-md mx-auto">
          Get early access + <span className="text-white font-semibold">30% off</span> your first 3 months.
        </p>

        <p className="text-white/30 text-sm mb-8">
          60+ AI agents that replace your entire team. Content, marketing, sales, CRM, analytics — all in one platform.
        </p>

        {status === 'success' ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
            <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">You&apos;re on the list!</p>
            <p className="text-white/50 text-sm">We&apos;ll email you on launch day with your exclusive early access link and discount code.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
            >
              {status === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                'Get early access'
              )}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-red-400 text-sm mt-3">Something went wrong. Please try again.</p>
        )}

        {count > 0 && (
          <p className="text-white/20 text-sm mt-6">
            Join {count.toLocaleString()} others waiting for launch
          </p>
        )}

        <div className="mt-16 grid grid-cols-3 gap-6 text-center">
          {[
            { value: '60+', label: 'AI Agents' },
            { value: '€39', label: 'Starting price' },
            { value: '7 days', label: 'Free trial' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-white/30 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
