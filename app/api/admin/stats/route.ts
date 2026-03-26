import { NextResponse } from 'next/server'
import { createServerClient, createServiceClient } from '@/lib/supabase/server'

const ADMIN_USER_ID = '5dc15dea-4633-441b-b37a-5406e7235114'

export async function GET() {
  // Auth check — must be the owner
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Allow owner OR admin role
  if (user.id !== ADMIN_USER_ID) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // Use service role for admin-level queries
  const admin = await createServiceClient()

  // Fetch all profiles
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, plan, credits_used, credits_limit, created_at, subscription_status')
    .order('created_at', { ascending: false })

  if (!profiles) {
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
  }

  const totalUsers = profiles.length
  const activeTrials = profiles.filter(p => p.plan === 'trial').length
  const paidUsers = profiles.filter(p => p.plan !== 'trial').length
  const totalGenerations = profiles.reduce((s, p) => s + (p.credits_used ?? 0), 0)

  // Plan breakdown
  const planCounts: Record<string, number> = {}
  for (const p of profiles) {
    planCounts[p.plan] = (planCounts[p.plan] ?? 0) + 1
  }

  const planRevenue: Record<string, number> = { launch: 39, orbit: 79, galaxy: 149 }
  const monthlyRevenue = profiles.reduce((s, p) => s + (planRevenue[p.plan] ?? 0), 0)

  // Recent signups (last 20)
  const recentSignups = profiles.slice(0, 20).map(p => ({
    id: p.id,
    plan: p.plan,
    credits_used: p.credits_used,
    credits_limit: p.credits_limit,
    created_at: p.created_at,
  }))

  // Agent usage — query saved_generations for content type counts
  const { data: generations } = await admin
    .from('saved_generations')
    .select('content_type')
    .limit(1000)

  const agentUsage: Record<string, number> = {}
  if (generations) {
    for (const g of generations) {
      const type = g.content_type || 'unknown'
      agentUsage[type] = (agentUsage[type] ?? 0) + 1
    }
  }

  // System health — basic checks
  const healthChecks = {
    supabase: 'operational',
    api: 'operational',
    stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not configured',
    anthropic: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not configured',
    resend: process.env.RESEND_API_KEY ? 'configured' : 'not configured',
    twilio: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'not configured',
  }

  return NextResponse.json({
    totalUsers,
    activeTrials,
    paidUsers,
    totalGenerations,
    monthlyRevenue,
    planCounts,
    recentSignups,
    agentUsage,
    healthChecks,
  })
}
