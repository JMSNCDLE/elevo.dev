import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { generateDocument } from '@/lib/agents/documentAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const Schema = z.object({
  businessProfileId: z.string().uuid(),
  documentType: z.enum([
    'report', 'proposal', 'presentation', 'spreadsheet',
    'business_plan', 'invoice', 'contract', 'marketing_brief',
    'press_release', 'email_sequence',
  ]),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  audience: z.string().max(200).optional(),
  tone: z.string().max(50).optional(),
  locale: z.string().default('en'),
})

const CREDIT_COST = 2

export async function POST(request: Request) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_used, credits_limit')
    .eq('id', user.id)
    .single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  if (profile.credits_used + CREDIT_COST > profile.credits_limit) {
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
    const result = await generateDocument(
      {
        businessProfile: bp as BusinessProfile,
        documentType: parsed.data.documentType,
        title: parsed.data.title,
        description: parsed.data.description,
        audience: parsed.data.audience,
        tone: parsed.data.tone,
        locale: parsed.data.locale,
      },
      parsed.data.locale
    )

    // Deduct credits after success
    await supabase
      .from('profiles')
      .update({ credits_used: profile.credits_used + CREDIT_COST })
      .eq('id', user.id)

    // Save to saved_generations
    await supabase
      .from('saved_generations')
      .insert({
        user_id: user.id,
        business_profile_id: parsed.data.businessProfileId,
        type: 'seo', // using seo as a proxy content type for documents
        title: result.title,
        content: JSON.stringify(result),
        metadata: { documentType: parsed.data.documentType, source: 'elevo_docs' },
      })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[docs/generate]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
