import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { runSEOAudit } from '@/lib/agents/seoAgent'

const schema = z.object({
  domain: z.string().min(1),
  keywords: z.array(z.string()).min(1).max(10),
  locale: z.string().default('en'),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { domain, keywords, locale } = parsed.data

  const result = await runSEOAudit(domain, keywords, locale)
  return NextResponse.json({ result })
}
