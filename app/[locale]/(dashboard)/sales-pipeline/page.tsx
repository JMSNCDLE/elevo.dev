'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  GitBranch, Plus, Loader2, Lock, Search, Mail, Phone,
  FileText, ChevronRight, DollarSign, Users, TrendingUp,
  Trash2, X,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Lead {
  id: string
  full_name: string
  company: string | null
  email: string | null
  stage: string
  notes: string | null
  value: number
  created_at: string
  updated_at: string
}

const STAGES = [
  { key: 'lead', label: 'Lead', color: 'border-gray-500' },
  { key: 'researched', label: 'Researched', color: 'border-blue-500' },
  { key: 'contacted', label: 'Contacted', color: 'border-indigo-500' },
  { key: 'meeting_booked', label: 'Meeting', color: 'border-purple-500' },
  { key: 'proposal_sent', label: 'Proposal', color: 'border-orange-500' },
  { key: 'negotiation', label: 'Negotiation', color: 'border-yellow-500' },
  { key: 'won', label: 'Won', color: 'border-green-500' },
  { key: 'lost', label: 'Lost', color: 'border-red-500' },
]

export default function SalesPipelinePage() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'
  const supabase = createBrowserClient()

  const [plan, setPlan] = useState<string>('trial')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newValue, setNewValue] = useState('')
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

  const loadLeads = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/pipeline')
    if (res.ok) {
      const data = await res.json()
      setLeads(data.leads ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadLeads() }, [loadLeads])

  async function addLead(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    const res = await fetch('/api/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: newName, company: newCompany, email: newEmail, value: newValue ? parseFloat(newValue) : 0 }),
    })
    if (res.ok) {
      toast.success('Lead added')
      setNewName(''); setNewCompany(''); setNewEmail(''); setNewValue('')
      setShowAdd(false)
      loadLeads()
    }
    setSaving(false)
  }

  async function moveStage(id: string, stage: string) {
    await fetch('/api/pipeline', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, stage }),
    })
    loadLeads()
  }

  async function deleteLead(id: string) {
    await fetch('/api/pipeline', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadLeads()
  }

  const isOrbitPlus = plan === 'orbit' || plan === 'galaxy'

  if (!isOrbitPlus && !loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-dashCard border border-white/5 rounded-2xl p-10 text-center">
          <Lock className="w-10 h-10 text-dashMuted mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Sales Pipeline</h1>
          <p className="text-dashMuted mb-6">Upgrade to Orbit (€79/mo) to unlock a full sales pipeline with lead tracking, quick actions, and analytics.</p>
          <Link href={`/${locale}/pricing`} className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">Upgrade to Orbit →</Link>
        </div>
      </div>
    )
  }

  const totalValue = leads.filter(l => l.stage !== 'lost').reduce((s, l) => s + (l.value ?? 0), 0)
  const wonValue = leads.filter(l => l.stage === 'won').reduce((s, l) => s + (l.value ?? 0), 0)
  const wonCount = leads.filter(l => l.stage === 'won').length
  const totalCount = leads.filter(l => l.stage !== 'lost').length
  const convRate = totalCount > 0 ? ((wonCount / totalCount) * 100).toFixed(0) : '0'

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Sales Pipeline</h1>
            <p className="text-sm text-dashMuted">Track leads from first contact to closed deal</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      {/* Analytics row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-dashCard border border-white/5 rounded-xl p-4">
          <p className="text-xs text-dashMuted mb-1">Pipeline Value</p>
          <p className="text-xl font-bold text-white">€{totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-dashCard border border-white/5 rounded-xl p-4">
          <p className="text-xs text-dashMuted mb-1">Won Revenue</p>
          <p className="text-xl font-bold text-green-400">€{wonValue.toLocaleString()}</p>
        </div>
        <div className="bg-dashCard border border-white/5 rounded-xl p-4">
          <p className="text-xs text-dashMuted mb-1">Active Leads</p>
          <p className="text-xl font-bold text-white">{totalCount}</p>
        </div>
        <div className="bg-dashCard border border-white/5 rounded-xl p-4">
          <p className="text-xs text-dashMuted mb-1">Win Rate</p>
          <p className="text-xl font-bold text-indigo-400">{convRate}%</p>
        </div>
      </div>

      {/* Add lead form */}
      {showAdd && (
        <form onSubmit={addLead} className="bg-dashCard border border-indigo-500/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Add New Lead</p>
            <button type="button" onClick={() => setShowAdd(false)} className="text-dashMuted hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full name *"
              className="bg-dashBg border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50" autoFocus />
            <input type="text" value={newCompany} onChange={e => setNewCompany(e.target.value)} placeholder="Company"
              className="bg-dashBg border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50" />
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email"
              className="bg-dashBg border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50" />
            <input type="number" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Deal value (€)"
              className="bg-dashBg border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50" />
          </div>
          <button type="submit" disabled={!newName.trim() || saving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors">
            {saving ? 'Adding…' : 'Add Lead'}
          </button>
        </form>
      )}

      {/* Pipeline board */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3" style={{ minWidth: STAGES.length * 200 }}>
            {STAGES.map(stage => {
              const stageLeads = leads.filter(l => l.stage === stage.key)
              return (
                <div key={stage.key} className="flex-1 min-w-[180px]">
                  <div className={`border-t-2 ${stage.color} bg-dashCard rounded-xl p-3 min-h-[200px]`}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-white">{stage.label}</p>
                      <span className="text-[10px] text-dashMuted bg-white/5 px-1.5 py-0.5 rounded">{stageLeads.length}</span>
                    </div>
                    <div className="space-y-2">
                      {stageLeads.map(lead => (
                        <div key={lead.id} className="bg-dashBg border border-white/5 rounded-lg p-3 group">
                          <p className="text-sm font-medium text-white truncate">{lead.full_name}</p>
                          {lead.company && <p className="text-[10px] text-dashMuted truncate">{lead.company}</p>}
                          {lead.value > 0 && <p className="text-[10px] text-green-400 mt-1">€{lead.value.toLocaleString()}</p>}

                          {/* Quick actions */}
                          <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/${locale}/tools/researcher?q=${encodeURIComponent(lead.company ?? lead.full_name)}`} title="Research"
                              className="w-6 h-6 bg-white/5 rounded flex items-center justify-center hover:bg-sky-500/20 transition-colors">
                              <Search className="w-3 h-3 text-sky-400" />
                            </Link>
                            <Link href={`/${locale}/tools/cold-email`} title="Cold Email"
                              className="w-6 h-6 bg-white/5 rounded flex items-center justify-center hover:bg-emerald-500/20 transition-colors">
                              <Mail className="w-3 h-3 text-emerald-400" />
                            </Link>
                            <Link href={`/${locale}/tools/cold-call`} title="Call Script"
                              className="w-6 h-6 bg-white/5 rounded flex items-center justify-center hover:bg-red-500/20 transition-colors">
                              <Phone className="w-3 h-3 text-red-400" />
                            </Link>
                            <Link href={`/${locale}/tools/proposal-builder`} title="Proposal"
                              className="w-6 h-6 bg-white/5 rounded flex items-center justify-center hover:bg-violet-500/20 transition-colors">
                              <FileText className="w-3 h-3 text-violet-400" />
                            </Link>
                          </div>

                          {/* Move stage / delete */}
                          <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <select
                              value={lead.stage}
                              onChange={e => moveStage(lead.id, e.target.value)}
                              className="bg-transparent border border-white/10 rounded text-[10px] text-dashMuted px-1 py-0.5 focus:outline-none"
                            >
                              {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                            </select>
                            <button onClick={() => deleteLead(lead.id)} className="text-dashMuted hover:text-red-400 transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
