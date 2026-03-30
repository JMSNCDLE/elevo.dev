import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_IDS } from '@/lib/admin'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { auditInstagramProfile } from '@/lib/agents/instagramAuditAgent'
import { generateProspectDemoPage } from '@/lib/demo-pages/generator'

const Schema = z.object({
  instagramHandle: z.string().min(1),
  businessName: z.string().optional(),
  businessCategory: z.string().optional(),
  agencyName: z.string().optional(),
  locale: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_used, credits_limit')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Credit check — costs 5 credits
  if (!ADMIN_IDS.includes(user!.id) && profile && (profile ?? { credits_used: 0 }).credits_used + 5 > (profile ?? { credits_limit: 9999 }).credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits. Instagram Audit costs 5 credits.' }, { status: 402 })
  }

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const { instagramHandle, businessName, businessCategory, agencyName, locale } = parsed.data

  try {
    const audit = await auditInstagramProfile(
      {
        instagramHandle,
        businessName,
        businessCategory,
        agencyName,
        locale: locale ?? 'en',
      },
      locale ?? 'en'
    )

    const { pageSlug, pageUrl, expiresAt } = await generateProspectDemoPage(
      audit,
      user.id,
      agencyName ?? 'ELEVO AI'
    )

    // Deduct credits after success
    await supabase
      .from('profiles')
      .update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + 5 })
      .eq('id', user.id)

    return NextResponse.json({ audit, pageSlug, pageUrl, expiresAt })
  } catch (err) {
    console.error('Instagram audit error:', err)
    return NextResponse.json({ error: 'Audit failed. Please try again.' }, { status: 500 })
  }
}
