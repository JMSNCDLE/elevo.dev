import type { ToolDefinition } from './types'

export const createTaskTool: ToolDefinition = {
  name: 'create_task',
  description: 'Create a task or to-do item for the user.',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Task title' },
      description: { type: 'string', description: 'Task description' },
      priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], description: 'Priority level' },
      due_date: { type: 'string', description: 'Due date in ISO format (optional)' },
    },
    required: ['title'],
  },
  sensitive: false,
  async execute(input, ctx) {
    const { data, error } = await ctx.supabase
      .from('pa_tasks')
      .insert({
        user_id: ctx.userId,
        title: input.title,
        description: input.description || null,
        priority: input.priority || 'medium',
        due_date: input.due_date || null,
        status: 'open',
      })
      .select()
      .single()

    if (error) return { success: false, message: `Failed to create task: ${error.message}` }
    return { success: true, message: `Task created: "${input.title}"`, data }
  },
}
