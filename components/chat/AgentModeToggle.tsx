'use client'

import { useState } from 'react'

interface AgentModeToggleProps {
  onChange: (mode: 'advise' | 'execute') => void
  defaultMode?: 'advise' | 'execute'
}

export default function AgentModeToggle({ onChange, defaultMode = 'advise' }: AgentModeToggleProps) {
  const [mode, setMode] = useState<'advise' | 'execute'>(defaultMode)

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-dashCard rounded-lg border border-dashSurface2 mb-4">
      <span className={`text-xs ${mode === 'advise' ? 'text-dashText font-medium' : 'text-dashMuted'}`}>
        💬 Advise
      </span>
      <button
        onClick={() => {
          const next = mode === 'advise' ? 'execute' : 'advise'
          setMode(next)
          onChange(next)
        }}
        className={`relative w-10 h-5 rounded-full transition-colors ${mode === 'execute' ? 'bg-accent' : 'bg-dashSurface2'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${mode === 'execute' ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
      <span className={`text-xs ${mode === 'execute' ? 'text-accent font-medium' : 'text-dashMuted'}`}>
        ⚡ Do It For Me
      </span>
    </div>
  )
}

/** System prompt suffix for "execute" mode */
export const EXECUTE_MODE_PROMPT = `
EXECUTION MODE: You are in "Do It For Me" mode. Do NOT just advise or suggest.
You MUST use your tools to actually EXECUTE every action. If the user asks for
an email campaign, USE the send_email tool to actually send it. If they ask for
a content calendar, USE create_task to actually create each task. If they ask
for a document, USE generate_document to actually produce the file.
Always confirm what you've DONE, not what you'd recommend.`
