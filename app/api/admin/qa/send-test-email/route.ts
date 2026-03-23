import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

// POST /api/admin/qa/send-test-email
// Body: { type: 'confirmation' | 'receipt' | 'onboarding', email: string }
// Admin only

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const body = await req.json()
  const { type, email } = body as { type: 'confirmation' | 'receipt' | 'onboarding'; email: string }

  if (!type || !email) {
    return NextResponse.json({ error: 'type and email are required' }, { status: 400 })
  }

  const emailConfig = buildTestEmail(type, email)
  const resend = new Resend(process.env.RESEND_API_KEY)
  const FROM = process.env.FROM_EMAIL ?? 'ELEVO AI <onboarding@resend.dev>'

  try {
    const result = await resend.emails.send({
      from: FROM,
      to: [email],
      subject: emailConfig.subject,
      html: emailConfig.html,
    })

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error.message })
    }

    return NextResponse.json({ success: true, messageId: result.data?.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message })
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

function buildTestEmail(type: 'confirmation' | 'receipt' | 'onboarding', email: string) {
  const header = `
    <tr>
      <td style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:32px 40px;text-align:center">
        <div style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px">ELEVO AI™</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:4px">The AI operating system for local businesses</div>
      </td>
    </tr>
  `

  const footer = `
    <tr>
      <td style="padding:20px 40px;border-top:1px solid #F1F5F9;text-align:center">
        <p style="font-size:11px;color:#94A3B8;margin:0">© 2026 ELEVO AI Ltd™ · hello@elevo.ai · <em>This is a test email sent from the QA Suite.</em></p>
      </td>
    </tr>
  `

  const wrap = (body: string) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:40px 20px">
            <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
              ${header}
              ${body}
              ${footer}
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  if (type === 'confirmation') {
    return {
      subject: '[TEST] Confirm your ELEVO AI account',
      html: wrap(`
        <tr>
          <td style="padding:40px 40px">
            <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 12px">You're almost in.</h1>
            <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 24px">
              This is a TEST confirmation email. In production, the button below will contain a real confirmation link.
            </p>
            <a href="#" style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px">
              Confirm my account → (test)
            </a>
            <p style="font-size:12px;color:#94A3B8;margin:24px 0 0">Sent to: ${email}</p>
          </td>
        </tr>
      `),
    }
  }

  if (type === 'receipt') {
    return {
      subject: '[TEST] Your ELEVO AI receipt',
      html: wrap(`
        <tr>
          <td style="padding:40px 40px">
            <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 12px">Payment confirmed.</h1>
            <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 24px">
              This is a TEST receipt email. In production, this will include your invoice number, plan, amount, and billing date.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;margin-bottom:24px">
              <tr style="background:#F8FAFC">
                <td style="padding:12px 16px;font-size:13px;color:#64748B;font-weight:600">Plan</td>
                <td style="padding:12px 16px;font-size:13px;color:#0F172A;text-align:right">ELEVO Orbit™ (test)</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:13px;color:#64748B;font-weight:600">Amount</td>
                <td style="padding:12px 16px;font-size:13px;color:#0F172A;text-align:right">£79.00</td>
              </tr>
              <tr style="background:#F8FAFC">
                <td style="padding:12px 16px;font-size:13px;color:#64748B;font-weight:600">Invoice</td>
                <td style="padding:12px 16px;font-size:13px;color:#0F172A;text-align:right">INV-TEST-001</td>
              </tr>
            </table>
            <p style="font-size:12px;color:#94A3B8;margin:0">Sent to: ${email}</p>
          </td>
        </tr>
      `),
    }
  }

  // onboarding
  return {
    subject: '[TEST] Welcome to ELEVO AI — let\'s get started',
    html: wrap(`
      <tr>
        <td style="padding:40px 40px">
          <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 12px">Welcome to ELEVO AI™</h1>
          <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 24px">
            This is a TEST onboarding email. In production, this will welcome your user, explain their plan, and guide them to their first win.
          </p>
          <p style="font-size:14px;color:#475569;margin:0 0 8px"><strong>Your 7-day trial includes:</strong></p>
          <ul style="font-size:14px;color:#475569;line-height:1.8;padding-left:20px;margin:0 0 24px">
            <li>50 AI credits to use on any tool</li>
            <li>Access to all content generators</li>
            <li>CRM for up to 10 contacts</li>
            <li>Live chat with your ELEVO guide (Mira)</li>
          </ul>
          <a href="#" style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px">
            Open Mission Control → (test)
          </a>
          <p style="font-size:12px;color:#94A3B8;margin:24px 0 0">Sent to: ${email}</p>
        </td>
      </tr>
    `),
  }
}
