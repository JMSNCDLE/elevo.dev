'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Loader2, Circle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WorkflowStep {
  id: string
  label: string
  status: 'pending' | 'active' | 'completed' | 'error'
  detail?: string
}

interface WorkflowProgressProps {
  steps: WorkflowStep[]
  estimatedTimeMs?: number
  startedAt?: number
  visible: boolean
}

export default function WorkflowProgress({ steps, estimatedTimeMs, startedAt, visible }: WorkflowProgressProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!visible || !startedAt) return
    const interval = setInterval(() => setElapsed(Date.now() - startedAt), 500)
    return () => clearInterval(interval)
  }, [visible, startedAt])

  if (!visible || steps.length === 0) return null

  const completedCount = steps.filter(s => s.status === 'completed').length
  const progressPct = Math.round((completedCount / steps.length) * 100)

  return (
    <div className="max-w-2xl mx-auto my-3">
      <div className="bg-dashCard border border-dashSurface2 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-dashMuted">Processing</span>
          <div className="flex items-center gap-2">
            {estimatedTimeMs && elapsed > 0 && (
              <span className="text-xs text-dashMuted flex items-center gap-1">
                <Clock size={10} />
                {Math.max(0, Math.ceil((estimatedTimeMs - elapsed) / 1000))}s remaining
              </span>
            )}
            <span className="text-xs font-medium text-accent">{progressPct}%</span>
          </div>
        </div>
        <div className="h-1.5 bg-dashSurface2 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-accent rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="space-y-2">
          {steps.map(step => (
            <div key={step.id} className="flex items-start gap-2.5">
              {step.status === 'completed' ? <CheckCircle size={14} className="text-green-400 mt-0.5 shrink-0" />
                : step.status === 'active' ? <Loader2 size={14} className="text-accent animate-spin mt-0.5 shrink-0" />
                : step.status === 'error' ? <Circle size={14} className="text-red-400 mt-0.5 shrink-0" />
                : <Circle size={14} className="text-dashMuted/40 mt-0.5 shrink-0" />}
              <div>
                <span className={cn('text-xs',
                  step.status === 'completed' ? 'text-dashMuted line-through' :
                  step.status === 'active' ? 'text-dashText font-medium' : 'text-dashMuted/60'
                )}>{step.label}</span>
                {step.detail && step.status === 'active' && (
                  <p className="text-[10px] text-dashMuted mt-0.5">{step.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
