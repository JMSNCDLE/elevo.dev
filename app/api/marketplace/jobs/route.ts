import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { ADMIN_IDS } from '@/lib/admin'

// GET — list jobs (public, all authenticated users)
export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || ''
  const status = searchParams.get('status') || 'open'
  const myJobs = searchParams.get('my') === 'true'

  let query = supabase
    .from('marketplace_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (myJobs) {
    query = query.eq('poster_id', user.id)
  } else {
    query = query.eq('status', status)
  }
  if (category) query = query.eq('category', category)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ jobs: data })
}

// POST — create a job (tier-gated)
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Tier gating
  if (!ADMIN_IDS.includes(user.id) && (profile.plan === 'trial' || profile.plan === 'launch')) {
    return NextResponse.json({ error: 'Upgrade to Orbit to post jobs on the marketplace' }, { status: 403 })
  }

  // Orbit: max 3 jobs/month
  if (profile.plan === 'orbit') {
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('marketplace_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('poster_id', user.id)
      .gte('created_at', monthStart.toISOString())

    if ((count ?? 0) >= 3) {
      return NextResponse.json({ error: 'Orbit plan allows 3 job posts per month. Upgrade to Galaxy for unlimited.' }, { status: 403 })
    }
  }

  const body = await req.json()
  const { title, description, category, budget_min, budget_max, currency, deadline, skills } = body

  if (!title?.trim() || !description?.trim() || !category) {
    return NextResponse.json({ error: 'title, description, and category are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('marketplace_jobs')
    .insert({
      poster_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      budget_min: budget_min || null,
      budget_max: budget_max || null,
      currency: currency || 'EUR',
      deadline: deadline || null,
      skills: skills || [],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ job: data })
}

// PATCH — update job status
export async function PATCH(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { jobId, status, assigned_to } = await req.json()
  if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (status) updates.status = status
  if (assigned_to) updates.assigned_to = assigned_to

  const { error } = await supabase
    .from('marketplace_jobs')
    .update(updates)
    .eq('id', jobId)
    .eq('poster_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
