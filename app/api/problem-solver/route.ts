import { NextResponse } from 'next/server'
import { ADMIN_IDS } from '@/lib/admin'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { runProblemSolver } from '@/lib/agents/problemSolverAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const PostSchema = z.object({
  problem: z.string().min(10),
  businessProfileId: z.string().uuid().optional(),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = PostSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  // Credit check — Problem Solver costs 2 credits
  const { data: profile } = await supabase.from('profiles').select('credits_used, credits_limit').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  if (!ADMIN_IDS.includes(user!.id) && profile && (profile ?? { credits_used: 0 }).credits_used + 2 > (profile ?? { credits_limit: 9999 }).credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits. Problem Solver costs 2 credits.' }, { status: 402 })
  }

  // Load business profile
  let bp: BusinessProfile | null = null
  if (parsed.data.businessProfileId) {
    const { data } = await supabase.from('business_profiles').select('*').eq('id', parsed.data.businessProfileId).eq('user_id', user.id).single()
    bp = data as BusinessProfile
  } else {
    const { data } = await supabase.from('business_profiles').select('*').eq('user_id', user.id).eq('is_primary', true).single()
    bp = data as BusinessProfile
  }

  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  // Get CRM context
  const { data: crmStats } = await supabase.from('contacts').select('id, total_revenue').eq('user_id', user.id)
  const totalRevenue = crmStats?.reduce((sum, c) => sum + (c.total_revenue ?? 0), 0) ?? 0
  const totalContacts = crmStats?.length ?? 0

  try {
    const result = await runProblemSolver(bp, parsed.data.problem, { totalRevenue, totalContacts })

    // Save to history
    await supabase.from('problem_solver_history').insert({
      user_id: user.id,
      business_profile_id: bp.id,
      problem: parsed.data.problem,
      diagnosis: result.diagnosis,
      root_cause: result.rootCause,
      urgency: result.urgency,
      action_plan: result.actionPlan,
      generated_content: result.generatedContent ?? null,
      longer_term_recommendations: result.longerTermRecommendations,
      estimated_impact: result.estimatedImpact,
    })

    // Deduct 2 credits
    await supabase.from('profiles').update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + 2 }).eq('id', user.id)

    // Track analytics event
    await supabase.from('analytics_events').insert({
      user_id: user.id,
      business_profile_id: bp.id,
      event_type: 'problem_solved',
      agent_name: 'Max',
      feature: 'problem_solver',
      metadata: { urgency: result.urgency },
    })

    return NextResponse.json({ result })
  } catch (err) {
    console.error('Problem solver error:', err)
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
  }
}

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: history } = await supabase
    .from('problem_solver_history')
    .select('id, problem, diagnosis, urgency, estimated_impact, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ history: history ?? [] })
}
