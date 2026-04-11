'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import {
  ArrowLeft, Play, Pause, Trash2, Loader2, CheckCircle2, XCircle, Clock, Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Team {
  id: string
  name: string
  goal: string
  status: 'active' | 'paused' | 'completed' | 'failed'
  total_credits_used: number
}

interface Member {
  id: string
  agent_type: string
  role_title: string
  context: string | null
  credits_used: number
}

interface Task {
  id: string
  assigned_agent: string
  task_description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'needs_approval'
  priority: number
  result: { output?: string } | null
  credits_used: number
  completed_at: string | null
  created_at: string
}

const STATUS_BADGE: Record<string, string> = {
  active: 'text-green-400 bg-green-500/10 border-green-500/30',
  paused: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  completed: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  failed: 'text-red-400 bg-red-500/10 border-red-500/30',
}

const TASK_ICON: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4 text-dashMuted" />,
  in_progress: <Loader2 className="w-4 h-4 text-accent animate-spin" />,
  completed: <CheckCircle2 className="w-4 h-4 text-green-400" />,
  failed: <XCircle className="w-4 h-4 text-red-400" />,
  needs_approval: <Clock className="w-4 h-4 text-yellow-400" />,
}

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const locale = useLocale()
  const teamId = params?.id as string

  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/teams/${teamId}`)
      if (r.ok) {
        const data = await r.json()
        setTeam(data.team)
        setMembers(data.members ?? [])
        setTasks(data.tasks ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [teamId])

  useEffect(() => { load() }, [load])

  async function runNext() {
    if (running) return
    setRunning(true)
    try {
      const r = await fetch(`/api/teams/${teamId}/execute`, { method: 'POST' })
      const data = await r.json()
      if (!r.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Task failed')
      if (data.done) {
        toast.success('🎉 All tasks complete — team finished!')
      } else {
        toast.success(`Task complete: ${data.task?.task_description?.slice(0, 60) ?? 'Done'}`)
      }
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to run task')
    } finally {
      setRunning(false)
    }
  }

  async function setStatus(status: 'active' | 'paused') {
    const r = await fetch(`/api/teams/${teamId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (r.ok) {
      toast.success(status === 'active' ? 'Team resumed' : 'Team paused')
      load()
    }
  }

  async function deleteTeam() {
    if (!confirm('Delete this team? This will also delete all tasks and history.')) return
    const r = await fetch(`/api/teams/${teamId}`, { method: 'DELETE' })
    if (r.ok) {
      toast.success('Team deleted')
      router.push(`/${locale}/dashboard/teams`)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 text-dashMuted animate-spin" />
      </div>
    )
  }

  if (!team) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-dashMuted">Team not found.</p>
        <Link href={`/${locale}/dashboard/teams`} className="text-accent hover:underline">← Back to teams</Link>
      </div>
    )
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending')
  const completedTasks = tasks.filter(t => t.status === 'completed').length

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back link */}
      <Link
        href={`/${locale}/dashboard/teams`}
        className="inline-flex items-center gap-2 text-sm text-dashMuted hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> All teams
      </Link>

      {/* Header */}
      <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{team.name}</h1>
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded border ${STATUS_BADGE[team.status]}`}>
                {team.status}
              </span>
            </div>
            <p className="text-sm text-dashMuted">{team.goal}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {team.status === 'active' && (
              <button
                onClick={() => setStatus('paused')}
                className="flex items-center gap-1.5 px-3 py-2 bg-dashBg border border-dashSurface2 hover:border-yellow-500/40 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <Pause className="w-3.5 h-3.5" /> Pause
              </button>
            )}
            {team.status === 'paused' && (
              <button
                onClick={() => setStatus('active')}
                className="flex items-center gap-1.5 px-3 py-2 bg-dashBg border border-dashSurface2 hover:border-green-500/40 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <Play className="w-3.5 h-3.5" /> Resume
              </button>
            )}
            <button
              onClick={deleteTeam}
              className="flex items-center gap-1.5 px-3 py-2 bg-dashBg border border-dashSurface2 hover:border-red-500/40 text-red-400 text-xs font-medium rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-dashBg/50 border border-dashSurface2 rounded-xl p-3">
            <p className="text-[10px] text-dashMuted uppercase tracking-wide mb-1">Members</p>
            <p className="text-lg font-bold text-white">{members.length}</p>
          </div>
          <div className="bg-dashBg/50 border border-dashSurface2 rounded-xl p-3">
            <p className="text-[10px] text-dashMuted uppercase tracking-wide mb-1">Tasks done</p>
            <p className="text-lg font-bold text-white">{completedTasks}/{tasks.length}</p>
          </div>
          <div className="bg-dashBg/50 border border-dashSurface2 rounded-xl p-3">
            <p className="text-[10px] text-dashMuted uppercase tracking-wide mb-1">Credits used</p>
            <p className="text-lg font-bold text-white">{team.total_credits_used}</p>
          </div>
        </div>
      </div>

      {/* Run next task button */}
      {team.status === 'active' && pendingTasks.length > 0 && (
        <button
          onClick={runNext}
          disabled={running}
          className="w-full mb-6 flex items-center justify-center gap-2 px-5 py-3 bg-accent hover:bg-accentLight disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {running ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Agent working…</>
          ) : (
            <><Zap className="w-4 h-4" /> Run next task ({pendingTasks.length} pending)</>
          )}
        </button>
      )}

      {/* Agent cards */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">Team members</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.map(m => {
            const memberTasks = tasks.filter(t => t.assigned_agent === m.agent_type)
            const done = memberTasks.filter(t => t.status === 'completed').length
            return (
              <div key={m.id} className="bg-dashCard border border-dashSurface2 rounded-xl p-4">
                <p className="text-sm font-bold text-white mb-1">{m.role_title}</p>
                <p className="text-[11px] text-dashMuted mb-3">{m.agent_type}</p>
                <div className="flex items-center justify-between text-xs text-dashMuted">
                  <span>{done}/{memberTasks.length} tasks</span>
                  <span>{m.credits_used} cr</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Task feed */}
      <div className="bg-dashCard border border-dashSurface2 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-dashSurface2">
          <h2 className="text-sm font-semibold text-white">Task feed</h2>
        </div>
        {tasks.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-dashMuted">
            No tasks yet — the team goal is being decomposed…
          </div>
        ) : (
          <div className="divide-y divide-dashSurface2">
            {tasks.map(t => (
              <div key={t.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{TASK_ICON[t.status]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-white truncate">{t.task_description}</p>
                      <span className="text-[10px] uppercase tracking-wide text-dashMuted shrink-0">
                        {t.assigned_agent}
                      </span>
                    </div>
                    {t.result?.output && (
                      <details className="mt-2">
                        <summary className="text-xs text-accent cursor-pointer hover:underline">View result</summary>
                        <pre className="mt-2 text-xs text-dashText whitespace-pre-wrap bg-dashBg/50 border border-dashSurface2 rounded-lg p-3 max-h-64 overflow-y-auto">
                          {t.result.output}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
