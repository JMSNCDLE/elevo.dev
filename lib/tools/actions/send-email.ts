import type { ToolDefinition } from './types'
import { sendEmail } from '@/lib/email/send'

export const sendEmailTool: ToolDefinition = {
  name: 'send_email',
  description: 'Send an email to a recipient. Use this when the user asks to email someone.',
  input_schema: {
    type: 'object',
    properties: {
      to: { type: 'string', description: 'Recipient email address' },
      subject: { type: 'string', description: 'Email subject line' },
      body: { type: 'string', description: 'Email body content' },
    },
    required: ['to', 'subject', 'body'],
  },
  sensitive: true,
  async execute(input, ctx) {
    const result = await sendEmail({
      to: input.to as string,
      subject: input.subject as string,
      body: input.body as string,
      agentName: 'Agent Tool',
      userId: ctx.userId,
    })
    return { success: result.success, message: result.success ? `Email sent to ${input.to}` : 'Email failed' }
  },
}
