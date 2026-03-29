import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const OnboardSchema = z.object({
  businessName: z.string().min(1),
  category: z.string().min(1),
  city: z.string().min(1),
  country: z.string().default('United Kingdom'),
  services: z.array(z.string()).min(1),
  uniqueSellingPoints: z.array(z.string()).default([]),
  locale: z.string().optional(),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = OnboardSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { businessName, category, city, country, services, uniqueSellingPoints } = parsed.data

  // Check if primary business profile already exists
  const { data: existing } = await supabase.from('business_profiles').select('id').eq('user_id', user.id).eq('is_primary', true).single()

  if (existing) {
    // Update existing
    await supabase.from('business_profiles').update({
      business_name: businessName, category, city, country, services,
      unique_selling_points: uniqueSellingPoints, onboarding_complete: true, updated_at: new Date().toISOString(),
    }).eq('id', existing.id)

    return NextResponse.json({ success: true, businessProfileId: existing.id })
  }

  // Create new
  const { data: bp, error: bpError } = await supabase.from('business_profiles').insert({
    user_id: user.id, business_name: businessName, category, city, country,
    services, unique_selling_points: uniqueSellingPoints,
    tone_of_voice: 'Professional and friendly', is_primary: true, onboarding_complete: true,
  }).select('id').single()

  if (bpError || !bp) {
    console.error('Onboard error:', bpError)
    return NextResponse.json({ error: 'Failed to create business profile' }, { status: 500 })
  }

  return NextResponse.json({ success: true, businessProfileId: bp.id })
}
