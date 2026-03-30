import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { ADMIN_IDS } from '@/lib/admin'

const AdRowSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  impressions: z.number().int().min(0),
  clicks: z.number().int().min(0),
  spend: z.number().min(0),
  revenue: z.number().min(0).default(0),
  conversions: z.number().int().min(0).default(0),
})

const ImportSchema = z.object({
  businessProfileId: z.string().uuid(),
  platform: z.string().min(1),
  adData: z.array(AdRowSchema).min(1).max(500),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (!ADMIN_IDS.includes(user.id) && profile.plan !== 'orbit' && profile.plan !== 'galaxy') {
    return NextResponse.json({ error: 'Orbit plan required' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = ImportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const { businessProfileId, platform, adData } = parsed.data

  // Verify ownership
  const { data: bp } = await supabase.from('business_profiles').select('id').eq('id', businessProfileId).eq('user_id', user.id).single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  // Calculate derived fields and build rows
  const rows = adData.map(row => {
    const cpm = row.impressions > 0 ? (row.spend / row.impressions) * 1000 : 0
    const ctr = row.impressions > 0 ? row.clicks / row.impressions : 0
    const roas = row.spend > 0 ? row.revenue / row.spend : 0
    const cpc = row.clicks > 0 ? row.spend / row.clicks : 0

    return {
      business_profile_id: businessProfileId,
      date: row.date,
      platform,
      impressions: row.impressions,
      clicks: row.clicks,
      spend: row.spend,
      revenue: row.revenue,
      cpm: parseFloat(cpm.toFixed(4)),
      ctr: parseFloat(ctr.toFixed(6)),
      roas: parseFloat(roas.toFixed(4)),
      cpc: parseFloat(cpc.toFixed(4)),
      conversions: row.conversions,
    }
  })

  const { error } = await supabase.from('ad_performance').upsert(rows, {
    onConflict: 'business_profile_id,date,platform',
    ignoreDuplicates: false,
  })

  if (error) {
    console.error('Ad import error:', error)
    return NextResponse.json({ error: 'Failed to import ad data' }, { status: 500 })
  }

  return NextResponse.json({ success: true, imported: rows.length })
}
