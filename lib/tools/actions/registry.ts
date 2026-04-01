import type { ToolDefinition } from './types'
import { sendEmailTool } from './send-email'
import { createTaskTool } from './create-task'
import { createContactTool } from './create-contact'
import { whatsappNotifyTool } from './whatsapp-notify'

const allTools: ToolDefinition[] = [
  sendEmailTool,
  createTaskTool,
  createContactTool,
  whatsappNotifyTool,
]

/** Get Anthropic-compatible tool schemas (without execute function) */
export function getToolSchemas(toolNames?: string[]) {
  const filtered = toolNames ? allTools.filter(t => toolNames.includes(t.name)) : allTools
  return filtered.map(t => ({
    name: t.name,
    description: t.description,
    input_schema: t.input_schema,
  }))
}

export function getTool(name: string): ToolDefinition | undefined {
  return allTools.find(t => t.name === name)
}

export function isSensitiveTool(name: string): boolean {
  return allTools.find(t => t.name === name)?.sensitive ?? true
}
