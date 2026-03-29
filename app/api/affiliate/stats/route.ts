import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAffiliateStats } from '@/lib/affiliate'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const stats = await getAffiliateStats(user.id)

  // Also fetch payout history
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id')
    .eq('user_id', user.id)
    .single()

  let payouts: unknown[] = []
  if (affiliate) {
    const { data } = await supabase
      .from('affiliate_payouts')
      .select('*')
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false })
      .limit(20)

    payouts = data ?? []
  }

  return NextResponse.json({ stats, payouts })
}
