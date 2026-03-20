'use client'

import { useState, useEffect } from 'react'
import {
  Loader2,
  AlertTriangle,
  Package,
  PlusCircle,
  Trash2,
  ShoppingCart,
  TrendingUp,
  XCircle,
  Info,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import { cn } from '@/lib/utils'
import type { BusinessProfile } from '@/lib/agents/types'
import type { InventoryReport } from '@/lib/agents/inventoryAgent'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'
type InputMode = 'paste' | 'manual'

const CURRENCIES = ['GBP', 'USD', 'EUR'] as const
const CURRENCY_SYMBOLS: Record<string, string> = { GBP: '£', USD: '$', EUR: '€' }

interface ManualItem {
  name: string
  currentStock: string
  unit: string
  costPerUnit: string
  sellingPrice: string
  monthlySales: string
  supplier: string
}

function emptyItem(): ManualItem {
  return { name: '', currentStock: '', unit: 'units', costPerUnit: '', sellingPrice: '', monthlySales: '', supplier: '' }
}

function severityStyles(severity: string) {
  if (severity === 'critical') return 'bg-red-500/10 border-red-500/30'
  if (severity === 'warning') return 'bg-amber-500/10 border-amber-500/30'
  return 'bg-blue-500/10 border-blue-500/30'
}

function severityIcon(severity: string) {
  if (severity === 'critical') return <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
  if (severity === 'warning') return <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
  return <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
}

function urgencyBadge(urgency: string) {
  if (urgency === 'immediate') return 'bg-red-500/10 text-red-400'
  if (urgency === 'this_week') return 'bg-amber-500/10 text-amber-400'
  return 'bg-blue-500/10 text-blue-400'
}

function priorityBadge(priority: string) {
  if (priority === 'urgent') return 'bg-red-500/10 text-red-400'
  if (priority === 'normal') return 'bg-amber-500/10 text-amber-400'
  return 'bg-blue-500/10 text-blue-400'
}

function effortBadge(effort: string) {
  if (effort === 'low') return 'bg-green-500/10 text-green-400'
  if (effort === 'medium') return 'bg-amber-500/10 text-amber-400'
  return 'bg-red-500/10 text-red-400'
}

function alertTypeLabel(type: string) {
  const map: Record<string, string> = {
    out_of_stock: 'Out of Stock',
    low_stock: 'Low Stock',
    overstock: 'Overstock',
    slow_moving: 'Slow Moving',
    dead_stock: 'Dead Stock',
  }
  return map[type] ?? type
}

function fmt(sym: string, value: number) {
  return `${sym}${value.toLocaleString()}`
}

export default function InventoryPage({ params }: { params: { locale: string } }) {
  const supabase = createBrowserClient()
  const [plan, setPlan] = useState<string>('trial')
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [inputMode, setInputMode] = useState<InputMode>('paste')
  const [rawData, setRawData] = useState('')
  const [items, setItems] = useState<ManualItem[]>([emptyItem()])
  const [currency, setCurrency] = useState('GBP')
  const [report, setReport] = useState<InventoryReport | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: prof }, { data: bpData }] = await Promise.all([
        supabase.from('profiles').select('plan').eq('id', user.id).single(),
        supabase.from('business_profiles').select('*').eq('user_id', user.id).eq('is_primary', true).single(),
      ])
      if (prof) setPlan(prof.plan)
      if (bpData) setBp(bpData as BusinessProfile)
    }
    load()
  }, [])

  if (plan === 'trial' || plan === 'launch') {
    return <UpgradePrompt locale={params.locale} feature="Inventory & Supply" />
  }

  const sym = CURRENCY_SYMBOLS[currency] || '£'

  const updateItem = (i: number, field: keyof ManualItem, value: string) => {
    setItems(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row))
  }

  const addItem = () => setItems(prev => [...prev, emptyItem()])

  const removeItem = (i: number) => {
    if (items.length === 1) return
    setItems(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleAnalyse = async () => {
    if (!bp) return
    setStatus('thinking')
    setReport(null)
    setError('')
    try {
      const body: Record<string, unknown> = {
        businessProfileId: bp.id,
        currency,
        locale: params.locale,
      }
      if (inputMode === 'paste') {
        body.rawData = rawData
      } else {
        const validItems = items.filter(it => it.name.trim() && it.currentStock && it.costPerUnit)
        body.items = validItems.map(it => ({
          name: it.name,
          currentStock: parseFloat(it.currentStock) || 0,
          unit: it.unit || 'units',
          costPerUnit: parseFloat(it.costPerUnit) || 0,
          sellingPrice: it.sellingPrice ? parseFloat(it.sellingPrice) : undefined,
          monthlySales: it.monthlySales ? parseFloat(it.monthlySales) : undefined,
          supplier: it.supplier || undefined,
        }))
      }
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      setStatus('generating')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setReport(data.result)
      setStatus('done')
    } catch {
      setStatus('error')
      setError('Analysis failed. Please try again.')
    }
  }

  const criticalAlerts = report?.stockAlerts.filter(a => a.severity === 'critical') ?? []

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Package size={22} className="text-accent" />
          <h1 className="text-2xl font-bold text-dashText">Inventory &amp; Supply</h1>
        </div>
        <p className="text-dashMuted text-sm">Analysed by Rex, your Inventory &amp; Supply Chain Specialist</p>
      </div>

      {/* Input Card */}
      <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 mb-6">
        {/* Mode Tabs */}
        <div className="flex gap-2 mb-5">
          {(['paste', 'manual'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setInputMode(mode)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium border transition-colors min-h-[44px]',
                inputMode === mode
                  ? 'bg-accent border-accent text-white'
                  : 'bg-dashSurface border-dashSurface2 text-dashMuted hover:text-dashText'
              )}
            >
              {mode === 'paste' ? 'Paste Data' : 'Enter Manually'}
            </button>
          ))}
        </div>

        {inputMode === 'paste' ? (
          <textarea
            value={rawData}
            onChange={e => setRawData(e.target.value)}
            placeholder="Paste your stock list, inventory CSV, or spreadsheet rows here..."
            className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-4 py-3 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            style={{ minHeight: '120px' }}
          />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-dashSurface2">
                    {['Item Name', 'Stock', 'Unit', `Cost/Unit (${sym})`, `Selling Price (${sym})`, 'Monthly Sales', 'Supplier', ''].map(h => (
                      <th key={h} className="text-left text-xs text-dashMuted font-medium pb-2 pr-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashSurface2">
                  {items.map((row, i) => (
                    <tr key={i}>
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={row.name}
                          onChange={e => updateItem(i, 'name', e.target.value)}
                          placeholder="e.g. Paint — Dulux White"
                          className="w-full min-w-[120px] bg-dashSurface border border-dashSurface2 rounded-lg px-2 py-2 text-xs text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          value={row.currentStock}
                          onChange={e => updateItem(i, 'currentStock', e.target.value)}
                          placeholder="0"
                          min="0"
                          className="w-20 bg-dashSurface border border-dashSurface2 rounded-lg px-2 py-2 text-xs text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={row.unit}
                          onChange={e => updateItem(i, 'unit', e.target.value)}
                          placeholder="units"
                          className="w-20 bg-dashSurface border border-dashSurface2 rounded-lg px-2 py-2 text-xs text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          value={row.costPerUnit}
                          onChange={e => updateItem(i, 'costPerUnit', e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-24 bg-dashSurface border border-dashSurface2 rounded-lg px-2 py-2 text-xs text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          value={row.sellingPrice}
                          onChange={e => updateItem(i, 'sellingPrice', e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-24 bg-dashSurface border border-dashSurface2 rounded-lg px-2 py-2 text-xs text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          value={row.monthlySales}
                          onChange={e => updateItem(i, 'monthlySales', e.target.value)}
                          placeholder="0"
                          min="0"
                          className="w-24 bg-dashSurface border border-dashSurface2 rounded-lg px-2 py-2 text-xs text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={row.supplier}
                          onChange={e => updateItem(i, 'supplier', e.target.value)}
                          placeholder="Supplier name"
                          className="w-32 bg-dashSurface border border-dashSurface2 rounded-lg px-2 py-2 text-xs text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
                        />
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => removeItem(i)}
                          disabled={items.length === 1}
                          className="p-2 text-dashMuted hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={addItem}
              className="flex items-center gap-1.5 text-xs text-accent hover:text-dashText transition-colors min-h-[44px] mt-3"
            >
              <PlusCircle size={14} />
              Add Item
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-dashSurface2">
          <div className="flex items-center gap-3">
            <label className="text-xs text-dashMuted">Currency:</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-xs text-dashText focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <AgentStatusIndicator status={status} />
          </div>
          <button
            onClick={handleAnalyse}
            disabled={!bp || status === 'thinking' || status === 'generating'}
            className="px-4 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-h-[44px]"
          >
            {(status === 'thinking' || status === 'generating') && <Loader2 size={15} className="animate-spin" />}
            Analyse Inventory →
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {/* Results */}
      {report && (
        <div className="space-y-6">
          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-red-400">Critical Alerts</h2>
              {criticalAlerts.map((alert, i) => (
                <div key={i} className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                  <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-dashText">{alert.itemName}</span>
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">{alertTypeLabel(alert.alertType)}</span>
                    </div>
                    <p className="text-xs text-dashMuted">Stock: {alert.currentStock} — {alert.recommendedAction}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stock Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Package size={16} className="text-accent" />
                <p className="text-xs text-dashMuted">Total Inventory Value</p>
              </div>
              <p className="text-2xl font-bold text-dashText">{fmt(sym, report.totalInventoryValue)}</p>
            </div>
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart size={16} className="text-accent" />
                <p className="text-xs text-dashMuted">Total SKUs</p>
              </div>
              <p className="text-2xl font-bold text-dashText">{report.totalSkus}</p>
            </div>
          </div>

          {/* All Stock Alerts */}
          {report.stockAlerts.length > 0 && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <h2 className="text-sm font-semibold text-dashText mb-4">All Stock Alerts</h2>
              <div className="space-y-3">
                {report.stockAlerts.map((alert, i) => (
                  <div key={i} className={cn('rounded-xl border p-4 flex items-start gap-3', severityStyles(alert.severity))}>
                    {severityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-dashText">{alert.itemName}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-dashSurface text-dashMuted">{alertTypeLabel(alert.alertType)}</span>
                        <span className={cn('text-xs px-2 py-0.5 rounded capitalize', urgencyBadge(alert.urgency))}>
                          {alert.urgency.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-dashMuted">Stock: {alert.currentStock} — {alert.recommendedAction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Restocking Plan */}
          {report.restockingPlan.length > 0 && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <h2 className="text-sm font-semibold text-dashText mb-4">Restocking Plan</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dashSurface2">
                      {['Item', 'Qty', 'Unit', 'Order By', 'Est. Cost', 'Priority'].map(h => (
                        <th key={h} className="text-left text-xs text-dashMuted font-medium pb-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.restockingPlan.map((item, i) => (
                      <tr key={i} className="border-t border-dashSurface2">
                        <td className="py-2 pr-4 text-dashText text-xs">{item.itemName}</td>
                        <td className="py-2 pr-4 text-dashText text-xs font-medium">{item.orderQuantity}</td>
                        <td className="py-2 pr-4 text-dashMuted text-xs">{/* unit from restocking plan */}—</td>
                        <td className="py-2 pr-4 text-dashMuted text-xs">{item.orderBy}</td>
                        <td className="py-2 pr-4 text-dashText text-xs">{fmt(sym, item.estimatedCost)}</td>
                        <td className="py-2">
                          <span className={cn('text-xs px-2 py-0.5 rounded capitalize', priorityBadge(item.priority))}>
                            {item.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Supplier Alternatives */}
          {report.supplierAlternatives.length > 0 && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <h2 className="text-sm font-semibold text-dashText mb-4">Supplier Alternatives</h2>
              <div className="space-y-4">
                {report.supplierAlternatives.map((alt, i) => (
                  <div key={i} className="border-t border-dashSurface2 pt-4 first:border-0 first:pt-0">
                    <p className="text-sm font-medium text-dashText mb-1">{alt.currentItem}</p>
                    <p className="text-xs text-dashMuted mb-2">
                      Current: {alt.currentSupplier || 'Unknown'} — {fmt(sym, alt.currentCost)}/unit
                    </p>
                    <div className="space-y-2">
                      {alt.alternatives.map((a, j) => (
                        <div key={j} className="bg-dashSurface rounded-lg p-3 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-medium text-dashText">{a.supplierName}</p>
                            <p className="text-xs text-dashMuted">{a.notes}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-dashText">{fmt(sym, a.estimatedCost)}/unit</p>
                            <p className="text-xs text-green-400 font-semibold">Save {fmt(sym, a.estimatedSaving)}/unit</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Market Trends */}
          {report.marketTrends.length > 0 && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <h2 className="text-sm font-semibold text-dashText mb-4 flex items-center gap-2">
                <TrendingUp size={15} className="text-accent" />
                Market Trends
              </h2>
              <ul className="space-y-2">
                {report.marketTrends.map((trend, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-dashMuted">
                    <span className="text-accent mt-0.5 shrink-0">•</span>
                    {trend}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cost Optimisation */}
          {report.costOptimisation.opportunities.length > 0 && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-dashText">Cost Optimisation</h2>
                <span className="text-sm font-bold text-green-400">
                  Save {fmt(sym, report.costOptimisation.totalPotentialSaving)}/mo
                </span>
              </div>
              <div className="space-y-3">
                {report.costOptimisation.opportunities.map((opp, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 border-t border-dashSurface2 pt-3 first:border-0 first:pt-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-dashText">{opp.action}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded', effortBadge(opp.effort))}>
                        {opp.effort} effort
                      </span>
                    </div>
                    <span className="text-sm font-bold text-green-400 shrink-0">{fmt(sym, opp.saving)}/mo</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
