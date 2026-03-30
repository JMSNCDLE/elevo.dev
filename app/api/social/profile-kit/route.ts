import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateSocialProfileKit } from '@/lib/agents/socialProfileAgent'

const schema = z.object({
  businessProfileId: z.string().uuid(),
  platform: z.string().min(1),
  goal: z.string().min(1),
  locale: z.string().default('en'),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { businessProfileId, platform, goal, locale } = parsed.data

  const { data: bp } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', businessProfileId)
    .eq('user_id', user.id)
    .single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_used, credits_limit')
    .eq('id', user.id)
    .single()
  if (!profile || (profile ?? { credits_used: 0 }).credits_used + 1 > (profile ?? { credits_limit: 9999 }).credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  const kit = await generateSocialProfileKit({ businessProfile: bp, platform, goal, locale })

  await supabase.from('profiles').update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + 1 }).eq('id', user.id)

  return NextResponse.json({ kit })
}
