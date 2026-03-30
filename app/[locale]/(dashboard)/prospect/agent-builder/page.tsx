'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Loader2, Download, Bot, UserPlus, ExternalLink, AlertTriangle } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { ADMIN_IDS } from '@/lib/admin'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import CopyButton from '@/components/shared/CopyButton'
import type { AgentBuildBrief } from '@/lib/agents/agentBuilderAgent'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'
type SectionId = 'summary' | 'spec' | 'tools' | 'techstack' | 'buildplan' | 'handover' | 'commercial' | 'risks'

const BUSINESS_TYPES = [
  'E-commerce',
  'Restaurant',
  'Professional Services',
  'Healthcare',
  'Real Estate',
  'Manufacturing',
  'Retail',
  'Other',
]

const BUSINESS_SIZES = [
  'Solo',
  'Small (2-10)',
  'Medium (10-50)',
  'Enterprise (50+)',
]

const AVAILABLE_TOOLS = [
  'Slack', 'HubSpot', 'Shopify', 'Xero', 'Google Workspace',
  'Microsoft 365', 'Salesforce', 'Mailchimp', 'Zapier', 'Other',
]

const BUDGETS = [
  'Under £1k', '£1-5k', '£5-25k', '£25k+', 'Unknown',
]

const TIMELINES = [
  'ASAP', '1 month', '3 months', '6 months', 'Flexible',
]

const TECHNICAL_LEVELS = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Basic' },
  { value: 'medium', label: 'Intermediate' },
  { value: 'high', label: 'Advanced' },
]

const SECTIONS: { id: SectionId; label: string; description: string }[] = [
  { id: 'summary', label: 'Executive Summary', description: 'Non-technical overview' },
  { id: 'spec', label: 'Agent Specification', description: 'Technical spec' },
  { id: 'tools', label: 'Tools + Integrations', description: 'Required tools' },
  { id: 'techstack', label: 'Tech Stack', description: 'Recommended stack' },
  { id: 'buildplan', label: 'Build Plan', description: 'Phased timeline' },
  { id: 'handover', label: 'Handover Summary', description: 'Go-live checklist' },
  { id: 'commercial', label: 'Commercial Summary', description: 'Cost + ROI' },
  { id: 'risks', label: 'Risk Register', description: 'Risks + mitigations' },
]

const RISK_COLORS: Record<string, string> = {
  low: 'text-green-400 bg-green-500/10 border-green-500/30',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  high: 'text-red-400 bg-red-500/10 border-red-500/30',
}

export default function AgentBuilderPage() {
  const locale = useLocale()
  const supabase = createBrowserClient()

  const [plan, setPlan] = useState<string>('trial')
  const [clientName, setClientName] = useState('')
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0])
  const [businessSize, setBusinessSize] = useState(BUSINESS_SIZES[0])
  const [mainProblem, setMainProblem] = useState('')
  const [currentTools, setCurrentTools] = useState<string[]>([])
  const [budget, setBudget] = useState(BUDGETS[0])
  const [timeline, setTimeline] = useState(TIMELINES[0])
  const [technicalLevel, setTechnicalLevel] = useState<'none' | 'low' | 'medium' | 'high'>('none')

  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [brief, setBrief] = useState<AgentBuildBrief | null>(null)
  const [activeSection, setActiveSection] = useState<SectionId>('summary')
  const [crmToast, setCrmToast] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: prof } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
      if (prof) setPlan(ADMIN_IDS.includes(user.id) ? 'galaxy' : (prof.plan ?? 'trial'))
    }
    load()
  }, [])

  if (plan !== 'galaxy') {
    return <UpgradePrompt locale={locale} feature="ELEVO Build™" requiredPlan="galaxy" description="ELEVO Build™ is available on the Galaxy plan. It creates complete AI agent build briefs you can sell directly to clients." />
  }

  const toggleTool = (tool: string) => {
    setCurrentTools(prev => prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool])
  }

  const canGenerate = clientName.trim() && mainProblem.trim().length > 20

  const handleGenerate = async () => {
    if (!canGenerate) return
    setStatus('thinking')
    setBrief(null)
    setError('')

    try {
      const res = await fetch('/api/prospect/agent-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            clientName,
            businessType,
            businessSize,
            mainProblem,
            currentTools,
            budget,
            timeline,
            technicalLevel,
            locale,
          },
          locale,
        }),
      })

      setStatus('generating')

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Generation failed')
      }

      const data = await res.json()
      setBrief(data.brief)
      setStatus('done')
      setActiveSection('summary')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Generation failed. Please try again.')
    }
  }

  const handleAddToCRM = async () => {
    await fetch('/api/crm/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: clientName,
        business_name: `${clientName} — ${businessType}`,
        notes: `Agent builder lead — ${businessType} / ${businessSize}`,
      }),
    })
    setCrmToast(true)
    setTimeout(() => setCrmToast(false), 3000)
  }

  const handlePrint = () => window.print()

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-accent/15 border border-accent/30 rounded-lg flex items-center justify-center">
            <Bot size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-dashText">ELEVO Build™</h1>
            <p className="text-dashMuted text-sm">Auto Agent Builder — Turn any client problem into a complete AI build brief in 60 seconds</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs bg-accent/10 border border-accent/20 text-accent px-2.5 py-1 rounded-full font-medium">5 credits</span>
          <span className="text-xs text-dashMuted">Galaxy only feature</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 bg-[#1A2332] rounded-xl border border-[#161F2E] p-6 space-y-4 h-fit">
          <h2 className="text-sm font-semibold text-dashText mb-4">Client Details</h2>

          <div>
            <label className="block text-xs font-medium text-dashMuted mb-1.5">Client name <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="e.g. Apex Retail Ltd"
              className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dashMuted mb-1.5">Business type</label>
              <select
                value={businessType}
                onChange={e => setBusinessType(e.target.value)}
                className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              >
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-dashMuted mb-1.5">Size</label>
              <select
                value={businessSize}
                onChange={e => setBusinessSize(e.target.value)}
                className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              >
                {BUSINESS_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-dashMuted mb-1.5">What problem do they need solved? <span className="text-red-400">*</span></label>
            <textarea
              value={mainProblem}
              onChange={e => setMainProblem(e.target.value)}
              rows={4}
              placeholder="Describe the problem in detail. e.g. 'They spend 3 hours a day manually responding to customer enquiries on WhatsApp and email. They lose leads when they're busy. They want automated responses that feel human and can book appointments.'"
              className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] placeholder:text-[#94A3B8] resize-none focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-dashMuted mb-2">Current tools</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TOOLS.map(tool => (
                <button
                  key={tool}
                  onClick={() => toggleTool(tool)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors border ${
                    currentTools.includes(tool)
                      ? 'bg-accent/20 text-accent border-accent/40'
                      : 'bg-transparent text-dashMuted border-[#161F2E] hover:text-[#EEF2FF]'
                  }`}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dashMuted mb-1.5">Budget</label>
              <select
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              >
                {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-dashMuted mb-1.5">Timeline</label>
              <select
                value={timeline}
                onChange={e => setTimeline(e.target.value)}
                className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              >
                {TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-dashMuted mb-1.5">Client&apos;s technical level</label>
            <select
              value={technicalLevel}
              onChange={e => setTechnicalLevel(e.target.value as 'none' | 'low' | 'medium' | 'high')}
              className="w-full bg-[#141B24] border border-[#161F2E] rounded-lg px-3 py-2.5 text-sm text-[#EEF2FF] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            >
              {TECHNICAL_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-between pt-2">
            <AgentStatusIndicator
              status={status}
              agentName="ELEVO Build™"
              message={status === 'thinking' || status === 'generating' ? 'Designing your agent...' : undefined}
            />
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || status === 'thinking' || status === 'generating'}
              className="px-4 py-2.5 bg-[#6366F1] text-white font-semibold rounded-lg hover:bg-[#818CF8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              {(status === 'thinking' || status === 'generating') && <Loader2 size={14} className="animate-spin" />}
              Build the Brief →
            </button>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        {/* Output */}
        <div className="lg:col-span-3">
          {!brief ? (
            <div className="bg-[#1A2332] rounded-xl border border-[#161F2E] p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mb-4">
                <Bot size={24} className="text-accent/60" />
              </div>
              <p className="text-dashMuted text-sm">Fill in the client details and click Build the Brief.</p>
              <p className="text-dashMuted/60 text-xs mt-1">A complete technical + commercial brief will appear here.</p>
            </div>
          ) : (
            <div className="bg-[#1A2332] rounded-xl border border-[#161F2E] overflow-hidden">
              {/* Brief header */}
              <div className="px-6 py-4 border-b border-[#161F2E]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#EEF2FF]">{brief.projectName}</h3>
                    <p className="text-xs text-dashMuted mt-0.5">For {clientName}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleAddToCRM}
                      className="flex items-center gap-1.5 text-xs text-dashMuted hover:text-[#EEF2FF] transition-colors px-2.5 py-1.5 rounded-md border border-[#161F2E] hover:border-[#6366F1]/30"
                    >
                      <UserPlus size={12} />
                      Add to Pipeline
                    </button>
                    <CopyButton text={brief.fullBriefDocument} size="sm" />
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 text-xs text-dashMuted hover:text-[#EEF2FF] transition-colors px-2.5 py-1.5 rounded-md border border-[#161F2E] hover:border-[#6366F1]/30"
                    >
                      <Download size={12} />
                      PDF
                    </button>
                  </div>
                </div>
                {crmToast && (
                  <div className="mt-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-400">
                    Added to CRM pipeline
                  </div>
                )}
              </div>

              {/* Section nav */}
              <div className="flex border-b border-[#161F2E] overflow-x-auto">
                {SECTIONS.map(sec => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
                      activeSection === sec.id
                        ? 'text-[#6366F1] border-b-2 border-[#6366F1]'
                        : 'text-dashMuted hover:text-[#EEF2FF]'
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>

              <div className="p-6 max-h-[600px] overflow-y-auto space-y-4">
                {/* EXECUTIVE SUMMARY */}
                {activeSection === 'summary' && (
                  <div className="space-y-4">
                    <div className="bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-xl p-5">
                      <p className="text-xs font-medium text-[#6366F1] mb-2 uppercase tracking-wide">Share this with your client</p>
                      <p className="text-sm text-[#EEF2FF] leading-relaxed">{brief.executiveSummary}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                        <p className="text-xs text-dashMuted mb-1">Estimated Cost</p>
                        <p className="text-lg font-bold text-[#EEF2FF]">{brief.commercial.estimatedBuildCost}</p>
                      </div>
                      <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                        <p className="text-xs text-dashMuted mb-1">Timeline</p>
                        <p className="text-lg font-bold text-[#EEF2FF]">{brief.commercial.estimatedTimeline}</p>
                      </div>
                      <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                        <p className="text-xs text-dashMuted mb-1">Monthly Support</p>
                        <p className="text-lg font-bold text-[#EEF2FF]">{brief.commercial.monthlySupportCost}</p>
                      </div>
                      <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                        <p className="text-xs text-dashMuted mb-1">Payback Period</p>
                        <p className="text-lg font-bold text-[#EEF2FF]">{brief.commercial.paybackPeriod}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AGENT SPEC */}
                {activeSection === 'spec' && (
                  <div className="space-y-4">
                    <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-[#EEF2FF]">{brief.agentSpec.agentName}</p>
                          <p className="text-xs text-dashMuted">{brief.agentSpec.agentRole}</p>
                        </div>
                      </div>
                      <p className="text-xs text-dashMuted mb-1 font-medium">Primary Objective</p>
                      <p className="text-sm text-[#EEF2FF] mb-4">{brief.agentSpec.primaryObjective}</p>
                    </div>
                    <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                      <p className="text-xs font-medium text-dashMuted uppercase tracking-wide mb-2">Trigger Conditions</p>
                      <ul className="space-y-1.5">
                        {brief.agentSpec.triggerConditions.map((t, i) => (
                          <li key={i} className="text-sm text-[#EEF2FF] flex items-start gap-2"><span className="text-accent mt-0.5">→</span>{t}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                        <p className="text-xs font-medium text-dashMuted uppercase tracking-wide mb-2">Inputs</p>
                        <ul className="space-y-2">
                          {brief.agentSpec.inputs.map((inp, i) => (
                            <li key={i} className="text-xs">
                              <span className="text-[#EEF2FF] font-medium">{inp.name}</span>
                              <span className="text-dashMuted ml-1">({inp.type}){inp.required ? ' *' : ''}</span>
                              <p className="text-dashMuted/70 mt-0.5">{inp.description}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                        <p className="text-xs font-medium text-dashMuted uppercase tracking-wide mb-2">Outputs</p>
                        <ul className="space-y-2">
                          {brief.agentSpec.outputs.map((out, i) => (
                            <li key={i} className="text-xs">
                              <span className="text-[#EEF2FF] font-medium">{out.name}</span>
                              <span className="text-dashMuted ml-1">({out.type})</span>
                              <p className="text-dashMuted/70 mt-0.5">{out.description}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                      <p className="text-xs font-medium text-dashMuted uppercase tracking-wide mb-2">Decision Logic</p>
                      <ul className="space-y-1.5">
                        {brief.agentSpec.decisionLogic.map((d, i) => (
                          <li key={i} className="text-sm text-[#EEF2FF]">{d}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                        <p className="text-xs font-medium text-dashMuted uppercase tracking-wide mb-2">Error Handling</p>
                        <ul className="space-y-1">
                          {brief.agentSpec.errorHandling.map((e, i) => (
                            <li key={i} className="text-xs text-[#EEF2FF]">{e}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                        <p className="text-xs font-medium text-dashMuted uppercase tracking-wide mb-2">Escalation Rules</p>
                        <ul className="space-y-1">
                          {brief.agentSpec.escalationRules.map((e, i) => (
                            <li key={i} className="text-xs text-[#EEF2FF]">{e}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* TOOLS */}
                {activeSection === 'tools' && (
                  <div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#161F2E]">
                          <th className="text-left text-xs text-dashMuted font-medium pb-3">Tool</th>
                          <th className="text-left text-xs text-dashMuted font-medium pb-3">Purpose</th>
                          <th className="text-left text-xs text-dashMuted font-medium pb-3">API?</th>
                          <th className="text-left text-xs text-dashMuted font-medium pb-3">Setup</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brief.tools.map((tool, i) => (
                          <tr key={i} className="border-b border-[#161F2E]/50">
                            <td className="py-3 pr-4">
                              <p className="text-[#EEF2FF] font-medium text-xs">{tool.toolName}</p>
                              {tool.alternatives.length > 0 && (
                                <p className="text-[10px] text-dashMuted/60 mt-0.5">Alt: {tool.alternatives.join(', ')}</p>
                              )}
                            </td>
                            <td className="py-3 pr-4 text-xs text-dashMuted">{tool.purpose}</td>
                            <td className="py-3 pr-4">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${tool.apiRequired ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'}`}>
                                {tool.apiRequired ? 'Required' : 'No'}
                              </span>
                            </td>
                            <td className="py-3 text-xs text-dashMuted">{tool.estimatedSetupTime}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* TECH STACK */}
                {activeSection === 'techstack' && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'AI Model', value: brief.techStack.aiModel },
                      { label: 'Framework', value: brief.techStack.framework },
                      { label: 'Database', value: brief.techStack.database },
                      { label: 'Hosting', value: brief.techStack.hosting },
                    ].map((item) => (
                      <div key={item.label} className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                        <p className="text-xs text-dashMuted mb-1 uppercase tracking-wide font-medium">{item.label}</p>
                        <p className="text-sm text-[#EEF2FF]">{item.value}</p>
                      </div>
                    ))}
                    <div className="col-span-2 bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-xl p-4">
                      <p className="text-xs text-[#6366F1] mb-1 uppercase tracking-wide font-medium">Estimated Monthly Cost</p>
                      <p className="text-lg font-bold text-[#EEF2FF]">{brief.techStack.estimatedMonthlyCost}</p>
                    </div>
                  </div>
                )}

                {/* BUILD PLAN */}
                {activeSection === 'buildplan' && (
                  <div className="space-y-3">
                    {brief.buildPlan.map((phase) => (
                      <div key={phase.phase} className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-xs text-accent font-bold shrink-0">
                            {phase.phase}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[#EEF2FF]">{phase.name}</p>
                            <p className="text-xs text-dashMuted">{phase.duration}</p>
                          </div>
                        </div>
                        <div className="mb-3">
                          <p className="text-xs text-dashMuted font-medium mb-1.5">Deliverables</p>
                          <ul className="space-y-1">
                            {phase.deliverables.map((d, i) => (
                              <li key={i} className="text-xs text-[#EEF2FF] flex items-start gap-1.5"><span className="text-accent">•</span>{d}</li>
                            ))}
                          </ul>
                        </div>
                        {phase.dependencies.length > 0 && (
                          <p className="text-xs text-dashMuted">Depends on: {phase.dependencies.join(', ')}</p>
                        )}
                        <div className="mt-3 pt-3 border-t border-[#161F2E]">
                          <p className="text-xs text-green-400">Done when: {phase.completionCriteria}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* HANDOVER */}
                {activeSection === 'handover' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                        <p className="text-xs font-medium text-dashMuted uppercase tracking-wide mb-2">Documentation</p>
                        <ul className="space-y-1">
                          {brief.handover.documentationRequired.map((d, i) => (
                            <li key={i} className="text-xs text-[#EEF2FF] flex items-center gap-1.5">
                              <span className="w-3.5 h-3.5 rounded border border-[#6366F1]/40 inline-flex items-center justify-center shrink-0" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                        <p className="text-xs font-medium text-dashMuted uppercase tracking-wide mb-2">Training Required</p>
                        <ul className="space-y-1">
                          {brief.handover.trainingRequired.map((t, i) => (
                            <li key={i} className="text-xs text-[#EEF2FF] flex items-center gap-1.5">
                              <span className="w-3.5 h-3.5 rounded border border-[#6366F1]/40 inline-flex items-center justify-center shrink-0" />
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                      <p className="text-xs font-medium text-dashMuted uppercase tracking-wide mb-2">Go-Live Checklist</p>
                      <ul className="space-y-1.5">
                        {brief.handover.goLiveChecklist.map((item, i) => (
                          <li key={i} className="text-sm text-[#EEF2FF] flex items-center gap-2">
                            <span className="w-4 h-4 rounded border border-green-500/40 inline-flex items-center justify-center shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                        <p className="text-xs font-medium text-dashMuted uppercase tracking-wide mb-2">Maintenance Plan</p>
                        <p className="text-sm text-[#EEF2FF]">{brief.handover.maintenancePlan}</p>
                      </div>
                      <div className="bg-[#141B24] rounded-xl border border-[#161F2E] p-4">
                        <p className="text-xs font-medium text-dashMuted uppercase tracking-wide mb-2">Support Plan</p>
                        <p className="text-sm text-[#EEF2FF]">{brief.handover.supportPlan}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* COMMERCIAL */}
                {activeSection === 'commercial' && (
                  <div className="space-y-4">
                    <div className="bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-xl p-5">
                      <p className="text-xs font-medium text-[#6366F1] uppercase tracking-wide mb-4">Commercial Summary</p>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Build Cost', value: brief.commercial.estimatedBuildCost },
                          { label: 'Timeline', value: brief.commercial.estimatedTimeline },
                          { label: 'Monthly Support', value: brief.commercial.monthlySupportCost },
                          { label: 'Payback Period', value: brief.commercial.paybackPeriod },
                        ].map(item => (
                          <div key={item.label}>
                            <p className="text-xs text-dashMuted mb-1">{item.label}</p>
                            <p className="text-xl font-bold text-[#EEF2FF]">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <p className="text-xs font-medium text-green-400 uppercase tracking-wide mb-2">Return on Investment</p>
                      <p className="text-sm text-[#EEF2FF]">{brief.commercial.roi}</p>
                    </div>
                  </div>
                )}

                {/* RISKS */}
                {activeSection === 'risks' && (
                  <div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#161F2E]">
                          <th className="text-left text-xs text-dashMuted font-medium pb-3">Risk</th>
                          <th className="text-left text-xs text-dashMuted font-medium pb-3">Likelihood</th>
                          <th className="text-left text-xs text-dashMuted font-medium pb-3">Impact</th>
                          <th className="text-left text-xs text-dashMuted font-medium pb-3">Mitigation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brief.risks.map((risk, i) => (
                          <tr key={i} className="border-b border-[#161F2E]/50">
                            <td className="py-3 pr-3">
                              <div className="flex items-start gap-1.5">
                                <AlertTriangle size={13} className="text-amber-400 mt-0.5 shrink-0" />
                                <span className="text-xs text-[#EEF2FF]">{risk.risk}</span>
                              </div>
                            </td>
                            <td className="py-3 pr-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${RISK_COLORS[risk.likelihood] ?? 'text-dashMuted'}`}>
                                {risk.likelihood}
                              </span>
                            </td>
                            <td className="py-3 pr-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${RISK_COLORS[risk.impact] ?? 'text-dashMuted'}`}>
                                {risk.impact}
                              </span>
                            </td>
                            <td className="py-3 text-xs text-dashMuted">{risk.mitigation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className="px-6 py-4 border-t border-[#161F2E] flex items-center justify-between">
                <a
                  href="/conversations"
                  className="flex items-center gap-1.5 text-xs text-dashMuted hover:text-[#EEF2FF] transition-colors"
                >
                  <ExternalLink size={12} />
                  Load into ELEVO Connect™
                </a>
                <div className="flex items-center gap-2">
                  <CopyButton text={brief.fullBriefDocument} />
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 text-xs text-dashMuted hover:text-[#EEF2FF] transition-colors px-3 py-1.5 rounded-md border border-[#161F2E] hover:border-[#6366F1]/30"
                  >
                    <Download size={12} />
                    Download Full Brief as PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white; color: black; }
          nav, aside, header { display: none !important; }
        }
      `}</style>
    </div>
  )
}
