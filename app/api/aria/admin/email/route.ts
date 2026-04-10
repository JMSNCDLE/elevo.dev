import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { action, to, subject, html, recipients } = body

  const resendKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.FROM_EMAIL || 'ELEVO AI <team@elevo.dev>'

  if (!resendKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
  }

  try {
    switch (action) {
      case 'send_single': {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: fromEmail, to: [to], subject, html }),
        })
        const result = await res.json()
        return NextResponse.json({ success: res.ok, result })
      }

      case 'send_bulk': {
        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
          return NextResponse.json({ error: 'No recipients provided' }, { status: 400 })
        }

        const results = []
        for (const recipient of recipients) {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: fromEmail, to: [recipient], subject, html }),
          })
          const result = await res.json()
          results.push({ to: recipient, success: res.ok, result })
        }
        return NextResponse.json({ success: true, results })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
