'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Users, Search, RefreshCw, Loader2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils'

const ADMIN_USER_ID = '5dc15dea-4633-441b-b37a-5406e7235114'

interface UserRow {
  id: string
  full_name: string | null
  email: string | null
  plan: string
  credits_used: number
  credits_limit: number
  created_at: string
  subscription_status: string | null
}

const PLAN_STYLES: Record<string, string> = {
  trial: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  launch: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  orbit: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  galaxy: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
}

export default function AdminUsersPage() {
  const router = useRouter()
  const locale = useLocale()
  const supabase = createBrowserClient()

  const [authed, setAuthed] = useState(false)
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.id !== ADMIN_USER_ID) { router.push(`/${locale}/dashboard`); return }
      setAuthed(true)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, plan, credits_used, credits_limit, created_at, subscription_status')
      .order('created_at', { ascending: false })
      .limit(200)
    setUsers((data as UserRow[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { if (authed) loadUsers() }, [authed, loadUsers])

  const filtered = users.filter(u => {
    const matchesSearch = !search || (u.full_name ?? '').toLowerCase().includes(search.toLowerCase()) || (u.email ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesPlan = planFilter === 'all' || u.plan === planFilter
    return matchesSearch && matchesPlan
  })

  if (!authed) return <div className="p-6 flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-5 h-5 text-blue-400" />
        <h1 className="text-xl font-bold text-white">Users ({users.length})</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dashMuted" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            className="w-full bg-dashCard border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50" />
        </div>
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
          className="bg-dashCard border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
          <option value="all">All plans</option>
          <option value="trial">Trial</option>
          <option value="launch">Launch</option>
          <option value="orbit">Orbit</option>
          <option value="galaxy">Galaxy</option>
        </select>
        <button onClick={loadUsers} className="flex items-center gap-1.5 px-3 py-2 text-xs text-dashMuted border border-white/5 rounded-lg hover:text-white transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
      ) : (
        <div className="bg-dashCard border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Credits</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dashMuted">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{u.full_name ?? 'No name'}</p>
                      <p className="text-dashMuted text-xs">{u.email ?? u.id.slice(0, 12)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${PLAN_STYLES[u.plan] ?? PLAN_STYLES.trial}`}>{u.plan}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, ((u.credits_used ?? 0) / (u.credits_limit || 1)) * 100)}%` }} />
                        </div>
                        <span className="text-xs text-dashMuted">{u.credits_used ?? 0}/{u.credits_limit ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${u.subscription_status === 'active' ? 'text-green-400' : 'text-dashMuted'}`}>
                        {u.subscription_status ?? 'trial'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-dashMuted whitespace-nowrap">{timeAgo(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-white/5 text-xs text-dashMuted">
            Showing {filtered.length} of {users.length} users
          </div>
        </div>
      )}
    </div>
  )
}
