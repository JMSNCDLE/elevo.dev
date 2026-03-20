import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { sendSequenceEmail } from '@/lib/email/send'
import type { SequenceKey } from '@/lib/email/sequences'

const Schema = z.object({
  sequenceKey: z.string(),
  userId: z.string().uuid(),
  variables: z.record(z.union([z.string(), z.number()])).default({}),
})

export async function POST(request: Request) {
  // Service role only — validate via CRON_SECRET or internal header
  const authHeader = request.headers.get('x-service-key')
  if (authHeader !== process.env.SUPABASE_SERVICE_ROLE_KEY && authHeader !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { sequenceKey, userId, variables } = parsed.data

  const supabase = await createServerClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', userId)
    .single()

  if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: bp } = await supabase
    .from('business_profiles')
    .select('business_name, city, business_category')
    .eq('user_id', userId)
    .single()

  const firstName = profile.full_name?.split(' ')[0] ?? 'there'
  const mergedVars: Record<string, string | number> = {
    firstName,
    businessName: bp?.business_name ?? 'your business',
    city: bp?.city ?? 'your city',
    businessCategory: bp?.business_category ?? 'business',
    ...variables,
  }

  try {
    await sendSequenceEmail(sequenceKey as SequenceKey, profile.email, mergedVars)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Email send error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
