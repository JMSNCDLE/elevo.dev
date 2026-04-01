// ─── Agent Conversation Memory ───────────────────────────────────────────────
// Persistent multi-turn memory for agent conversations.
// Tables: agent_conversations + agent_messages
// Uses Supabase client from getUserContext() — no new client creation.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = any

export interface ConversationRecord {
  id: string
  user_id: string
  agent: string
  language: string
  created_at: string
  updated_at: string
}

export interface MessageRecord {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  tool_name: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export async function getOrCreateConversation(
  userId: string,
  agent: string,
  supabase: SB,
  language = 'en'
): Promise<ConversationRecord | null> {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: existing } = await supabase
      .from('agent_conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('agent', agent)
      .gte('updated_at', oneDayAgo)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existing) return existing as ConversationRecord

    const { data: created } = await supabase
      .from('agent_conversations')
      .insert({ user_id: userId, agent, language })
      .select()
      .single()

    return created as ConversationRecord
  } catch {
    // Tables may not exist yet — graceful degradation
    return null
  }
}

export async function saveMessage({
  conversationId,
  role,
  content,
  toolName,
  supabase,
}: {
  conversationId: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  toolName?: string
  supabase: SB
}): Promise<void> {
  try {
    await supabase.from('agent_messages').insert({
      conversation_id: conversationId,
      role,
      content,
      tool_name: toolName ?? null,
    })

    await supabase
      .from('agent_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)
  } catch {
    console.warn('[memory] Failed to save message')
  }
}

export async function loadMessages(
  conversationId: string,
  supabase: SB,
  limit = 20
): Promise<MessageRecord[]> {
  try {
    const { data } = await supabase
      .from('agent_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit)

    return (data ?? []) as MessageRecord[]
  } catch {
    return []
  }
}

export function formatMessagesForClaude(
  messages: MessageRecord[]
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return messages.map(msg => {
    if (msg.role === 'tool') {
      return {
        role: 'assistant' as const,
        content: `[Tool: ${msg.tool_name}] ${msg.content}`,
      }
    }
    return {
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }
  })
}
