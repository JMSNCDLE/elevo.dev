'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, Zap, Clock, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import CopyButton from '@/components/shared/CopyButton'
import type { ProblemSolverResponse, BusinessProfile } from '@/lib/agents/types'

const urgencyConfig = {
  low: { color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', icon: Clock },
  medium: { color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: AlertTriangle },
  high: { color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', icon: AlertTriangle },
  critical: { color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20', icon: AlertTriangle },
}

const impactDots: Record<string, string> = {
  low: '●○○',
  medium: '●●○',
  high: '●●●',
}

const exampleProblems = [
  "My bookings have dropped 40% this month and I don't know why",
  "A competitor just opened nearby and I'm losing customers",
  "I have too many quotes going out but not converting to jobs",
  "I want to raise my prices but I'm worried about losing clients",
]

export default function AdvisorPage({ params }: { params: { locale: string } }) {
  const searchParams = useSearchParams()
  const supabase = createBrowserClient()
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [problem, setProblem] = useState(searchParams.get('problem') || '')
  const [result, setResult] = useState<ProblemSolverResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('business_profiles').select('*').eq('user_id', user.id).eq('is_primary', true).single()
      if (data) setBp(data as BusinessProfile)
    }
    load()
  }, [])

  // Auto-submit if problem came from URL
  useEffect(() => {
    if (searchParams.get('problem') && bp) {
      handleSubmit()
    }
  }, [bp])

  const handleSubmit = async () => {
    if (!problem.trim()) return
    setLoading(true)
    setResult(null)
    setError('')

    try {
      const res = await fetch('/api/problem-solver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem, businessProfileId: bp?.id }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed')
      }

      const data = await res.json()
      setResult(data.result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const urgency = result?.urgency ?? 'medium'
  const uc = urgencyConfig[urgency] || urgencyConfig.medium

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={20} className="text-accent" />
          <h1 className="text-2xl font-bold text-dashText">Problem Solver</h1>
        </div>
        <p className="text-dashMuted text-sm">Describe any business challenge. Get expert diagnosis, action plan, and ready-to-use content.</p>
        <p className="text-xs text-dashMuted mt-1">Uses 2 credits per analysis (powered by Claude Opus)</p>
      </div>

      {/* Input */}
      <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5 mb-6">
        <textarea
          value={problem}
          onChange={e => setProblem(e.target.value)}
          rows={4}
          placeholder="Describe your problem in as much detail as possible..."
          className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2.5 text-sm text-dashText placeholder:text-dashMuted resize-none focus:outline-none focus:ring-2 focus:ring-accent mb-3"
        />

        {/* Examples */}
        <div className="mb-3">
          <p className="text-xs text-dashMuted mb-2">Examples:</p>
          <div className="flex flex-wrap gap-2">
            {exampleProblems.map(ex => (
              <button key={ex} onClick={() => setProblem(ex)} className="text-xs px-2.5 py-1 bg-dashSurface border border-dashSurface2 rounded-md text-dashMuted hover:text-dashText hover:border-accent/30 transition-colors text-left">
                {ex.slice(0, 50)}...
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!problem.trim() || loading}
          className="w-full py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Analysing...' : 'Analyse & Solve (2 credits)'}
        </button>

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Urgency + diagnosis */}
          <div className={`rounded-xl border p-5 ${uc.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <uc.icon size={16} className={uc.color} />
              <span className={`text-xs font-semibold uppercase tracking-wide ${uc.color}`}>
                {urgency} urgency
              </span>
            </div>
            <h3 className="text-sm font-semibold text-dashText mb-1">Diagnosis</h3>
            <p className="text-sm text-dashText">{result.diagnosis}</p>
          </div>

          {/* Root cause */}
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
            <h3 className="text-sm font-semibold text-dashText mb-2">Root Cause</h3>
            <p className="text-sm text-dashMuted">{result.rootCause}</p>
          </div>

          {/* Action plan */}
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
            <h3 className="text-sm font-semibold text-dashText mb-3">Action Plan</h3>
            <div className="space-y-3">
              {result.actionPlan.map((action, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-accentDim rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-accent">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-dashText">{action.step}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-dashMuted">{action.timeframe}</span>
                      <span className="text-xs text-dashMuted">Impact: <span className="font-mono">{impactDots[action.impact]}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generated content */}
          {result.generatedContent && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <button
                onClick={() => setShowContent(!showContent)}
                className="flex items-center justify-between w-full"
              >
                <h3 className="text-sm font-semibold text-dashText">Ready-to-use content</h3>
                {showContent ? <ChevronUp size={16} className="text-dashMuted" /> : <ChevronDown size={16} className="text-dashMuted" />}
              </button>
              {showContent && (
                <div className="mt-3">
                  <div className="bg-dashSurface rounded-lg p-3 text-sm text-dashText whitespace-pre-wrap mb-2">
                    {result.generatedContent}
                  </div>
                  <CopyButton text={result.generatedContent} />
                </div>
              )}
            </div>
          )}

          {/* Longer-term */}
          {result.longerTermRecommendations.length > 0 && (
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
              <h3 className="text-sm font-semibold text-dashText mb-3">Longer-term recommendations</h3>
              <ul className="space-y-2">
                {result.longerTermRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-dashMuted">
                    <CheckCircle2 size={14} className="text-accent mt-0.5 shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Estimated impact */}
          <div className="bg-accentDim rounded-xl border border-accent/20 p-4">
            <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">Estimated impact</p>
            <p className="text-sm text-dashText">{result.estimatedImpact}</p>
          </div>
        </div>
      )}
    </div>
  )
}
