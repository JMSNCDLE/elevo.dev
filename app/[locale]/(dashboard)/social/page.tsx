'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'
import {
  Instagram, Facebook, Linkedin, Twitter, Globe,
  CheckCircle2, Link2, ToggleLeft, ToggleRight, Loader2,
  Calendar, Send, RefreshCw, Users
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import { cn } from '@/lib/utils'

interface SocialAccount {
  id: string
  platform: string
  platform_username?: string
  page_name?: string
  follower_count: number
  auto_post_enabled: boolean
  is_active: boolean
  updated_at: string
}

interface ScheduledPost {
  id: string
  platform: string
  content: string
  scheduled_for: string
  status: string
}

const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  { key: 'twitter', label: 'X / Twitter', icon: Twitter, color: 'text-white', bg: 'bg-white/5 border-white/10' },
  { key: 'tiktok', label: 'TikTok', icon: Globe, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
  { key: 'google', label: 'Google Business', icon: Globe, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
]

export default function SocialPage() {
  const locale = useLocale()
  const supabase = createBrowserClient()

  const [plan, setPlan] = useState<string>('trial')
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [scheduled, setScheduled] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [publishingId, setPublishingId] = useState<string | null>(null)

  // Check for OAuth success in URL
  const connectedPlatform = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('connected')
    : null

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const [profileRes, accountsRes, postsRes] = await Promise.all([
      supabase.from('profiles').select('plan').eq('id', user.id).single(),
      supabase.from('social_accounts').select('*').eq('user_id', user.id).eq('is_active', true),
      supabase.from('scheduled_posts').select('*').eq('user_id', user.id).eq('status', 'scheduled').order('scheduled_for').limit(20),
    ])

    setPlan(profileRes.data?.plan ?? 'trial')
    setAccounts(accountsRes.data ?? [])
    setScheduled(postsRes.data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  const isOrbit = plan === 'orbit' || plan === 'galaxy'

  async function toggleAutoPost(account: SocialAccount) {
    setTogglingId(account.id)
    await supabase
      .from('social_accounts')
      .update({ auto_post_enabled: !account.auto_post_enabled })
      .eq('id', account.id)
    setAccounts(prev => prev.map(a => a.id === account.id ? { ...a, auto_post_enabled: !a.auto_post_enabled } : a))
    setTogglingId(null)
  }

  async function publishNow(postId: string) {
    setPublishingId(postId)
    const res = await fetch('/api/social/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId }),
    })
    const data = await res.json()
    if (data.success) {
      setScheduled(prev => prev.filter(p => p.id !== postId))
    }
    setPublishingId(null)
  }

  if (!isOrbit) {
    return (
      <div className="p-6">
        <UpgradePrompt
          locale={locale}
          featureName="Social Hub"
          description="Connect your social accounts and let ELEVO auto-post at optimal times."
          requiredPlan="orbit"
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dashText">Social Hub</h1>
        <p className="text-dashMuted mt-1">Connect your accounts. ELEVO posts automatically at optimal times.</p>
      </div>

      {connectedPlatform && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm">
          <CheckCircle2 size={16} />
          <span className="capitalize">{connectedPlatform}</span> connected successfully!
        </div>
      )}

      {loading ? (
        <AgentStatusIndicator status="thinking" agentName="Clio" message="Loading your accounts..." />
      ) : (
        <>
          {/* Connected Accounts */}
          <section>
            <h2 className="text-base font-semibold text-dashText mb-4">Connected Accounts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PLATFORMS.map(platform => {
                const account = accounts.find(a => a.platform === platform.key)
                const Icon = platform.icon

                return (
                  <div
                    key={platform.key}
                    className={cn(
                      'rounded-xl border p-4 space-y-3',
                      account ? platform.bg : 'bg-dashCard border-dashSurface2'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon size={18} className={account ? platform.color : 'text-dashMuted'} />
                        <span className={cn('text-sm font-medium', account ? 'text-dashText' : 'text-dashMuted')}>
                          {platform.label}
                        </span>
                      </div>
                      {account && (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <CheckCircle2 size={12} />
                          Connected
                        </span>
                      )}
                    </div>

                    {account ? (
                      <>
                        <div className="text-xs text-dashMuted space-y-0.5">
                          {(account.platform_username || account.page_name) && (
                            <p className="text-dashText font-medium truncate">
                              @{account.platform_username ?? account.page_name}
                            </p>
                          )}
                          {account.follower_count > 0 && (
                            <p className="flex items-center gap-1">
                              <Users size={11} />
                              {account.follower_count.toLocaleString()} followers
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-dashMuted">Auto-post</span>
                          <button
                            onClick={() => toggleAutoPost(account)}
                            disabled={togglingId === account.id}
                            className="text-accent"
                          >
                            {togglingId === account.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : account.auto_post_enabled ? (
                              <ToggleRight size={22} />
                            ) : (
                              <ToggleLeft size={22} className="text-dashMuted" />
                            )}
                          </button>
                        </div>
                      </>
                    ) : (
                      <a
                        href={`/api/social/oauth/${platform.key}`}
                        className="flex items-center justify-center gap-1.5 w-full py-2 bg-accent/10 text-accent text-xs font-medium rounded-lg hover:bg-accent/20 transition-colors"
                      >
                        <Link2 size={13} />
                        Connect
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Scheduled Posts */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-dashText">Scheduled Posts</h2>
              <button onClick={fetchData} className="text-dashMuted hover:text-dashText transition-colors">
                <RefreshCw size={15} />
              </button>
            </div>

            {scheduled.length === 0 ? (
              <div className="bg-dashCard border border-dashSurface2 rounded-xl p-8 text-center">
                <Calendar size={32} className="text-dashMuted mx-auto mb-3" />
                <p className="text-dashMuted text-sm">No posts scheduled. Generate content and schedule it from any generator.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {scheduled.map(post => {
                  const platform = PLATFORMS.find(p => p.key === post.platform)
                  const Icon = platform?.icon ?? Globe

                  return (
                    <div key={post.id} className="bg-dashCard border border-dashSurface2 rounded-xl p-4 flex items-start gap-3">
                      <Icon size={16} className={platform?.color ?? 'text-dashMuted'} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-dashText line-clamp-2">{post.content}</p>
                        <p className="text-xs text-dashMuted mt-1">
                          {new Date(post.scheduled_for).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => publishNow(post.id)}
                        disabled={publishingId === post.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 shrink-0"
                      >
                        {publishingId === post.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Send size={12} />
                        )}
                        Post Now
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
