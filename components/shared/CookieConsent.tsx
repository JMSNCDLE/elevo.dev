'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConsentPreferences {
  analytics: boolean
  marketing: boolean
  personalisation: boolean
}

const STORAGE_KEY = 'elevo_consent_v2'

export default function CookieConsent() {
  const [shown, setShown] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    analytics: true,
    marketing: true,
    personalisation: true,
  })

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        setShown(true)
      }
    } catch {
      setShown(true)
    }
  }, [])

  function saveConsent(prefs: ConsentPreferences) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ts: Date.now(), ...prefs })
      )
    } catch {
      // localStorage not available
    }
    setShown(false)
    setModalOpen(false)
  }

  function handleEssentialOnly() {
    saveConsent({ analytics: false, marketing: false, personalisation: false })
  }

  function handleAcceptAll() {
    saveConsent({ analytics: true, marketing: true, personalisation: true })
  }

  function handleSavePreferences() {
    saveConsent(preferences)
  }

  function handleClose() {
    setShown(false)
    setModalOpen(false)
  }

  if (!shown) return null

  return (
    <>
      {/* Cookie bar */}
      <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Sparkles size={16} className="text-indigo-600" />
              </div>
              <p className="text-sm text-gray-600">
                We use cookies to improve your experience and analyse site traffic.{' '}
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-indigo-600 underline hover:text-indigo-700 transition-colors"
                >
                  Manage preferences
                </button>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleEssentialOnly}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 hover:text-gray-800 transition-colors whitespace-nowrap"
              >
                Essential only
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Sparkles size={18} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Cookie preferences</h2>
                <p className="text-xs text-gray-500">Control what data we collect</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {/* Essential — always on */}
              <div className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Essential</p>
                  <p className="text-xs text-gray-500 mt-0.5">Required for the site to function. Cannot be disabled.</p>
                </div>
                <div className="shrink-0">
                  <div className="w-10 h-6 bg-indigo-600 rounded-full flex items-center justify-end pr-0.5 cursor-not-allowed opacity-70">
                    <div className="w-5 h-5 bg-white rounded-full shadow" />
                  </div>
                </div>
              </div>

              {/* Analytics */}
              <ToggleRow
                label="Analytics"
                description="Helps us understand how visitors use the site."
                checked={preferences.analytics}
                onChange={v => setPreferences(p => ({ ...p, analytics: v }))}
              />

              {/* Marketing */}
              <ToggleRow
                label="Marketing"
                description="Used to deliver personalised advertisements."
                checked={preferences.marketing}
                onChange={v => setPreferences(p => ({ ...p, marketing: v }))}
              />

              {/* Personalisation */}
              <ToggleRow
                label="Personalisation"
                description="Remembers your preferences for a better experience."
                checked={preferences.personalisation}
                onChange={v => setPreferences(p => ({ ...p, personalisation: v }))}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleEssentialOnly}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                Essential only
              </button>
              <button
                onClick={handleSavePreferences}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
              >
                Save preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded-xl">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'shrink-0 w-10 h-6 rounded-full flex items-center transition-colors duration-200',
          checked ? 'bg-indigo-600 justify-end pr-0.5' : 'bg-gray-200 justify-start pl-0.5'
        )}
      >
        <div className="w-5 h-5 bg-white rounded-full shadow" />
      </button>
    </div>
  )
}
