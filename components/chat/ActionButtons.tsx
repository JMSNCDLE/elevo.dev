'use client'

import { useState } from 'react'
import { Mail, CheckSquare, Download, Copy, Loader2 } from 'lucide-react'

interface ActionButtonsProps {
  responseContent: string
  agentName: string
}

export function ActionButtons({ responseContent, agentName }: ActionButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  async function handleAction(name: string, fn: () => Promise<void>) {
    setLoading(name)
    try {
      await fn()
      setCompleted(prev => new Set([...prev, name]))
    } catch (e) {
      console.error(e)
    }
    setLoading(null)
  }

  const buttons = [
    {
      id: 'copy',
      label: completed.has('copy') ? 'Copied!' : 'Copy',
      icon: <Copy className="w-3.5 h-3.5" />,
      action: async () => { await navigator.clipboard.writeText(responseContent) },
    },
    {
      id: 'task',
      label: completed.has('task') ? 'Task Created' : 'Create Task',
      icon: <CheckSquare className="w-3.5 h-3.5" />,
      action: async () => {
        await fetch('/api/pa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create_task', title: `Follow up: ${agentName}`, description: responseContent.slice(0, 500), priority: 'medium' }),
        })
      },
    },
    {
      id: 'email',
      label: completed.has('email') ? 'Email Sent' : 'Send as Email',
      icon: <Mail className="w-3.5 h-3.5" />,
      action: async () => {
        await fetch('/api/pa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send_email', to: '', subject: `${agentName} — ELEVO AI`, body: responseContent }),
        })
      },
    },
    {
      id: 'docx',
      label: 'Download DOCX',
      icon: <Download className="w-3.5 h-3.5" />,
      action: async () => {
        const res = await fetch('/api/documents/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: `${agentName} Output`, sections: [{ content: responseContent }] }),
        })
        if (res.ok) {
          const blob = await res.blob()
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${agentName}-output.docx`
          a.click()
          URL.revokeObjectURL(url)
        }
      },
    },
  ]

  return (
    <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-white/5">
      {buttons.map(btn => (
        <button
          key={btn.id}
          onClick={() => handleAction(btn.id, btn.action)}
          disabled={loading !== null}
          className={`flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md transition-all ${
            completed.has(btn.id)
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-dashCard text-dashMuted hover:text-dashText border border-dashSurface2'
          } ${loading === btn.id ? 'opacity-50' : ''}`}
        >
          {loading === btn.id ? <Loader2 className="w-3 h-3 animate-spin" /> : btn.icon}
          {btn.label}
        </button>
      ))}
    </div>
  )
}
