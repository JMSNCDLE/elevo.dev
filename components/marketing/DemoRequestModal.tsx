'use client'

import { useState } from 'react'
import { X, Loader2, Check } from 'lucide-react'

interface DemoRequestModalProps {
  open: boolean
  onClose: () => void
}

const INTERESTS = [
  { value: 'marketing',   label: 'Marketing' },
  { value: 'sales',       label: 'Sales' },
  { value: 'content',     label: 'Content' },
  { value: 'operations',  label: 'Operations' },
  { value: 'everything',  label: 'Everything' },
] as const

export default function DemoRequestModal({ open, onClose }: DemoRequestModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [interest, setInterest] = useState<(typeof INTERESTS)[number]['value']>('everything')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const r = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), company: company.trim() || undefined, interest }),
      })
      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        throw new Error(typeof data.error === 'string' ? data.error : 'Could not send request')
      }
      setSubmitted(true)
      setTimeout(() => {
        onClose()
        // reset for next open
        setSubmitted(false)
        setName('')
        setEmail('')
        setCompany('')
        setInterest('everything')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0F0F1E] border border-white/10 rounded-2xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Request a demo</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-500/15 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Thanks — we&apos;ll be in touch!</h3>
            <p className="text-sm text-white/60">
              We&apos;ll email you within 24 hours to schedule your personalised walkthrough.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-4">
            <p className="text-sm text-white/60">
              See ELEVO in action with a personalised walkthrough. Takes ~20 minutes.
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
              <label className="block text-xs font-medium text-white/70 mb-1.5">Work email *</label>
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
              <label className="block text-xs font-medium text-white/70 mb-1.5">Company <span className="text-white/30">(optional)</span></label>
              <input
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Acme Inc."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">What are you most interested in?</label>
              <select
                value={interest}
                onChange={e => setInterest(e.target.value as typeof interest)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/60"
              >
                {INTERESTS.map(i => <option key={i.value} value={i.value} className="bg-[#0F0F1E]">{i.label}</option>)}
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
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : 'Request demo →'}
            </button>

            <p className="text-[11px] text-white/40 text-center">
              No credit card required. We&apos;ll never spam you.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
