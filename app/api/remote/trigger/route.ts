import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const Schema = z.object({
  action: z.string().min(1),
  businessProfileId: z.string().min(1),
  sessionToken: z.string().min(1),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  if (!parsed.data.sessionToken) {
    return NextResponse.json({ error: 'Invalid session token' }, { status: 401 })
  }

  return NextResponse.json({ queued: true, estimatedTime: '30 seconds' })
}
