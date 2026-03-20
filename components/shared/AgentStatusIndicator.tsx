'use client'

import { Loader2, CheckCircle2, XCircle, Brain, Sparkles } from 'lucide-react'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'

interface AgentStatusIndicatorProps {
  status: Status
  label?: string
}

const config: Record<Status, { icon: React.ElementType; label: string; className: string }> = {
  idle: { icon: Sparkles, label: 'Ready', className: 'text-dashMuted' },
  thinking: { icon: Brain, label: 'Thinking...', className: 'text-accent animate-pulse' },
  generating: { icon: Loader2, label: 'Generating...', className: 'text-accent' },
  done: { icon: CheckCircle2, label: 'Done', className: 'text-green-400' },
  error: { icon: XCircle, label: 'Error', className: 'text-red-400' },
}

export default function AgentStatusIndicator({ status, label }: AgentStatusIndicatorProps) {
  const { icon: Icon, label: defaultLabel, className } = config[status]

  return (
    <div className={`flex items-center gap-1.5 text-sm ${className}`}>
      <Icon
        size={15}
        className={status === 'generating' ? 'animate-spin' : status === 'thinking' ? 'animate-pulse' : ''}
      />
      <span>{label || defaultLabel}</span>
    </div>
  )
}
