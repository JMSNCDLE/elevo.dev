import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { ADMIN_IDS } from '@/lib/admin'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!ADMIN_IDS.includes(user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Return impersonation info (actual session swap handled client-side via Supabase admin)
  const { targetUserId } = await request.json()
  return NextResponse.json({
    message:
      'Impersonation requires Supabase Admin API — use service role key',
    targetUserId,
  })
}
