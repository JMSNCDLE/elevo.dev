import { getUserContext } from '@/lib/auth/getUserContext'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const ctx = await getUserContext()
  if (!ctx.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const updates: Record<string, unknown> = {}

  if (body.onboarding_completed !== undefined) updates.onboarding_completed = body.onboarding_completed
  if (body.business_name) updates.full_name = body.business_name
  if (body.business_industry) updates.business_industry = body.business_industry

  const { error } = await ctx.supabase.from('profiles').update(updates).eq('id', ctx.user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Also update business_profiles if business name provided
  if (body.business_name) {
    const { data: bp } = await ctx.supabase.from('business_profiles').select('id').eq('user_id', ctx.user.id).eq('is_primary', true).maybeSingle()
    if (bp) {
      await ctx.supabase.from('business_profiles').update({ business_name: body.business_name, category: body.business_industry ?? '' }).eq('id', bp.id)
    }
  }

  return NextResponse.json({ success: true })
}
