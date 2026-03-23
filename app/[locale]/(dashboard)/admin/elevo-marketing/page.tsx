'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, RefreshCw, Check, Copy, Download, TrendingUp } from 'lucide-react'

interface ContentQueueItem {
  id: string
  date: string
  platform: string
  topic: string
  hook: string
  caption: string
  status: 'planned' | 'approved' | 'skipped'
  vegaPrompt: string
}

interface Script {
  id: string
  hook: string
  script: string
  platform: string
  vegaPrompt: string
  estimatedViews: string
}

interface MissionStatus {
  title: string
  week: number
  totalWeeks: number
  goal: string
  status: string
  platforms: Record<string, { followers: number; postsThisWeek: number; engagementRate: string }>
  adCampaigns: Array<{ name: string; platform: string; status: string; spend: string; ctr: string; leads: number }>
}

export default function ELEVOMarketingPage({ params }: { params: Promise<{ locale: string }> }) {
  const router = useRouter()
  const [locale, setLocale] = useState('en')
  const [loading, setLoading] = useState(true)
  const [missionStatus, setMissionStatus] = useState<MissionStatus | null>(null)
  const [contentQueue, setContentQueue] = useState<ContentQueueItem[]>([])
  const [scripts, setScripts] = useState<Script[]>([])
  const [generating, setGenerating] = useState<string | null>(null)
  const [copiedScript, setCopiedScript] = useState<string | null>(null)

  useEffect(() => {
    params.then((p) => setLocale(p.locale))
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/elevo-marketing')
      if (res.status === 403) {
        router.push(`/${locale}/dashboard`)
        return
      }
      const data = await res.json()
      setMissionStatus(data.missionStatus)
      setContentQueue(data.contentQueue || [])
      setScripts(data.jamesScripts || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function generateFreshContent(item: ContentQueueItem) {
    setGenerating(item.id)
    try {
      const res = await fetch('/api/admin/elevo-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: item.platform, topic: item.topic }),
      })
      if (res.ok) {
        await loadData()
      }
    } finally {
      setGenerating(null)
    }
  }

  function updateItemStatus(id: string, status: 'approved' | 'skipped') {
    setContentQueue((prev) => prev.map((item) => item.id === id ? { ...item, status } : item))
  }

  function copyScript(script: Script) {
    navigator.clipboard.writeText(`HOOK: ${script.hook}\n\n${script.script}\n\n---\nVEGA PROMPT:\n${script.vegaPrompt}`)
    setCopiedScript(script.id)
    setTimeout(() => setCopiedScript(null), 2000)
  }

  function downloadAllScripts() {
    const content = scripts.map((s, i) =>
      `SCRIPT ${i + 1}\n${'='.repeat(50)}\nHOOK: ${s.hook}\n\n${s.script}\n\nESTIMATED VIEWS: ${s.estimatedViews}\n\nVEGA PROMPT:\n${s.vegaPrompt}\n\n`
    ).join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'elevo-tiktok-scripts.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const PLATFORM_COLORS: Record<string, string> = {
    TikTok: 'text-pink-400',
    Instagram: 'text-purple-400',
    LinkedIn: 'text-sky-400',
    YouTube: 'text-red-400',
    'YouTube Shorts': 'text-red-400',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080C14] text-[#EEF2FF] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading ELEVO marketing dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-[#EEF2FF] p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">ELEVO is marketing itself.</h1>
            <p className="text-sm text-gray-400 mt-1">Admin: ELEVO's own social marketing command centre</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {missionStatus && (
          <div className="bg-[#141B24] rounded-2xl border border-indigo-500/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
              <h2 className="font-semibold text-lg">{missionStatus.title}</h2>
              <span className="text-xs text-indigo-400 bg-indigo-600/20 px-2 py-0.5 rounded-full">Week {missionStatus.week}/{missionStatus.totalWeeks}</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">{missionStatus.goal}</p>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-1">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(missionStatus.week / missionStatus.totalWeeks) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-500">{Math.round((missionStatus.week / missionStatus.totalWeeks) * 100)}% complete</p>
          </div>
        )}

        {missionStatus && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Platform Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(missionStatus.platforms).map(([platform, data]) => (
                <div key={platform} className="bg-[#141B24] rounded-xl border border-white/5 p-4">
                  <p className={`text-sm font-semibold mb-3 ${PLATFORM_COLORS[platform] || 'text-[#EEF2FF]'}`}>{platform}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Followers</span>
                      <span className="font-medium">{data.followers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Posts this week</span>
                      <span className="font-medium">{data.postsThisWeek}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Engagement</span>
                      <span className="text-green-400 font-medium">{data.engagementRate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-4">Content Queue — Next 7 Days</h2>
          <div className="space-y-3">
            {contentQueue.map((item) => (
              <div key={item.id} className={`bg-[#141B24] rounded-xl border p-4 transition-all ${
                item.status === 'approved' ? 'border-green-500/30' :
                item.status === 'skipped' ? 'border-white/5 opacity-50' :
                'border-white/5'
              }`}>
                <div className="flex items-start gap-4">
                  <div className="shrink-0 text-center">
                    <p className="text-xs text-gray-500">{item.date}</p>
                    <p className={`text-xs font-semibold ${PLATFORM_COLORS[item.platform] || 'text-[#EEF2FF]'}`}>{item.platform}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#EEF2FF] mb-1">{item.topic}</p>
                    <p className="text-xs text-gray-400 italic">"{item.hook}"</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => updateItemStatus(item.id, 'approved')}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                        item.status === 'approved'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-white/5 hover:bg-white/10 text-gray-300'
                      }`}
                    >
                      {item.status === 'approved' ? <><Check size={10} className="inline mr-1" />Approved</> : 'Approve'}
                    </button>
                    <button
                      onClick={() => generateFreshContent(item)}
                      disabled={generating === item.id}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                    >
                      {generating === item.id ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : 'Regenerate'}
                    </button>
                    <button
                      onClick={() => updateItemStatus(item.id, 'skipped')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {missionStatus?.adCampaigns && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Ad Campaigns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missionStatus.adCampaigns.map((campaign, i) => (
                <div key={i} className="bg-[#141B24] rounded-xl border border-white/5 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold">{campaign.name}</p>
                      <p className="text-xs text-gray-400">{campaign.platform}</p>
                    </div>
                    <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">{campaign.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-sm font-bold text-indigo-400">{campaign.spend}</p>
                      <p className="text-xs text-gray-500">Spent</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-400">{campaign.ctr}</p>
                      <p className="text-xs text-gray-500">CTR</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-400">{campaign.leads}</p>
                      <p className="text-xs text-gray-500">Leads</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">TikTok Scripts for James</h2>
            <button
              onClick={downloadAllScripts}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <Download size={14} /> Download All
            </button>
          </div>
          <div className="space-y-4">
            {scripts.map((script, i) => (
              <div key={script.id} className="bg-[#141B24] rounded-xl border border-white/5 p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400">{i + 1}</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-400">{script.estimatedViews} estimated views</span>
                    </div>
                  </div>
                  <button
                    onClick={() => copyScript(script)}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {copiedScript === script.id ? <><Check size={12} className="text-green-400" /> Copied</> : <><Copy size={12} /> Copy Script</>}
                  </button>
                </div>
                <p className="text-sm font-semibold text-indigo-300 mb-3">"{script.hook}"</p>
                <div className="bg-[#1A2332] rounded-xl p-4 text-sm text-gray-300 whitespace-pre-wrap font-mono text-xs leading-relaxed max-h-48 overflow-y-auto">
                  {script.script}
                </div>
                <div className="mt-3 p-3 bg-purple-600/10 border border-purple-500/20 rounded-lg">
                  <p className="text-xs font-semibold text-purple-300 mb-1">VEGA VIDEO PROMPT</p>
                  <p className="text-xs text-gray-400">{script.vegaPrompt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
