import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/send'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  try {
    const { email, source } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const { error } = await getSupabase().from('waitlist').upsert(
      { email: email.toLowerCase().trim(), source: source || 'website' },
      { onConflict: 'email' }
    )

    if (error) {
      console.error('Waitlist insert error:', error)
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
    }

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: "You're on the ELEVO AI early access list!",
      body: `Hey there!\n\nYou're officially on the early access list for ELEVO AI.\n\nWhen we launch on April 28, you'll get:\n\n• Early access before the public\n• 30% off your first 3 months\n• Priority onboarding with our team\n\nWe'll email you on launch day with your exclusive link.\n\nSee you soon,\nJames @ ELEVO AI`,
      agentName: 'Waitlist',
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { count } = await getSupabase()
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({ count: count || 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
