import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface Invoice {
  invoice_number: string
  amount: number
  currency: string
  plan: string
  status: string
  pdf_url: string | null
  billing_period_start: string
  billing_period_end: string
  created_at: string
}

export default async function BillingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, billing_anchor_day, stripe_customer_id')
    .eq('id', user.id)
    .single()

  const currencySymbol = (currency: string) =>
    currency === 'gbp' ? '€' : currency === 'eur' ? '€' : '$'

  // Calculate next billing date
  const today = new Date()
  let nextBillingDisplay = 'N/A'
  if (profile?.billing_anchor_day) {
    const next = new Date(today.getFullYear(), today.getMonth(), profile.billing_anchor_day as number)
    if (next <= today) next.setMonth(next.getMonth() + 1)
    nextBillingDisplay = next.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const planPrices: Record<string, number> = {
    launch: 39, orbit: 79, galaxy: 149
  }
  const planPrice = planPrices[profile?.plan ?? ''] ?? 0

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <Link href={`/${locale}/dashboard/settings`} className="text-sm text-dashMuted hover:text-dashText mb-4 inline-flex items-center gap-1">
          ← Back to Settings
        </Link>
        <h1 className="text-2xl font-bold text-dashText">Billing & Invoices</h1>
        <p className="text-dashMuted text-sm mt-1">Manage your subscription and download invoices.</p>
      </div>

      {/* Next payment notice */}
      {profile?.billing_anchor_day && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-dashMuted">Next payment</p>
              <p className="text-xl font-bold text-dashText">
                €{planPrice.toFixed(2)} on {nextBillingDisplay}
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="#"
                className="text-sm border border-dashSurface2 hover:bg-dashSurface2 text-dashText px-4 py-2 rounded-lg transition-colors"
              >
                Update payment method
              </a>
              <a
                href="#"
                className="text-sm border border-red-500/30 hover:bg-red-500/10 text-red-400 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel subscription
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Invoice table */}
      <div className="bg-dashCard rounded-xl border border-dashSurface2 overflow-hidden">
        <div className="px-6 py-4 border-b border-dashSurface2">
          <h2 className="text-sm font-semibold text-dashText">Invoice history</h2>
        </div>
        {!invoices?.length ? (
          <div className="p-10 text-center text-dashMuted text-sm">No invoices yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dashSurface2">
                <th className="px-6 py-3 text-left text-xs font-medium text-dashMuted uppercase">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dashMuted uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dashMuted uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dashMuted uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dashMuted uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dashMuted uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dashSurface2">
              {(invoices as Invoice[]).map(inv => (
                <tr key={inv.invoice_number} className="hover:bg-dashSurface/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-dashText text-xs">{inv.invoice_number}</td>
                  <td className="px-6 py-4 text-dashMuted">
                    {new Date(inv.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-dashText font-medium">
                    {currencySymbol(inv.currency)}{inv.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-dashMuted capitalize">{inv.plan}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      inv.status === 'paid' ? 'bg-green-500/10 text-green-400' :
                      inv.status === 'refunded' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {inv.pdf_url ? (
                      <a href={inv.pdf_url} className="text-accent hover:underline text-xs">Download PDF</a>
                    ) : (
                      <span className="text-dashMuted text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
