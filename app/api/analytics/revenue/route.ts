import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const Schema = z.object({
  businessProfileId: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  totalRevenue: z.number().min(0),
  totalJobs: z.number().int().min(0),
  newCustomers: z.number().int().min(0),
  avgJobValue: z.number().min(0),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const { date, totalRevenue, totalJobs, newCustomers, avgJobValue, businessProfileId } = parsed.data

  const { error } = await supabase.from('revenue_snapshots').upsert({
    user_id: user.id,
    business_profile_id: businessProfileId ?? null,
    snapshot_date: date,
    total_revenue: totalRevenue,
    total_jobs: totalJobs,
    new_customers: newCustomers,
    avg_job_value: avgJobValue,
  }, { onConflict: 'user_id,business_profile_id,snapshot_date' })

  if (error) {
    console.error('Revenue snapshot upsert error:', error)
    return NextResponse.json({ error: 'Failed to save revenue data' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
