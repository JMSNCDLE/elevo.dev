import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { buildAdCampaign, type AdCampaignBrief } from '@/lib/agents/adCampaignAgent'

const schema = z.object({
  businessProfileId: z.string().uuid(),
  brief: z.object({
    platform: z.enum(['meta', 'google', 'tiktok', 'linkedin', 'pinterest', 'snapchat']),
    objective: z.enum(['awareness', 'traffic', 'leads', 'conversions', 'app_installs', 'video_views']),
    dailyBudget: z.number().positive(),
    currency: z.string().default('GBP'),
    targetLocation: z.string(),
    campaignDuration: z.string(),
    productOrService: z.string().min(1),
    uniqueSellingPoint: z.string(),
    locale: z.string().default('en'),
  }),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { businessProfileId, brief } = parsed.data

  // Orbit+ check
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_used, credits_limit')
    .eq('id', user.id)
    .single()

  if (!profile || !['orbit', 'galaxy'].includes(profile.plan ?? '')) {
    return NextResponse.json({ error: 'Orbit plan required' }, { status: 403 })
  }
  if (profile.credits_used + 3 > profile.credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  // Load business profile
  const { data: bp } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', businessProfileId)
    .eq('user_id', user.id)
    .single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  const campaignBrief: AdCampaignBrief = {
    businessProfile: bp,
    ...brief,
  }

  const output = await buildAdCampaign(campaignBrief)

  // Save campaign
  const { data: saved } = await supabase.from('ad_campaigns').insert({
    user_id: user.id,
    business_profile_id: businessProfileId,
    name: output.campaignName,
    platform: brief.platform,
    objective: brief.objective,
    daily_budget: brief.dailyBudget,
    currency: brief.currency,
    target_location: brief.targetLocation,
    campaign_duration: brief.campaignDuration,
    product_or_service: brief.productOrService,
    status: 'draft',
    output,
  }).select('id').single()

  // Deduct credits
  await supabase.from('profiles').update({ credits_used: profile.credits_used + 3 }).eq('id', user.id)

  return NextResponse.json({ output, campaignId: saved?.id })
}
