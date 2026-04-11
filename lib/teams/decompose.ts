// ─── Goal decomposition — break a team goal into a sequenced task list ──────
// Uses claude-opus-4-6 (the orchestrator model) per the prompt rule.
// NEVER uses thinking or effort params.

import { createMessage, MODELS, MAX_TOKENS, extractText } from '@/lib/agents/client'

export interface DecomposedTask {
  description: string
  assigned_agent: string  // agent_type slug from team members
  priority: number        // sequential ordering, 1 = first
}

interface DecomposeArgs {
  goal: string
  members: Array<{ agent_type: string; role_title: string; context: string }>
}

export async function decomposeGoal({ goal, members }: DecomposeArgs): Promise<DecomposedTask[]> {
  const memberList = members
    .map(m => `- ${m.agent_type} (${m.role_title}): ${m.context}`)
    .join('\n')

  const message = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.MEDIUM,
    messages: [
      {
        role: 'user',
        content: `You are an AI orchestrator decomposing a business goal into a sequenced task plan.

GOAL: ${goal}

TEAM MEMBERS:
${memberList}

Break the goal into 4–8 concrete tasks that, executed in order, will achieve it. Each task must be:
- Assigned to ONE of the team members above (use the agent_type slug exactly)
- Specific and actionable (no vague tasks)
- Sequenced so earlier tasks unblock later ones

Return ONLY valid JSON (no markdown, no commentary) matching:
{
  "tasks": [
    { "description": "<concrete task>", "assigned_agent": "<agent_type slug>", "priority": <1-N> }
  ]
}`,
      },
    ],
  })

  const text = extractText(message)
  const json = text.match(/\{[\s\S]*\}/)?.[0] ?? '{}'
  try {
    const parsed = JSON.parse(json) as { tasks?: DecomposedTask[] }
    const validAgents = new Set(members.map(m => m.agent_type))
    return (parsed.tasks ?? [])
      .filter(t => validAgents.has(t.assigned_agent))
      .map((t, i) => ({ ...t, priority: t.priority ?? i + 1 }))
  } catch {
    // Fallback: round-robin tasks across members
    return members.slice(0, 4).map((m, i) => ({
      description: `${m.role_title}: contribute to "${goal}"`,
      assigned_agent: m.agent_type,
      priority: i + 1,
    }))
  }
}
