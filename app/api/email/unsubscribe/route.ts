import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyUnsubscribeToken, type EmailType } from '@/lib/email/unsubscribe-token'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev'

const COLUMN_MAP: Record<EmailType, string[]> = {
  digest: ['email_digest_enabled'],
  trial: ['email_trial_reminders_enabled'],
  reengagement: ['email_reengagement_enabled'],
  all: ['email_digest_enabled', 'email_trial_reminders_enabled', 'email_reengagement_enabled'],
}

const TYPE_LABELS: Record<EmailType, string> = {
  digest: 'weekly digest',
  trial: 'trial reminder',
  reengagement: 're-engagement',
  all: 'marketing',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('uid')
  const type = (searchParams.get('type') ?? 'all') as EmailType
  const sig = searchParams.get('sig')

  if (!userId || !sig) {
    return new Response(unsubscribePage('Invalid link', false, ''), {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  if (!verifyUnsubscribeToken(userId, type, sig)) {
    return new Response(unsubscribePage('Invalid or expired token', false, ''), {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return new Response(unsubscribePage('Server error', false, ''), {
      headers: { 'Content-Type': 'text/html' },
    })
  }
  const supabase = createClient(url, key)

  const cols = COLUMN_MAP[type] ?? COLUMN_MAP.all
  const update: Record<string, boolean> = {}
  for (const c of cols) update[c] = false

  const { error } = await supabase.from('profiles').update(update).eq('id', userId)
  if (error) {
    return new Response(unsubscribePage('Failed to update preferences', false, TYPE_LABELS[type]), {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  return new Response(unsubscribePage('', true, TYPE_LABELS[type]), {
    headers: { 'Content-Type': 'text/html' },
  })
}

function unsubscribePage(error: string, success: boolean, label: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Unsubscribe — ELEVO AI</title>
<style>body{font-family:-apple-system,sans-serif;background:#f4f4f5;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.card{background:#fff;border-radius:12px;padding:40px;max-width:440px;text-align:center;border:1px solid #e4e4e7}
h1{font-size:20px;color:#18181b;margin:0 0 12px}p{color:#71717a;font-size:14px;line-height:1.6;margin:8px 0}
a{color:#6366F1;text-decoration:none;font-weight:600}</style></head>
<body><div class="card">
${success
  ? `<h1>You&#39;ve been unsubscribed</h1><p>You won&#39;t receive ${label} emails from ELEVO AI anymore.</p><p>You&#39;ll still get important account emails (invoices, security alerts).</p><p style="margin-top:20px"><a href="${APP_URL}/en/dashboard/settings">Manage preferences</a></p>`
  : `<h1>Something went wrong</h1><p>${error}</p><p style="margin-top:20px"><a href="${APP_URL}">Go to ELEVO AI</a></p>`}
</div></body></html>`
}
