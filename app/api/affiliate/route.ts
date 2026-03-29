import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAffiliateStats } from '@/lib/affiliate'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!affiliate) {
    return NextResponse.json({ joined: false })
  }

  const stats = await getAffiliateStats(user.id)
  return NextResponse.json({ joined: true, affiliate, stats })
}
