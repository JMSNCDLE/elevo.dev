import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const {
    email,
    firstName,
    businessName,
    businessType,
    location,
    phone,
    source,
    utmSource,
    utmMedium,
    utmCampaign,
    consentGiven,
  } = body

  if (!email || !source) {
    return NextResponse.json({ error: 'email and source required' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { error } = await supabase.from('leads').insert({
    email,
    first_name: firstName,
    business_name: businessName,
    business_type: businessType,
    location,
    phone,
    source,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    consent_given: consentGiven ?? false,
  })

  if (error) {
    // Upsert on conflict
    await supabase
      .from('leads')
      .upsert(
        {
          email,
          source,
          business_name: businessName,
          business_type: businessType,
          location,
          consent_given: consentGiven ?? false,
        },
        { onConflict: 'email' }
      )
  }

  return NextResponse.json({ ok: true })
}
