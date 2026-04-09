// ─── Action Handler Registration ─────────────────────────────────────────────
// Registers all side-effect actions with the idempotent executor.
// Import this file to ensure handlers are registered before executeAction is called.

import { registerAction } from '@/lib/core/executeAction'
import { sendEmail } from '@/lib/email/send'
import { sendTelegramToJames } from '@/lib/notifications/telegram'
import { createServerClient } from '@/lib/supabase/server'

// ─── Send Email ──────────────────────────────────────────────────────────────
registerAction('send_email', async (payload, userId) => {
  const { to, subject, body } = payload as { to?: string; subject?: string; body?: string }
  if (!to || !subject || !body) throw new Error('to, subject, and body are required')
  const result = await sendEmail({ to, subject, body, agentName: 'Action System', userId })
  return { sent: result.success, to, subject }
})

// ─── Create Task ─────────────────────────────────────────────────────────────
registerAction('create_task', async (payload, userId) => {
  const supabase = await createServerClient()
  const { title, description, priority } = payload as { title?: string; description?: string; priority?: string }
  if (!title) throw new Error('title is required')
  const { data, error } = await supabase.from('pa_tasks').insert({
    user_id: userId,
    title,
    description: description ?? null,
    priority: priority ?? 'medium',
    status: 'open',
  }).select('id').single()
  if (error) throw new Error(error.message)
  return { created: true, taskId: data?.id }
})

// ─── Create Contact ──────────────────────────────────────────────────────────
registerAction('create_contact', async (payload, userId) => {
  const supabase = await createServerClient()
  const { full_name, email, phone, notes, source } = payload as Record<string, string>
  if (!full_name) throw new Error('full_name is required')
  const { data, error } = await supabase.from('contacts').insert({
    user_id: userId,
    full_name,
    email: email ?? null,
    phone: phone ?? null,
    notes: notes ?? null,
    source: source ?? 'action',
    status: 'active',
  }).select('id').single()
  if (error) throw new Error(error.message)
  return { created: true, contactId: data?.id }
})

// ─── Telegram Notify ────────────────────────────────────────────────────────
registerAction('whatsapp_notify', async (payload) => {
  const { message } = payload as { message?: string }
  if (!message) throw new Error('message is required')
  await sendTelegramToJames(message)
  return { sent: true }
})

registerAction('telegram_notify', async (payload) => {
  const { message } = payload as { message?: string }
  if (!message) throw new Error('message is required')
  await sendTelegramToJames(message)
  return { sent: true }
})
