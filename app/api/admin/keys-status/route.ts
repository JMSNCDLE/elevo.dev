import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { isAdminId } from '@/lib/admin'

const KEYS = [
  { name: 'ANTHROPIC_API_KEY', label: 'Anthropic Claude (Agents)', critical: true },
  { name: 'NEXT_PUBLIC_SUPABASE_URL', label: 'Supabase URL', critical: true },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', label: 'Supabase Service Role', critical: true },
  { name: 'STRIPE_SECRET_KEY', label: 'Stripe Billing', critical: true },
  { name: 'RESEND_API_KEY', label: 'Resend Email', critical: true },
  { name: 'REPLICATE_API_TOKEN', label: 'Replicate (AI Images)', critical: false },
  { name: 'RUNWAY_API_KEY', label: 'Runway ML (AI Video)', critical: false },
  { name: 'YOUTUBE_API_KEY', label: 'YouTube API', critical: false },
  { name: 'TIKTOK_CLIENT_KEY', label: 'TikTok Client Key', critical: false },
  { name: 'TIKTOK_CLIENT_SECRET', label: 'TikTok Client Secret', critical: false },
  { name: 'CJ_API_KEY', label: 'CJDropshipping', critical: false },
  { name: 'GOOGLE_SEARCH_CONSOLE_KEY', label: 'Google Search Console', critical: false },
  { name: 'TELEGRAM_BOT_TOKEN', label: 'Telegram Bot', critical: false },
  { name: 'TWILIO_ACCOUNT_SID', label: 'Twilio (WhatsApp)', critical: false },
] as const

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminId(user.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = KEYS.map(k => ({
    name: k.name,
    label: k.label,
    critical: k.critical,
    configured: !!process.env[k.name],
  }))

  return NextResponse.json({
    keys: status,
    summary: {
      total: status.length,
      configured: status.filter(s => s.configured).length,
      missing: status.filter(s => !s.configured).length,
      missingCritical: status.filter(s => !s.configured && s.critical).length,
    },
  })
}
