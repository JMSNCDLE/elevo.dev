'use client'

import { useState, useEffect } from 'react'
import {
  Loader2, MessageSquare, PlusCircle, Trash2, Send,
  ChevronDown, AlertTriangle
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import AgentStatusIndicator from '@/components/shared/AgentStatusIndicator'
import ActionExplanation from '@/components/shared/ActionExplanation'
import { cn } from '@/lib/utils'
import type { BusinessProfile } from '@/lib/agents/types'
import type { ConversationChannel, ConversationOutput } from '@/lib/agents/conversationAgent'

type Status = 'idle' | 'thinking' | 'generating' | 'done' | 'error'

const CHANNELS: { value: ConversationChannel; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'sms', label: 'SMS' },
  { value: 'email', label: 'Email' },
  { value: 'instagram_dm', label: 'Instagram DM' },
  { value: 'facebook_messenger', label: 'Facebook Messenger' },
  { value: 'website_chat', label: 'Website Chat' },
]

const TRIGGER_TYPES = [
  { value: 'new_lead', label: 'New Lead' },
  { value: 'review_request', label: 'Review Request' },
  { value: 'appointment_reminder', label: 'Appointment Reminder' },
  { value: 'reactivation', label: 'Win-Back / Reactivation' },
  { value: 'post_purchase', label: 'Post-Purchase Follow-up' },
  { value: 'inquiry_response', label: 'Inquiry Response' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'birthday', label: 'Birthday / Anniversary' },
  { value: 'custom', label: 'Custom' },
]

const TONES = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'celebratory', label: 'Celebratory' },
]

export default function ConversationsPage() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [plan, setPlan] = useState<string>('trial')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ConversationOutput | null>(null)

  // Form fields
  const [flowName, setFlowName] = useState('')
  const [channel, setChannel] = useState<ConversationChannel>('whatsapp')
  const [triggerType, setTriggerType] = useState('new_lead')
  const [contactName, setContactName] = useState('')
  const [contactHistory, setContactHistory] = useState('')
  const [objective, setObjective] = useState('')
  const [tone, setTone] = useState('friendly')
  const [agentPersona, setAgentPersona] = useState('')

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: pr } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
      if (pr) setPlan(pr.plan)
      const { data: bp } = await supabase.from('business_profiles').select('*').eq('user_id', user.id).single()
      if (bp) setProfile(bp as BusinessProfile)
    })
  }, [])

  if (plan !== 'orbit' && plan !== 'galaxy') {
    return (
      <div className="p-8">
        <UpgradePrompt
          featureName="Conversations"
          description="Build multi-message conversation flows for WhatsApp, SMS, email and more with AI-powered sequencing."
          requiredPlan="orbit"
        />
      </div>
    )
  }

  async function handleGenerate() {
    if (!profile) return
    if (!flowName.trim() || !objective.trim()) {
      setError('Flow name and objective are required.')
      return
    }
    setError(null)
    setStatus('thinking')
    setResult(null)

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfileId: profile.id,
          locale: 'en',
          flow: {
            name: flowName,
            triggerType,
            channel,
            agentPersona: agentPersona || profile.business_name,
            businessProfile: profile,
            contactName: contactName || 'Customer',
            contactHistory: contactHistory || undefined,
            objective,
            tone,
            locale: 'en',
          },
        }),
      })

      setStatus('generating')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Generation failed')
      setResult(json.result)
      setStatus('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-dashBg text-dashText">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <MessageSquare size={18} className="text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-dashText">Conversations</h1>
              <p className="text-sm text-dashMuted">Build multi-message flows for any channel · 2 credits</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-dashCard rounded-2xl border border-dashSurface2 p-6 space-y-5 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-dashMuted mb-1.5 block">Flow Name</label>
              <input
                value={flowName}
                onChange={e => setFlowName(e.target.value)}
                placeholder="e.g. New Lead Welcome Sequence"
                className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText placeholder-dashMuted focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs text-dashMuted mb-1.5 block">Channel</label>
              <div className="relative">
                <select
                  value={channel}
                  onChange={e => setChannel(e.target.value as ConversationChannel)}
                  className="w-full appearance-none bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
                >
                  {CHANNELS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-dashMuted pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-dashMuted mb-1.5 block">Trigger Type</label>
              <div className="relative">
                <select
                  value={triggerType}
                  onChange={e => setTriggerType(e.target.value)}
                  className="w-full appearance-none bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
                >
                  {TRIGGER_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-dashMuted pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-dashMuted mb-1.5 block">Tone</label>
              <div className="relative">
                <select
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className="w-full appearance-none bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent"
                >
                  {TONES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-dashMuted pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-dashMuted mb-1.5 block">Contact Name <span className="opacity-50">(optional)</span></label>
              <input
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder="e.g. Sarah"
                className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText placeholder-dashMuted focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs text-dashMuted mb-1.5 block">Agent Persona <span className="opacity-50">(optional)</span></label>
              <input
                value={agentPersona}
                onChange={e => setAgentPersona(e.target.value)}
                placeholder="e.g. Alex from ELEVO"
                className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText placeholder-dashMuted focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-dashMuted mb-1.5 block">Objective <span className="text-red-400">*</span></label>
            <textarea
              value={objective}
              onChange={e => setObjective(e.target.value)}
              rows={3}
              placeholder="What should this conversation flow achieve? e.g. Nurture a new lead who enquired about landscaping services — get them to book a free site visit."
              className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText placeholder-dashMuted focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-dashMuted mb-1.5 block">Contact History <span className="opacity-50">(optional)</span></label>
            <textarea
              value={contactHistory}
              onChange={e => setContactHistory(e.target.value)}
              rows={2}
              placeholder="Any prior interactions? e.g. Enquired via website 2 days ago. Was interested in monthly lawn care."
              className="w-full bg-dashSurface border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText placeholder-dashMuted focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={status === 'thinking' || status === 'generating'}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {status === 'thinking' || status === 'generating' ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
            {status === 'thinking' ? 'Thinking…' : status === 'generating' ? 'Building flow…' : 'Build Conversation Flow'}
          </button>
        </div>

        {/* Status */}
        {(status === 'thinking' || status === 'generating') && (
          <div className="mb-6">
            <AgentStatusIndicator
              status={status === 'thinking' ? 'thinking' : 'generating'}
              agentName="Echo"
            />
          </div>
        )}

        {/* Results */}
        {result && status === 'done' && (
          <div className="space-y-4">
            {/* Summary bar */}
            <div className="bg-dashCard rounded-xl border border-dashSurface2 p-4 flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-dashMuted text-xs mb-0.5">Flow</p>
                <p className="font-semibold text-dashText">{result.flowName}</p>
              </div>
              <div>
                <p className="text-dashMuted text-xs mb-0.5">Channel</p>
                <p className="font-semibold text-dashText capitalize">{result.channel.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-dashMuted text-xs mb-0.5">Messages</p>
                <p className="font-semibold text-dashText">{result.messages.length}</p>
              </div>
              <div>
                <p className="text-dashMuted text-xs mb-0.5">Est. Response Rate</p>
                <p className="font-semibold text-green-400">{result.estimatedResponseRate}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-3">
              {result.messages.map((msg, i) => (
                <div key={i} className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-accent">Message {msg.messageNumber}</span>
                    <span className="text-xs text-dashMuted">Send after: {msg.sendAfter}</span>
                  </div>
                  <p className="text-sm text-dashText whitespace-pre-wrap mb-3">{msg.content}</p>
                  {msg.callToAction && (
                    <p className="text-xs text-dashMuted border-t border-dashSurface2 pt-2">CTA: {msg.callToAction}</p>
                  )}
                  {msg.waitForReply && (
                    <div className="mt-2 pt-2 border-t border-dashSurface2 space-y-1">
                      {msg.ifYesResponse && (
                        <p className="text-xs text-green-400">✓ If yes: {msg.ifYesResponse}</p>
                      )}
                      {msg.ifNoResponse && (
                        <p className="text-xs text-amber-400">✗ If no: {msg.ifNoResponse}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Agent instructions + fallback */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
                <p className="text-xs font-semibold text-dashMuted uppercase tracking-wider mb-2">Agent Instructions</p>
                <p className="text-sm text-dashText">{result.agentInstructions}</p>
              </div>
              <div className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
                <p className="text-xs font-semibold text-dashMuted uppercase tracking-wider mb-2">Fallback Script</p>
                <p className="text-sm text-dashText">{result.fallbackScript}</p>
              </div>
            </div>

            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
              <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">Success Criteria</p>
              <p className="text-sm text-dashText">{result.successCriteria}</p>
            </div>

            <ActionExplanation
              title="Your conversation flow is ready"
              description="Echo has built a multi-message sequence tailored to your channel constraints and objective. Copy each message into your CRM, messaging tool, or automation platform."
            />
          </div>
        )}
      </div>
    </div>
  )
}
