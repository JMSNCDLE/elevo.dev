import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'ELEVO-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(req: NextRequest) {
  const { email, plan } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const supabase = await createServiceClient()

  // Check if active code already exists for this email
  const { data: existing } = await supabase
    .from('discount_codes')
    .select('code, expires_at')
    .eq('email', email)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existing) {
    return NextResponse.json({ code: existing.code, expiresAt: existing.expires_at })
  }

  // Generate new code
  const code = generateCode()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase.from('discount_codes').insert({
    code,
    email,
    discount_percent: 50,
    valid_for_plan: plan ?? null,
    expires_at: expiresAt,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send email with code (fire and forget)
  try {
    const { sendEmail } = await import('@/lib/email/send')
    await sendEmail({
      to: email,
      subject: 'Your ELEVO AI™ personal discount code — 50% off',
      html: `<p>Hi! Your ELEVO AI™ discount code is: <strong>${code}</strong></p><p>50% off your first month. Valid for 24 hours.</p><p><a href="https://elevo.dev/en/pricing">Claim at elevo.ai/pricing →</a></p>`,
    })
  } catch (_) {
    // Non-fatal
  }

  return NextResponse.json({ code, expiresAt })
}
