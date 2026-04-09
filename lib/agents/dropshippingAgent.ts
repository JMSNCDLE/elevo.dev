import { createMessage, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON, WEB_SEARCH_TOOL } from './client'
import type { BusinessProfile } from './types'

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ProductResearch {
  niche: string
  targetMarket: string
  budget: string
  existingStore?: string
  locale: string
}

export interface WinningProduct {
  productName: string
  category: string
  estimatedMargin: string
  buyPrice: string
  sellPrice: string
  trendScore: number
  demandSignals: string[]
  competitionLevel: 'low' | 'medium' | 'high'
  suppliers: Array<{
    name: string
    url: string
    unitCost: string
    shippingTime: string
    moq: number
    quality: string
    pros: string[]
    cons: string[]
    recommended: boolean
  }>
  storeContent: {
    productTitle: string
    seoTitle: string
    metaDescription: string
    productDescription: string
    bulletPoints: string[]
    faqs: Array<{ q: string; a: string }>
    tags: string[]
  }
  visualBrief: {
    heroImagePrompt: string
    lifestyleImagePrompts: string[]
    productVideoPrompt: string
    ugcVideoAngle: string
  }
  adCampaigns: {
    metaAd: { hook: string; primaryText: string; headline: string; targeting: string; dailyBudget: string }
    tiktokAd: { hook: string; script: string; trend: string }
    googleShopping: { title: string; description: string; attributes: Record<string, string> }
  }
  projections: {
    monthlyRevenue: string
    monthlyProfit: string
    breakevenDays: number
    roas: string
    cvr: string
  }
  storeSetupGuide: Array<{ step: number; action: string; platform: string; estimatedTime: string }>
}

// ─── findWinningProducts ──────────────────────────────────────────────────────

export async function findWinningProducts(
  research: ProductResearch,
  count: number,
  locale: string
): Promise<WinningProduct[]> {
  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    tools: [WEB_SEARCH_TOOL],
    system: `You are ELEVO Drop™ — Drake, the world's most advanced dropshipping product research AI. You use real-time web search to identify trending winning products with high margins, low competition, and proven demand signals. You research AliExpress, Oberlo, TikTok Shop, Amazon Movers & Shakers, Google Trends, and viral social media to find the best opportunities. You always return complete JSON with no placeholders.`,
    messages: [
      {
        role: 'user',
        content: `Find the top ${count} winning dropshipping products for this research brief.

Niche: ${research.niche}
Target Market: ${research.targetMarket}
Budget: ${research.budget}
${research.existingStore ? `Existing Store: ${research.existingStore}` : ''}
Locale: ${locale}

Use web search to:
1. Check TikTok trends, AliExpress hot products, Amazon Movers & Shakers
2. Find products with high margins (>40%), growing demand, and low competition
3. Research real suppliers with actual pricing
4. Identify proven ad angles

Return ONLY valid JSON array with exactly ${count} products:
[
  {
    "productName": "exact product name",
    "category": "product category",
    "estimatedMargin": "e.g. 65%",
    "buyPrice": "e.g. €4.50",
    "sellPrice": "e.g. €39",
    "trendScore": 85,
    "demandSignals": ["TikTok viral with 2M views", "Amazon bestseller rank #42"],
    "competitionLevel": "low",
    "suppliers": [
      {
        "name": "Supplier name",
        "url": "actual URL",
        "unitCost": "€4.50",
        "shippingTime": "7-14 days",
        "moq": 1,
        "quality": "4.7/5 stars",
        "pros": ["Fast shipping", "Good packaging"],
        "cons": ["Limited colour options"],
        "recommended": true
      }
    ],
    "storeContent": {
      "productTitle": "SEO title",
      "seoTitle": "60-char SEO title",
      "metaDescription": "155-char meta",
      "productDescription": "300-word description",
      "bulletPoints": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
      "faqs": [{"q": "question", "a": "answer"}],
      "tags": ["tag1", "tag2"]
    },
    "visualBrief": {
      "heroImagePrompt": "Midjourney/DALL-E prompt for hero product shot",
      "lifestyleImagePrompts": ["lifestyle prompt 1", "lifestyle prompt 2"],
      "productVideoPrompt": "Sora/Kling video prompt",
      "ugcVideoAngle": "UGC video concept and script angle"
    },
    "adCampaigns": {
      "metaAd": {
        "hook": "scroll-stopping first line",
        "primaryText": "full ad copy",
        "headline": "headline",
        "targeting": "audience targeting description",
        "dailyBudget": "€20-€50"
      },
      "tiktokAd": {
        "hook": "first 3 seconds",
        "script": "full TikTok ad script",
        "trend": "trending sound or format to use"
      },
      "googleShopping": {
        "title": "product title for Google Shopping",
        "description": "shopping description",
        "attributes": {"brand": "Generic", "material": "...", "color": "..."}
      }
    },
    "projections": {
      "monthlyRevenue": "€8,500",
      "monthlyProfit": "€3,200",
      "breakevenDays": 21,
      "roas": "3.2x",
      "cvr": "2.8%"
    },
    "storeSetupGuide": [
      {"step": 1, "action": "Create Shopify store", "platform": "Shopify", "estimatedTime": "30 mins"},
      {"step": 2, "action": "Install DSers or AutoDS", "platform": "Shopify App Store", "estimatedTime": "15 mins"}
    ]
  }
]`,
      },
    ],
  })

  try {
    const text = extractText(response)
    const result = parseJSON<WinningProduct[]>(text)
    return Array.isArray(result) ? result : [result as unknown as WinningProduct]
  } catch {
    return []
  }
}

// ─── analyseProduct ───────────────────────────────────────────────────────────

export async function analyseProduct(
  productUrl: string,
  businessContext: string,
  locale: string
): Promise<WinningProduct> {
  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    tools: [WEB_SEARCH_TOOL],
    system: `You are ELEVO Drop™ — Drake. You analyse specific products for dropshipping viability. You research competitors, pricing, demand, and suppliers to give a complete dropshipping assessment. Return thorough JSON with no placeholders.`,
    messages: [
      {
        role: 'user',
        content: `Analyse this product for dropshipping viability.

Product URL: ${productUrl}
Business Context: ${businessContext}
Locale: ${locale}

Search for:
1. This product on AliExpress, CJDropshipping, and other suppliers
2. Competitor stores selling this product
3. Reviews and demand signals
4. Ad examples on Facebook Ad Library

Return ONLY valid JSON matching the WinningProduct structure:
{
  "productName": "name",
  "category": "category",
  "estimatedMargin": "X%",
  "buyPrice": "€X.XX",
  "sellPrice": "€XX.XX",
  "trendScore": 75,
  "demandSignals": [],
  "competitionLevel": "medium",
  "suppliers": [],
  "storeContent": {
    "productTitle": "",
    "seoTitle": "",
    "metaDescription": "",
    "productDescription": "",
    "bulletPoints": [],
    "faqs": [],
    "tags": []
  },
  "visualBrief": {
    "heroImagePrompt": "",
    "lifestyleImagePrompts": [],
    "productVideoPrompt": "",
    "ugcVideoAngle": ""
  },
  "adCampaigns": {
    "metaAd": {"hook": "", "primaryText": "", "headline": "", "targeting": "", "dailyBudget": ""},
    "tiktokAd": {"hook": "", "script": "", "trend": ""},
    "googleShopping": {"title": "", "description": "", "attributes": {}}
  },
  "projections": {
    "monthlyRevenue": "",
    "monthlyProfit": "",
    "breakevenDays": 30,
    "roas": "",
    "cvr": ""
  },
  "storeSetupGuide": []
}`,
      },
    ],
  })

  try {
    return parseJSON<WinningProduct>(extractText(response))
  } catch {
    return {
      productName: 'Product Analysis',
      category: 'General',
      estimatedMargin: 'Unknown',
      buyPrice: 'Unknown',
      sellPrice: 'Unknown',
      trendScore: 50,
      demandSignals: [],
      competitionLevel: 'medium',
      suppliers: [],
      storeContent: {
        productTitle: '',
        seoTitle: '',
        metaDescription: '',
        productDescription: extractText(response).slice(0, 500),
        bulletPoints: [],
        faqs: [],
        tags: [],
      },
      visualBrief: {
        heroImagePrompt: '',
        lifestyleImagePrompts: [],
        productVideoPrompt: '',
        ugcVideoAngle: '',
      },
      adCampaigns: {
        metaAd: { hook: '', primaryText: '', headline: '', targeting: '', dailyBudget: '' },
        tiktokAd: { hook: '', script: '', trend: '' },
        googleShopping: { title: '', description: '', attributes: {} },
      },
      projections: {
        monthlyRevenue: '',
        monthlyProfit: '',
        breakevenDays: 30,
        roas: '',
        cvr: '',
      },
      storeSetupGuide: [],
    }
  }
}

// ─── findSuppliers ────────────────────────────────────────────────────────────

export async function findSuppliers(
  productName: string,
  targetMarket: string,
  locale: string
): Promise<WinningProduct['suppliers']> {
  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.MEDIUM,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    tools: [WEB_SEARCH_TOOL],
    system: `You are ELEVO Drop™ — Drake. You find and compare the best dropshipping suppliers for any product. You research AliExpress, CJDropshipping, Zendrop, Spocket, SourcinBox, and niche suppliers to give honest comparisons.`,
    messages: [
      {
        role: 'user',
        content: `Find the best suppliers for: ${productName}
Target Market: ${targetMarket}
Locale: ${locale}

Search for at least 4 suppliers including AliExpress options, CJDropshipping, and any niche suppliers.

Return ONLY valid JSON array:
[
  {
    "name": "supplier name",
    "url": "actual URL",
    "unitCost": "€X.XX",
    "shippingTime": "X-X days",
    "moq": 1,
    "quality": "4.5/5 stars",
    "pros": ["advantage 1", "advantage 2"],
    "cons": ["disadvantage 1"],
    "recommended": true
  }
]`,
      },
    ],
  })

  try {
    const result = parseJSON<WinningProduct['suppliers']>(extractText(response))
    return Array.isArray(result) ? result : []
  } catch {
    return []
  }
}

// ─── buildShopifyContent ──────────────────────────────────────────────────────

export async function buildShopifyContent(
  product: Partial<WinningProduct>,
  businessProfile: BusinessProfile,
  locale: string
): Promise<WinningProduct['storeContent']> {
  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: MAX_TOKENS.MEDIUM,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    system: `You are ELEVO Drop™ — Drake. You write conversion-optimised Shopify store content for dropshipping products. You understand SEO, buyer psychology, and e-commerce copywriting. Always return complete JSON.`,
    messages: [
      {
        role: 'user',
        content: `Write complete Shopify store content for this product.

Product: ${product.productName || 'Unknown product'}
Category: ${product.category || 'General'}
Buy Price: ${product.buyPrice || 'Unknown'}
Sell Price: ${product.sellPrice || 'Unknown'}
Business: ${businessProfile.business_name}
Tone: ${businessProfile.tone_of_voice}
Target Audience: ${businessProfile.target_audience || 'General consumers'}
Locale: ${locale}

Return ONLY valid JSON:
{
  "productTitle": "compelling product title (max 60 chars)",
  "seoTitle": "SEO-optimised page title (max 60 chars)",
  "metaDescription": "meta description (max 155 chars)",
  "productDescription": "300-400 word persuasive product description in HTML format",
  "bulletPoints": ["key feature 1", "key feature 2", "key feature 3", "key feature 4", "key feature 5"],
  "faqs": [
    {"q": "question 1", "a": "answer 1"},
    {"q": "question 2", "a": "answer 2"},
    {"q": "question 3", "a": "answer 3"},
    {"q": "question 4", "a": "answer 4"},
    {"q": "question 5", "a": "answer 5"}
  ],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`,
      },
    ],
  })

  try {
    return parseJSON<WinningProduct['storeContent']>(extractText(response))
  } catch {
    return {
      productTitle: product.productName || '',
      seoTitle: product.productName || '',
      metaDescription: '',
      productDescription: extractText(response).slice(0, 1000),
      bulletPoints: [],
      faqs: [],
      tags: [],
    }
  }
}
