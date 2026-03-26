'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
  Mail, Search, RefreshCw, Loader2, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Calendar, Filter,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

const ADMIN_USER_ID = '5dc15dea-4633-441b-b37a-5406e7235114'

interface EmailLog {
  id: string
  from_address: string
  to_address: string
  subject: string
  body_preview: string | null
  status: string
  agent_name: string | null
  user_id: string | null
  sent_at: string
}

interface Stats {
  today: number
  week: number
  month: number
  total: number
  failed: number
}

export default function AdminEmailsPage() {
  const router = useRouter()
  const locale = useLocale()
  const supabase = createBrowserClient()

  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [emails, setEmails] = useState<EmailLog[]>([])
  const [stats, setStats] = useState<Stats>({ today: 0, week: 0, month: 0, total: 0, failed: 0 })
  const [search, setSearch] = useState('')
  const [days, setDays] = useState(30)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.id !== ADMIN_USER_ID) {
        router.push(`/${locale}/dashboard`)
        return
      }
      setAuthed(true)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchEmails = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ days: String(days) })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/emails?${params}`)
      if (res.ok) {
        const data = await res.json()
        setEmails(data.emails || [])
        setStats(data.stats || { today: 0, week: 0, month: 0, total: 0, failed: 0 })
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [search, days])

  useEffect(() => {
    if (authed) fetchEmails()
  }, [authed, fetchEmails])

  if (!authed) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center">
          <Mail className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Email Oversight</h1>
          <p className="text-sm text-dashMuted">All outbound emails sent by ELEVO AI</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Today" value={stats.today} />
        <StatCard label="This week" value={stats.week} />
        <StatCard label="This month" value={stats.month} />
        <StatCard label="Total (period)" value={stats.total} />
        <StatCard label="Failed" value={stats.failed} color={stats.failed > 0 ? 'text-red-400' : undefined} />
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dashMuted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchEmails()}
            placeholder="Search by email or subject…"
            className="w-full bg-dashCard border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-dashMuted" />
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="bg-dashCard border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
        <button
          onClick={fetchEmails}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 text-xs text-dashMuted border border-white/5 rounded-lg hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
      ) : emails.length === 0 ? (
        <div className="bg-dashCard border border-white/5 rounded-xl p-12 text-center">
          <Mail className="w-12 h-12 text-dashMuted mx-auto mb-4" />
          <p className="text-dashMuted text-sm">No emails found for this period.</p>
        </div>
      ) : (
        <div className="bg-dashCard border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">To</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Subject</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Agent</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {emails.map(email => (
                  <>
                    <tr
                      key={email.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer"
                      onClick={() => setExpandedId(expandedId === email.id ? null : email.id)}
                    >
                      <td className="px-4 py-3 text-dashMuted text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(email.sent_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          <span className="text-white/30 ml-1">
                            {new Date(email.sent_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white truncate max-w-[180px]">{email.to_address}</td>
                      <td className="px-4 py-3 text-white truncate max-w-[250px]">{email.subject}</td>
                      <td className="px-4 py-3">
                        {email.agent_name ? (
                          <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                            {email.agent_name}
                          </span>
                        ) : (
                          <span className="text-xs text-dashMuted">System</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {email.status === 'sent' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {expandedId === email.id ? (
                          <ChevronUp className="w-4 h-4 text-dashMuted" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-dashMuted" />
                        )}
                      </td>
                    </tr>
                    {expandedId === email.id && (
                      <tr key={`${email.id}-detail`} className="border-b border-white/5">
                        <td colSpan={6} className="px-4 py-4 bg-dashBg">
                          <div className="space-y-2 text-xs">
                            <div className="flex gap-4">
                              <span className="text-dashMuted w-16 shrink-0">From:</span>
                              <span className="text-white">{email.from_address}</span>
                            </div>
                            <div className="flex gap-4">
                              <span className="text-dashMuted w-16 shrink-0">To:</span>
                              <span className="text-white">{email.to_address}</span>
                            </div>
                            {email.user_id && (
                              <div className="flex gap-4">
                                <span className="text-dashMuted w-16 shrink-0">User ID:</span>
                                <span className="text-white font-mono">{email.user_id}</span>
                              </div>
                            )}
                            {email.body_preview && (
                              <div className="mt-2">
                                <span className="text-dashMuted block mb-1">Preview:</span>
                                <div className="bg-dashCard border border-white/5 rounded-lg p-3 text-white/70 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                  {email.body_preview}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-dashCard border border-white/5 rounded-xl p-4">
      <p className="text-xs text-dashMuted mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color ?? 'text-white'}`}>{value}</p>
    </div>
  )
}
