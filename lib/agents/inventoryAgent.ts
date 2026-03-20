import { getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON, WEB_SEARCH_TOOL } from './client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InventoryData {
  items: Array<{
    name: string
    category?: string
    currentStock: number
    unit: string
    costPerUnit: number
    sellingPrice?: number
    monthlySales?: number
    supplier?: string
    leadTimeDays?: number
    reorderPoint?: number
  }>
  currency: string
  businessName: string
  businessCategory: string
}

export interface InventoryReport {
  totalInventoryValue: number
  totalSkus: number
  stockAlerts: Array<{
    itemName: string
    alertType: 'out_of_stock' | 'low_stock' | 'overstock' | 'slow_moving' | 'dead_stock'
    severity: 'critical' | 'warning' | 'info'
    currentStock: number
    recommendedAction: string
    urgency: 'immediate' | 'this_week' | 'this_month'
  }>
  demandAnalysis: Array<{
    itemName: string
    demandTrend: 'increasing' | 'stable' | 'decreasing' | 'seasonal'
    seasonalPeaks?: string[]
    reorderRecommendation: string
    optimalStockLevel: number
  }>
  supplierAlternatives: Array<{
    currentItem: string
    currentSupplier: string
    currentCost: number
    alternatives: Array<{
      supplierName: string
      estimatedCost: number
      estimatedSaving: number
      notes: string
    }>
  }>
  supplyRisks: Array<{
    risk: string
    affectedItems: string[]
    mitigation: string
  }>
  costOptimisation: {
    totalPotentialSaving: number
    opportunities: Array<{
      action: string
      saving: number
      effort: 'low' | 'medium' | 'high'
    }>
  }
  restockingPlan: Array<{
    itemName: string
    orderQuantity: number
    orderBy: string
    estimatedCost: number
    priority: 'urgent' | 'normal' | 'planned'
  }>
  marketTrends: string[]
  executiveSummary: string
}

// ─── Agent ────────────────────────────────────────────────────────────────────

export async function runInventoryAnalysis(data: InventoryData, locale: string): Promise<InventoryReport> {
  const client = getClient()

  const totalInventoryValue = data.items.reduce((sum, item) => sum + item.currentStock * item.costPerUnit, 0)

  const itemsSummary = data.items
    .map(
      (item) =>
        `- ${item.name}` +
        (item.category ? ` [${item.category}]` : '') +
        `: ${item.currentStock} ${item.unit} @ ${data.currency}${item.costPerUnit}/unit` +
        (item.sellingPrice ? `, sells at ${data.currency}${item.sellingPrice}` : '') +
        (item.monthlySales ? `, ${item.monthlySales} sold/month` : '') +
        (item.supplier ? `, supplier: ${item.supplier}` : '') +
        (item.leadTimeDays ? `, lead time: ${item.leadTimeDays} days` : '') +
        (item.reorderPoint ? `, reorder at: ${item.reorderPoint}` : '')
    )
    .join('\n')

  const response = await client.messages.create({
    model: MODELS.SPECIALIST,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    tools: [WEB_SEARCH_TOOL],
    system: `You are ELEVO AI's Inventory & Supply Chain Specialist — Rex. You are an expert in inventory management, procurement, and supply chain optimisation for small and medium businesses.

Your role is to:
1. Identify stock alerts — out of stock, low stock (below reorder point or <2 weeks supply), overstock (>3 months supply), slow-moving (no sales in 60 days), dead stock (no sales in 90+ days)
2. Analyse demand trends and seasonality based on monthly sales data
3. Search the web for supplier alternatives and current market pricing to find cost savings
4. Identify supply chain risks (single-supplier dependency, long lead times, price volatility)
5. Build a prioritised restocking plan with exact order quantities and deadlines
6. Find cost optimisation opportunities (bulk buying, alternative suppliers, eliminating dead stock)
7. Surface relevant market trends for the ${data.businessCategory} sector

REORDER LOGIC:
- If monthly_sales > 0: optimal stock = monthly_sales * 1.5 (6 weeks cover)
- If currentStock < reorderPoint: critical alert
- If currentStock < (monthlySales * 0.5): low stock warning
- If currentStock > (monthlySales * 3): overstock — tie up in capital

Use web search to find current market trends, price benchmarks, and supplier alternatives relevant to ${data.businessCategory} businesses.

Locale: ${locale}`,
    messages: [
      {
        role: 'user',
        content: `Analyse the inventory for ${data.businessName} (${data.businessCategory}).
Currency: ${data.currency}
Total inventory value: ${data.currency}${totalInventoryValue.toFixed(2)}
Total SKUs: ${data.items.length}

INVENTORY DATA:
${itemsSummary}

Search for market trends and supplier alternatives relevant to this business type. Identify all stock alerts, demand patterns, and cost saving opportunities. Build a prioritised restocking plan.

Return ONLY valid JSON:
{
  "totalInventoryValue": <number>,
  "totalSkus": <number>,
  "stockAlerts": [
    {
      "itemName": "<name>",
      "alertType": "out_of_stock|low_stock|overstock|slow_moving|dead_stock",
      "severity": "critical|warning|info",
      "currentStock": <number>,
      "recommendedAction": "<specific action>",
      "urgency": "immediate|this_week|this_month"
    }
  ],
  "demandAnalysis": [
    {
      "itemName": "<name>",
      "demandTrend": "increasing|stable|decreasing|seasonal",
      "seasonalPeaks": ["<month or season>"],
      "reorderRecommendation": "<specific recommendation>",
      "optimalStockLevel": <number>
    }
  ],
  "supplierAlternatives": [
    {
      "currentItem": "<item name>",
      "currentSupplier": "<supplier or unknown>",
      "currentCost": <number>,
      "alternatives": [
        {
          "supplierName": "<supplier name>",
          "estimatedCost": <number>,
          "estimatedSaving": <number per unit>,
          "notes": "<notes on this alternative>"
        }
      ]
    }
  ],
  "supplyRisks": [
    {
      "risk": "<risk description>",
      "affectedItems": ["<item name>"],
      "mitigation": "<mitigation strategy>"
    }
  ],
  "costOptimisation": {
    "totalPotentialSaving": <number per month>,
    "opportunities": [
      {
        "action": "<specific action>",
        "saving": <number per month>,
        "effort": "low|medium|high"
      }
    ]
  },
  "restockingPlan": [
    {
      "itemName": "<name>",
      "orderQuantity": <number>,
      "orderBy": "<date or timeframe, e.g. Within 3 days>",
      "estimatedCost": <number>,
      "priority": "urgent|normal|planned"
    }
  ],
  "marketTrends": ["<trend 1>", "<trend 2>", "<trend 3>"],
  "executiveSummary": "<2-3 paragraph summary of inventory health, key risks, and top 3 actions>"
}`,
      },
    ],
  })

  try {
    return parseJSON<InventoryReport>(extractText(response))
  } catch {
    return {
      totalInventoryValue: 0,
      totalSkus: 0,
      stockAlerts: [],
      demandAnalysis: [],
      supplierAlternatives: [],
      supplyRisks: [],
      costOptimisation: {
        totalPotentialSaving: 0,
        opportunities: [],
      },
      restockingPlan: [],
      marketTrends: [],
      executiveSummary: 'Inventory analysis could not be completed. Please check your data and try again.',
    }
  }
}
