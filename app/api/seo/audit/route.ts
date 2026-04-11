import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { runComprehensiveAudit } from '@/lib/agents/seoAgent'

const schema = z.object({
  domain: z.string().min(1),
  keywords: z.array(z.string()).min(1).max(10),
  locale: z.string().default('en'),
  targetCountry: z.string().default('us'),
  competitorDomains: z.array(z.string()).max(3).default([]),
  depth: z.enum(['quick', 'full', 'deep']).default('quick'),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { domain, keywords, locale, targetCountry, competitorDomains, depth } = parsed.data

  // Insert pending row so the user sees their audit in history immediately
  const { data: pending } = await supabase
    .from('seo_audits')
    .insert({
      user_id: user.id,
      domain,
      target_country: targetCountry,
      keywords,
      competitor_domains: competitorDomains,
      audit_depth: depth,
      status: 'pending',
    })
    .select('id')
    .single()

  try {
    const result = await runComprehensiveAudit({
      domain,
      keywords,
      competitorDomains,
      targetCountry,
      locale,
      depth,
    })

    if (pending?.id) {
      await supabase
        .from('seo_audits')
        .update({
          status: 'complete',
          seo_score: result.overview.seoScore,
          technical_health: result.overview.technicalHealth,
          content_score: result.overview.contentScore,
          backlink_score: result.overview.backlinkScore,
          overview: result.overview,
          keyword_analysis: result.keywords,
          technical_issues: result.technicalIssues,
          content_plan: result.contentPlan,
          competitor_data: result.competitors,
        })
        .eq('id', pending.id)
    }

    return NextResponse.json({ result, auditId: pending?.id })
  } catch (err) {
    if (pending?.id) {
      await supabase.from('seo_audits').update({ status: 'error' }).eq('id', pending.id)
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Audit failed' },
      { status: 500 }
    )
  }
}
