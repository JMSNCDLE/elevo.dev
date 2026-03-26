import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getClient, MODELS } from '@/lib/agents/client'

const SYSTEM_PROMPT = `You are Aria, the ELEVO PA™ — a personal assistant for business owners using the ELEVO AI platform.

You help users with:
1. **Task management**: Create, prioritise, and track tasks. When a user asks you to create a task, respond with a JSON block in this format:
   \`\`\`json
   {"action":"create_task","title":"...","description":"...","priority":"high|medium|low","due_date":"YYYY-MM-DD or null"}
   \`\`\`
2. **Daily planning**: Suggest priorities based on their pending tasks and business context.
3. **Business insights**: Summarise their recent activity — credits used, content generated, contacts added.
4. **Quick actions**: Help draft emails, suggest posts, plan the day.
5. **Reminders**: When asked to set a reminder, create a task with a due date.

Rules:
- Be concise and action-oriented. Business owners are busy.
- When creating tasks, always include the JSON block so the system can parse it.
- Prioritise: urgent tasks first, then by due date.
- Use the user's business context to give relevant advice.
- Never access other users' data.
- Keep responses under 150 words unless more detail is needed.`

// GET — list user's PA tasks
export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  let query = supabase
    .from('pa_tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.limit(50)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ tasks: data })
}

// POST — chat with PA or create/update tasks
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await req.json()
  const { action, message, taskId, updates, conversationHistory = [] } = body

  // Direct task operations
  if (action === 'create_task') {
    const { title, description, priority, due_date } = body
    const { data, error } = await supabase
      .from('pa_tasks')
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        priority: priority || 'medium',
        status: 'open',
        type: 'reminder',
        due_date: due_date || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ task: data })
  }

  if (action === 'update_task' && taskId) {
    const { data, error } = await supabase
      .from('pa_tasks')
      .update(updates)
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ task: data })
  }

  if (action === 'delete_task' && taskId) {
    const { error } = await supabase
      .from('pa_tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // Chat with PA — stream response
  if (!message?.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }

  // Fetch user context
  const [tasksResult, profileResult, bpResult] = await Promise.all([
    supabase.from('pa_tasks').select('*').eq('user_id', user.id).eq('status', 'open').order('created_at', { ascending: false }).limit(10),
    supabase.from('profiles').select('plan, credits_used, credits_limit').eq('id', user.id).single(),
    supabase.from('business_profiles').select('business_name, industry, city').eq('user_id', user.id).eq('is_primary', true).single(),
  ])

  const pendingTasks = tasksResult.data || []
  const profile = profileResult.data
  const bp = bpResult.data

  const contextBlock = `
User context:
- Business: ${bp?.business_name || 'Unknown'} (${bp?.industry || 'Unknown industry'}, ${bp?.city || 'Unknown city'})
- Plan: ${profile?.plan || 'trial'}
- Credits: ${(profile?.credits_limit || 0) - (profile?.credits_used || 0)} remaining of ${profile?.credits_limit || 0}
- Pending tasks (${pendingTasks.length}): ${pendingTasks.map(t => `[${t.priority}] ${t.title}`).join(', ') || 'None'}
- Today: ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`

  const messages: { role: 'user' | 'assistant'; content: string }[] = [
    ...conversationHistory
      .filter((m: { role: string; content: string }) => !(m.role === 'assistant' && m.content.startsWith("Hi! I'm Aria")))
      .map((m: { role: 'user' | 'assistant'; content: string }) => ({ role: m.role, content: m.content })),
    { role: 'user', content: `${contextBlock}\n\nUser message: ${message}` },
  ]

  try {
    const client = getClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = await (client.messages as any).create({
      model: MODELS.SPECIALIST,
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      messages,
      stream: true,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          controller.close()
        } catch (err) {
          console.error('[pa stream]', err)
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('[pa]', err)
    return NextResponse.json({ error: 'AI unavailable' }, { status: 500 })
  }
}
