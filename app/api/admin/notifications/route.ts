import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceClient } from '@/lib/supabase/server'
import { notifyOwner } from '@/lib/notifications/notify-owner'
import { isAdminId } from '@/lib/admin'

// GET — list notification history
export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminId(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') || '30', 10)
  const type = searchParams.get('type') || ''

  const admin = await createServiceClient()
  const since = new Date(Date.now() - days * 86400000).toISOString()

  let query = admin
    .from('owner_notifications')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(100)

  if (type) query = query.eq('type', type)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ notifications: data || [] })
}

// POST — manually send a notification
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminId(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, message, channel, type } = await req.json()
  if (!title || !message) {
    return NextResponse.json({ error: 'title and message required' }, { status: 400 })
  }

  const success = await notifyOwner({
    type: type || 'alert',
    title,
    message,
    channel: channel || 'both',
  })

  return NextResponse.json({ success })
}
