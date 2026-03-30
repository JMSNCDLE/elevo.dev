'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
  Bell, RefreshCw, Loader2, Send, UserPlus, DollarSign,
  AlertTriangle, BarChart2, Brain, UserMinus,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { isAdminId } from '@/lib/admin'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  channel: string
  status: string
  created_at: string
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  signup: { icon: UserPlus, color: 'text-blue-400' },
  subscription: { icon: DollarSign, color: 'text-green-400' },
  churn: { icon: UserMinus, color: 'text-red-400' },
  alert: { icon: AlertTriangle, color: 'text-yellow-400' },
  daily_summary: { icon: BarChart2, color: 'text-indigo-400' },
  weekly_insight: { icon: Brain, color: 'text-purple-400' },
  agent_insight: { icon: Brain, color: 'text-cyan-400' },
}

export default function AdminNotificationsPage() {
  const router = useRouter()
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [authed, setAuthed] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [sendTitle, setSendTitle] = useState('')
  const [sendMsg, setSendMsg] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || !isAdminId(user.id)) { router.push(`/${locale}/dashboard`); return }
      setAuthed(true)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/notifications?days=30')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { if (authed) loadNotifications() }, [authed, loadNotifications])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!sendTitle.trim() || !sendMsg.trim()) return
    setSending(true)
    try {
      await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: sendTitle.trim(), message: sendMsg.trim(), channel: 'both', type: 'alert' }),
      })
      setSendTitle('')
      setSendMsg('')
      loadNotifications()
    } catch { /* ignore */ }
    finally { setSending(false) }
  }

  if (!authed) return <div className="p-6 flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-yellow-400" />
          <h1 className="text-xl font-bold text-white">Notifications</h1>
        </div>
        <button onClick={loadNotifications} className="flex items-center gap-1.5 px-3 py-2 text-xs text-dashMuted border border-white/5 rounded-lg hover:text-white transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Manual send */}
      <form onSubmit={handleSend} className="bg-dashCard border border-white/5 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-white">Send Manual Notification</p>
        <input type="text" value={sendTitle} onChange={e => setSendTitle(e.target.value)} placeholder="Title"
          className="w-full bg-dashBg border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50" />
        <textarea value={sendMsg} onChange={e => setSendMsg(e.target.value)} placeholder="Message" rows={2}
          className="w-full bg-dashBg border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 resize-none" />
        <button type="submit" disabled={!sendTitle.trim() || !sendMsg.trim() || sending}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors">
          <Send className="w-3.5 h-3.5" />
          {sending ? 'Sending…' : 'Send via WhatsApp + Email'}
        </button>
      </form>

      {/* History */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
      ) : notifications.length === 0 ? (
        <div className="bg-dashCard border border-white/5 rounded-xl p-12 text-center">
          <Bell className="w-12 h-12 text-dashMuted mx-auto mb-4" />
          <p className="text-dashMuted text-sm">No notifications sent yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const config = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.alert
            const Icon = config.icon
            return (
              <div key={n.id} className="bg-dashCard border border-white/5 rounded-xl p-4 flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    <span className="text-[10px] text-dashMuted bg-white/5 px-1.5 py-0.5 rounded">{n.channel}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${n.status === 'sent' ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>{n.status}</span>
                  </div>
                  <p className="text-xs text-dashMuted line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-dashMuted mt-1">
                    {new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
