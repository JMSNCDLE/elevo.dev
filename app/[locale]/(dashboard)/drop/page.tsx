'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'
import { ADMIN_IDS } from '@/lib/admin'
import {
  ShoppingCart, Package, Loader2, ChevronDown, ChevronUp, ExternalLink,
  TrendingUp, BarChart2, Star, Globe, Plus, CheckCircle2, AlertTriangle,
  Scissors, Film, Store,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import ActionExplanation from '@/components/shared/ActionExplanation'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import CopyButton from '@/components/shared/CopyButton'
import { cn } from '@/lib/utils'
import type { WinningProduct } from '@/lib/agents/dropshippingAgent'

type Tab = 'finder' | 'suppliers' | 'builder' | 'ads' | 'products'
type Status = 'idle' | 'loading' | 'done' | 'error'

const MARKETS = [
  { value: 'UK', label: '🇬🇧 United Kingdom' },
  { value: 'US', label: '🇺🇸 United States' },
  { value: 'EU', label: '🇪🇺 European Union' },
  { value: 'Global', label: '🌍 Global' },
]

const PRODUCT_STATUSES = {
  researching: { color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Researching' },
  testing: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Testing' },
  scaling: { color: 'text-green-400', bg: 'bg-green-500/10', label: 'Scaling' },
  paused: { color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Paused' },
  killed: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Killed' },
}

const COMPETITION_CONFIG = {
  low: { color: 'text-green-400', label: 'Low Competition' },
  medium: { color: 'text-yellow-400', label: 'Medium Competition' },
  high: { color: 'text-red-400', label: 'High Competition' },
}

function TrendGauge({ score }: { score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-32 h-2 bg-dashSurface2 rounded-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  )
}

function ProductCard({ product, onSave, locale }: { product: WinningProduct; onSave: (p: WinningProduct) => void; locale: string }) {
  const [expanded, setExpanded] = useState(false)
  const [activeSection, setActiveSection] = useState<'suppliers' | 'content' | 'ads' | 'projections'>('projections')

  return (
    <div className="bg-dashCard rounded-xl border border-dashSurface2 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-semibold text-dashText text-lg">{product.productName}</h3>
            <p className="text-xs text-dashMuted mt-0.5">{product.category}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={cn('text-xs font-semibold px-2 py-1 rounded-full', COMPETITION_CONFIG[product.competitionLevel].color, 'bg-current/10')}>
              {COMPETITION_CONFIG[product.competitionLevel].label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-dashSurface2/50 rounded-lg p-2.5 text-center">
            <p className="text-xs text-dashMuted mb-0.5">Buy</p>
            <p className="text-sm font-bold text-dashText">{product.buyPrice}</p>
          </div>
          <div className="bg-dashSurface2/50 rounded-lg p-2.5 text-center">
            <p className="text-xs text-dashMuted mb-0.5">Sell</p>
            <p className="text-sm font-bold text-green-400">{product.sellPrice}</p>
          </div>
          <div className="bg-dashSurface2/50 rounded-lg p-2.5 text-center">
            <p className="text-xs text-dashMuted mb-0.5">Margin</p>
            <p className="text-sm font-bold text-accent">{product.estimatedMargin}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-dashMuted mb-1">Trend Score</p>
          <TrendGauge score={product.trendScore} />
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {product.demandSignals.slice(0, 3).map((signal, i) => (
            <span key={i} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{signal}</span>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-dashSurface2 rounded-lg text-sm text-dashText hover:bg-dashCard transition-colors"
          >
            View Full Report {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={() => onSave(product)}
            className="flex items-center gap-1.5 px-3 py-2 bg-accent/10 text-accent rounded-lg text-sm font-semibold hover:bg-accent/20 transition-colors"
          >
            <Plus size={14} />
            Save
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-dashSurface2 p-5">
          <div className="flex gap-2 mb-4">
            {(['projections', 'suppliers', 'content', 'ads'] as const).map(s => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', activeSection === s ? 'bg-accent text-white' : 'bg-dashSurface2 text-dashMuted hover:text-dashText')}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {activeSection === 'projections' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dashSurface2/50 rounded-lg p-3">
                <p className="text-xs text-dashMuted">Monthly Revenue</p>
                <p className="text-base font-bold text-green-400">{product.projections.monthlyRevenue}</p>
              </div>
              <div className="bg-dashSurface2/50 rounded-lg p-3">
                <p className="text-xs text-dashMuted">Monthly Profit</p>
                <p className="text-base font-bold text-accent">{product.projections.monthlyProfit}</p>
              </div>
              <div className="bg-dashSurface2/50 rounded-lg p-3">
                <p className="text-xs text-dashMuted">Breakeven</p>
                <p className="text-base font-bold text-dashText">{product.projections.breakevenDays} days</p>
              </div>
              <div className="bg-dashSurface2/50 rounded-lg p-3">
                <p className="text-xs text-dashMuted">ROAS</p>
                <p className="text-base font-bold text-dashText">{product.projections.roas}</p>
              </div>
            </div>
          )}

          {activeSection === 'suppliers' && (
            <div className="space-y-3">
              {product.suppliers.map((supplier, i) => (
                <div key={i} className={cn('rounded-lg p-3 border', supplier.recommended ? 'border-accent/30 bg-accent/5' : 'border-dashSurface2 bg-dashSurface2/30')}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-dashText">{supplier.name}</span>
                    {supplier.recommended && <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">Recommended</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-dashMuted mb-2">
                    <span>Cost: <strong className="text-dashText">{supplier.unitCost}</strong></span>
                    <span>Ship: <strong className="text-dashText">{supplier.shippingTime}</strong></span>
                    <span>MOQ: <strong className="text-dashText">{supplier.moq}</strong></span>
                  </div>
                  {supplier.url && (
                    <a href={supplier.url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent flex items-center gap-1 hover:underline">
                      View supplier <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeSection === 'content' && (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-dashMuted mb-1">Product Title</p>
                <p className="text-sm text-dashText bg-dashSurface2/50 rounded-lg p-2">{product.storeContent.productTitle}</p>
              </div>
              <div>
                <p className="text-xs text-dashMuted mb-1">Meta Description</p>
                <p className="text-xs text-dashText bg-dashSurface2/50 rounded-lg p-2">{product.storeContent.metaDescription}</p>
              </div>
              <div>
                <p className="text-xs text-dashMuted mb-2">Bullet Points</p>
                <ul className="space-y-1">
                  {product.storeContent.bulletPoints.map((bp, i) => (
                    <li key={i} className="text-xs text-dashText flex items-start gap-1.5">
                      <CheckCircle2 size={12} className="text-green-400 mt-0.5 shrink-0" />
                      {bp}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/${locale}/dashboard/create?prompt=${encodeURIComponent(product.visualBrief.heroImagePrompt)}`}
                  className="flex items-center gap-1.5 text-xs text-accent bg-accent/10 px-3 py-1.5 rounded-lg hover:bg-accent/20 transition-colors"
                >
                  <Film size={12} /> Generate Images
                </a>
                <a
                  href={`/${locale}/dashboard/video-studio?prompt=${encodeURIComponent(product.visualBrief.productVideoPrompt)}`}
                  className="flex items-center gap-1.5 text-xs text-accent bg-accent/10 px-3 py-1.5 rounded-lg hover:bg-accent/20 transition-colors"
                >
                  <Film size={12} /> Generate Video
                </a>
              </div>
            </div>
          )}

          {activeSection === 'ads' && (
            <div className="space-y-4">
              <div className="bg-dashSurface2/50 rounded-lg p-3">
                <p className="text-xs font-semibold text-dashMuted mb-2">Meta Ad</p>
                <p className="text-xs text-dashText font-semibold">{product.adCampaigns.metaAd.hook}</p>
                <p className="text-xs text-dashMuted mt-1">{product.adCampaigns.metaAd.primaryText}</p>
              </div>
              <div className="bg-dashSurface2/50 rounded-lg p-3">
                <p className="text-xs font-semibold text-dashMuted mb-2">TikTok Ad</p>
                <p className="text-xs text-dashText font-semibold">{product.adCampaigns.tiktokAd.hook}</p>
              </div>
              <a
                href={`/${locale}/ads?product=${encodeURIComponent(product.productName)}&hook=${encodeURIComponent(product.adCampaigns.metaAd.hook)}`}
                className="flex items-center gap-1.5 text-xs text-accent bg-accent/10 px-3 py-1.5 rounded-lg hover:bg-accent/20 transition-colors"
              >
                <TrendingUp size={12} /> Build Full Ad Campaign →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DropPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = useLocale()
  const supabase = createBrowserClient()
  const [plan, setPlan] = useState<string>('trial')
  const [tab, setTab] = useState<Tab>('finder')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [businessProfileId, setBusinessProfileId] = useState('')
  const [businessProfiles, setBusinessProfiles] = useState<Array<{ id: string; business_name: string }>>([])

  // Finder
  const [niche, setNiche] = useState('')
  const [targetMarket, setTargetMarket] = useState('UK')
  const [budget, setBudget] = useState('€500')
  const [products, setProducts] = useState<WinningProduct[]>([])

  // Suppliers
  const [supplierProduct, setSupplierProduct] = useState('')
  const [suppliers, setSuppliers] = useState<WinningProduct['suppliers']>([])

  // Builder
  const [myProducts, setMyProducts] = useState<Array<{ id: string; product_name: string; status: string; product_data: WinningProduct; monthly_revenue: number; monthly_spend: number; roas: number }>>([])
  const [selectedMyProduct, setSelectedMyProduct] = useState<string>('')
  const [storeContent, setStoreContent] = useState<WinningProduct['storeContent'] | null>(null)

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [profileRes, bpRes] = await Promise.all([
      supabase.from('profiles').select('plan').eq('id', user.id).single(),
      supabase.from('business_profiles').select('id, business_name').eq('user_id', user.id),
    ])
    setPlan(ADMIN_IDS.includes(user.id) ? 'galaxy' : (profileRes.data?.plan ?? 'trial'))
    setBusinessProfiles(bpRes.data ?? [])
    if (bpRes.data?.[0]) setBusinessProfileId(bpRes.data[0].id)
  }, [supabase])

  const fetchMyProducts = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('dropship_products').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setMyProducts(data ?? [])
  }, [supabase])

  useEffect(() => {
    fetchProfile()
    fetchMyProducts()
  }, [fetchProfile, fetchMyProducts])

  if (plan !== 'galaxy') {
    return (
      <div className="min-h-screen bg-dashBg p-8">
        <UpgradePrompt
          locale={locale}
          featureName="ELEVO Drop™"
          description="ELEVO Drop™ is your complete dropshipping suite — find winning products, source suppliers, and build stores. Available on the Galaxy plan."
          requiredPlan="galaxy"
        />
      </div>
    )
  }

  async function handleFindProducts() {
    if (!niche || !targetMarket || !budget) return
    setStatus('loading')
    setError(null)
    setProducts([])
    try {
      const res = await fetch('/api/drop/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, targetMarket, budget, count: 5, locale }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setProducts(data.products ?? [])
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find products')
      setStatus('error')
    }
  }

  async function handleFindSuppliers() {
    if (!supplierProduct) return
    setStatus('loading')
    setError(null)
    setSuppliers([])
    try {
      const res = await fetch('/api/drop/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: supplierProduct, targetMarket, locale }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setSuppliers(data.suppliers ?? [])
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find suppliers')
      setStatus('error')
    }
  }

  async function handleBuildStoreContent() {
    if (!selectedMyProduct || !businessProfileId) return
    const prod = myProducts.find(p => p.id === selectedMyProduct)
    if (!prod) return
    setStatus('loading')
    setError(null)
    setStoreContent(null)
    try {
      const res = await fetch('/api/drop/store-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productData: prod.product_data, businessProfileId, locale }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setStoreContent(data.content)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content')
      setStatus('error')
    }
  }

  async function handleSaveProduct(product: WinningProduct) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('dropship_products').insert({
      user_id: user.id,
      business_profile_id: businessProfileId || null,
      product_name: product.productName,
      niche,
      status: 'researching',
      product_data: product,
    })
    fetchMyProducts()
  }

  const TABS: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
    { id: 'finder', label: 'Product Finder', icon: ShoppingCart },
    { id: 'suppliers', label: 'Supplier Finder', icon: Package },
    { id: 'builder', label: 'Store Builder', icon: Store },
    { id: 'ads', label: 'Ad Creator', icon: TrendingUp },
    { id: 'products', label: 'My Products', icon: BarChart2 },
  ]

  return (
    <div className="min-h-screen bg-dashBg">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
            <ShoppingCart size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-dashText">ELEVO Drop™</h1>
            <p className="text-sm text-dashMuted">Drake — Your complete dropshipping suite</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-dashSurface rounded-xl p-1 w-fit">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setStatus('idle'); setError(null) }}
                className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors', tab === t.id ? 'bg-accent text-white' : 'text-dashMuted hover:text-dashText')}
              >
                <Icon size={14} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Tab: Product Finder */}
        {tab === 'finder' && (
          <div className="space-y-6">
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
              <h2 className="text-base font-semibold text-dashText mb-4">Find Winning Products</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-xs text-dashMuted block mb-1.5">Niche / Category</label>
                  <input
                    value={niche}
                    onChange={e => setNiche(e.target.value)}
                    placeholder="e.g. pet accessories, fitness"
                    className="w-full bg-dashSurface2 border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs text-dashMuted block mb-1.5">Target Market</label>
                  <select
                    value={targetMarket}
                    onChange={e => setTargetMarket(e.target.value)}
                    className="w-full bg-dashSurface2 border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
                  >
                    {MARKETS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-dashMuted block mb-1.5">Budget</label>
                  <input
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    placeholder="e.g. €500/month"
                    className="w-full bg-dashSurface2 border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <button
                onClick={handleFindProducts}
                disabled={status === 'loading' || !niche}
                className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight disabled:opacity-50 transition-colors"
              >
                {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                {status === 'loading' ? 'Scanning markets...' : 'Find 5 Winning Products (5 credits)'}
              </button>
            </div>

            {status === 'loading' && (
              <AgentStatusIndicator
                status="generating"
                message="ELEVO Drop™ is scanning TikTok Shop, Amazon Movers, AliExpress trending, Google Trends..."
              />
            )}
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">{error}</div>}

            {status === 'done' && products.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-4">
                  {products.map((product, i) => (
                    <ProductCard key={i} product={product} onSave={handleSaveProduct} locale={locale} />
                  ))}
                </div>
                <ActionExplanation
                  title="Product Research Complete"
                  description={`Drake found ${products.length} winning products by analysing TikTok trends, Amazon bestsellers, AliExpress hot products, and Google Trends. Save any product to your portfolio to build store content and ads.`}
                />
              </>
            )}
          </div>
        )}

        {/* Tab: Supplier Finder */}
        {tab === 'suppliers' && (
          <div className="space-y-6">
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
              <h2 className="text-base font-semibold text-dashText mb-4">Find Suppliers</h2>
              <div className="flex gap-3 mb-4">
                <input
                  value={supplierProduct}
                  onChange={e => setSupplierProduct(e.target.value)}
                  placeholder="Enter product name, e.g. LED strip lights"
                  className="flex-1 bg-dashSurface2 border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:border-accent"
                />
                <select
                  value={targetMarket}
                  onChange={e => setTargetMarket(e.target.value)}
                  className="bg-dashSurface2 border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
                >
                  {MARKETS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <button
                onClick={handleFindSuppliers}
                disabled={status === 'loading' || !supplierProduct}
                className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight disabled:opacity-50 transition-colors"
              >
                {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
                {status === 'loading' ? 'Finding suppliers...' : 'Find Suppliers (2 credits)'}
              </button>
            </div>

            {status === 'loading' && <AgentStatusIndicator status="generating" message="Searching AliExpress, CJDropshipping, Zendrop, Spocket and niche suppliers..." />}
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">{error}</div>}

            {suppliers.length > 0 && (
              <div className="bg-dashCard rounded-xl border border-dashSurface2 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dashSurface2">
                      <th className="text-left text-xs text-dashMuted px-4 py-3">Supplier</th>
                      <th className="text-left text-xs text-dashMuted px-4 py-3">Unit Cost</th>
                      <th className="text-left text-xs text-dashMuted px-4 py-3">Shipping</th>
                      <th className="text-left text-xs text-dashMuted px-4 py-3">MOQ</th>
                      <th className="text-left text-xs text-dashMuted px-4 py-3">Quality</th>
                      <th className="text-left text-xs text-dashMuted px-4 py-3">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((s, i) => (
                      <tr key={i} className={cn('border-b border-dashSurface2 last:border-0', s.recommended ? 'bg-accent/5' : '')}>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-dashText">{s.name}</span>
                          {s.recommended && <span className="ml-2 text-xs text-accent bg-accent/10 px-1.5 py-0.5 rounded">Best</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-green-400 font-semibold">{s.unitCost}</td>
                        <td className="px-4 py-3 text-sm text-dashText">{s.shippingTime}</td>
                        <td className="px-4 py-3 text-sm text-dashText">{s.moq}</td>
                        <td className="px-4 py-3 text-sm text-dashText">{s.quality}</td>
                        <td className="px-4 py-3">
                          {s.url && (
                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accentLight">
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Store Builder */}
        {tab === 'builder' && (
          <div className="space-y-6">
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
              <h2 className="text-base font-semibold text-dashText mb-4">Generate Store Content</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-dashMuted block mb-1.5">Select Product</label>
                  <select
                    value={selectedMyProduct}
                    onChange={e => setSelectedMyProduct(e.target.value)}
                    className="w-full bg-dashSurface2 border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
                  >
                    <option value="">Choose a product...</option>
                    {myProducts.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-dashMuted block mb-1.5">Business Profile</label>
                  <select
                    value={businessProfileId}
                    onChange={e => setBusinessProfileId(e.target.value)}
                    className="w-full bg-dashSurface2 border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
                  >
                    {businessProfiles.map(bp => <option key={bp.id} value={bp.id}>{bp.business_name}</option>)}
                  </select>
                </div>
              </div>
              <button
                onClick={handleBuildStoreContent}
                disabled={status === 'loading' || !selectedMyProduct || !businessProfileId}
                className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight disabled:opacity-50 transition-colors"
              >
                {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Store size={16} />}
                {status === 'loading' ? 'Generating content...' : 'Generate Store Content (1 credit)'}
              </button>
            </div>

            {status === 'loading' && <AgentStatusIndicator status="generating" message="Writing conversion-optimised Shopify store content..." />}
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">{error}</div>}

            {storeContent && (
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-dashText">Store Content Ready</h3>
                  <CopyButton text={JSON.stringify(storeContent, null, 2)} />
                </div>
                <div>
                  <p className="text-xs text-dashMuted mb-1">Product Title</p>
                  <p className="text-sm font-semibold text-dashText">{storeContent.productTitle}</p>
                </div>
                <div>
                  <p className="text-xs text-dashMuted mb-1">SEO Title</p>
                  <p className="text-sm text-dashText">{storeContent.seoTitle}</p>
                </div>
                <div>
                  <p className="text-xs text-dashMuted mb-1">Meta Description</p>
                  <p className="text-xs text-dashText bg-dashSurface2/50 rounded-lg p-2">{storeContent.metaDescription}</p>
                </div>
                <div>
                  <p className="text-xs text-dashMuted mb-2">Bullet Points</p>
                  <ul className="space-y-1">
                    {storeContent.bulletPoints.map((bp, i) => (
                      <li key={i} className="text-xs text-dashText flex items-start gap-1.5">
                        <CheckCircle2 size={12} className="text-green-400 mt-0.5 shrink-0" />
                        {bp}
                      </li>
                    ))}
                  </ul>
                </div>
                {storeContent.faqs.length > 0 && (
                  <div>
                    <p className="text-xs text-dashMuted mb-2">FAQs</p>
                    <div className="space-y-2">
                      {storeContent.faqs.slice(0, 3).map((faq, i) => (
                        <div key={i} className="bg-dashSurface2/50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-dashText">{faq.q}</p>
                          <p className="text-xs text-dashMuted mt-1">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  {(() => {
                    const prod = myProducts.find(p => p.id === selectedMyProduct)
                    const heroPrompt = prod?.product_data?.visualBrief?.heroImagePrompt ?? ''
                    const videoPrompt = prod?.product_data?.visualBrief?.productVideoPrompt ?? ''
                    return (
                      <>
                        <a href={`/${locale}/create?prompt=${encodeURIComponent(heroPrompt)}`} className="text-xs text-accent bg-accent/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-accent/20 transition-colors">
                          <Film size={12} /> Generate Product Images →
                        </a>
                        <a href={`/${locale}/video-studio?prompt=${encodeURIComponent(videoPrompt)}`} className="text-xs text-accent bg-accent/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-accent/20 transition-colors">
                          <Film size={12} /> Generate Product Video →
                        </a>
                      </>
                    )
                  })()}
                </div>
                <ActionExplanation title="Store Content Generated" description="Drake has written conversion-optimised Shopify content including SEO title, meta description, bullet points, and FAQs. Copy it directly into your Shopify product editor." />
              </div>
            )}
          </div>
        )}

        {/* Tab: Ad Creator */}
        {tab === 'ads' && (
          <div className="space-y-6">
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
              <h2 className="text-base font-semibold text-dashText mb-4">Create Ad Campaigns</h2>
              <p className="text-sm text-dashMuted mb-4">Select a product to build a full Meta, Google, and TikTok campaign.</p>
              <div className="mb-4">
                <label className="text-xs text-dashMuted block mb-1.5">Select Product</label>
                <select
                  value={selectedMyProduct}
                  onChange={e => setSelectedMyProduct(e.target.value)}
                  className="w-full max-w-sm bg-dashSurface2 border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
                >
                  <option value="">Choose a product...</option>
                  {myProducts.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}
                </select>
              </div>

              {selectedMyProduct && (() => {
                const prod = myProducts.find(p => p.id === selectedMyProduct)
                if (!prod) return null
                const adData = prod.product_data?.adCampaigns?.metaAd
                return (
                  <div className="space-y-3">
                    {adData && (
                      <div className="bg-dashSurface2/50 rounded-xl p-4">
                        <p className="text-xs text-dashMuted mb-2">Pre-filled Ad Preview</p>
                        <p className="text-sm font-semibold text-dashText">Hook: {adData.hook}</p>
                        <p className="text-xs text-dashMuted mt-1">Targeting: {adData.targeting}</p>
                        <p className="text-xs text-dashMuted">Daily Budget: {adData.dailyBudget}</p>
                      </div>
                    )}
                    <a
                      href={`/${locale}/ads?product=${encodeURIComponent(prod.product_name)}&hook=${encodeURIComponent(adData?.hook ?? '')}`}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors"
                    >
                      <TrendingUp size={16} />
                      Build Full Ad Campaign →
                    </a>
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* Tab: My Products */}
        {tab === 'products' && (
          <div className="space-y-4">
            <div className="bg-dashCard rounded-xl border border-dashSurface2 overflow-hidden">
              {myProducts.length === 0 ? (
                <div className="p-8 text-center">
                  <Package size={32} className="text-dashMuted mx-auto mb-3" />
                  <p className="text-dashText font-medium mb-1">No products yet</p>
                  <p className="text-sm text-dashMuted">Use the Product Finder to discover and save winning products.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dashSurface2">
                      <th className="text-left text-xs text-dashMuted px-4 py-3">Product</th>
                      <th className="text-left text-xs text-dashMuted px-4 py-3">Status</th>
                      <th className="text-left text-xs text-dashMuted px-4 py-3">Monthly Revenue</th>
                      <th className="text-left text-xs text-dashMuted px-4 py-3">Monthly Spend</th>
                      <th className="text-left text-xs text-dashMuted px-4 py-3">ROAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myProducts.map(p => {
                      const sc = PRODUCT_STATUSES[p.status as keyof typeof PRODUCT_STATUSES] ?? PRODUCT_STATUSES.researching
                      return (
                        <tr key={p.id} className="border-b border-dashSurface2 last:border-0 hover:bg-dashSurface2/30 cursor-pointer transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-dashText">{p.product_name}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', sc.color, sc.bg)}>{sc.label}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-green-400 font-semibold">€{(p.monthly_revenue ?? 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-dashText">€{(p.monthly_spend ?? 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-dashText">{(p.roas ?? 0).toFixed(2)}x</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
