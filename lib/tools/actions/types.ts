// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ToolContext = {
  userId: string
  email?: string
  plan: string
  locale: string
  language: string
  supabase: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

export type ToolDefinition = {
  name: string
  description: string
  input_schema: Record<string, unknown>
  sensitive: boolean
  execute: (input: Record<string, unknown>, ctx: ToolContext) => Promise<ToolResult>
}

export type ToolResult = {
  success: boolean
  message?: string
  data?: unknown
}
