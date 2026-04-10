'use client'

import { useEffect, useState } from 'react'
import { Mail, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Prefs {
  digest: boolean
  trial: boolean
  reengagement: boolean
}

export default function EmailPreferences() {
  const [prefs, setPrefs] = useState<Prefs | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/user/email-preferences')
      .then(r => r.json())
      .then(data => {
        if (data?.error) return
        setPrefs({ digest: data.digest, trial: data.trial, reengagement: data.reengagement })
      })
      .catch(() => {})
  }, [])

  async function toggle(key: keyof Prefs) {
    if (!prefs) return
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    setSaving(true)
    try {
      const fieldMap: Record<keyof Prefs, string> = {
        digest: 'email_digest_enabled',
        trial: 'email_trial_reminders_enabled',
        reengagement: 'email_reengagement_enabled',
      }
      const res = await fetch('/api/user/email-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [fieldMap[key]]: next[key] }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Preferences saved')
    } catch {
      setPrefs(prefs)
      toast.error('Could not save')
    } finally {
      setSaving(false)
    }
  }

  if (!prefs) {
    return (
      <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-dashMuted" />
          <h3 className="text-sm font-semibold text-dashText">Email Preferences</h3>
        </div>
        <Loader2 className="w-4 h-4 text-dashMuted animate-spin" />
      </div>
    )
  }

  const items: Array<{ key: keyof Prefs; label: string; desc: string }> = [
    { key: 'digest', label: 'Weekly activity digest', desc: 'Mondays — your week in review with stats and tips' },
    { key: 'trial', label: 'Trial reminders', desc: 'Notifications before your trial ends (cannot disable on active trial)' },
    { key: 'reengagement', label: 'Re-engagement emails', desc: 'A friendly nudge if you haven&apos;t logged in for a few days' },
  ]

  return (
    <div className="bg-dashCard border border-dashSurface2 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Mail className="w-4 h-4 text-dashMuted" />
        <h3 className="text-sm font-semibold text-dashText">Email Preferences</h3>
        {saving && <Loader2 className="w-3 h-3 text-dashMuted animate-spin ml-1" />}
      </div>
      <p className="text-xs text-dashMuted mb-4">Welcome emails, invoices, and security alerts cannot be disabled.</p>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.key} className="flex items-start justify-between gap-4 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dashText">{item.label}</p>
              <p className="text-xs text-dashMuted mt-0.5" dangerouslySetInnerHTML={{ __html: item.desc }} />
            </div>
            <button
              onClick={() => toggle(item.key)}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                prefs[item.key] ? 'bg-accent' : 'bg-dashSurface2'
              }`}
              aria-pressed={prefs[item.key]}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                  prefs[item.key] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
