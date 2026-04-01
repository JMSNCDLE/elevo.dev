import type { ToolDefinition } from './types'

export const createContactTool: ToolDefinition = {
  name: 'create_contact',
  description: 'Create a contact in the CRM. Use this when the user mentions a new lead or client.',
  input_schema: {
    type: 'object',
    properties: {
      full_name: { type: 'string', description: 'Contact full name' },
      email: { type: 'string', description: 'Contact email address' },
      phone: { type: 'string', description: 'Contact phone number' },
      notes: { type: 'string', description: 'Notes about this contact' },
      source: { type: 'string', description: 'Where this contact came from' },
    },
    required: ['full_name'],
  },
  sensitive: false,
  async execute(input, ctx) {
    const { data, error } = await ctx.supabase
      .from('contacts')
      .insert({
        user_id: ctx.userId,
        full_name: input.full_name,
        email: input.email || null,
        phone: input.phone || null,
        notes: input.notes || null,
        source: input.source || 'agent',
        status: 'active',
      })
      .select()
      .single()

    if (error) return { success: false, message: `Failed to create contact: ${error.message}` }
    return { success: true, message: `Contact created: ${input.full_name}`, data }
  },
}
