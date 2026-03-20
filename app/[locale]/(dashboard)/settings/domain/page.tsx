'use client'

import { useState, useEffect } from 'react'
import { Globe, Check, X, Loader2, Lock } from 'lucide-react'
import { useLocale } from 'next-intl'

export default function DomainPage() {
  const locale = useLocale()
  const [subdomain, setSubdomain] = useState('')
  const [currentSubdomain, setCurrentSubdomain] = useState<string | null>(null)
  const [availability, setAvailability] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/tenant/subdomain')
      .then(r => r.json())
      .then(d => {
        if (d.subdomain) {
          setCurrentSubdomain(d.subdomain)
          setSubdomain(d.subdomain)
        }
      })
      .catch(console.error)
  }, [])

  async function checkAvailability(value: string) {
    if (!value || value.length < 3) {
      setAvailability(null)
      return
    }

    setChecking(true)
    try {
      const r = await fetch(`/api/tenant/subdomain?subdomain=${encodeURIComponent(value)}`)
      const d = await r.json()
      setAvailability(d.available)
    } catch {
      setAvailability(null)
    } finally {
      setChecking(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSubdomain(val)
    setAvailability(null)
    setSaved(false)
    setError(null)

    if (val.length >= 3) {
      const timer = setTimeout(() => checkAvailability(val), 500)
      return () => clearTimeout(timer)
    }
  }

  async function handleSave() {
    if (!subdomain || subdomain.length < 3) return
    setSaving(true)
    setError(null)

    try {
      const r = await fetch('/api/tenant/subdomain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain }),
      })
      const d = await r.json()

      if (!r.ok) {
        setError(d.error ?? 'Failed to save subdomain')
      } else {
        setCurrentSubdomain(subdomain)
        setSaved(true)
        setAvailability(null)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
          <Globe size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-dashText">Custom Domain</h1>
          <p className="text-dashMuted text-sm">Set your custom *.elevo.ai subdomain</p>
        </div>
      </div>

      <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-dashText mb-4">Your ELEVO subdomain</h2>

        {currentSubdomain && (
          <div className="bg-dashSurface border border-dashSurface2 rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
            <Check size={14} className="text-green-400" />
            <span className="text-sm text-dashMuted">Current: </span>
            <span className="text-sm font-mono text-dashText">{currentSubdomain}.elevo.ai</span>
          </div>
        )}

        <div className="flex items-center gap-0">
          <div className="relative flex-1">
            <input
              type="text"
              value={subdomain}
              onChange={handleChange}
              placeholder="my-business"
              maxLength={30}
              className="w-full bg-dashSurface border border-dashSurface2 border-r-0 rounded-l-lg px-4 py-2.5 text-dashText text-sm focus:outline-none focus:border-accent/50 pr-10"
            />
            {checking && (
              <Loader2 size={14} className="absolute right-3 top-3 text-dashMuted animate-spin" />
            )}
            {!checking && availability === true && (
              <Check size={14} className="absolute right-3 top-3 text-green-400" />
            )}
            {!checking && availability === false && (
              <X size={14} className="absolute right-3 top-3 text-red-400" />
            )}
          </div>
          <div className="bg-dashSurface border border-dashSurface2 rounded-none px-3 py-2.5 text-dashMuted text-sm select-none">
            .elevo.ai
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !subdomain || subdomain.length < 3 || availability === false}
            className="bg-accent text-white px-4 py-2.5 rounded-r-lg text-sm font-semibold hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? 'Saved!' : 'Save'}
          </button>
        </div>

        {!checking && availability === false && (
          <p className="text-xs text-red-400 mt-2">That subdomain is already taken.</p>
        )}
        {!checking && availability === true && subdomain && (
          <p className="text-xs text-green-400 mt-2">{subdomain}.elevo.ai is available!</p>
        )}
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

        <p className="text-xs text-dashMuted mt-4">
          Subdomains must be 3–30 characters and can only contain lowercase letters, numbers, and hyphens.
        </p>
      </div>

      {/* Galaxy: custom domain */}
      <div className="bg-dashCard border border-accent/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={14} className="text-accent" />
          <h2 className="text-sm font-semibold text-dashText">Custom Domain</h2>
          <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded font-medium">Galaxy</span>
        </div>
        <p className="text-sm text-dashMuted mb-4">
          Point your own domain (e.g. app.yourbusiness.com) to your ELEVO dashboard. Available on the Galaxy plan.
        </p>
        <button
          onClick={() => window.location.href = `/${locale}/pricing`}
          className="text-sm text-accent font-semibold hover:underline"
        >
          Upgrade to Galaxy →
        </button>
      </div>
    </div>
  )
}
