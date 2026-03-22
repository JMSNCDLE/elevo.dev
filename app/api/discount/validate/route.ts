import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  if (!code) return NextResponse.json({ valid: false })

  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('discount_codes')
    .select('id, discount_percent, valid_for_plan, used, expires_at')
    .eq('code', code.toUpperCase())
    .single()

  if (!data) return NextResponse.json({ valid: false })
  if (data.used) return NextResponse.json({ valid: false, reason: 'Code already used' })
  if (new Date(data.expires_at) < new Date()) return NextResponse.json({ valid: false, reason: 'Code expired' })

  return NextResponse.json({
    valid: true,
    discountPercent: data.discount_percent,
    plan: data.valid_for_plan,
  })
}
