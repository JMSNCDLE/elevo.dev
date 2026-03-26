import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET — list applications (for a job poster or applicant)
export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get('jobId')

  let query = supabase.from('marketplace_applications').select('*').order('created_at', { ascending: false })

  if (jobId) {
    query = query.eq('job_id', jobId)
  } else {
    query = query.eq('applicant_id', user.id)
  }

  const { data, error } = await query.limit(50)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ applications: data })
}

// POST — apply to a job
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { job_id, cover_letter, proposed_rate, portfolio_url, estimated_days } = await req.json()

  if (!job_id || !cover_letter?.trim()) {
    return NextResponse.json({ error: 'job_id and cover_letter required' }, { status: 400 })
  }

  // Check not applying to own job
  const { data: job } = await supabase.from('marketplace_jobs').select('poster_id').eq('id', job_id).single()
  if (job?.poster_id === user.id) {
    return NextResponse.json({ error: 'Cannot apply to your own job' }, { status: 400 })
  }

  // Check not already applied
  const { data: existing } = await supabase
    .from('marketplace_applications')
    .select('id')
    .eq('job_id', job_id)
    .eq('applicant_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already applied to this job' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('marketplace_applications')
    .insert({
      job_id,
      applicant_id: user.id,
      cover_letter: cover_letter.trim(),
      proposed_rate: proposed_rate || null,
      portfolio_url: portfolio_url || null,
      estimated_days: estimated_days || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ application: data })
}
