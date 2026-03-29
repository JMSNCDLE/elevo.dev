import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { getMiraMessage, ONBOARDING_CHECKLIST } from '@/lib/agents/miraOnboardingAgent'

const PostSchema = z.object({
  currentStep: z.string().default('profile'),
  question: z.string().optional(),
  locale: z.string().default('en'),
})

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed_steps')
    .eq('id', user.id)
    .single()

  const completedSteps: string[] = profile?.onboarding_completed_steps ?? []

  return NextResponse.json({
    checklist: ONBOARDING_CHECKLIST,
    completedSteps,
    completionPercent: Math.round((completedSteps.length / ONBOARDING_CHECKLIST.length) * 100),
  })
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = PostSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { currentStep, question, locale } = parsed.data

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed_steps')
    .eq('id', user.id)
    .single()

  const completedSteps: string[] = profile?.onboarding_completed_steps ?? []

  const { data: bp } = await supabase
    .from('business_profiles')
    .select('name, category, city, country, services, unique_selling_points, description')
    .eq('user_id', user.id)
    .single()

  try {
    const miraResponse = await getMiraMessage(
      bp ?? null,
      completedSteps,
      currentStep,
      question,
      locale
    )

    return NextResponse.json(miraResponse)
  } catch (err) {
    console.error('Mira error:', err)
    return NextResponse.json({ error: 'Mira is unavailable right now. Please try again.' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { stepId } = await request.json()
  if (!stepId) return NextResponse.json({ error: 'stepId required' }, { status: 400 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed_steps')
    .eq('id', user.id)
    .single()

  const existing: string[] = profile?.onboarding_completed_steps ?? []
  if (!existing.includes(stepId)) {
    await supabase
      .from('profiles')
      .update({ onboarding_completed_steps: [...existing, stepId] })
      .eq('id', user.id)
  }

  return NextResponse.json({ success: true })
}
