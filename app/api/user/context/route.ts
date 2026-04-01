import { getUserContext } from '@/lib/auth/getUserContext'
import { NextResponse } from 'next/server'

export async function GET() {
  const ctx = await getUserContext()
  if (!ctx.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({
    plan: ctx.plan,
    isAdmin: ctx.isAdmin,
    locale: ctx.locale,
    language: ctx.language,
    email: ctx.user.email,
    userId: ctx.user.id,
    creditsUsed: ctx.profile?.credits_used ?? 0,
    creditsLimit: ctx.profile?.credits_limit ?? 20,
  })
}
