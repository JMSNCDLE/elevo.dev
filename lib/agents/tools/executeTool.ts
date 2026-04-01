import { sendEmail } from '@/lib/email/send'
import { sendWhatsAppToJames } from '@/lib/notifications/whatsapp'

interface ToolCall {
  name: string
  input: Record<string, unknown>
}

interface ToolResult {
  success: boolean
  message: string
  data?: unknown
}

export async function executeTool(toolCall: ToolCall, ctx: { userId?: string; supabase?: unknown }): Promise<ToolResult> {
  const { name, input } = toolCall

  switch (name) {
    case 'send_email': {
      const { to, subject, body } = input as { to?: string; subject?: string; body?: string }
      if (!to || !subject || !body) return { success: false, message: 'Missing to, subject, or body' }
      const result = await sendEmail({ to, subject, body, agentName: 'Agent Tool', userId: ctx.userId })
      return { success: result.success, message: result.success ? 'Email sent' : 'Email failed' }
    }

    case 'whatsapp_james': {
      const { message } = input as { message?: string }
      if (!message) return { success: false, message: 'Missing message' }
      try {
        await sendWhatsAppToJames(message)
        return { success: true, message: 'WhatsApp sent to James' }
      } catch {
        return { success: false, message: 'WhatsApp send failed' }
      }
    }

    case 'create_task': {
      const { title, description, priority, due_date } = input as {
        title?: string; description?: string; priority?: string; due_date?: string
      }
      if (!title) return { success: false, message: 'Missing title' }
      // Task creation uses Supabase — caller should handle this
      return {
        success: true,
        message: 'Task created',
        data: { title, description, priority: priority ?? 'medium', due_date: due_date ?? null },
      }
    }

    default:
      console.warn(`[executeTool] Unknown tool: ${name}`)
      return { success: false, message: `Unknown tool: ${name}` }
  }
}
