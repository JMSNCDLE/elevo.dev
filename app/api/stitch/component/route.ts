import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { generateUIComponent } from '@/lib/agents/stitchDesignAgent'
import { ADMIN_IDS } from '@/lib/admin'

const CREDIT_COST = 2

const Schema = z.object({
  componentType: z.enum(['Hero', 'Navbar', 'Pricing', 'CTA', 'Form', 'Card', 'Footer', 'Testimonials', 'Features', 'FAQ', 'Team', 'Gallery']),
  style: z.enum(['modern', 'minimal', 'bold', 'playful', 'luxury']),
  description: z.string().min(5),
  framework: z.string().default('HTML + Tailwind CSS'),
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

  if (!ADMIN_IDS.includes(user.id) && (!profile || (profile.plan !== 'orbit' && profile.plan !== 'galaxy'))) {
    return NextResponse.json({ error: 'Orbit plan required' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  if (!ADMIN_IDS.includes(user!.id) && profile && (profile ?? { credits_used: 0 }).credits_used + CREDIT_COST > (profile ?? { credits_limit: 9999 }).credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  try {
    const result = await generateUIComponent(
      parsed.data.componentType,
      parsed.data.style,
      parsed.data.description,
      parsed.data.framework,
      parsed.data.locale
    )

    await supabase
      .from('profiles')
      .update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + CREDIT_COST })
      .eq('id', user.id)

    // Save to stitch_designs
    await supabase.from('stitch_designs').insert({
      user_id: user.id,
      component_type: parsed.data.componentType,
      description: parsed.data.description,
      code: result,
    })

    return NextResponse.json({ result })
  } catch (err) {
    console.error('Stitch component error:', err)
    return NextResponse.json({ error: 'Agent failed. Please try again.' }, { status: 500 })
  }
}
