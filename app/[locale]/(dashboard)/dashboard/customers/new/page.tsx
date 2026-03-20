'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function NewContactPage({ params }: { params: { locale: string } }) {
  const router = useRouter()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', address: '', postcode: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/crm/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/${params.locale}/dashboard/customers/${data.contact.id}`)
    } else {
      const err = await res.json()
      setError(err.error || 'Failed to create contact')
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <Link href={`/${params.locale}/dashboard/customers`} className="flex items-center gap-1.5 text-dashMuted hover:text-dashText text-sm mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to contacts
      </Link>

      <h1 className="text-2xl font-bold text-dashText mb-6">Add contact</h1>

      <form onSubmit={handleSubmit} className="bg-dashCard rounded-xl border border-dashSurface2 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-dashMuted mb-1.5">Full name <span className="text-red-400">*</span></label>
          <input type="text" required value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="e.g. Sarah Johnson" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Phone</label>
            <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="07700 900123" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dashMuted mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="sarah@example.com" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-dashMuted mb-1.5">Address</label>
          <input type="text" value={form.address} onChange={e => update('address', e.target.value)} placeholder="123 High Street" className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-dashMuted mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} placeholder="Any notes about this customer..." className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted resize-none focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={loading || !form.fullName.trim()} className="w-full py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 size={15} className="animate-spin" />}
          {loading ? 'Saving...' : 'Add contact'}
        </button>
      </form>
    </div>
  )
}
