import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const agentType = req.nextUrl.searchParams.get('agent_type') ?? 'elevo-chat'

  const { data: conversation } = await supabase
    .from('conversations')
    .select('id, agent_type, title, updated_at')
    .eq('user_id', user.id)
    .eq('agent_type', agentType)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!conversation) {
    return NextResponse.json({ conversation: null, messages: [] })
  }

  const { data: messages } = await supabase
    .from('conversation_messages')
    .select('id, role, content, credits_used, created_at')
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: true })
    .limit(200)

  return NextResponse.json({
    conversation,
    messages: messages ?? [],
  })
}
