'use client'

import { useState } from 'react'
import { Eye, Copy, Check, ExternalLink } from 'lucide-react'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import type { VisionImageType, VisionOutput } from '@/lib/agents/visionAgent'

// ─── Image types ──────────────────────────────────────────────────────────────

const IMAGE_TYPES: Array<{
  type: VisionImageType
  label: string
  emoji: string
  desc: string
}> = [
  { type: 'ad_creative', label: 'Ad Creative', emoji: '📢', desc: 'Paid social or display ads' },
  { type: 'social_graphic', label: 'Social Graphic', emoji: '📱', desc: 'Instagram, Facebook, TikTok' },
  { type: 'product_mockup', label: 'Product Mockup', emoji: '🛍️', desc: 'Product photography style' },
  { type: 'brand_visual', label: 'Brand Visual', emoji: '🎨', desc: 'Brand identity imagery' },
  { type: 'website_hero', label: 'Website Hero', emoji: '🌐', desc: 'Hero banner or header' },
  { type: 'logo_concept', label: 'Logo Concept', emoji: '🏷️', desc: 'Logo and brand mark ideas' },
  { type: 'restaurant_promo', label: 'Restaurant Promo', emoji: '🍽️', desc: 'Food, menu, ambiance shots' },
  { type: 'lifestyle_photo', label: 'Lifestyle Photo', emoji: '📸', desc: 'Authentic lifestyle imagery' },
]

const STYLE_OPTIONS = ['Photorealistic', 'Illustrated', 'Minimalist', 'Cinematic', 'Abstract']
const PLATFORM_OPTIONS = ['Instagram', 'Facebook', 'Website', 'Print', 'TikTok', 'YouTube']

type PromptPlatform = 'midjourney' | 'dalle3' | 'stableDiffusion' | 'ideogram' | 'adobeFirefly' | 'canvaAI'

const PLATFORM_TABS: Array<{ key: PromptPlatform; label: string; url: string; color: string }> = [
  { key: 'midjourney', label: 'Midjourney', url: 'https://www.midjourney.com', color: 'text-blue-400' },
  { key: 'dalle3', label: 'DALL·E 3', url: 'https://chat.openai.com', color: 'text-green-400' },
  { key: 'stableDiffusion', label: 'Stable Diffusion', url: 'https://stability.ai', color: 'text-purple-400' },
  { key: 'ideogram', label: 'Ideogram', url: 'https://ideogram.ai', color: 'text-orange-400' },
  { key: 'adobeFirefly', label: 'Firefly', url: 'https://firefly.adobe.com', color: 'text-red-400' },
  { key: 'canvaAI', label: 'Canva AI', url: 'https://www.canva.com', color: 'text-cyan-400' },
]

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A2332] text-[#94A3B8] hover:text-[#EEF2FF] text-xs transition-colors"
    >
      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VisionPage() {
  const [selectedType, setSelectedType] = useState<VisionImageType | null>(null)
  const [description, setDescription] = useState('')
  const [style, setStyle] = useState('Photorealistic')
  const [platform, setPlatform] = useState('Instagram')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VisionOutput | null>(null)
  const [error, setError] = useState('')
  const [activePromptTab, setActivePromptTab] = useState<PromptPlatform>('midjourney')

  const handleGenerate = async () => {
    if (!selectedType || !description) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/vision/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfileId: 'primary',
          imageType: selectedType,
          description,
          style,
          platform,
          locale: 'en',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Generation failed')
        return
      }
      setResult(data as VisionOutput)

      // Highlight the recommended platform
      const recommended = PLATFORM_TABS.find(p => p.label.toLowerCase().includes(data.recommendedPlatform?.toLowerCase?.() ?? ''))
      if (recommended) setActivePromptTab(recommended.key)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const activeTab = PLATFORM_TABS.find(t => t.key === activePromptTab)
  const activePromptData = result?.prompts[activePromptTab]

  return (
    <div className="min-h-screen bg-[#080C14] px-6 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <Eye size={20} className="text-[#6366F1]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#EEF2FF]">ELEVO Vision™</h1>
              <p className="text-sm text-[#94A3B8]">AI Image Generation Studio · Orbit+</p>
            </div>
          </div>
        </div>

        {!result ? (
          <div className="space-y-6">
            {/* Image type grid */}
            <div>
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Image Type</p>
              <div className="grid grid-cols-4 gap-3">
                {IMAGE_TYPES.map(imgType => {
                  const isSelected = selectedType === imgType.type
                  return (
                    <button
                      key={imgType.type}
                      onClick={() => setSelectedType(imgType.type)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#6366F1] bg-[#6366F1]/10'
                          : 'border-[#1E2A3A] bg-[#1A2332] hover:border-[#6366F1]/40'
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{imgType.emoji}</span>
                      <p className={`font-semibold text-xs ${isSelected ? 'text-[#EEF2FF]' : 'text-[#CBD5E1]'}`}>{imgType.label}</p>
                      <p className="text-xs text-[#64748B] mt-0.5 leading-tight">{imgType.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">Describe the image *</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="e.g. A confident tradesperson standing in front of a branded van, wearing work gear, smiling, natural light, suburban street..."
                className="w-full bg-[#141B24] border border-[#1E2A3A] rounded-xl px-4 py-3 text-[#EEF2FF] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Style */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">Style</label>
                <div className="flex flex-col gap-1.5">
                  {STYLE_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition-colors ${
                        style === s
                          ? 'border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1]'
                          : 'border-[#1E2A3A] bg-[#141B24] text-[#94A3B8] hover:border-[#6366F1]/40'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">Platform / Use</label>
                <div className="flex flex-col gap-1.5">
                  {PLATFORM_OPTIONS.map(p => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition-colors ${
                        platform === p
                          ? 'border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1]'
                          : 'border-[#1E2A3A] bg-[#141B24] text-[#94A3B8] hover:border-[#6366F1]/40'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !selectedType || !description}
              className="w-full py-4 bg-[#6366F1] hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <AgentStatusIndicator status="generating" agentName="Iris" />
              ) : (
                <>
                  <Eye size={18} />
                  Generate Prompts → 1 credit
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Action bar */}
            <div className="flex items-center justify-between bg-[#1A2332] rounded-xl px-4 py-3">
              <div>
                <p className="font-semibold text-[#EEF2FF] capitalize">{result.imageType.replace('_', ' ')}</p>
                <p className="text-xs text-[#64748B]">{result.dimensions} · {result.fileFormat}</p>
              </div>
              <button
                onClick={() => setResult(null)}
                className="px-3 py-1.5 rounded-lg bg-[#141B24] text-[#94A3B8] hover:text-[#EEF2FF] text-sm transition-colors"
              >
                New prompts
              </button>
            </div>

            {/* Recommended platform */}
            {result.recommendedPlatform && (
              <div className="bg-green-500/5 border border-green-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-400">Recommended: {result.recommendedPlatform}</p>
                  <p className="text-xs text-[#64748B]">{result.recommendationReason}</p>
                </div>
              </div>
            )}

            {/* Platform tabs */}
            <div className="flex gap-1 bg-[#141B24] rounded-xl p-1 overflow-x-auto">
              {PLATFORM_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActivePromptTab(tab.key)}
                  className={`flex-1 min-w-0 py-2 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    activePromptTab === tab.key
                      ? 'bg-[#1A2332] text-[#EEF2FF]'
                      : 'text-[#64748B] hover:text-[#94A3B8]'
                  } ${result.recommendedPlatform?.toLowerCase().includes(tab.label.toLowerCase()) ? 'ring-1 ring-green-500/30' : ''}`}
                >
                  {tab.label}
                  {result.recommendedPlatform?.toLowerCase().includes(tab.label.toLowerCase()) && (
                    <span className="ml-1 text-green-400">★</span>
                  )}
                </button>
              ))}
            </div>

            {/* Active prompt */}
            {activePromptData && (
              <div className="bg-[#0D1219] rounded-xl border border-[#1E2A3A] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-bold ${activeTab?.color || 'text-[#EEF2FF]'}`}>{activeTab?.label}</p>
                  <div className="flex items-center gap-2">
                    <CopyButton text={'prompt' in activePromptData ? activePromptData.prompt : ''} label="Copy prompt" />
                    {activeTab?.url && (
                      <a
                        href={activeTab.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1A2332] text-[#94A3B8] hover:text-[#EEF2FF] text-xs transition-colors"
                      >
                        <ExternalLink size={12} />
                        Open {activeTab.label}
                      </a>
                    )}
                  </div>
                </div>

                {'prompt' in activePromptData && (
                  <div>
                    <p className="text-xs text-[#64748B] mb-1.5">Prompt</p>
                    <div className="bg-[#141B24] rounded-lg p-4 text-sm text-[#CBD5E1] leading-relaxed font-mono whitespace-pre-wrap">
                      {activePromptData.prompt}
                    </div>
                  </div>
                )}

                {activePromptTab === 'midjourney' && 'parameters' in activePromptData && (
                  <>
                    <div>
                      <p className="text-xs text-[#64748B] mb-1.5">Parameters</p>
                      <div className="bg-[#141B24] rounded-lg px-3 py-2 text-xs text-[#94A3B8] font-mono flex items-center justify-between">
                        <span>{activePromptData.parameters}</span>
                        <CopyButton text={activePromptData.parameters} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-1.5">Negative Prompt</p>
                      <div className="bg-[#141B24] rounded-lg px-3 py-2 text-xs text-red-400/80 font-mono flex items-center justify-between">
                        <span>{activePromptData.negativePrompt}</span>
                        <CopyButton text={activePromptData.negativePrompt} />
                      </div>
                    </div>
                    {activePromptData.tip && (
                      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-3 py-2">
                        <p className="text-xs text-yellow-400">💡 {activePromptData.tip}</p>
                      </div>
                    )}
                  </>
                )}

                {activePromptTab === 'stableDiffusion' && 'steps' in activePromptData && (
                  <>
                    <div>
                      <p className="text-xs text-[#64748B] mb-1.5">Negative Prompt</p>
                      <div className="bg-[#141B24] rounded-lg px-3 py-2 text-xs text-red-400/80 font-mono flex items-center justify-between">
                        <span>{activePromptData.negativePrompt}</span>
                        <CopyButton text={activePromptData.negativePrompt} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#141B24] rounded-lg px-3 py-2">
                        <p className="text-xs text-[#64748B]">Steps</p>
                        <p className="text-sm font-bold text-[#EEF2FF]">{activePromptData.steps}</p>
                      </div>
                      <div className="bg-[#141B24] rounded-lg px-3 py-2">
                        <p className="text-xs text-[#64748B]">CFG Scale</p>
                        <p className="text-sm font-bold text-[#EEF2FF]">{activePromptData.cfgScale}</p>
                      </div>
                    </div>
                  </>
                )}

                {activePromptTab === 'dalle3' && 'quality' in activePromptData && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#141B24] rounded-lg px-3 py-2">
                      <p className="text-xs text-[#64748B]">Quality</p>
                      <p className="text-sm font-bold text-[#EEF2FF] capitalize">{activePromptData.quality}</p>
                    </div>
                    <div className="bg-[#141B24] rounded-lg px-3 py-2">
                      <p className="text-xs text-[#64748B]">Style</p>
                      <p className="text-sm font-bold text-[#EEF2FF] capitalize">{activePromptData.style}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3 Variations */}
            {result.variations && result.variations.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Variations</p>
                <div className="grid grid-cols-3 gap-3">
                  {result.variations.map((v, i) => (
                    <div key={i} className="bg-[#1A2332] rounded-xl p-4 border border-[#1E2A3A]">
                      <p className="font-semibold text-[#EEF2FF] text-sm mb-1">{v.name}</p>
                      <p className="text-xs text-[#94A3B8] mb-2">{v.useCase}</p>
                      <p className="text-xs text-[#64748B] italic">{v.promptModification}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brand notes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1A2332] rounded-xl p-4">
                <p className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-2">Brand Notes</p>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{result.brandNotes}</p>
              </div>
              <div className="bg-[#1A2332] rounded-xl p-4">
                <p className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-2">Colour Guidance</p>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{result.colourGuidance}</p>
              </div>
              <div className="bg-[#1A2332] rounded-xl p-4">
                <p className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-2">Style Direction</p>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{result.styleGuidance}</p>
              </div>
              <div className="bg-[#1A2332] rounded-xl p-4">
                <p className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-2">Platform Tips</p>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{result.platformSpecificTips}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
