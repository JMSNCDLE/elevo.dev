import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { runLiveAssistant } from '@/lib/agents/liveAssistant'
import type { BusinessProfile, AssistantMessage } from '@/lib/agents/types'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { messages, businessProfileId }: { messages: AssistantMessage[]; businessProfileId?: string } = await request.json()

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()

  let bp: BusinessProfile | null = null
  if (businessProfileId) {
    const { data } = await supabase.from('business_profiles').select('*').eq('id', businessProfileId).eq('user_id', user.id).single()
    bp = data as BusinessProfile
  }

  try {
    const response = await runLiveAssistant(messages, bp, profile?.plan ?? 'trial')
    return NextResponse.json({ response })
  } catch (err) {
    console.error('Assistant error:', err)
    return NextResponse.json({ error: 'Assistant unavailable' }, { status: 500 })
  }
}
