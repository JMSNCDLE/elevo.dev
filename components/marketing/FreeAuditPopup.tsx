'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { X, Loader2, Check, Sparkles } from 'lucide-react'

const SESSION_KEY = 'elevo_audit_shown'
const TIME_DELAY_MS = 30000  // 30s
const SCROLL_THRESHOLD = 0.5  // 50%

const CHALLENGES = [
  'Getting more customers',
  'Managing social media',
  'Creating content',
  'Saving time',
  'Growing revenue',
  'Other',
]

export default function FreeAuditPopup() {
  const pathname = usePathname()
  const [shown, setShown] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [challenge, setChallenge] = useState(CHALLENGES[0])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Only run on marketing pages — not dashboard, auth, demo
  const isMarketing =
    !!pathname &&
    !pathname.includes('/dashboard') &&
    !pathname.includes('/login') &&
    !pathname.includes('/signup') &&
    !pathname.includes('/onboarding') &&
    !pathname.includes('/demo')

  useEffect(() => {
    if (!isMarketing) return
    if (typeof window === 'undefined') return
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return
    } catch { /* ignore */ }

    let triggered = false
    const trigger = () => {
      if (triggered) return
      triggered = true
      setShown(true)
      try { sessionStorage.setItem(SESSION_KEY, 'true') } catch { /* ignore */ }
    }

    const timer = setTimeout(trigger, TIME_DELAY_MS)

    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight
      const total = document.documentElement.scrollHeight
      if (total > 0 && scrolled / total >= SCROLL_THRESHOLD) {
        trigger()
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [isMarketing])

  function close() {
    setShown(false)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const r = await fetch('/api/leads/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          website: website.trim() || undefined,
          challenge,
        }),
      })
      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        throw new Error(typeof data.error === 'string' ? data.error : 'Could not submit')
      }
      setSubmitted(true)
      setTimeout(() => {
        setShown(false)
      }, 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (!shown || !isMarketing) return null

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0F0F1E] border border-white/10 rounded-2xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Free AI Business Audit</h2>
          </div>
          <button onClick={close} className="text-white/50 hover:text-white" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-500/15 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Audit on the way!</h3>
            <p className="text-sm text-white/60">
              We&apos;ll send your personalised audit within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-4">
            <p className="text-sm text-white/60">
              See exactly how ELEVO&apos;s AI agents can grow your business. Takes 2 minutes.
            </p>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Name *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Email *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Business website <span className="text-white/30">(optional)</span></label>
              <input
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://yourbusiness.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Biggest challenge</label>
              <select
                value={challenge}
                onChange={e => setChallenge(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/60"
              >
                {CHALLENGES.map(c => <option key={c} value={c} className="bg-[#0F0F1E]">{c}</option>)}
              </select>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !name.trim() || !email.trim()}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : 'Get my free audit →'}
            </button>

            <p className="text-[11px] text-white/40 text-center">
              No credit card. We&apos;ll never spam you.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
