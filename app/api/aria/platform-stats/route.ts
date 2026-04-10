import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function GET() {
  try {
    const supabase = getSupabase()
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setUTCHours(0, 0, 0, 0)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [totalRes, todayRes, weekRes, monthRes, trialsRes, paidRes, recentRes, waitlistRes, plansRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', monthAgo.toISOString()),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'trialing'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
      supabase.from('profiles').select('email, created_at, subscription_status').order('created_at', { ascending: false }).limit(5),
      supabase.from('waitlist').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('subscription_plan, subscription_status').in('subscription_status', ['active', 'trialing']),
    ])

    const planData = plansRes.data || []
    const plans = {
      launch: planData.filter(p => p.subscription_plan === 'launch').length,
      orbit: planData.filter(p => p.subscription_plan === 'orbit').length,
      galaxy: planData.filter(p => p.subscription_plan === 'galaxy').length,
    }

    return NextResponse.json({
      timestamp: now.toISOString(),
      users: {
        total: totalRes.count || 0,
        today: todayRes.count || 0,
        this_week: weekRes.count || 0,
        this_month: monthRes.count || 0,
        recent: recentRes.data || [],
      },
      subscriptions: {
        active_trials: trialsRes.count || 0,
        paid: paidRes.count || 0,
        plans,
      },
      waitlist: waitlistRes.count || 0,
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
