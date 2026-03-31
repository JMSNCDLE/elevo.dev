import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendWhatsAppToJames, JAMES_ALERTS } from '@/lib/notifications/whatsapp'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const body = await request.json()
  const { type, data } = body

  let message: string

  switch (type) {
    case 'newSale':
      message = JAMES_ALERTS.newSale(data.plan ?? 'unknown', data.amount ?? '€0', data.email ?? 'unknown')
      break
    case 'newUser':
      message = JAMES_ALERTS.newUser(data.email ?? 'unknown', data.country ?? 'unknown')
      break
    case 'paymentFailed':
      message = JAMES_ALERTS.paymentFailed(data.email ?? 'unknown', data.amount ?? '€0')
      break
    case 'criticalError':
      message = JAMES_ALERTS.criticalError(data.error ?? 'Unknown error', data.page ?? 'unknown')
      break
    case 'dailySummary':
      message = JAMES_ALERTS.dailySummary(data.users ?? 0, data.revenue ?? '€0', data.newSignups ?? 0)
      break
    case 'competitorAlert':
      message = JAMES_ALERTS.competitorAlert(data.competitor ?? 'unknown', data.action ?? 'unknown')
      break
    default:
      return NextResponse.json({ error: 'Unknown notification type' }, { status: 400 })
  }

  const success = await sendWhatsAppToJames(message)
  return NextResponse.json({ success })
}
