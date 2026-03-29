import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { runTrademarkCheck } from '@/lib/agents/trademarkAgent'

const schema = z.object({
  brandName: z.string().min(1),
  description: z.string().min(1),
  jurisdictions: z.array(z.string()).min(1),
  locale: z.string().default('en'),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { brandName, description, jurisdictions, locale } = parsed.data
  const report = await runTrademarkCheck(brandName, description, jurisdictions, locale)

  return NextResponse.json({ report })
}
