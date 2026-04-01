import { getUserContext } from '@/lib/auth/getUserContext'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getUserContext()
  if (!ctx.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await ctx.supabase
    .from('workflows')
    .select('*, workflow_steps(*)')
    .eq('id', id)
    .eq('user_id', ctx.user.id)
    .single()

  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
