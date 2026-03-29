'use client'

import { useState } from 'react'
import { Bookmark, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import ActionExplanation from '@/components/shared/ActionExplanation'
import CopyButton from '@/components/shared/CopyButton'
import type { GenerationOutput } from '@/lib/agents/types'

type AgentStatus = 'idle' | 'thinking' | 'generating' | 'done' | 'error'

interface GeneratorShellProps {
  title: string
  description?: string
  formContent: React.ReactNode
  output: GenerationOutput | null
  status: AgentStatus
  onRegenerate?: () => void
}

type TabKey = 'primary' | 'alt1' | 'alt2' | 'seo'

export default function GeneratorShell({
  title,
  description,
  formContent,
  output,
  status,
  onRegenerate,
}: GeneratorShellProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('primary')
  const [saving, setSaving] = useState(false)

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'primary', label: 'Primary' },
    { key: 'alt1', label: 'Alternative 1' },
    { key: 'alt2', label: 'Alternative 2' },
    { key: 'seo', label: 'SEO Info' },
  ]

  const activeContent =
    activeTab === 'primary'
      ? output?.primary
      : activeTab === 'alt1'
      ? output?.alternatives?.[0]
      : activeTab === 'alt2'
      ? output?.alternatives?.[1]
      : null

  const saveToLibrary = async () => {
    if (!output) return
    setSaving(true)
    try {
      await fetch('/api/generate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: output.primary, type: output.contentType }),
      })
      toast.success('Saved to library')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-dashBg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dashText">{title}</h1>
          {description && <p className="text-dashMuted mt-1 text-sm">{description}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form panel */}
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
            <h2 className="text-sm font-semibold text-dashText mb-4 uppercase tracking-wide">Settings</h2>
            {formContent}
          </div>

          {/* Output panel */}
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-dashText uppercase tracking-wide">Output</h2>
              <AgentStatusIndicator status={status} />
            </div>

            {!output && status === 'idle' && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-dashMuted text-sm text-center">
                  Fill in the settings and click Generate to create your content.
                </p>
              </div>
            )}

            {(status === 'thinking' || status === 'generating') && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-dashMuted text-sm">ELEVO is crafting your content...</p>
              </div>
            )}

            {output && status !== 'thinking' && status !== 'generating' && (
              <div className="flex-1 flex flex-col">
                {/* Tabs */}
                <div className="flex gap-1 mb-4 bg-dashSurface rounded-lg p-1">
                  {tabs.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-colors ${
                        activeTab === tab.key
                          ? 'bg-dashCard text-dashText shadow-sm'
                          : 'text-dashMuted hover:text-dashText'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Content */}
                {activeTab === 'seo' ? (
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl font-bold ${
                        (output.seoScore?.score ?? 0) >= 80 ? 'text-green-400' : (output.seoScore?.score ?? 0) >= 60 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {output.seoScore?.score ?? 0}
                      </div>
                      <div className="text-sm text-dashMuted">SEO Score</div>
                    </div>
                    {output.seoScore && (
                      <div className="space-y-2 text-sm">
                        {([
                          { key: 'keywordPresence', label: 'Keyword presence' },
                          { key: 'localRelevance', label: 'Local relevance' },
                          { key: 'ctaPresent', label: 'CTA present' },
                          { key: 'lengthOk', label: 'Length optimal' },
                          { key: 'readabilityOk', label: 'Readability' },
                        ] as const).map(({ key, label }) => (
                          <div key={key} className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${output.seoScore![key] ? 'bg-green-400' : 'bg-red-400'}`} />
                            <span className="text-dashMuted">{label}</span>
                          </div>
                        ))}
                        <p className="text-dashMuted mt-2">{output.seoScore.feedback}</p>
                      </div>
                    )}
                    {output.hashtags && output.hashtags.length > 0 && (
                      <div>
                        <p className="text-xs text-dashMuted mb-1">Hashtags</p>
                        <p className="text-accent text-sm">{output.hashtags.join(' ')}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col gap-3">
                    {activeContent ? (
                      <>
                        <textarea
                          readOnly
                          value={activeContent}
                          className="flex-1 bg-dashSurface border border-dashSurface2 rounded-lg p-3 text-sm text-dashText resize-none focus:outline-none min-h-[200px]"
                        />
                        <ActionExplanation
                          contentType={output.contentType}
                          seoScore={output.seoScore?.score}
                          wordCount={output.wordCount}
                        />
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-dashMuted text-sm">No alternative generated.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-dashSurface2">
                  <div className="flex gap-3">
                    {activeContent && <CopyButton text={activeContent} />}
                    <button
                      onClick={saveToLibrary}
                      disabled={saving}
                      className="flex items-center gap-1.5 text-sm text-dashMuted hover:text-dashText transition-colors"
                    >
                      <Bookmark size={14} />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                  {onRegenerate && (
                    <button
                      onClick={onRegenerate}
                      className="flex items-center gap-1.5 text-sm text-accent hover:text-accentLight transition-colors"
                    >
                      <RefreshCw size={14} />
                      Regenerate
                    </button>
                  )}
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-red-400 text-sm mb-2">Generation failed.</p>
                  {onRegenerate && (
                    <button onClick={onRegenerate} className="text-accent text-sm hover:underline">
                      Try again
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
