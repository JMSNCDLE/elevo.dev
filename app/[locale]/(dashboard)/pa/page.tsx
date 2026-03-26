'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ClipboardList, Plus, Send, Loader2, Bot, Check, Circle,
  AlertTriangle, Trash2, Calendar, MessageSquare,
} from 'lucide-react'

interface PATask {
  id: string
  title: string
  description: string | null
  priority: 'high' | 'medium' | 'low'
  status: 'open' | 'in_progress' | 'done'
  due_date: string | null
  created_at: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const PRIORITY_STYLES = {
  high: 'text-red-400 bg-red-500/10 border-red-500/20',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  low: 'text-green-400 bg-green-500/10 border-green-500/20',
}

export default function PAPage() {
  const [tab, setTab] = useState<'tasks' | 'chat'>('tasks')
  const [tasks, setTasks] = useState<PATask[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)

  // New task form
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [newDue, setNewDue] = useState('')
  const [saving, setSaving] = useState(false)

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm Aria, your personal assistant. I can help you plan your day, manage tasks, draft content, and stay on top of your business. What would you like to do?" }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  // Load tasks
  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/pa')
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch {
      // ignore
    } finally {
      setLoadingTasks(false)
    }
  }, [])

  useEffect(() => { loadTasks() }, [loadTasks])

  async function createTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setSaving(true)
    try {
      await fetch('/api/pa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_task',
          title: newTitle.trim(),
          description: newDesc.trim() || null,
          priority: newPriority,
          due_date: newDue || null,
        }),
      })
      setNewTitle('')
      setNewDesc('')
      setNewPriority('medium')
      setNewDue('')
      setShowForm(false)
      loadTasks()
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  async function updateTask(id: string, updates: Partial<PATask>) {
    await fetch('/api/pa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_task', taskId: id, updates }),
    })
    loadTasks()
  }

  async function deleteTask(id: string) {
    await fetch('/api/pa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_task', taskId: id }),
    })
    loadTasks()
  }

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return
    const userMsg = chatInput.trim()
    setChatInput('')
    const updated = [...messages, { role: 'user' as const, content: userMsg }]
    setMessages(updated)
    setChatLoading(true)
    setStreamingText('')

    try {
      const res = await fetch('/api/pa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, conversationHistory: messages }),
      })

      if (!res.ok || !res.body) throw new Error('Failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setStreamingText(accumulated)
      }

      // Parse any task creation from the response
      const taskMatch = accumulated.match(/```json\s*(\{[^}]*"action"\s*:\s*"create_task"[^}]*\})\s*```/)
      if (taskMatch) {
        try {
          const taskData = JSON.parse(taskMatch[1])
          await fetch('/api/pa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...taskData, action: 'create_task' }),
          })
          loadTasks()
        } catch {
          // ignore parse errors
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: accumulated }])
      setStreamingText('')
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
      setStreamingText('')
    } finally {
      setChatLoading(false)
    }
  }

  const pending = tasks.filter(t => t.status === 'open')
  const inProgress = tasks.filter(t => t.status === 'in_progress')
  const done = tasks.filter(t => t.status === 'done')

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ELEVO PA™</h1>
            <p className="text-sm text-dashMuted">Your personal assistant — Aria</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-dashCard rounded-lg p-0.5">
          <button
            onClick={() => setTab('tasks')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === 'tasks' ? 'bg-indigo-600 text-white' : 'text-dashMuted hover:text-white'
            }`}
          >
            <ClipboardList className="w-4 h-4 inline mr-1.5" />
            Tasks
          </button>
          <button
            onClick={() => setTab('chat')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === 'chat' ? 'bg-indigo-600 text-white' : 'text-dashMuted hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-1.5" />
            Chat with Aria
          </button>
        </div>
      </div>

      {/* ── TASKS TAB ── */}
      {tab === 'tasks' && (
        <div>
          {/* Add task button */}
          <div className="mb-6">
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add task
              </button>
            ) : (
              <form onSubmit={createTask} className="bg-dashCard border border-white/5 rounded-xl p-4 space-y-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Task title"
                  className="w-full bg-dashBg border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
                  autoFocus
                />
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full bg-dashBg border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 resize-none"
                />
                <div className="flex gap-3">
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as 'high' | 'medium' | 'low')}
                    className="bg-dashBg border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="high">High priority</option>
                    <option value="medium">Medium priority</option>
                    <option value="low">Low priority</option>
                  </select>
                  <input
                    type="date"
                    value={newDue}
                    onChange={e => setNewDue(e.target.value)}
                    className="bg-dashBg border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!newTitle.trim() || saving}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {saving ? 'Saving…' : 'Create task'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-dashMuted hover:text-white text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {loadingTasks ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20">
              <ClipboardList className="w-12 h-12 text-dashMuted mx-auto mb-4" />
              <p className="text-dashMuted text-sm">No tasks yet. Add one above or ask Aria to help plan your day.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pending */}
              <div>
                <h3 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                  <Circle className="w-3 h-3" />
                  To do ({pending.length})
                </h3>
                <div className="space-y-2">
                  {pending.map(task => (
                    <TaskCard key={task.id} task={task} onUpdate={updateTask} onDelete={deleteTask} />
                  ))}
                </div>
              </div>

              {/* In Progress */}
              <div>
                <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                  <Loader2 className="w-3 h-3" />
                  In progress ({inProgress.length})
                </h3>
                <div className="space-y-2">
                  {inProgress.map(task => (
                    <TaskCard key={task.id} task={task} onUpdate={updateTask} onDelete={deleteTask} />
                  ))}
                </div>
              </div>

              {/* Done */}
              <div>
                <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <Check className="w-3 h-3" />
                  Done ({done.length})
                </h3>
                <div className="space-y-2">
                  {done.map(task => (
                    <TaskCard key={task.id} task={task} onUpdate={updateTask} onDelete={deleteTask} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CHAT TAB ── */}
      {tab === 'chat' && (
        <div className="bg-dashCard border border-white/5 rounded-xl overflow-hidden flex flex-col" style={{ height: 520 }}>
          {/* Chat header */}
          <div className="flex items-center gap-3 p-4 border-b border-white/5">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Aria — ELEVO PA™</p>
              <p className="text-xs text-indigo-400">Task planner · Daily priorities · Quick actions</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-dashBg text-[#EEF2FF] rounded-bl-sm border border-white/5'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {streamingText && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm leading-relaxed bg-dashBg text-[#EEF2FF] border border-white/5 whitespace-pre-wrap">
                  {streamingText}
                  <span className="inline-block w-1.5 h-4 bg-indigo-400 ml-0.5 animate-pulse rounded-sm" />
                </div>
              </div>
            )}
            {chatLoading && !streamingText && (
              <div className="flex justify-start">
                <div className="bg-dashBg border border-white/5 rounded-2xl rounded-bl-sm px-3.5 py-2.5">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex gap-2 flex-wrap">
              {['Plan my day', 'What are my priorities?', 'Create a task', 'Draft a follow-up email'].map(q => (
                <button
                  key={q}
                  onClick={() => setChatInput(q)}
                  className="text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-white/5">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Ask Aria to plan your day, create tasks, or draft content…"
                className="flex-1 bg-dashBg border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
                disabled={chatLoading}
              />
              <button
                onClick={sendChat}
                disabled={!chatInput.trim() || chatLoading}
                className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Task Card Component ──

function TaskCard({
  task,
  onUpdate,
  onDelete,
}: {
  task: PATask
  onUpdate: (id: string, updates: Partial<PATask>) => void
  onDelete: (id: string) => void
}) {
  const nextStatus: Record<string, string> = {
    open: 'in_progress',
    in_progress: 'done',
    done: 'open',
  }

  return (
    <div className="bg-dashBg border border-white/5 rounded-xl p-3 group">
      <div className="flex items-start gap-2">
        <button
          onClick={() => onUpdate(task.id, { status: nextStatus[task.status] as PATask['status'] })}
          className="mt-0.5 shrink-0"
          title={`Mark as ${nextStatus[task.status]}`}
        >
          {task.status === 'done' ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : task.status === 'in_progress' ? (
            <Loader2 className="w-4 h-4 text-blue-400" />
          ) : (
            <Circle className="w-4 h-4 text-dashMuted hover:text-indigo-400 transition-colors" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${task.status === 'done' ? 'text-dashMuted line-through' : 'text-white'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-dashMuted mt-0.5 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${PRIORITY_STYLES[task.priority]}`}>
              {task.priority === 'high' && <AlertTriangle className="w-2.5 h-2.5 inline mr-0.5" />}
              {task.priority}
            </span>
            {task.due_date && (
              <span className="text-[10px] text-dashMuted flex items-center gap-0.5">
                <Calendar className="w-2.5 h-2.5" />
                {new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-dashMuted hover:text-red-400 transition-all shrink-0"
          title="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
