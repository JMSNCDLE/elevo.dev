import type { WinningProduct } from '@/lib/agents/dropshippingAgent'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShopifyCredentials {
  shopDomain: string
  accessToken: string
}

interface ShopifyOrder {
  id: number
  total_price: string
  financial_status: string
  fulfillment_status: string | null
  created_at: string
  customer?: { first_name?: string; last_name?: string; email?: string }
  line_items: Array<{ product_id: number; title: string; quantity: number; price: string }>
}

interface ShopifyProduct {
  id: number
  title: string
  status: string
  variants: Array<{ inventory_quantity: number; price: string }>
}

// ─── Base fetch helper ────────────────────────────────────────────────────────

async function shopifyFetch<T>(
  creds: ShopifyCredentials,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `https://${creds.shopDomain}/admin/api/2024-01/${endpoint}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'X-Shopify-Access-Token': creds.accessToken,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Shopify API error ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}

// ─── getShopifyAnalytics ──────────────────────────────────────────────────────

export async function getShopifyAnalytics(
  creds: ShopifyCredentials,
  period: string
): Promise<{
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  conversionRate: number
  topProducts: Array<{ title: string; revenue: number; orders: number }>
  trafficSources: Record<string, number>
  abandonedCheckouts: number
  refundRate: number
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>
}> {
  // Calculate date range
  const days = period === '7d' ? 7 : period === '90d' ? 90 : period === 'all' ? 365 : 30
  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - days)
  const createdAtMin = startDate.toISOString()

  // Fetch orders
  const ordersRes = await shopifyFetch<{ orders: ShopifyOrder[] }>(
    creds,
    `orders.json?status=any&created_at_min=${createdAtMin}&limit=250`
  )
  const orders = ordersRes.orders || []

  // Aggregate totals
  let totalRevenue = 0
  let totalOrders = orders.length
  const productRevenue: Record<string, { title: string; revenue: number; orders: number }> = {}
  const revenueByDayMap: Record<string, { revenue: number; orders: number }> = {}
  let refundCount = 0

  for (const order of orders) {
    const amount = parseFloat(order.total_price) || 0
    totalRevenue += amount

    if (order.financial_status === 'refunded' || order.financial_status === 'partially_refunded') {
      refundCount++
    }

    // Group by day
    const day = order.created_at.slice(0, 10)
    if (!revenueByDayMap[day]) revenueByDayMap[day] = { revenue: 0, orders: 0 }
    revenueByDayMap[day].revenue += amount
    revenueByDayMap[day].orders += 1

    // Group by product
    for (const item of order.line_items) {
      const key = String(item.product_id)
      if (!productRevenue[key]) productRevenue[key] = { title: item.title, revenue: 0, orders: 0 }
      productRevenue[key].revenue += parseFloat(item.price) * item.quantity
      productRevenue[key].orders += 1
    }
  }

  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Top products (sorted by revenue)
  const topProducts = Object.values(productRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map(p => ({ title: p.title, revenue: Math.round(p.revenue * 100) / 100, orders: p.orders }))

  // Revenue by day (sorted)
  const revenueByDay = Object.entries(revenueByDayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, revenue: Math.round(v.revenue * 100) / 100, orders: v.orders }))

  // Abandoned checkouts
  let abandonedCheckouts = 0
  try {
    const checkoutsRes = await shopifyFetch<{ checkouts: unknown[] }>(
      creds,
      `checkouts.json?created_at_min=${createdAtMin}&limit=250`
    )
    abandonedCheckouts = (checkoutsRes.checkouts || []).length
  } catch {
    abandonedCheckouts = 0
  }

  const refundRate = totalOrders > 0 ? Math.round((refundCount / totalOrders) * 100 * 10) / 10 : 0

  // Traffic sources — Shopify REST doesn't expose analytics; return placeholder breakdown
  const trafficSources: Record<string, number> = {
    direct: 35,
    social: 28,
    search: 22,
    email: 10,
    referral: 5,
  }

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    conversionRate: 2.4, // placeholder — requires session data (Plus API)
    topProducts,
    trafficSources,
    abandonedCheckouts,
    refundRate,
    revenueByDay,
  }
}

// ─── getShopifyProducts ───────────────────────────────────────────────────────

export async function getShopifyProducts(
  creds: ShopifyCredentials
): Promise<Array<{ id: string; title: string; status: string; inventory: number; price: string }>> {
  const res = await shopifyFetch<{ products: ShopifyProduct[] }>(
    creds,
    'products.json?limit=250'
  )

  return (res.products || []).map(p => ({
    id: String(p.id),
    title: p.title,
    status: p.status,
    inventory: p.variants.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0),
    price: p.variants[0]?.price ?? '0.00',
  }))
}

// ─── createShopifyProduct ─────────────────────────────────────────────────────

export async function createShopifyProduct(
  creds: ShopifyCredentials,
  product: WinningProduct['storeContent']
): Promise<{ productId: string; productUrl: string }> {
  const body = {
    product: {
      title: product.productTitle,
      body_html: product.productDescription,
      tags: product.tags.join(', '),
      status: 'draft',
      metafields: [
        { namespace: 'global', key: 'title_tag', value: product.seoTitle, type: 'single_line_text_field' },
        { namespace: 'global', key: 'description_tag', value: product.metaDescription, type: 'single_line_text_field' },
      ],
    },
  }

  const res = await shopifyFetch<{ product: { id: number } }>(
    creds,
    'products.json',
    { method: 'POST', body: JSON.stringify(body) }
  )

  const productId = String(res.product.id)
  const productUrl = `https://${creds.shopDomain}/admin/products/${productId}`

  return { productId, productUrl }
}

// ─── getShopifyOrders ─────────────────────────────────────────────────────────

export async function getShopifyOrders(
  creds: ShopifyCredentials,
  limit: number
): Promise<Array<{ id: string; total: number; status: string; createdAt: string; customer: string }>> {
  const res = await shopifyFetch<{ orders: ShopifyOrder[] }>(
    creds,
    `orders.json?status=any&limit=${Math.min(limit, 250)}`
  )

  return (res.orders || []).map(o => ({
    id: String(o.id),
    total: parseFloat(o.total_price) || 0,
    status: o.fulfillment_status || o.financial_status || 'pending',
    createdAt: o.created_at,
    customer: o.customer
      ? [o.customer.first_name, o.customer.last_name].filter(Boolean).join(' ') || o.customer.email || 'Guest'
      : 'Guest',
  }))
}
