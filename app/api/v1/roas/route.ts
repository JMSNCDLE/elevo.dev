import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { validateApiKey } from '@/lib/api-auth'
import { getClient, MODELS, MAX_TOKENS, extractText } from '@/lib/agents/client'

const Schema = z.object({
  adSpend: z.number().positive(),
  revenue: z.number().positive(),
  platform: z.string().default('Google Ads'),
  campaignData: z.record(z.unknown()).optional(),
})

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization') ?? ''
  const apiKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

  const { valid, userId } = await validateApiKey(apiKey)
  if (!valid || !userId) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const { adSpend, revenue, platform, campaignData } = parsed.data
  const roas = revenue / adSpend

  const supabase = await createServiceClient()
  const { data: bp } = await supabase
    .from('business_profiles')
    .select('name, category, city')
    .eq('user_id', userId)
    .single()

  const client = getClient()
  const prompt = `Analyse the following ROAS data for ${bp?.name ?? 'a business'}:

Platform: ${platform}
Ad Spend: £${adSpend}
Revenue: £${revenue}
ROAS: ${roas.toFixed(2)}x
${campaignData ? `Campaign data: ${JSON.stringify(campaignData)}` : ''}

Provide:
1. ROAS assessment (good/average/poor vs industry benchmarks)
2. Key insights
3. Top 3 actionable recommendations
4. Whether to increase, maintain, or reduce spend

Be specific and actionable.`

  try {
    const response = await client.messages.create({
      model: MODELS.AGENT,
      max_tokens: MAX_TOKENS.MEDIUM,
      messages: [{ role: 'user', content: prompt }],
    })

    return NextResponse.json({
      roas,
      adSpend,
      revenue,
      platform,
      analysis: extractText(response),
    })
  } catch (err) {
    console.error('v1 roas error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
