import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { getShopifyProducts } from '@/lib/integrations/shopify'

const Schema = z.object({
  platform: z.enum(['shopify', 'woocommerce', 'wix', 'squarespace', 'custom']),
  storeUrl: z.string().min(3),
  accessToken: z.string().optional(),
  businessProfileId: z.string().uuid().optional(),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const { platform, storeUrl, accessToken, businessProfileId } = parsed.data

  // For Shopify, test the connection first
  if (platform === 'shopify') {
    if (!accessToken) return NextResponse.json({ error: 'Access token required for Shopify' }, { status: 400 })

    try {
      // Normalise shop domain
      const shopDomain = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
      await getShopifyProducts({ shopDomain, accessToken })
    } catch (err) {
      console.error('[store/connect] Shopify test failed:', err)
      return NextResponse.json({ error: 'Could not connect to Shopify store. Check your store URL and access token.' }, { status: 400 })
    }
  }

  try {
    const shopDomain = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')

    const { data: integration, error } = await supabase
      .from('store_integrations')
      .insert({
        user_id: user.id,
        business_profile_id: businessProfileId ?? null,
        platform,
        store_url: shopDomain,
        access_token: accessToken ?? null,
        is_active: true,
        connected_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('[store/connect] insert error:', error)
      return NextResponse.json({ error: 'Failed to save integration' }, { status: 500 })
    }

    return NextResponse.json({ integration })
  } catch (err) {
    console.error('[store/connect]', err)
    return NextResponse.json({ error: 'Connection failed' }, { status: 500 })
  }
}
