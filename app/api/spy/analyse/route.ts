import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { runCompetitorSpy } from '@/lib/agents/competitorSpyAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const CREDIT_COSTS: Record<string, number> = { quick: 1, deep: 3, full: 5 }

const Schema = z.object({
  competitorName: z.string().min(2),
  competitorWebsite: z.string().optional(),
  competitorInstagram: z.string().optional(),
  competitorGoogleBusiness: z.string().optional(),
  analysisDepth: z.enum(['quick', 'deep', 'full']).default('quick'),
  businessProfileId: z.string().uuid(),
  locale: z.string().default('en'),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_used, credits_limit')
    .eq('id', user.id)
    .single()
  if (!profile || (profile.plan !== 'orbit' && profile.plan !== 'galaxy')) {
    return NextResponse.json({ error: 'Orbit plan required' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const creditCost = CREDIT_COSTS[parsed.data.analysisDepth]
  if (profile.credits_used + creditCost > profile.credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  const { data: bp } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', parsed.data.businessProfileId)
    .eq('user_id', user.id)
    .single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  try {
    const report = await runCompetitorSpy(
      {
        competitorName: parsed.data.competitorName,
        competitorWebsite: parsed.data.competitorWebsite,
        competitorInstagram: parsed.data.competitorInstagram,
        competitorGoogleBusiness: parsed.data.competitorGoogleBusiness,
        yourBusinessProfile: bp as BusinessProfile,
        analysisDepth: parsed.data.analysisDepth,
        locale: parsed.data.locale,
      },
      parsed.data.locale,
    )

    await supabase.from('competitor_intel').upsert({
      user_id: user.id,
      business_profile_id: bp.id,
      competitor_name: parsed.data.competitorName,
      competitor_website: parsed.data.competitorWebsite,
      competitor_instagram: parsed.data.competitorInstagram,
      report,
      threat_level: report.threatLevel,
      analysis_depth: parsed.data.analysisDepth,
      last_refreshed_at: new Date().toISOString(),
      next_refresh_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })

    await supabase
      .from('profiles')
      .update({ credits_used: profile.credits_used + creditCost })
      .eq('id', user.id)

    return NextResponse.json({ report })
  } catch (err) {
    console.error('[spy/analyse]', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
