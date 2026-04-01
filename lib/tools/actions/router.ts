import { getTool } from './registry'
import type { ToolContext, ToolResult } from './types'

export type ToolExecutionResult = {
  type: 'executed' | 'confirmation_required' | 'error'
  tool: string
  input: Record<string, unknown>
  result?: ToolResult
  message?: string
}

export async function executeToolCall(
  toolName: string,
  toolInput: Record<string, unknown>,
  ctx: ToolContext,
  userConfirmed = false
): Promise<ToolExecutionResult> {
  const tool = getTool(toolName)

  if (!tool) {
    return { type: 'error', tool: toolName, input: toolInput, message: `Unknown tool: ${toolName}` }
  }

  // Sensitive tools need explicit user confirmation
  if (tool.sensitive && !userConfirmed) {
    return {
      type: 'confirmation_required',
      tool: toolName,
      input: toolInput,
      message: `This action requires your confirmation: ${tool.description}`,
    }
  }

  try {
    let result = await tool.execute(toolInput, ctx)
    // Validate output shape
    if (result && typeof result === 'object' && typeof result.success !== 'boolean') {
      console.warn(`[router] Tool ${toolName} returned invalid shape — wrapping`)
      result = { success: true, data: result }
    }
    return { type: 'executed', tool: toolName, input: toolInput, result }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return { type: 'error', tool: toolName, input: toolInput, message: msg }
  }
}
