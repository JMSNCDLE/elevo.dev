import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/send'
import { wrapEmail } from '@/lib/email/templates'

const ADMIN_ID = process.env.ELEVO_ADMIN_USER_ID ?? '5dc15dea-4633-441b-b37a-5406e7235114'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev'
const MAX_PROMO_PER_MONTH = 2

interface CampaignRequest {
  campaignId?: string
  subject_en: string
  subject_es: string
  body_en: string
  body_es: string
  audience: 'all' | 'trial' | 'launch' | 'orbit' | 'galaxy' | 'churned'
  sendNow: boolean
  scheduledAt?: string
}

async function getAuthUser(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(url, key)

  // Extract user from cookie-based auth
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  return user
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(url, key)

  // Admin check via cookie
  const body: CampaignRequest = await request.json()

  // Simple admin check: require admin header or cookie
  const adminCheck = request.headers.get('x-admin-id')
  if (adminCheck !== ADMIN_ID) {
    // Fallback: check via Supabase auth
    const cookieHeader = request.headers.get('cookie') ?? ''
    // For server actions / API calls from dashboard, check profiles
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // Build audience query
  let query = supabase.from('profiles').select('id, email, full_name')

  switch (body.audience) {
    case 'trial': query = query.eq('plan', 'trial'); break
    case 'launch': query = query.eq('plan', 'launch'); break
    case 'orbit': query = query.eq('plan', 'orbit'); break
    case 'galaxy': query = query.eq('plan', 'galaxy'); break
    case 'churned':
      // Users who had a subscription but are now on trial
      query = query.eq('plan', 'trial').not('stripe_customer_id', 'is', null)
      break
    case 'all':
    default:
      break
  }

  const { data: recipients, error: recipError } = await query.limit(1000)
  if (recipError) return NextResponse.json({ error: recipError.message }, { status: 500 })

  // Save campaign to DB
  const { data: campaign, error: insertErr } = await supabase.from('email_campaigns').insert({
    subject_en: body.subject_en,
    subject_es: body.subject_es,
    body_en: body.body_en,
    body_es: body.body_es,
    audience: body.audience,
    status: body.sendNow ? 'sending' : 'scheduled',
    scheduled_at: body.scheduledAt ?? null,
    total_recipients: recipients?.length ?? 0,
  }).select('id').single()

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  if (!body.sendNow) {
    return NextResponse.json({ ok: true, campaignId: campaign?.id, status: 'scheduled', recipients: recipients?.length })
  }

  // Send immediately
  let sent = 0
  let skipped = 0
  let errors = 0

  for (const user of recipients ?? []) {
    try {
      // Get auth user for email
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(user.id)
      const email = authUser?.email ?? user.email
      if (!email) { skipped++; continue }

      // Check unsubscribe
      const { data: prefs } = await supabase
        .from('email_preferences')
        .select('marketing_emails')
        .eq('user_id', user.id)
        .single()
      if (prefs?.marketing_emails === false) { skipped++; continue }

      // Check monthly promo limit (max 2 per month)
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      const { count: promoCount } = await supabase
        .from('email_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('agent_name', 'Campaign')
        .gte('sent_at', monthStart.toISOString())
      if ((promoCount ?? 0) >= MAX_PROMO_PER_MONTH) { skipped++; continue }

      const locale = (authUser?.user_metadata?.locale as string) ?? 'en'
      const isEs = locale === 'es'
      const subject = isEs ? body.subject_es : body.subject_en
      const htmlBody = isEs ? body.body_es : body.body_en

      const unsubUrl = `${APP_URL}/api/email/unsubscribe?uid=${user.id}`
      const html = wrapEmail(htmlBody, { locale, unsubscribeUrl: unsubUrl })

      await sendEmail({
        to: email,
        subject,
        html,
        agentName: 'Campaign',
        userId: user.id,
      })

      sent++

      // Rate limit: 10 per second to avoid Resend limits
      if (sent % 10 === 0) {
        await new Promise(r => setTimeout(r, 1000))
      }
    } catch {
      errors++
    }
  }

  // Update campaign status
  await supabase.from('email_campaigns').update({
    status: 'sent',
    sent_at: new Date().toISOString(),
    sent_count: sent,
    skipped_count: skipped,
    error_count: errors,
  }).eq('id', campaign?.id)

  return NextResponse.json({ ok: true, campaignId: campaign?.id, sent, skipped, errors })
}

// GET — list campaigns
export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(url, key)

  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
