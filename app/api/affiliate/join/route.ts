import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateAffiliateCode } from '@/lib/affiliate'

export async function POST() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Check if already an affiliate
  const { data: existing } = await supabase
    .from('affiliates')
    .select('id, code')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ success: true, code: existing.code, alreadyJoined: true })
  }

  // Generate unique code
  let code = generateAffiliateCode(user.id)

  // Ensure uniqueness
  let attempts = 0
  while (attempts < 5) {
    const { data: conflict } = await supabase
      .from('affiliates')
      .select('id')
      .eq('code', code)
      .single()

    if (!conflict) break
    code = generateAffiliateCode(user.id + attempts)
    attempts++
  }

  const { error } = await supabase.from('affiliates').insert({
    user_id: user.id,
    code,
    tier: 1,
    total_referrals: 0,
    pending_commission: 0,
    paid_commission: 0,
    active: true,
  })

  if (error) {
    console.error('Affiliate join error:', error)
    return NextResponse.json({ error: 'Failed to join affiliate program' }, { status: 500 })
  }

  // Also update profiles.affiliate_code
  await supabase.from('profiles').update({ affiliate_code: code }).eq('id', user.id)

  return NextResponse.json({ success: true, code })
}
