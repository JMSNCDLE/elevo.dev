import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { generateSingleMessage } from '@/lib/agents/conversationAgent'
import type { ConversationChannel } from '@/lib/agents/conversationAgent'
import type { BusinessProfile } from '@/lib/agents/types'

const Schema = z.object({
  contactId: z.string().uuid().optional(),
  channel: z.string().min(1),
  purpose: z.string().min(1),
  contactName: z.string().min(1),
  businessProfileId: z.string().uuid(),
  priorMessages: z.array(z.string()).optional(),
  replyToReceived: z.string().optional(),
  locale: z.string().min(2),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan, credits_used, credits_limit').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if ((profile ?? { credits_used: 0 }).credits_used >= (profile ?? { credits_limit: 9999 }).credits_limit) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { data: bp } = await supabase.from('business_profiles').select('*').eq('id', parsed.data.businessProfileId).eq('user_id', user.id).single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  try {
    const message = await generateSingleMessage(
      {
        channel: parsed.data.channel as ConversationChannel,
        purpose: parsed.data.purpose,
        contactName: parsed.data.contactName,
        businessProfile: bp as BusinessProfile,
        priorMessages: parsed.data.priorMessages,
        replyToReceived: parsed.data.replyToReceived,
      },
      parsed.data.locale,
    )

    await supabase.from('profiles').update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + 1 }).eq('id', user.id)

    return NextResponse.json({ message })
  } catch (err) {
    console.error('Single message agent error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
