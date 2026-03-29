'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Monitor, Plus, Loader2, Trash2, AlertTriangle,
  CheckCircle, PauseCircle, XCircle, Lock, Shield,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface AdAccount {
  id: string
  platform: string
  account_name: string
  account_id: string | null
  status: string
  monthly_spend: number
  connected_at: string
}

const PLATFORM_CONFIG = {
  meta: { label: 'Meta Ads', color: 'bg-blue-600', desc: 'Facebook & Instagram advertising' },
  google: { label: 'Google Ads', color: 'bg-red-500', desc: 'Search, Display & YouTube ads' },
}

const STATUS_STYLES: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  active: { icon: CheckCircle, color: 'text-green-400', label: 'Active' },
  paused: { icon: PauseCircle, color: 'text-yellow-400', label: 'Paused' },
  banned: { icon: XCircle, color: 'text-red-400', label: 'Banned' },
}

export default function AdAccountsPage() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'
  const supabase = createBrowserClient()

  const [plan, setPlan] = useState<string>('trial')
  const [accounts, setAccounts] = useState<AdAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState<'meta' | 'google' | null>(null)
  const [accountName, setAccountName] = useState('')
  const [accountId, setAccountId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('plan').eq('id', user.id).single().then(({ data }) => {
        setPlan(data?.plan ?? 'trial')
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadAccounts = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/ad-accounts')
    if (res.ok) {
      const data = await res.json()
      setAccounts(data.accounts ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadAccounts() }, [loadAccounts])

  async function handleAdd(platform: 'meta' | 'google') {
    if (!accountName.trim()) return
    setSaving(true)
    const res = await fetch('/api/ad-accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, account_name: accountName.trim(), account_id: accountId.trim() || null }),
    })
    if (res.ok) {
      toast.success('Account connected!')
      setAccountName(''); setAccountId(''); setAdding(null)
      loadAccounts()
    } else {
      const data = await res.json()
      toast.error(data.error ?? 'Failed')
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    const res = await fetch('/api/ad-accounts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      toast.success('Account disconnected')
      loadAccounts()
    }
  }

  const isOrbitPlus = plan === 'orbit' || plan === 'galaxy'
  const metaAccounts = accounts.filter(a => a.platform === 'meta')
  const googleAccounts = accounts.filter(a => a.platform === 'google')

  if (!isOrbitPlus && !loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-dashCard border border-white/5 rounded-2xl p-10 text-center">
          <Lock className="w-10 h-10 text-dashMuted mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Ad Account Management</h1>
          <p className="text-dashMuted mb-6">
            Upgrade to Orbit (€79/mo) to connect Meta and Google ad accounts with dual-account ban protection.
          </p>
          <Link href={`/${locale}/pricing`} className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">
            Upgrade to Orbit →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <Monitor className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Ad Accounts</h1>
          <p className="text-sm text-dashMuted">Connect up to 2 Meta + 2 Google accounts for ban protection</p>
        </div>
      </div>

      {/* Ban protection info */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-400">Dual account ban protection</p>
          <p className="text-xs text-dashMuted mt-0.5">Connect 2 accounts per platform. If one gets flagged or banned, the other keeps your ads running.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Meta section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-[10px] text-white font-bold">M</div>
                Meta Ads ({metaAccounts.length}/2)
              </h2>
              {metaAccounts.length < 2 && (
                <button onClick={() => setAdding('meta')} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add account
                </button>
              )}
            </div>
            <div className="space-y-2">
              {metaAccounts.map(acc => <AccountCard key={acc.id} account={acc} onDelete={handleDelete} />)}
              {metaAccounts.length === 0 && !adding && (
                <div className="bg-dashCard border border-white/5 rounded-xl p-6 text-center">
                  <p className="text-sm text-dashMuted">No Meta accounts connected</p>
                </div>
              )}
              {adding === 'meta' && (
                <AddForm platform="meta" accountName={accountName} setAccountName={setAccountName}
                  accountId={accountId} setAccountId={setAccountId}
                  saving={saving} onSave={() => handleAdd('meta')} onCancel={() => setAdding(null)} />
              )}
            </div>
          </div>

          {/* Google section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center text-[10px] text-white font-bold">G</div>
                Google Ads ({googleAccounts.length}/2)
              </h2>
              {googleAccounts.length < 2 && (
                <button onClick={() => setAdding('google')} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add account
                </button>
              )}
            </div>
            <div className="space-y-2">
              {googleAccounts.map(acc => <AccountCard key={acc.id} account={acc} onDelete={handleDelete} />)}
              {googleAccounts.length === 0 && !adding && (
                <div className="bg-dashCard border border-white/5 rounded-xl p-6 text-center">
                  <p className="text-sm text-dashMuted">No Google accounts connected</p>
                </div>
              )}
              {adding === 'google' && (
                <AddForm platform="google" accountName={accountName} setAccountName={setAccountName}
                  accountId={accountId} setAccountId={setAccountId}
                  saving={saving} onSave={() => handleAdd('google')} onCancel={() => setAdding(null)} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AccountCard({ account, onDelete }: { account: AdAccount; onDelete: (id: string) => void }) {
  const st = STATUS_STYLES[account.status] ?? STATUS_STYLES.active
  const Icon = st.icon
  return (
    <div className="bg-dashCard border border-white/5 rounded-xl p-4 flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 ${account.platform === 'meta' ? 'bg-blue-600' : 'bg-red-500'} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
          {account.platform === 'meta' ? 'M' : 'G'}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{account.account_name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Icon className={`w-3 h-3 ${st.color}`} />
            <span className={`text-[10px] font-medium ${st.color}`}>{st.label}</span>
            {account.account_id && <span className="text-[10px] text-dashMuted">ID: {account.account_id}</span>}
          </div>
        </div>
      </div>
      <button onClick={() => onDelete(account.id)} className="opacity-0 group-hover:opacity-100 text-dashMuted hover:text-red-400 transition-all">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

function AddForm({ platform, accountName, setAccountName, accountId, setAccountId, saving, onSave, onCancel }: {
  platform: string; accountName: string; setAccountName: (v: string) => void;
  accountId: string; setAccountId: (v: string) => void;
  saving: boolean; onSave: () => void; onCancel: () => void;
}) {
  const config = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG]
  return (
    <div className="bg-dashCard border border-indigo-500/20 rounded-xl p-4 space-y-3">
      <p className="text-sm font-medium text-white">Connect {config?.label ?? platform}</p>
      <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Account name (e.g. Main Business)"
        className="w-full bg-dashBg border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50" autoFocus />
      <input type="text" value={accountId} onChange={e => setAccountId(e.target.value)} placeholder="Account ID (optional)"
        className="w-full bg-dashBg border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50" />
      <div className="flex gap-2">
        <button onClick={onSave} disabled={!accountName.trim() || saving}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors">
          {saving ? 'Connecting…' : 'Connect'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-dashMuted hover:text-white text-sm transition-colors">Cancel</button>
      </div>
      <p className="text-[10px] text-dashMuted flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" /> Full OAuth integration coming soon. For now, enter your account details manually.
      </p>
    </div>
  )
}
