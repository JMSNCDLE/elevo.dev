import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/send'

const Schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  company: z.string().max(120).optional(),
  interest: z.enum(['marketing', 'sales', 'content', 'operations', 'everything']).optional(),
})

export async function POST(req: NextRequest) {
  const parsed = Schema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { name, email, company, interest } = parsed.data

  // 1. Persist the lead via service role (no auth needed — public endpoint)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) {
    try {
      const supabase = createClient(url, key)
      await supabase.from('demo_requests').insert({
        name,
        email,
        company: company ?? null,
        interest: interest ?? null,
        status: 'pending',
      })
    } catch (err) {
      console.error('[demo-request] db insert failed:', err)
      // Still try to send notification emails — don't drop the lead
    }
  }

  // 2. Notify the team (lead alert — this one IS to the team)
  const interestLabel = interest ?? 'not specified'
  await sendEmail({
    to: process.env.LEADS_EMAIL ?? 'team@elevo.dev',
    subject: `New demo request: ${name}${company ? ` (${company})` : ''}`,
    html: `
<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:560px;padding:24px">
  <h2 style="margin:0 0 16px;color:#0f172a">New demo request 🎯</h2>
  <table cellpadding="6" cellspacing="0" style="font-size:14px;color:#3f3f46">
    <tr><td><strong>Name</strong></td><td>${name}</td></tr>
    <tr><td><strong>Email</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
    <tr><td><strong>Company</strong></td><td>${company ?? '—'}</td></tr>
    <tr><td><strong>Interest</strong></td><td>${interestLabel}</td></tr>
  </table>
  <p style="margin-top:24px;font-size:13px;color:#71717a">Reply within 24 hours.</p>
</div>`,
    agentName: 'Demo Request',
  })

  // 3. Confirmation to the requester
  await sendEmail({
    to: email,
    subject: 'Your ELEVO AI demo request',
    html: `
<div style="max-width:600px;margin:0 auto;background:#0A0A14;color:#FFFFFF;font-family:-apple-system,sans-serif;padding:40px 30px">
  <div style="height:4px;background:linear-gradient(90deg,#6366F1,#8B5CF6,#A855F7);border-radius:2px;margin-bottom:30px"></div>
  <h2 style="margin:0 0 16px;font-size:22px">Thanks ${name}! 👋</h2>
  <p style="line-height:1.7;color:#E5E7EB;font-size:15px">
    We've received your demo request${company ? ` for <strong>${company}</strong>` : ''}.
    A member of the ELEVO team will be in touch within 24 hours to schedule a personalised walkthrough
    focused on <strong>${interestLabel}</strong>.
  </p>
  <p style="line-height:1.7;color:#E5E7EB;font-size:15px;margin-top:20px">
    In the meantime, you can explore the live product demo:
  </p>
  <p style="margin:24px 0">
    <a href="https://elevo.dev/en/demo" style="display:inline-block;padding:14px 32px;background:#6366F1;color:#FFFFFF;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px">
      See the dashboard →
    </a>
  </p>
  <div style="margin-top:40px;padding-top:20px;border-top:1px solid #1F2937;color:#6B7280;font-size:12px">
    <p style="margin:0">ELEVO AI — Your AI Operating System</p>
    <p style="margin:6px 0 0"><a href="https://elevo.dev" style="color:#6366F1;text-decoration:none">elevo.dev</a></p>
  </div>
</div>`,
    agentName: 'Demo Request',
  })

  return NextResponse.json({ success: true })
}
