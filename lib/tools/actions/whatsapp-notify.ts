import type { ToolDefinition } from './types'
import { sendWhatsAppToJames } from '@/lib/notifications/whatsapp'

export const whatsappNotifyTool: ToolDefinition = {
  name: 'send_whatsapp',
  description: 'Send a WhatsApp notification to James (admin). Use for urgent updates.',
  input_schema: {
    type: 'object',
    properties: {
      message: { type: 'string', description: 'The message to send via WhatsApp' },
    },
    required: ['message'],
  },
  sensitive: true,
  async execute(input) {
    try {
      await sendWhatsAppToJames(input.message as string)
      return { success: true, message: 'WhatsApp notification sent' }
    } catch {
      return { success: false, message: 'WhatsApp notification failed' }
    }
  },
}
