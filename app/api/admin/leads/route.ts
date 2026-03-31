import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { ADMIN_IDS } from '@/lib/admin'

export async function GET(request: NextRequest) {
  // Auth check
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!ADMIN_IDS.includes(user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const serviceClient = await createServiceClient()
  const format = request.nextUrl.searchParams.get('format')

  const { data: leads } = await serviceClient
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (format === 'csv') {
    const headers = [
      'id',
      'email',
      'first_name',
      'business_name',
      'business_type',
      'location',
      'phone',
      'source',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'ip_country',
      'consent_given',
      'converted_to_user',
      'created_at',
    ]
    const csv = [
      headers.join(','),
      ...(leads ?? []).map(l =>
        headers
          .map(h => JSON.stringify((l as Record<string, unknown>)[h] ?? ''))
          .join(',')
      ),
    ].join('\n')
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="elevo-leads.csv"',
      },
    })
  }

  return NextResponse.json({ leads: leads ?? [] })
}
