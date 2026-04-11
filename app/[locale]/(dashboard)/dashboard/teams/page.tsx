'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Users2, Plus, Loader2, ArrowRight, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { TeamTemplate } from '@/lib/teams/templates'

interface TeamRow {
  id: string
  name: string
  goal: string
  status: 'active' | 'paused' | 'completed' | 'failed'
  template: string | null
  total_credits_used: number
  member_count: number
  updated_at: string
}

const STATUS_BADGE: Record<string, string> = {
  active: 'text-green-400 bg-green-500/10 border-green-500/30',
  paused: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  completed: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  failed: 'text-red-400 bg-red-500/10 border-red-500/30',
}

export default function TeamsPage() {
  const locale = useLocale()
  const [teams, setTeams] = useState<TeamRow[]>([])
  const [templates, setTemplates] = useState<TeamTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)

  // Wizard state
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTemplate, setSelectedTemplate] = useState<TeamTemplate | null>(null)
  const [customName, setCustomName] = useState('')
  const [customGoal, setCustomGoal] = useState('')

  async function load() {
    setLoading(true)
    try {
      const r = await fetch('/api/teams')
      if (r.ok) {
        const data = await r.json()
        setTeams(data.teams ?? [])
        setTemplates(data.templates ?? [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function pickTemplate(t: TeamTemplate) {
    setSelectedTemplate(t)
    setCustomName(t.name)
    setCustomGoal(t.exampleGoal)
    setStep(2)
  }

  async function createTeam() {
    if (!selectedTemplate || !customName.trim() || !customGoal.trim()) return
    setCreating(true)
    try {
      const r = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customName.trim(),
          goal: customGoal.trim(),
          template: selectedTemplate.id,
          members: selectedTemplate.members,
        }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Failed to create team')
      toast.success('Team created — decomposing goal into tasks…')
      setShowCreate(false)
      setStep(1)
      setSelectedTemplate(null)
      // Navigate to the new team detail
      window.location.href = `/${locale}/dashboard/teams/${data.teamId}`
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create team')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-accent/15 border border-accent/30 rounded-2xl flex items-center justify-center">
            <Users2 className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Agent Teams</h1>
            <p className="text-sm text-dashMuted">Build AI teams that work together towards your goals</p>
          </div>
        </div>
        <button
          onClick={() => { setShowCreate(true); setStep(1) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accentLight text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Team
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-dashMuted animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && teams.length === 0 && (
        <div className="bg-dashCard border border-dashSurface2 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Users2 className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No teams yet</h2>
          <p className="text-sm text-dashMuted max-w-md mx-auto mb-6">
            Create an AI team. Pick a template, give it a goal, and let your agents work together autonomously.
          </p>
          <button
            onClick={() => { setShowCreate(true); setStep(1) }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accentLight text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create your first team
          </button>
        </div>
      )}

      {/* Team list */}
      {!loading && teams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map(t => (
            <Link
              key={t.id}
              href={`/${locale}/dashboard/teams/${t.id}`}
              className="bg-dashCard border border-dashSurface2 hover:border-accent/40 rounded-2xl p-5 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-bold text-white truncate pr-3">{t.name}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded border ${STATUS_BADGE[t.status]}`}>
                  {t.status}
                </span>
              </div>
              <p className="text-sm text-dashMuted line-clamp-2 mb-4">{t.goal}</p>
              <div className="flex items-center justify-between text-xs text-dashMuted">
                <span>{t.member_count} agent{t.member_count !== 1 ? 's' : ''} · {t.total_credits_used} credit{t.total_credits_used !== 1 ? 's' : ''} used</span>
                <ArrowRight className="w-4 h-4 text-dashMuted group-hover:text-accent transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create wizard modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-dashSurface border border-dashSurface2 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-dashSurface2 flex items-center justify-between sticky top-0 bg-dashSurface">
              <div>
                <h2 className="text-lg font-bold text-white">{step === 1 ? 'Pick a team template' : 'Name your team'}</h2>
                <p className="text-xs text-dashMuted">Step {step} of 2</p>
              </div>
              <button onClick={() => { setShowCreate(false); setStep(1); setSelectedTemplate(null) }} className="text-dashMuted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {step === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {templates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => pickTemplate(t)}
                      className="text-left p-4 rounded-xl border border-dashSurface2 hover:border-accent/40 bg-dashBg/50 hover:bg-accent/5 transition-colors"
                    >
                      <div className="text-2xl mb-2">{t.emoji}</div>
                      <h3 className="text-sm font-bold text-white mb-1">{t.name}</h3>
                      <p className="text-xs text-dashMuted mb-3">{t.description}</p>
                      <p className="text-[10px] text-accent uppercase tracking-wide font-semibold">
                        {t.members.length} agents
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && selectedTemplate && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-dashMuted mb-1.5">Team name</label>
                    <input
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      className="w-full bg-dashBg border border-dashSurface2 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dashMuted mb-1.5">Business goal</label>
                    <textarea
                      value={customGoal}
                      onChange={e => setCustomGoal(e.target.value)}
                      rows={3}
                      className="w-full bg-dashBg border border-dashSurface2 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent resize-none"
                    />
                  </div>
                  <div className="bg-dashBg/50 border border-dashSurface2 rounded-xl p-4">
                    <p className="text-xs font-semibold text-dashMuted uppercase tracking-wide mb-3">
                      Team members ({selectedTemplate.members.length})
                    </p>
                    <div className="space-y-2">
                      {selectedTemplate.members.map(m => (
                        <div key={m.agent_type} className="flex items-center justify-between text-sm">
                          <span className="text-white font-medium">{m.role_title}</span>
                          <span className="text-xs text-dashMuted">{m.agent_type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm text-dashMuted hover:text-white"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={createTeam}
                      disabled={creating || !customName.trim() || !customGoal.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accentLight disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      {creating ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
                      ) : (
                        <>Launch team <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
