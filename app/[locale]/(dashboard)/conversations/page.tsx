'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'
import {
  MessageSquare, Instagram, Facebook, Phone, Mail,
  Bot, User, CheckCircle2,
  Plus, Loader2, Send, ToggleLeft, ToggleRight,
  Zap, BookOpen, Globe
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import { cn } from '@/lib/utils'
import type { BusinessProfile } from '@/lib/agents/types'

type Section = 'inbox' | 'flows' | 'templates'
type ConvStatus = 'all' | 'active' | 'escalated' | 'resolved' | 'spam'

interface LiveConversation {
  id: string
  platform: string
  channel: string
  status: string
  ai_handling: boolean
  messages: Array<{ role: string; content: string; ts: string }>
  intent?: string
  sentiment?: string
  last_message_at: string
  contacts?: { full_name?: string } | null
}

interface ConversationFlow {
  id: string
  name: string
  trigger_type: string
  platform: string
  channel: string
  is_active: boolean
  total_triggered: number
  total_converted: number
}

interface Template {
  id: string
  name: string
  category: string
  platform?: string
  message: string
  quick_replies: string[]
  variables: string[]
}

const PLATFORM_ICON: Record<string, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  whatsapp: Phone,
  sms: Phone,
  email: Mail,
  all: Globe,
}

const PLATFORM_COLOR: Record<string, string> = {
  instagram: 'text-pink-400',
  facebook: 'text-blue-400',
  whatsapp: 'text-green-400',
  sms: 'text-yellow-400',
  email: 'text-purple-400',
  all: 'text-dashMuted',
}

const PRESET_FLOWS = [
  { name: 'Instagram Comment DM', trigger: 'comment_keyword', platform: 'instagram', channel: 'instagram_dm', objective: 'Lead capture via comment trigger' },
  { name: 'New Follower Welcome', trigger: 'new_follower', platform: 'instagram', channel: 'instagram_dm', objective: 'Welcome new followers with a free consultation offer' },
  { name: 'Booking Confirmation', trigger: 'appointment_booked', platform: 'all', channel: 'sms', objective: 'Confirm appointment and send reminders' },
  { name: 'Google Review Request', trigger: 'payment_received', platform: 'all', channel: 'sms', objective: 'Request a Google review after job completion' },
  { name: 'Lapsed Customer Win-back', trigger: 'manual', platform: 'all', channel: 'sms', objective: 'Re-engage customers who have not booked in 60 days' },
  { name: 'Post-purchase Follow-up', trigger: 'payment_received', platform: 'all', channel: 'email', objective: 'Thank customer, upsell related service, and ask for referrals' },
]

const TEMPLATE_CATEGORIES = ['welcome', 'booking', 'quote', 'follow_up', 'review_request', 'reactivation', 'objection_handling', 'faq', 'promo']

export default function ConversationsPage() {
  const locale = useLocale()
  const supabase = createBrowserClient()

  const [plan, setPlan] = useState<string>('trial')
  const [bp, setBp] = useState<BusinessProfile | null>(null)
  const [section, setSection] = useState<Section>('inbox')
  const [convStatus, setConvStatus] = useState<ConvStatus>('all')
  const [conversations, setConversations] = useState<LiveConversation[]>([])
  const [flows, setFlows] = useState<ConversationFlow[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedConv, setSelectedConv] = useState<LiveConversation | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(true)
  const [buildingFlow, setBuildingFlow] = useState<string | null>(null)
  const [generatingTemplates, setGeneratingTemplates] = useState<string | null>(null)
  const [togglingFlow, setTogglingFlow] = useState<string | null>(null)
  const [sendingReply, setSendingReply] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const [profileRes, bpRes, convsRes, flowsRes, templatesRes] = await Promise.all([
      supabase.from('profiles').select('plan').eq('id', user.id).single(),
      supabase.from('business_profiles').select('*').eq('user_id', user.id).eq('is_primary', true).single(),
      supabase.from('live_conversations').select('*, contacts(full_name)').eq('user_id', user.id).order('last_message_at', { ascending: false }).limit(50),
      supabase.from('conversation_flows').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('conversation_templates').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
    ])

    setPlan(profileRes.data?.plan ?? 'trial')
    setBp(bpRes.data)
    setConversations((convsRes.data ?? []) as LiveConversation[])
    setFlows(flowsRes.data ?? [])
    setTemplates(templatesRes.data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchAll() }, [fetchAll])

  const isOrbit = plan === 'orbit' || plan === 'galaxy'

  const filteredConvs = conversations.filter(c =>
    convStatus === 'all' || c.status === convStatus
  )

  async function sendReply() {
    if (!selectedConv || !replyText.trim()) return
    setSendingReply(true)
    const res = await fetch('/api/conversations/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: selectedConv.id, incomingMessage: replyText, sendReply: true }),
    })
    const data = await res.json()
    if (data.reply) {
      const updatedMessages = [
        ...(selectedConv.messages ?? []),
        { role: 'user', content: replyText, ts: new Date().toISOString() },
        { role: 'assistant', content: data.reply.message, ts: new Date().toISOString() },
      ]
      setSelectedConv(prev => prev ? { ...prev, messages: updatedMessages } : prev)
      setConversations(prev => prev.map(c => c.id === selectedConv.id ? { ...c, messages: updatedMessages } : c))
    }
    setReplyText('')
    setSendingReply(false)
  }

  async function toggleAiHandling(conv: LiveConversation) {
    await fetch('/api/conversations/inbox', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: conv.id, aiHandling: !conv.ai_handling }),
    })
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, ai_handling: !c.ai_handling } : c))
    if (selectedConv?.id === conv.id) setSelectedConv(p => p ? { ...p, ai_handling: !p.ai_handling } : p)
  }

  async function buildPresetFlow(preset: typeof PRESET_FLOWS[number]) {
    if (!bp) return
    setBuildingFlow(preset.name)
    await fetch('/api/conversations/flows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessProfileId: bp.id, params: { triggerType: preset.trigger, platform: preset.platform, channel: preset.channel, objective: preset.objective, locale } }),
    })
    await fetchAll()
    setBuildingFlow(null)
  }

  async function toggleFlow(flow: ConversationFlow) {
    setTogglingFlow(flow.id)
    await fetch('/api/conversations/flows', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: flow.id, is_active: !flow.is_active }),
    })
    setFlows(prev => prev.map(f => f.id === flow.id ? { ...f, is_active: !f.is_active } : f))
    setTogglingFlow(null)
  }

  async function generateMoreTemplates(category: string) {
    if (!bp) return
    setGeneratingTemplates(category)
    await fetch('/api/conversations/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessProfileId: bp.id, category, locale }),
    })
    await fetchAll()
    setGeneratingTemplates(null)
  }

  if (!isOrbit) {
    return (
      <div className="p-6">
        <UpgradePrompt locale={locale} featureName="Conversations" description="Automate your DMs and messages powered by Sage AI." requiredPlan="orbit" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left panel */}
      <div className="w-72 shrink-0 border-r border-dashSurface2 flex flex-col bg-dashSurface">
        <div className="p-4 border-b border-dashSurface2">
          <h1 className="text-base font-bold text-dashText flex items-center gap-2">
            <MessageSquare size={16} className="text-accent" /> Conversations
          </h1>
          <div className="flex gap-1 mt-3">
            {(['inbox', 'flows', 'templates'] as Section[]).map(s => (
              <button key={s} onClick={() => setSection(s)}
                className={cn('flex-1 py-1 text-xs font-medium rounded-lg capitalize transition-colors', section === s ? 'bg-accent text-white' : 'text-dashMuted hover:text-dashText')}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center"><Loader2 size={20} className="animate-spin text-dashMuted" /></div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {section === 'inbox' && (
              <>
                <div className="p-2 border-b border-dashSurface2 flex gap-1 flex-wrap">
                  {(['all', 'active', 'escalated', 'resolved', 'spam'] as ConvStatus[]).map(s => (
                    <button key={s} onClick={() => setConvStatus(s)}
                      className={cn('px-2 py-0.5 text-xs rounded font-medium capitalize transition-colors', convStatus === s ? 'bg-accent/20 text-accent' : 'text-dashMuted hover:text-dashText')}>
                      {s}
                    </button>
                  ))}
                </div>
                {filteredConvs.length === 0 ? (
                  <div className="p-6 text-center text-dashMuted text-sm">No conversations yet.</div>
                ) : (
                  filteredConvs.map(conv => {
                    const Icon = PLATFORM_ICON[conv.platform] ?? MessageSquare
                    const lastMsg = conv.messages?.[conv.messages.length - 1]
                    return (
                      <button key={conv.id} onClick={() => setSelectedConv(conv)}
                        className={cn('w-full text-left px-4 py-3 border-b border-dashSurface2 hover:bg-dashCard transition-colors', selectedConv?.id === conv.id && 'bg-dashCard')}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <Icon size={13} className={PLATFORM_COLOR[conv.platform] ?? 'text-dashMuted'} />
                            <span className="text-xs font-medium text-dashText">{(conv.contacts as { full_name?: string } | null)?.full_name ?? 'Unknown'}</span>
                          </div>
                          <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium',
                            conv.status === 'escalated' ? 'bg-red-500/20 text-red-400' :
                            conv.ai_handling ? 'bg-accent/20 text-accent' : 'bg-amber-500/20 text-amber-400')}>
                            {conv.status === 'escalated' ? 'Urgent' : conv.ai_handling ? 'AI' : 'Manual'}
                          </span>
                        </div>
                        {lastMsg && <p className="text-xs text-dashMuted line-clamp-1">{lastMsg.content}</p>}
                      </button>
                    )
                  })
                )}
              </>
            )}

            {section === 'flows' && (
              <div className="p-3 space-y-2">
                <p className="text-xs text-dashMuted font-medium px-1">Active Flows</p>
                {flows.length === 0 && <p className="text-xs text-dashMuted px-1">No flows yet.</p>}
                {flows.map(flow => (
                  <div key={flow.id} className="bg-dashCard rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-dashText">{flow.name}</span>
                      <button onClick={() => toggleFlow(flow)} disabled={togglingFlow === flow.id} className="text-accent">
                        {togglingFlow === flow.id ? <Loader2 size={15} className="animate-spin" /> : flow.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} className="text-dashMuted" />}
                      </button>
                    </div>
                    <p className="text-xs text-dashMuted capitalize">{flow.trigger_type.replace(/_/g, ' ')} · {flow.platform}</p>
                    <p className="text-xs text-dashMuted">{flow.total_triggered} triggered · {flow.total_converted} converted</p>
                  </div>
                ))}
                <p className="text-xs text-dashMuted font-medium px-1 pt-3">Pre-built Flows</p>
                {PRESET_FLOWS.map(preset => (
                  <button key={preset.name} onClick={() => buildPresetFlow(preset)} disabled={buildingFlow === preset.name}
                    className="w-full text-left bg-dashBg border border-dashSurface2 rounded-lg p-3 hover:border-accent/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-dashText">{preset.name}</span>
                      {buildingFlow === preset.name ? <Loader2 size={13} className="animate-spin text-accent" /> : <Plus size={13} className="text-accent" />}
                    </div>
                    <p className="text-xs text-dashMuted mt-0.5 capitalize">{preset.trigger.replace(/_/g, ' ')} · {preset.platform}</p>
                  </button>
                ))}
              </div>
            )}

            {section === 'templates' && (
              <div className="p-3 space-y-3">
                {TEMPLATE_CATEGORIES.map(cat => {
                  const catTemplates = templates.filter(t => t.category === cat)
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-dashMuted capitalize">{cat.replace(/_/g, ' ')}</span>
                        <button onClick={() => generateMoreTemplates(cat)} disabled={generatingTemplates === cat}
                          className="text-xs text-accent hover:underline flex items-center gap-1">
                          {generatingTemplates === cat ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                          Generate
                        </button>
                      </div>
                      {catTemplates.slice(0, 2).map(t => (
                        <div key={t.id} className="bg-dashCard rounded-lg p-2.5 mb-1">
                          <p className="text-xs font-medium text-dashText mb-0.5">{t.name}</p>
                          <p className="text-xs text-dashMuted line-clamp-2">{t.message}</p>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col bg-dashBg">
        {selectedConv ? (
          <>
            <div className="px-5 py-3 border-b border-dashSurface2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(() => { const Icon = PLATFORM_ICON[selectedConv.platform] ?? MessageSquare; return <Icon size={15} className={PLATFORM_COLOR[selectedConv.platform] ?? 'text-dashMuted'} /> })()}
                <span className="text-sm font-medium text-dashText">{(selectedConv.contacts as { full_name?: string } | null)?.full_name ?? 'Unknown'}</span>
                {selectedConv.intent && <span className="text-xs text-dashMuted bg-dashCard px-2 py-0.5 rounded">{selectedConv.intent}</span>}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-dashMuted">
                  {selectedConv.ai_handling ? <Bot size={13} className="text-accent" /> : <User size={13} />}
                  AI
                  <button onClick={() => toggleAiHandling(selectedConv)}>
                    {selectedConv.ai_handling ? <ToggleRight size={18} className="text-accent" /> : <ToggleLeft size={18} className="text-dashMuted" />}
                  </button>
                </div>
                <button onClick={() => setSelectedConv(null)} className="text-dashMuted hover:text-dashText text-xs">Close</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {(selectedConv.messages ?? []).length === 0 && <p className="text-center text-dashMuted text-sm">No messages yet.</p>}
              {(selectedConv.messages ?? []).map((msg, i) => (
                <div key={i} className={cn('flex', msg.role === 'assistant' ? 'justify-start' : 'justify-end')}>
                  <div className={cn('max-w-sm px-3 py-2 rounded-xl text-sm', msg.role === 'assistant' ? 'bg-dashCard text-dashText' : 'bg-accent text-white')}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-dashSurface2 flex gap-2">
              <input value={replyText} onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                placeholder="Message..."
                className="flex-1 bg-dashCard border border-dashSurface2 rounded-lg px-3 py-2 text-sm text-dashText focus:outline-none focus:border-accent" />
              <button onClick={sendReply} disabled={sendingReply || !replyText.trim()}
                className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50">
                {sendingReply ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center">
              <MessageSquare size={28} className="text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-dashText mb-1">Sage is ready</h2>
              <p className="text-dashMuted text-sm max-w-sm">Select a conversation, or activate a flow to automate your DMs.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 w-full max-w-md">
              {[
                { icon: MessageSquare, label: conversations.length, sub: 'conversations' },
                { icon: Zap, label: flows.filter(f => f.is_active).length, sub: 'active flows' },
                { icon: BookOpen, label: templates.length, sub: 'templates' },
              ].map((stat, i) => (
                <div key={i} className="bg-dashCard rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-dashText">{stat.label}</p>
                  <p className="text-xs text-dashMuted">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
