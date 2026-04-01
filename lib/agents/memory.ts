// ─── Agent Conversation Memory ───────────────────────────────────────────────
// Persistent multi-turn memory for agent conversations.
// Tables: agent_conversations + agent_messages (see schema migration below).
// Uses the Supabase client from getUserContext() — no new client creation.

type SupabaseClient = {
  from: (table: string) => {
    select: (...args: unknown[]) => unknown
    insert: (...args: unknown[]) => unknown
    update: (...args: unknown[]) => unknown
  }
}

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
  supabase: SupabaseClient,
  language = 'en'
): Promise<ConversationRecord | null> {
  // Find the most recent conversation for this user + agent (within last 24h)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: existing } = await (supabase
    .from('agent_conversations')
    .select('*') as unknown as Promise<{ data: ConversationRecord[] | null }>)
    .catch(() => ({ data: null })) as { data: ConversationRecord[] | null }

  // If tables don't exist yet, return null gracefully
  if (existing === null) return null

  // Filter in memory since we can't chain easily with the generic type
  const recent = (existing as ConversationRecord[])
    ?.filter((c: ConversationRecord) => c.user_id === userId && c.agent === agent && c.updated_at > oneDayAgo)
    ?.sort((a: ConversationRecord, b: ConversationRecord) => b.updated_at.localeCompare(a.updated_at))
    ?.[0]

  if (recent) return recent

  try {
    const { data: created } = await (supabase
      .from('agent_conversations')
      .insert({ user_id: userId, agent, language }) as unknown as Promise<{ data: ConversationRecord | null }>)
    return created
  } catch {
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
  supabase: SupabaseClient
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
  } catch {
    // Don't fail the agent call if memory save fails
    console.warn('[memory] Failed to save message')
  }
}

export async function loadMessages(
  conversationId: string,
  supabase: SupabaseClient,
  limit = 20
): Promise<MessageRecord[]> {
  try {
    const { data } = await (supabase
      .from('agent_messages')
      .select('*') as unknown as Promise<{ data: MessageRecord[] | null }>)

    if (!data) return []

    return (data as MessageRecord[])
      .filter((m: MessageRecord) => m.conversation_id === conversationId)
      .sort((a: MessageRecord, b: MessageRecord) => a.created_at.localeCompare(b.created_at))
      .slice(-limit)
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
