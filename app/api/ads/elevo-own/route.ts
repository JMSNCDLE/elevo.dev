import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateELEVOOwnAds } from '@/lib/agents/adCampaignAgent'

const schema = z.object({
  targetMarket: z.enum(['spain_hospitality', 'uk_trades', 'uk_professional', 'global_agencies']),
  locale: z.string().default('en'),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Admin only
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { targetMarket, locale } = parsed.data
  const output = await generateELEVOOwnAds(targetMarket, locale)
  return NextResponse.json({ output })
}
