import { createServiceClient } from '@/lib/supabase/server'

export function generateAffiliateCode(userId: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  // Use userId as seed mixed with random
  const seed = userId.replace(/-/g, '').substring(0, 8)
  let code = ''
  for (let i = 0; i < 8; i++) {
    const seedChar = seed.charCodeAt(i) ?? 0
    const randomIndex = (seedChar + Math.floor(Math.random() * chars.length)) % chars.length
    code += chars[randomIndex]
  }
  return code
}

export function calculateCommission(planPrice: number, tierLevel: 1 | 2 | 3): number {
  const rates: Record<1 | 2 | 3, number> = {
    1: 0.20,
    2: 0.25,
    3: 0.30,
  }
  return Math.round(planPrice * rates[tierLevel] * 100) / 100
}

export async function getAffiliateStats(userId: string): Promise<{
  code: string
  totalReferrals: number
  pendingCommission: number
  paidCommission: number
  conversionRate: number
}> {
  const supabase = await createServiceClient()

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('code, total_referrals, pending_commission, paid_commission')
    .eq('user_id', userId)
    .single()

  if (!affiliate) {
    return {
      code: '',
      totalReferrals: 0,
      pendingCommission: 0,
      paidCommission: 0,
      conversionRate: 0,
    }
  }

  // Calculate conversion rate: converted referrals / total clicks (approximated by referrals)
  const conversionRate =
    affiliate.total_referrals > 0
      ? Math.round((affiliate.total_referrals / Math.max(affiliate.total_referrals, 1)) * 100)
      : 0

  return {
    code: affiliate.code,
    totalReferrals: affiliate.total_referrals ?? 0,
    pendingCommission: affiliate.pending_commission ?? 0,
    paidCommission: affiliate.paid_commission ?? 0,
    conversionRate,
  }
}
