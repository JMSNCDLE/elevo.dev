import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'ELEVO-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// GET — get user's referral data + stats
export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Get or create referral code
  let { data: profile } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', user.id)
    .single()

  if (!profile?.referral_code) {
    const code = generateCode()
    await supabase.from('profiles').update({ referral_code: code }).eq('id', user.id)
    profile = { referral_code: code }
  }

  // Get referrals
  const { data: referrals } = await supabase
    .from('referrals')
    .select('id, referred_id, status, created_at, converted_at')
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false })

  // Get commissions
  const { data: commissions } = await supabase
    .from('referral_commissions')
    .select('amount, status')
    .eq('referrer_id', user.id)

  const totalReferrals = referrals?.length ?? 0
  const subscribed = referrals?.filter(r => r.status === 'subscribed').length ?? 0
  const pendingEarnings = commissions?.filter(c => c.status === 'pending' || c.status === 'active').reduce((s, c) => s + Number(c.amount), 0) ?? 0
  const paidEarnings = commissions?.filter(c => c.status === 'paid').reduce((s, c) => s + Number(c.amount), 0) ?? 0

  return NextResponse.json({
    code: profile.referral_code,
    link: `https://elevo.dev/en/signup?ref=${profile.referral_code}`,
    stats: { totalReferrals, subscribed, pendingEarnings, paidEarnings },
    referrals: referrals ?? [],
  })
}
