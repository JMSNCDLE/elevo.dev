import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const businessProfileId = searchParams.get('businessProfileId')
  if (!businessProfileId) return NextResponse.json({ error: 'businessProfileId is required' }, { status: 400 })

  const { data: reports, error } = await supabase
    .from('growth_reports')
    .select('*')
    .eq('type', 'roas_report')
    .eq('user_id', user.id)
    .eq('business_profile_id', businessProfileId)
    .order('created_at', { ascending: false })
    .limit(12)

  if (error) {
    console.error('ROAS history fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }

  return NextResponse.json({ reports })
}
