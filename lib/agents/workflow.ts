// ─── Workflow Engine ─────────────────────────────────────────────────────────
// Creates and executes multi-step workflows. One step per request (Hobby 60s limit).
// State tracked in Supabase: workflows + workflow_steps tables.

import { planWorkflow } from './planner'
import { runAgent } from './runAgent'
import { executeToolCall } from '@/lib/tools/actions/router'
import { logAgentRun } from './logger'
import { isSensitiveTool } from '@/lib/tools/actions/registry'
import { getUserContext } from '@/lib/auth/getUserContext'

const MAX_STEPS = 10
const MAX_WORKFLOW_RUNTIME_MS = 10 * 60 * 1000 // 10 minutes
const STEP_TIMEOUT_MS = 90000 // 90 seconds

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = any

export async function createWorkflow(goal: string, agent: string) {
  const ctx = await getUserContext()
  if (!ctx.user) throw new Error('Unauthorized')

  // 1. Plan
  const plan = await planWorkflow(goal)
  const steps = plan.steps.slice(0, MAX_STEPS)

  // 2. Create workflow record
  const { data: workflow, error: wfError } = await ctx.supabase
    .from('workflows')
    .insert({
      user_id: ctx.user.id,
      agent,
      goal,
      status: 'running',
      total_steps: steps.length,
    })
    .select()
    .single()

  if (wfError || !workflow) throw new Error(wfError?.message ?? 'Failed to create workflow')

  // 3. Create step records
  const stepRecords = steps.map((step, i) => ({
    workflow_id: workflow.id,
    step_index: i,
    description: step.description,
    tool: step.tool,
    input: step.input,
    status: 'pending',
  }))

  await ctx.supabase.from('workflow_steps').insert(stepRecords)

  // 4. Execute first step immediately
  await executeNextStep(workflow.id)

  // Return fresh workflow state
  const { data: updated } = await ctx.supabase
    .from('workflows')
    .select('*, workflow_steps(*)')
    .eq('id', workflow.id)
    .single()

  return updated ?? workflow
}

export async function executeNextStep(workflowId: string) {
  const ctx = await getUserContext()
  if (!ctx.user) return

  // Get workflow
  const { data: workflow } = await ctx.supabase
    .from('workflows')
    .select('*')
    .eq('id', workflowId)
    .single()

  if (!workflow || workflow.status !== 'running') return

  // Check workflow timeout (10 min max)
  const workflowAge = Date.now() - new Date(workflow.created_at).getTime()
  if (workflowAge > MAX_WORKFLOW_RUNTIME_MS) {
    await ctx.supabase.from('workflows')
      .update({ status: 'failed', error: 'Workflow timed out (10 min max)', updated_at: new Date().toISOString() })
      .eq('id', workflowId)
    return
  }

  // Check for stuck steps (running > 90s) and recover
  const { data: stuckSteps } = await ctx.supabase
    .from('workflow_steps')
    .select('*')
    .eq('workflow_id', workflowId)
    .eq('status', 'running')

  for (const stuck of stuckSteps ?? []) {
    const stepAge = Date.now() - new Date(stuck.created_at).getTime()
    if (stepAge > STEP_TIMEOUT_MS) {
      await ctx.supabase.from('workflow_steps')
        .update({ status: 'error', error: 'Step timed out (90s)', completed_at: new Date().toISOString() })
        .eq('id', stuck.id)
    }
  }

  // Get next pending step
  const { data: steps } = await ctx.supabase
    .from('workflow_steps')
    .select('*')
    .eq('workflow_id', workflowId)
    .eq('status', 'pending')
    .order('step_index', { ascending: true })
    .limit(1)

  const step = steps?.[0]
  if (!step) {
    await ctx.supabase.from('workflows')
      .update({ status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', workflowId)
    return
  }

  // Sensitive tool check — pause workflow for user confirmation
  if (step.tool && isSensitiveTool(step.tool)) {
    await ctx.supabase.from('workflows')
      .update({ status: 'paused', updated_at: new Date().toISOString() })
      .eq('id', workflowId)
    return // Frontend shows confirmation UI
  }

  // Atomic claim — prevent duplicate execution
  const { data: claimed } = await ctx.supabase
    .from('workflow_steps')
    .update({ status: 'running' })
    .eq('id', step.id)
    .eq('status', 'pending')
    .select()
    .single()

  if (!claimed) return // Another execution already claimed this step

  const start = Date.now()

  try {
    // Resolve {{step_N_output}} references
    let resolvedInput = step.input
    if (resolvedInput) {
      const inputStr = JSON.stringify(resolvedInput)
      const resolved = await resolveStepReferences(inputStr, workflowId, ctx.supabase)
      resolvedInput = JSON.parse(resolved)
    }

    const toolCtx = {
      userId: ctx.user.id,
      email: ctx.user.email,
      plan: ctx.plan,
      locale: ctx.locale,
      language: ctx.language,
      supabase: ctx.supabase,
    }

    let output: unknown

    if (step.tool === 'think') {
      const agentResult = await runAgent({
        agent: workflow.agent,
        messages: [{ role: 'user', content: step.description }],
      })
      output = { success: true, content: agentResult.content }
    } else {
      const result = await executeToolCall(step.tool, resolvedInput ?? {}, toolCtx, true)
      output = result.result ?? result
    }

    // Mark done
    await ctx.supabase.from('workflow_steps').update({
      status: 'done',
      output,
      duration_ms: Date.now() - start,
      completed_at: new Date().toISOString(),
    }).eq('id', step.id)

    await ctx.supabase.from('workflows').update({
      current_step: step.step_index + 1,
      updated_at: new Date().toISOString(),
    }).eq('id', workflowId)

    // Log (fire and forget)
    logAgentRun(ctx.supabase, {
      userId: ctx.user.id,
      agent: `workflow:${workflow.agent}:step_${step.step_index}`,
      status: 'success',
      input: step.description,
      output: JSON.stringify(output).slice(0, 2000),
      durationMs: Date.now() - start,
      toolUsed: step.tool,
      locale: ctx.locale,
    })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)

    await ctx.supabase.from('workflow_steps').update({
      status: 'error',
      error: msg,
      duration_ms: Date.now() - start,
      completed_at: new Date().toISOString(),
    }).eq('id', step.id)

    await ctx.supabase.from('workflows').update({
      status: 'failed',
      error: `Step ${step.step_index} failed: ${msg}`,
      updated_at: new Date().toISOString(),
    }).eq('id', workflowId)

    logAgentRun(ctx.supabase, {
      userId: ctx.user.id,
      agent: `workflow:${workflow.agent}:step_${step.step_index}`,
      status: 'error',
      input: step.description,
      error: msg,
      durationMs: Date.now() - start,
      toolUsed: step.tool,
      locale: ctx.locale,
    })
  }
}

async function resolveStepReferences(inputStr: string, workflowId: string, supabase: SB): Promise<string> {
  const refs = inputStr.match(/\{\{step_(\d+)_output\}\}/g)
  if (!refs) return inputStr

  const { data: completedSteps } = await supabase
    .from('workflow_steps')
    .select('step_index, output')
    .eq('workflow_id', workflowId)
    .eq('status', 'done')

  let resolved = inputStr
  for (const ref of refs) {
    const idx = parseInt(ref.match(/\d+/)![0])
    const step = completedSteps?.find((s: { step_index: number }) => s.step_index === idx)
    if (step?.output) {
      resolved = resolved.replace(ref, JSON.stringify(step.output))
    } else {
      // Replace missing references with null — never let broken refs corrupt downstream
      console.warn(`[workflow] Step ${idx} output missing for ref ${ref}`)
      resolved = resolved.replace(ref, 'null')
    }
  }
  return resolved
}
