import type { ToolDefinition } from './types'
import { sendTelegramToJames } from '@/lib/notifications/telegram'

export const whatsappNotifyTool: ToolDefinition = {
  name: 'send_whatsapp',
  description: 'Send a Telegram notification to James (admin). Use for urgent updates.',
  input_schema: {
    type: 'object',
    properties: {
      message: { type: 'string', description: 'The message to send via Telegram' },
    },
    required: ['message'],
  },
  sensitive: true,
  async execute(input) {
    try {
      await sendTelegramToJames(input.message as string)
      return { success: true, message: 'Telegram notification sent' }
    } catch {
      return { success: false, message: 'Telegram notification failed' }
    }
  },
}
