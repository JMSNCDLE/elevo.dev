'use client'

import { useState, useEffect } from 'react'
import { Palette, Loader2, Check, Eye } from 'lucide-react'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import { useLocale } from 'next-intl'
import { createBrowserClient } from '@/lib/supabase/client'
import { ADMIN_IDS } from '@/lib/admin'

interface Config {
  brandName: string
  primaryColor: string
  accentColor: string
  logoUrl: string
  hideElevoBranding: boolean
  customCss: string
}

interface ProfileData {
  plan: string
  config: Config | null
}

export default function WhiteLabelPage() {
  const locale = useLocale()
  const [plan, setPlan] = useState<string>('trial')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [config, setConfig] = useState<Config>({
    brandName: 'My Business AI',
    primaryColor: '#6366F1',
    accentColor: '#4F46E5',
    logoUrl: '',
    hideElevoBranding: false,
    customCss: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const supabase = createBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()
        const [profileRes, configRes] = await Promise.all([
          fetch('/api/auth/me').catch(() => null),
          fetch('/api/white-label/config'),
        ])

        if (profileRes?.ok) {
          const pd: ProfileData = await profileRes.json()
          setPlan(user && ADMIN_IDS.includes(user.id) ? 'galaxy' : pd.plan)
        }

        if (configRes.ok) {
          const { config: existing } = await configRes.json()
          if (existing) {
            setConfig({
              brandName: existing.brand_name ?? '',
              primaryColor: existing.primary_color ?? '#6366F1',
              accentColor: existing.accent_color ?? '#4F46E5',
              logoUrl: existing.logo_url ?? '',
              hideElevoBranding: existing.hide_elevo_branding ?? false,
              customCss: existing.custom_css ?? '',
            })
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)

    try {
      const r = await fetch('/api/white-label/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: config.brandName,
          primaryColor: config.primaryColor,
          accentColor: config.accentColor,
          logoUrl: config.logoUrl || undefined,
          hideElevoBranding: config.hideElevoBranding,
          customCss: config.customCss || undefined,
        }),
      })

      if (r.ok) setSaved(true)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-dashMuted" size={24} />
      </div>
    )
  }

  if (plan !== 'galaxy') {
    return <UpgradePrompt locale={locale} feature="White-label branding" />
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
          <Palette size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-dashText">White-label Branding</h1>
          <p className="text-dashMuted text-sm">Customise ELEVO with your own brand</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Brand Name */}
        <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-5">
          <label className="block text-sm font-medium text-dashText mb-2">Brand Name</label>
          <input
            type="text"
            value={config.brandName}
            onChange={e => setConfig(prev => ({ ...prev, brandName: e.target.value }))}
            className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-dashText text-sm focus:outline-none focus:border-accent/50"
            placeholder="My Business AI"
          />
        </div>

        {/* Colors */}
        <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-5">
          <h3 className="text-sm font-medium text-dashText mb-4">Brand Colors</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-dashMuted mb-2">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={e => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0.5 bg-dashSurface"
                />
                <input
                  type="text"
                  value={config.primaryColor}
                  onChange={e => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="flex-1 bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-dashText text-sm font-mono focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-dashMuted mb-2">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.accentColor}
                  onChange={e => setConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0.5 bg-dashSurface"
                />
                <input
                  type="text"
                  value={config.accentColor}
                  onChange={e => setConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="flex-1 bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-dashText text-sm font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo URL */}
        <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-5">
          <label className="block text-sm font-medium text-dashText mb-2">Logo URL</label>
          <input
            type="url"
            value={config.logoUrl}
            onChange={e => setConfig(prev => ({ ...prev, logoUrl: e.target.value }))}
            className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-dashText text-sm focus:outline-none focus:border-accent/50"
            placeholder="https://yourdomain.com/logo.png"
          />
          {config.logoUrl && (
            <div className="mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={config.logoUrl} alt="Logo preview" className="h-10 object-contain" />
            </div>
          )}
        </div>

        {/* Hide ELEVO Branding */}
        <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dashText">Hide ELEVO Branding</p>
              <p className="text-xs text-dashMuted mt-0.5">Remove ELEVO AI logos and references</p>
            </div>
            <button
              onClick={() => setConfig(prev => ({ ...prev, hideElevoBranding: !prev.hideElevoBranding }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                config.hideElevoBranding ? 'bg-accent' : 'bg-dashSurface2'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  config.hideElevoBranding ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Custom CSS */}
        <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-5">
          <label className="block text-sm font-medium text-dashText mb-2">Custom CSS</label>
          <textarea
            value={config.customCss}
            onChange={e => setConfig(prev => ({ ...prev, customCss: e.target.value }))}
            rows={6}
            className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-dashText text-sm font-mono focus:outline-none focus:border-accent/50 resize-none"
            placeholder="/* Your custom CSS here */"
          />
        </div>

        {/* Preview */}
        <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Eye size={14} className="text-dashMuted" />
            <h3 className="text-sm font-medium text-dashText">Preview</h3>
          </div>
          <div
            className="rounded-xl p-4 border"
            style={{ background: '#0F1623', borderColor: config.primaryColor + '40' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: config.primaryColor }}
              >
                <span className="text-white text-xs font-bold">
                  {config.brandName.charAt(0)}
                </span>
              </div>
              <span className="font-bold text-white text-sm">{config.brandName}</span>
            </div>
            <div
              className="inline-block px-3 py-1.5 rounded-lg text-white text-xs font-semibold"
              style={{ background: config.primaryColor }}
            >
              Generate Content
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accentLight transition-colors disabled:opacity-50"
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> Saving...</>
          ) : saved ? (
            <><Check size={16} /> Saved!</>
          ) : (
            'Save White-label Config'
          )}
        </button>
      </div>
    </div>
  )
}
