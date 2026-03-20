'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, User, Phone, Mail, Clock } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { timeAgo, formatCurrency } from '@/lib/utils'
import type { Contact } from '@/lib/agents/types'

const statusColors = {
  active: 'text-green-400 bg-green-400/10',
  vip: 'text-purple-400 bg-purple-400/10',
  lapsed: 'text-amber-400 bg-amber-400/10',
  at_risk: 'text-red-400 bg-red-400/10',
}

export default function CustomersPage({ params }: { params: { locale: string } }) {
  const supabase = createBrowserClient()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [offset, setOffset] = useState(0)
  const limit = 20

  const loadContacts = useCallback(async () => {
    setLoading(true)
    const params_q = new URLSearchParams({ limit: String(limit), offset: String(offset) })
    if (search) params_q.set('search', search)
    if (statusFilter !== 'all') params_q.set('status', statusFilter)

    const res = await fetch(`/api/crm/contacts?${params_q}`)
    if (res.ok) {
      const data = await res.json()
      setContacts(data.contacts)
    }
    setLoading(false)
  }, [search, statusFilter, offset])

  useEffect(() => {
    const timer = setTimeout(loadContacts, search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [loadContacts])

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dashText">Contacts</h1>
          <p className="text-dashMuted text-sm mt-1">Manage your customer relationships</p>
        </div>
        <Link href={`/${params.locale}/dashboard/customers/new`} className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors text-sm">
          <Plus size={16} />
          Add contact
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dashMuted" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setOffset(0) }}
            placeholder="Search contacts..."
            className="w-full pl-9 pr-3 py-2 bg-dashCard border border-dashSurface2 rounded-lg text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setOffset(0) }}
          className="bg-dashCard border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="vip">VIP</option>
          <option value="lapsed">Lapsed</option>
          <option value="at_risk">At risk</option>
        </select>
      </div>

      {/* Contact list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-dashCard rounded-xl border border-dashSurface2 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-dashSurface2" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-dashSurface2 rounded w-1/3" />
                  <div className="h-2 bg-dashSurface2 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-16">
          <User size={40} className="text-dashMuted mx-auto mb-3" />
          <p className="text-dashText font-medium mb-1">No contacts yet</p>
          <p className="text-dashMuted text-sm">Add your first customer to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map(contact => (
            <Link
              key={contact.id}
              href={`/${params.locale}/dashboard/customers/${contact.id}`}
              className="flex items-center gap-4 bg-dashCard rounded-xl border border-dashSurface2 p-4 hover:border-accent/30 transition-all"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-accentDim flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-accent">{getInitials(contact.full_name)}</span>
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-dashText truncate">{contact.full_name}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${statusColors[contact.status]}`}>
                    {contact.status === 'at_risk' ? 'At risk' : contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-dashMuted">
                  {contact.phone && <span className="flex items-center gap-1"><Phone size={11} />{contact.phone}</span>}
                  {contact.email && <span className="flex items-center gap-1"><Mail size={11} />{contact.email.slice(0, 20)}{contact.email.length > 20 ? '...' : ''}</span>}
                </div>
              </div>

              {/* Stats */}
              <div className="text-right shrink-0 hidden sm:block">
                <p className="text-sm font-medium text-dashText">{formatCurrency(contact.total_revenue)}</p>
                <p className="text-xs text-dashMuted">{contact.total_jobs} jobs</p>
              </div>

              {/* Last contact */}
              <div className="text-right shrink-0 hidden md:block">
                <div className="flex items-center gap-1 text-xs text-dashMuted">
                  <Clock size={11} />
                  {contact.last_contact_date ? timeAgo(contact.last_contact_date) : 'Never'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
