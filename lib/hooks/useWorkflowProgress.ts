'use client'

import { useState, useCallback, useRef } from 'react'
import type { WorkflowStep } from '@/components/chat/WorkflowProgress'
import { getWorkflowSteps, getEstimatedTime } from '@/lib/core/workflowSteps'

export function useWorkflowProgress(agentType: string) {
  const [steps, setSteps] = useState<WorkflowStep[]>([])
  const [visible, setVisible] = useState(false)
  const [startedAt, setStartedAt] = useState<number | undefined>()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stepIndexRef = useRef(0)

  const estimatedTime = getEstimatedTime(agentType)

  const start = useCallback(() => {
    const initialSteps = getWorkflowSteps(agentType)
    if (initialSteps.length > 0) initialSteps[0].status = 'active'
    setSteps(initialSteps)
    setVisible(true)
    setStartedAt(Date.now())
    stepIndexRef.current = 0

    const stepDuration = estimatedTime / initialSteps.length
    const advance = () => {
      stepIndexRef.current++
      setSteps(prev => prev.map((step, i) => ({
        ...step,
        status: i < stepIndexRef.current ? 'completed' :
                i === stepIndexRef.current ? 'active' : 'pending',
      })))
      if (stepIndexRef.current < initialSteps.length - 1) {
        timerRef.current = setTimeout(advance, stepDuration)
      }
    }
    timerRef.current = setTimeout(advance, stepDuration)
  }, [agentType, estimatedTime])

  const complete = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setSteps(prev => prev.map(step => ({ ...step, status: 'completed' as const })))
    setTimeout(() => setVisible(false), 1500)
  }, [])

  const error = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setSteps(prev => prev.map(step =>
      step.status === 'active' ? { ...step, status: 'error' as const } : step
    ))
  }, [])

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setSteps([])
    setVisible(false)
    setStartedAt(undefined)
    stepIndexRef.current = 0
  }, [])

  return { steps, visible, startedAt, estimatedTime, start, complete, error, reset }
}
