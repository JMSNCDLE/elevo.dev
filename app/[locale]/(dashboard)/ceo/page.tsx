'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import {
  Crown, TrendingUp, Users, Loader2, ChevronDown, ChevronUp,
  BarChart2, AlertTriangle, CheckCircle2, ArrowRight, DollarSign,
  Target, Briefcase, Lightbulb, Shield, Star,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import ActionExplanation from '@/components/shared/ActionExplanation'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import CopyButton from '@/components/shared/CopyButton'
import { cn } from '@/lib/utils'
import type {
  CEOSessionResponse,
  GrowthStrategyResponse,
  InvestorPitchResponse,
  DecisionType,
} from '@/lib/agents/ceoAgent'

type Tab = 'session' | 'growth' | 'investor'
type Status = 'idle' | 'loading' | 'done' | 'error'

const DECISION_TYPES: { value: DecisionType; label: string; icon: React.ElementType }[] = [
  { value: 'pricing', label: 'Pricing Strategy', icon: DollarSign },
  { value: 'hiring', label: 'Hiring Decision', icon: Users },
  { value: 'pivot', label: 'Business Pivot', icon: TrendingUp },
  { value: 'fundraising', label: 'Fundraising', icon: BarChart2 },
  { value: 'partnership', label: 'Partnership', icon: Users },
  { value: 'market_entry', label: 'Market Entry', icon: Target },
  { value: 'cost_cutting', label: 'Cost Cutting', icon: AlertTriangle },
  { value: 'exit_strategy', label: 'Exit Strategy', icon: Briefcase },
]

const RISK_COLOR = {
  low: 'text-green-400 bg-green-500/10',
  medium: 'text-yellow-400 bg-yellow-500/10',
  high: 'text-red-400 bg-red-500/10',
}

const PRIORITY_COLOR = {
  now: 'text-red-400 bg-red-500/10',
  next: 'text-yellow-400 bg-yellow-500/10',
  later: 'text-blue-400 bg-blue-500/10',
  never: 'text-gray-400 bg-gray-500/10',
}

export default function CEOPage() {
  const locale = useLocale()
  const supabase = createBrowserClient()

  const [tab, setTab] = useState<Tab>('session')
  const [plan, setPlan] = useState<string>('trial')
  const [businessProfiles, setBusinessProfiles] = useState<Array<{ id: string; business_name: string }>>([])
  const [selectedProfile, setSelectedProfile] = useState('')

  // Session state
  const [sessionStatus, setSessionStatus] = useState<Status>('idle')
  const [sessionError, setSessionError] = useState('')
  const [sessionResult, setSessionResult] = useState<CEOSessionResponse | null>(null)
  const [question, setQuestion] = useState('')
  const [context, setContext] = useState('')
  const [decisionType, setDecisionType] = useState<DecisionType>('pricing')

  // Growth state
  const [growthStatus, setGrowthStatus] = useState<Status>('idle')
  const [growthError, setGrowthError] = useState('')
  const [growthResult, setGrowthResult] = useState<GrowthStrategyResponse | null>(null)
  const [currentMRR, setCurrentMRR] = useState('')
  const [targetMRR, setTargetMRR] = useState('')
  const [timeframe, setTimeframe] = useState('12 months')

  // Investor state
  const [investorStatus, setInvestorStatus] = useState<Status>('idle')
  const [investorError, setInvestorError] = useState('')
  const [investorResult, setInvestorResult] = useState<InvestorPitchResponse | null>(null)
  const [stage, setStage] = useState('Pre-seed')
  const [askAmount, setAskAmount] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: prof } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
      if (prof) setPlan(prof.plan)
      const { data: bps } = await supabase.from('business_profiles').select('id, business_name').eq('user_id', user.id)
      if (bps?.length) {
        setBusinessProfiles(bps)
        setSelectedProfile(bps[0].id)
      }
    }
    load()
  }, [supabase])

  const isGalaxy = plan === 'galaxy'

  if (!isGalaxy) {
    return (
      <div className="min-h-screen bg-dashBg p-8 flex items-center justify-center">
        <UpgradePrompt
          feature="ELEVO CEO™"
          requiredPlan="Galaxy"
          description="Get a personal AI Chief Executive Officer that advises on major business decisions, builds growth strategies, and prepares investor pitches."
        />
      </div>
    )
  }

  async function runSession() {
    if (!question.trim() || !selectedProfile) return
    setSessionStatus('loading')
    setSessionError('')
    setSessionResult(null)
    try {
      const res = await fetch(`/${locale}/api/ceo/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessProfileId: selectedProfile, question, context, decisionType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setSessionResult(data.result)
      setSessionStatus('done')
    } catch (e: unknown) {
      setSessionError(e instanceof Error ? e.message : 'Something went wrong')
      setSessionStatus('error')
    }
  }

  async function runGrowth() {
    if (!currentMRR || !targetMRR || !selectedProfile) return
    setGrowthStatus('loading')
    setGrowthError('')
    setGrowthResult(null)
    try {
      const res = await fetch(`/${locale}/api/ceo/growth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfileId: selectedProfile,
          currentMRR: Number(currentMRR),
          targetMRR: Number(targetMRR),
          timeframe,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setGrowthResult(data.result)
      setGrowthStatus('done')
    } catch (e: unknown) {
      setGrowthError(e instanceof Error ? e.message : 'Something went wrong')
      setGrowthStatus('error')
    }
  }

  async function runInvestor() {
    if (!askAmount || !selectedProfile) return
    setInvestorStatus('loading')
    setInvestorError('')
    setInvestorResult(null)
    try {
      const res = await fetch(`/${locale}/api/ceo/investor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessProfileId: selectedProfile, stage, askAmount }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setInvestorResult(data.result)
      setInvestorStatus('done')
    } catch (e: unknown) {
      setInvestorError(e instanceof Error ? e.message : 'Something went wrong')
      setInvestorStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-dashBg p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <Crown size={20} className="text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-dashText">ELEVO CEO™</h1>
            <p className="text-sm text-dashMuted">Your AI Chief Executive Officer</p>
          </div>
          <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full font-semibold">
            👑 Galaxy
          </span>
        </div>
        <p className="text-dashMuted text-sm mt-1">
          Fortune 500 strategy + McKinsey analysis + Goldman Sachs financial modelling — for your business.
        </p>
      </div>

      {/* Business profile selector */}
      {businessProfiles.length > 1 && (
        <div className="mb-6">
          <label className="text-xs text-dashMuted mb-1.5 block">Business</label>
          <select
            value={selectedProfile}
            onChange={e => setSelectedProfile(e.target.value)}
            className="bg-dashCard border border-dashSurface2 text-dashText text-sm rounded-lg px-3 py-2 w-64"
          >
            {businessProfiles.map(bp => (
              <option key={bp.id} value={bp.id}>{bp.business_name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-dashSurface rounded-xl p-1 w-fit">
        {([
          { key: 'session', label: 'CEO Session', icon: Lightbulb },
          { key: 'growth', label: 'Growth Strategy', icon: TrendingUp },
          { key: 'investor', label: 'Investor Prep', icon: BarChart2 },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === t.key ? 'bg-accent text-white' : 'text-dashMuted hover:text-dashText'
            )}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CEO Session Tab ── */}
      {tab === 'session' && (
        <div className="space-y-6">
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
            <h2 className="text-base font-semibold text-dashText mb-4">What decision do you need CEO-level advice on?</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {DECISION_TYPES.map(dt => (
                <button
                  key={dt.value}
                  onClick={() => setDecisionType(dt.value)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors',
                    decisionType === dt.value
                      ? 'bg-accent/10 border-accent text-accent'
                      : 'border-dashSurface2 text-dashMuted hover:text-dashText hover:border-dashText/30'
                  )}
                >
                  <dt.icon size={12} />
                  {dt.label}
                </button>
              ))}
            </div>

            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Describe your decision or challenge in detail. e.g. 'Should I raise prices by 20% or add a premium tier? We're at capacity and turning away clients...'"
              rows={4}
              className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-4 py-3 text-dashText text-sm placeholder:text-dashMuted resize-none mb-3"
            />
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="Additional context: current revenue, number of clients, team size, timeline pressure, etc."
              rows={3}
              className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-4 py-3 text-dashText text-sm placeholder:text-dashMuted resize-none mb-4"
            />

            <button
              onClick={runSession}
              disabled={sessionStatus === 'loading' || !question.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-semibold text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sessionStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Crown size={16} />}
              {sessionStatus === 'loading' ? 'CEO is thinking…' : 'Run CEO Session — 10 credits'}
            </button>
          </div>

          {sessionStatus === 'loading' && (
            <AgentStatusIndicator agentName="ELEVO CEO™" status="analyzing" />
          )}
          {sessionError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">{sessionError}</div>
          )}

          {sessionResult && sessionStatus === 'done' && (
            <div className="space-y-4">
              {/* Situation Analysis */}
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-dashText">Situation Analysis</h3>
                  <CopyButton text={sessionResult.situationAnalysis} />
                </div>
                <p className="text-sm text-dashMuted leading-relaxed whitespace-pre-line">{sessionResult.situationAnalysis}</p>
              </div>

              {/* Options */}
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                <h3 className="font-semibold text-dashText mb-4">Options Analysed</h3>
                <div className="space-y-4">
                  {sessionResult.optionsAnalysed.map((opt, i) => (
                    <div key={i} className="border border-dashSurface2 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm font-semibold text-dashText">{opt.option}</span>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', RISK_COLOR[opt.risk])}>Risk: {opt.risk}</span>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', RISK_COLOR[opt.reward])}>Reward: {opt.reward}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-green-400 font-semibold mb-1">Pros</p>
                          <ul className="space-y-0.5">
                            {opt.pros.map((p, j) => <li key={j} className="text-xs text-dashMuted flex gap-1.5"><CheckCircle2 size={10} className="text-green-400 mt-0.5 shrink-0" />{p}</li>)}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs text-red-400 font-semibold mb-1">Cons</p>
                          <ul className="space-y-0.5">
                            {opt.cons.map((c, j) => <li key={j} className="text-xs text-dashMuted flex gap-1.5"><AlertTriangle size={10} className="text-red-400 mt-0.5 shrink-0" />{c}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-accent flex items-center gap-2"><Star size={16} /> CEO Recommendation</h3>
                  <CopyButton text={sessionResult.recommendation} />
                </div>
                <p className="text-sm text-dashText leading-relaxed whitespace-pre-line">{sessionResult.recommendation}</p>
              </div>

              {/* Action Plan */}
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                <h3 className="font-semibold text-dashText mb-4">Action Plan</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-dashMuted border-b border-dashSurface2">
                        <th className="text-left pb-2 pr-4">Action</th>
                        <th className="text-left pb-2 pr-4">Owner</th>
                        <th className="text-left pb-2 pr-4">Deadline</th>
                        <th className="text-left pb-2">KPI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dashSurface2">
                      {sessionResult.actionPlan.map((a, i) => (
                        <tr key={i} className="text-xs">
                          <td className="py-2 pr-4 text-dashText">{a.action}</td>
                          <td className="py-2 pr-4 text-dashMuted">{a.owner}</td>
                          <td className="py-2 pr-4 text-yellow-400">{a.deadline}</td>
                          <td className="py-2 text-dashMuted">{a.kpi}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Board Summary */}
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-dashText">Board Summary</h3>
                  <CopyButton text={sessionResult.boardSummary} />
                </div>
                <p className="text-sm text-dashMuted leading-relaxed italic">{sessionResult.boardSummary}</p>
              </div>

              <ActionExplanation
                description="This CEO analysis uses Opus 4.6 with web search and adaptive thinking to deliver Fortune 500-level strategic advice tailored to your business context and market."
              />
            </div>
          )}
        </div>
      )}

      {/* ── Growth Strategy Tab ── */}
      {tab === 'growth' && (
        <div className="space-y-6">
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
            <h2 className="text-base font-semibold text-dashText mb-4">Build your growth strategy</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs text-dashMuted mb-1 block">Current monthly revenue (£)</label>
                <input
                  type="number"
                  value={currentMRR}
                  onChange={e => setCurrentMRR(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-dashText text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-dashMuted mb-1 block">Target monthly revenue (£)</label>
                <input
                  type="number"
                  value={targetMRR}
                  onChange={e => setTargetMRR(e.target.value)}
                  placeholder="e.g. 20000"
                  className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-dashText text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-dashMuted mb-1 block">Timeframe</label>
                <select
                  value={timeframe}
                  onChange={e => setTimeframe(e.target.value)}
                  className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-dashText text-sm"
                >
                  {['3 months', '6 months', '12 months', '18 months', '24 months'].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={runGrowth}
              disabled={growthStatus === 'loading' || !currentMRR || !targetMRR}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-semibold text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {growthStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
              {growthStatus === 'loading' ? 'Building strategy…' : 'Generate Growth Strategy — 15 credits'}
            </button>
          </div>

          {growthStatus === 'loading' && <AgentStatusIndicator agentName="ELEVO CEO™" status="generating" />}
          {growthError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">{growthError}</div>}

          {growthResult && growthStatus === 'done' && (
            <div className="space-y-4">
              {/* Growth Levers */}
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                <h3 className="font-semibold text-dashText mb-4">Growth Levers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {growthResult.growthLevers.map((lever, i) => (
                    <div key={i} className="border border-dashSurface2 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-dashText">{lever.lever}</span>
                        <span className="text-xs text-green-400 font-bold">{lever.estimatedRevenue}</span>
                      </div>
                      <p className="text-xs text-dashMuted mb-2">{lever.description}</p>
                      <p className="text-xs text-accent">Impact in: {lever.timeToImpact}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Matrix */}
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                <h3 className="font-semibold text-dashText mb-4">Priority Matrix</h3>
                <div className="space-y-2">
                  {growthResult.priorityMatrix.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-dashSurface rounded-lg">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-bold uppercase', PRIORITY_COLOR[item.priority])}>
                        {item.priority}
                      </span>
                      <span className="text-sm text-dashText flex-1">{item.initiative}</span>
                      <span className="text-xs text-dashMuted">Effort: {item.effort}</span>
                      <span className="text-xs text-dashMuted">Impact: {item.impact}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quarterly Milestones */}
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                <h3 className="font-semibold text-dashText mb-4">Quarterly Milestones</h3>
                <div className="space-y-4">
                  {growthResult.quarterlyMilestones.map((q, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-16 shrink-0">
                        <span className="text-xs font-bold text-accent">{q.quarter}</span>
                        <p className="text-xs text-green-400 mt-0.5">{q.target}</p>
                      </div>
                      <div className="flex-1 border-l border-dashSurface2 pl-4">
                        <p className="text-sm text-dashText font-medium mb-1">{q.milestone}</p>
                        <ul className="space-y-0.5">
                          {q.keyActions.map((a, j) => (
                            <li key={j} className="flex items-center gap-1.5 text-xs text-dashMuted">
                              <ArrowRight size={10} className="text-accent shrink-0" />{a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <ActionExplanation
                description="Growth strategy built with Opus 4.6 + real-time web search for market benchmarks, competitor analysis, and sector-specific growth tactics."
              />
            </div>
          )}
        </div>
      )}

      {/* ── Investor Prep Tab ── */}
      {tab === 'investor' && (
        <div className="space-y-6">
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
            <h2 className="text-base font-semibold text-dashText mb-4">Prepare your investor pitch</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-dashMuted mb-1 block">Investment stage</label>
                <select
                  value={stage}
                  onChange={e => setStage(e.target.value)}
                  className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-dashText text-sm"
                >
                  {['Pre-seed', 'Seed', 'Series A', 'Series B', 'Growth', 'Angel Round'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-dashMuted mb-1 block">Ask amount (e.g. £250,000)</label>
                <input
                  type="text"
                  value={askAmount}
                  onChange={e => setAskAmount(e.target.value)}
                  placeholder="e.g. £500,000"
                  className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-dashText text-sm"
                />
              </div>
            </div>
            <button
              onClick={runInvestor}
              disabled={investorStatus === 'loading' || !askAmount}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-semibold text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {investorStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <BarChart2 size={16} />}
              {investorStatus === 'loading' ? 'Preparing pitch…' : 'Build Investor Pitch — 10 credits'}
            </button>
          </div>

          {investorStatus === 'loading' && <AgentStatusIndicator agentName="ELEVO CEO™" status="generating" />}
          {investorError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">{investorError}</div>}

          {investorResult && investorStatus === 'done' && (
            <div className="space-y-4">
              {/* Pitch Deck Outline */}
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                <h3 className="font-semibold text-dashText mb-4">Pitch Deck Outline</h3>
                <div className="space-y-3">
                  {investorResult.pitchDeckOutline.map((slide) => (
                    <div key={slide.slide} className="flex gap-4 p-3 bg-dashSurface rounded-lg">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-accent">{slide.slide}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-dashText mb-0.5">{slide.title}</p>
                        <p className="text-xs text-dashMuted mb-1">{slide.content}</p>
                        <div className="flex flex-wrap gap-1">
                          {slide.keyPoints.map((pt, j) => (
                            <span key={j} className="text-xs bg-dashSurface2 text-dashMuted px-2 py-0.5 rounded">{pt}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Investor Narrative */}
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-accent">Your Investor Narrative</h3>
                  <CopyButton text={investorResult.investorNarrative} />
                </div>
                <p className="text-sm text-dashText leading-relaxed whitespace-pre-line">{investorResult.investorNarrative}</p>
              </div>

              {/* Objection Handlers */}
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                <h3 className="font-semibold text-dashText mb-4">Objection Handlers</h3>
                <div className="space-y-3">
                  {investorResult.objectionHandlers.map((obj, i) => (
                    <div key={i} className="border border-dashSurface2 rounded-lg p-4">
                      <p className="text-xs font-semibold text-red-400 mb-1">❓ {obj.objection}</p>
                      <p className="text-sm text-dashMuted">{obj.response}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Term Sheet */}
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-6">
                <h3 className="font-semibold text-dashText mb-3">Term Sheet Guidance</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-dashMuted mb-1">Recommended Valuation</p>
                    <p className="text-sm font-bold text-green-400">{investorResult.termSheetGuidance.valuation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-dashMuted mb-1">Acceptable Dilution</p>
                    <p className="text-sm font-bold text-yellow-400">{investorResult.termSheetGuidance.dilution}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-red-400 font-semibold mb-1">🚩 Red Flags to Watch</p>
                  <ul className="space-y-0.5">
                    {investorResult.termSheetGuidance.redFlags.map((f, i) => (
                      <li key={i} className="text-xs text-dashMuted flex gap-1.5"><Shield size={10} className="text-red-400 mt-0.5 shrink-0" />{f}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <ActionExplanation
                description="Investor pitch prepared by Opus 4.6 with real-time research into comparable valuations, investor expectations, and sector benchmarks for your stage and market."
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
