import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceClient } from '@/lib/supabase/server'

const ADMIN_USER_ID = '5dc15dea-4633-441b-b37a-5406e7235114'

export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const agent = searchParams.get('agent') || ''
  const days = parseInt(searchParams.get('days') || '30', 10)

  const admin = await createServiceClient()
  const since = new Date(Date.now() - days * 86400000).toISOString()

  let query = admin
    .from('email_logs')
    .select('*')
    .gte('sent_at', since)
    .order('sent_at', { ascending: false })
    .limit(200)

  if (search) {
    query = query.or(`to_address.ilike.%${search}%,subject.ilike.%${search}%`)
  }
  if (agent) {
    query = query.eq('agent_name', agent)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Stats
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const all = data || []
  const today = all.filter(e => e.sent_at >= todayStart).length
  const week = all.filter(e => e.sent_at >= weekStart).length
  const month = all.filter(e => e.sent_at >= monthStart).length
  const failed = all.filter(e => e.status !== 'sent').length

  return NextResponse.json({
    emails: all,
    stats: { today, week, month, total: all.length, failed },
  })
}
