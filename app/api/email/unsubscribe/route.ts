import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('uid')
  const token = searchParams.get('token')

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev'

  if (!userId) {
    return new Response(unsubscribePage('Invalid link', false, APP_URL), {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(url, key)

  // Upsert unsubscribe preference
  await supabase.from('email_preferences').upsert({
    user_id: userId,
    marketing_emails: false,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  return new Response(unsubscribePage('', true, APP_URL), {
    headers: { 'Content-Type': 'text/html' },
  })
}

function unsubscribePage(error: string, success: boolean, appUrl: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Unsubscribe — ELEVO AI</title>
<style>body{font-family:-apple-system,sans-serif;background:#f4f4f5;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.card{background:#fff;border-radius:12px;padding:40px;max-width:400px;text-align:center;border:1px solid #e4e4e7}
h1{font-size:20px;color:#18181b;margin:0 0 12px}p{color:#71717a;font-size:14px;line-height:1.6}
a{color:#6366F1;text-decoration:none;font-weight:600}</style></head>
<body><div class="card">
${success
  ? `<h1>You've been unsubscribed</h1><p>You won't receive promotional emails from ELEVO AI anymore.</p><p>You'll still get important account emails (invoices, security alerts).</p><p style="margin-top:20px"><a href="${appUrl}/en/dashboard">Back to dashboard</a></p>`
  : `<h1>Something went wrong</h1><p>${error}</p><p style="margin-top:20px"><a href="${appUrl}">Go to ELEVO AI</a></p>`}
</div></body></html>`
}
