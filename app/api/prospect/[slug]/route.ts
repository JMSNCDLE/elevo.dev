import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createServiceClient()

  const { data } = await supabase
    .from('prospect_audits')
    .select('audit_data, agency_name, agency_logo_url, business_name, expires_at, views')
    .eq('page_slug', slug)
    .single()

  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Check expiry
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Expired' }, { status: 410 })
  }

  // Increment views
  await supabase
    .from('prospect_audits')
    .update({ views: (data.views ?? 0) + 1, last_viewed_at: new Date().toISOString() })
    .eq('page_slug', slug)

  return NextResponse.json({
    audit: data.audit_data,
    agencyName: data.agency_name,
    agencyLogoUrl: data.agency_logo_url,
    businessName: data.business_name,
  })
}
