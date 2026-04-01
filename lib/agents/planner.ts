// ─── Workflow Planner Agent ───────────────────────────────────────────────────
// Takes a user goal and breaks it into executable steps using available tools.

import { createMessage, MODELS } from './client'
import { parseAgentJSON } from './runAgent'
import { getUserContext } from '@/lib/auth/getUserContext'
import { getToolSchemas } from '@/lib/tools/actions/registry'

export interface PlanStep {
  description: string
  tool: string
  input: Record<string, unknown>
}

export interface WorkflowPlan {
  steps: PlanStep[]
}

export async function planWorkflow(goal: string): Promise<WorkflowPlan> {
  const ctx = await getUserContext()
  const toolSchemas = getToolSchemas()
  const toolList = toolSchemas.map(t => `- ${t.name}: ${t.description}`).join('\n')

  const system = `You are the ELEVO Workflow Planner. Break the user's goal into a sequence of executable steps.

Available tools:
${toolList}

Rules:
- Each step must use exactly ONE tool or be a "think" step (for agent reasoning/drafting)
- Steps execute sequentially — each step can use output from previous steps
- Keep plans to 3-8 steps maximum — be efficient
- Be specific about tool inputs — use concrete values, not placeholders
- If a step needs data from a previous step, reference it as {{step_N_output}}
- You MUST respond entirely in ${ctx.language}

Return ONLY valid JSON:
{
  "steps": [
    {
      "description": "Human-readable description",
      "tool": "tool_name",
      "input": { ... }
    }
  ]
}`

  const response = await createMessage({
    model: MODELS.AGENT,
    system,
    messages: [{ role: 'user', content: goal }],
    max_tokens: 2000,
  })

  const text = response.content
    .filter((c: { type: string }) => c.type === 'text')
    .map((c: { type: string; text?: string }) => c.text ?? '')
    .join('')

  return parseAgentJSON<WorkflowPlan>(text)
}
