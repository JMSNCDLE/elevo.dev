// ─── CRM Conversation Agent (Sage — supercharged) ────────────────────────────
// The brain behind every DM, WhatsApp, SMS reply.
// ManyChat-level automation powered by Claude Opus.

import { createMessage, MODELS, MAX_TOKENS } from './client'
import type { BusinessProfile, Contact } from './types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConversationContext {
  businessProfile: BusinessProfile
  contact?: Contact
  platform: string
  channel: string
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  intent?: string
  flowStep?: number
  locale: string
}

export interface ConversationReply {
  message: string
  quickReplies?: string[]
  action?: {
    type:
      | 'collect_name'
      | 'collect_email'
      | 'collect_phone'
      | 'book_appointment'
      | 'send_quote'
      | 'add_to_crm'
      | 'escalate_to_human'
      | 'send_link'
      | 'request_review'
    data?: Record<string, unknown>
  }
  intent: string
  sentiment: 'positive' | 'neutral' | 'negative'
  shouldEscalate: boolean
  escalateReason?: string
  conversionAchieved: boolean
  conversionType?: string
  followUpScheduled?: { message: string; sendIn: string }
  crm_updates?: Partial<Contact>
}

export interface ConversationTemplate {
  name: string
  category: string
  platform?: string
  message: string
  quickReplies: string[]
  variables: string[]
}

export interface FlowStep {
  stepNumber: number
  delay: string
  message: string
  quickReplies: string[]
  conditions: Array<{ if: string; then: string }>
}

export interface ConversationFlowResult {
  flowName: string
  steps: FlowStep[]
  triggerKeywords?: string[]
  successMetric: string
}

// ─── Handle Incoming Message ──────────────────────────────────────────────────

export async function handleIncomingMessage(
  incomingText: string,
  context: ConversationContext
): Promise<ConversationReply> {
  const { businessProfile: bp, contact, platform, channel, conversationHistory, locale } = context

  const historyText = conversationHistory
    .map(m => `${m.role === 'user' ? 'Customer' : 'Assistant'}: ${m.content}`)
    .join('\n')

  const contactContext = contact
    ? `Known contact: ${contact.full_name}${contact.email ? `, email: ${contact.email}` : ''}${contact.phone ? `, phone: ${contact.phone}` : ''}, status: ${contact.status}`
    : 'Unknown contact — may need to collect their details'

  const message = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.MEDIUM,
    thinking: { type: 'adaptive' },
    effort: 'high',
    messages: [
      {
        role: 'user',
        content: `You are Sage, the AI assistant for ${bp.business_name} (${bp.category} in ${bp.city}).

You handle incoming messages on behalf of this business. Your job is to:
- Reply naturally in the business's tone of voice: ${bp.tone_of_voice}
- Understand what the customer wants and help them
- Collect contact information naturally when appropriate
- Book appointments, send quotes, or escalate to the human owner when needed
- NEVER reveal you are AI unless directly asked
- If asked "are you a bot?" or "are you human?": reply "I'm the assistant for ${bp.business_name} — happy to help! What can I do for you today?"
- Always sound warm, helpful, and professional
- Keep replies concise and natural for ${channel} (not too long)
- Language: ${locale}

Platform: ${platform} | Channel: ${channel}
${contactContext}

Conversation so far:
${historyText || '(New conversation)'}

New message from customer: "${incomingText}"

Reply as Sage. Return a JSON object:
{
  "message": "Your reply to send",
  "quickReplies": ["tap reply 1", "tap reply 2", "tap reply 3"],
  "action": {
    "type": "collect_name|collect_email|collect_phone|book_appointment|send_quote|add_to_crm|escalate_to_human|send_link|request_review|null",
    "data": {}
  },
  "intent": "What the customer wants (e.g. get_quote, book_appointment, enquiry, complaint)",
  "sentiment": "positive|neutral|negative",
  "shouldEscalate": false,
  "escalateReason": "Only if shouldEscalate is true",
  "conversionAchieved": false,
  "conversionType": "booked|bought|enquired|null",
  "followUpScheduled": { "message": "Follow up text", "sendIn": "24h" },
  "crm_updates": {
    "full_name": "if collected",
    "email": "if collected",
    "phone": "if collected"
  }
}

Set action.type to null if no specific action needed. quickReplies should be 2-3 natural-sounding options.`,
      },
    ],
  })

  const raw = message.content.find(b => b.type === 'text')?.text ?? '{}'
  const json = raw.match(/\{[\s\S]*\}/)?.[0] ?? raw

  try {
    return JSON.parse(json) as ConversationReply
  } catch {
    // Fallback if JSON parse fails
    return {
      message: raw.slice(0, 500),
      intent: 'unknown',
      sentiment: 'neutral',
      shouldEscalate: false,
      conversionAchieved: false,
    }
  }
}

// ─── Build Conversation Flow ──────────────────────────────────────────────────

export async function buildConversationFlow(params: {
  businessProfile: BusinessProfile
  triggerType: string
  platform: string
  channel: string
  objective: string
  locale: string
}): Promise<ConversationFlowResult> {
  const { businessProfile: bp, triggerType, platform, channel, objective, locale } = params

  const message = await createMessage({
    model: MODELS.SPECIALIST,
    max_tokens: MAX_TOKENS.MEDIUM,
    thinking: { type: 'adaptive' },
    effort: 'medium',
    messages: [
      {
        role: 'user',
        content: `You are Sage, ELEVO's CRM conversation agent. Build a ${platform} automation flow for ${bp.business_name}.

Business: ${bp.business_name} (${bp.category}, ${bp.city})
Tone: ${bp.tone_of_voice}
Trigger: ${triggerType}
Channel: ${channel}
Objective: ${objective}
Language: ${locale}

Create a complete conversation flow with 3-5 steps.

Return JSON:
{
  "flowName": "Descriptive name for this flow",
  "steps": [
    {
      "stepNumber": 1,
      "delay": "Immediate",
      "message": "First message to send",
      "quickReplies": ["Reply option 1", "Reply option 2"],
      "conditions": [
        { "if": "customer replies YES", "then": "send step 2" },
        { "if": "customer ignores", "then": "send follow-up after 24h" }
      ]
    }
  ],
  "triggerKeywords": ["keyword1", "keyword2"],
  "successMetric": "What success looks like for this flow"
}`,
      },
    ],
  })

  const raw = message.content.find(b => b.type === 'text')?.text ?? '{}'
  const json = raw.match(/\{[\s\S]*\}/)?.[0] ?? raw
  return JSON.parse(json) as ConversationFlowResult
}

// ─── Generate Template Library ────────────────────────────────────────────────

export async function generateTemplateLibrary(
  businessProfile: BusinessProfile,
  category: string,
  locale: string
): Promise<ConversationTemplate[]> {
  const bp = businessProfile

  const message = await createMessage({
    model: MODELS.SPECIALIST,
    max_tokens: MAX_TOKENS.MEDIUM,
    thinking: { type: 'adaptive' },
    effort: 'medium',
    messages: [
      {
        role: 'user',
        content: `You are Sage, ELEVO's CRM agent. Generate 6 message templates for ${bp.business_name}.

Business: ${bp.business_name} (${bp.category}, ${bp.city})
Tone: ${bp.tone_of_voice}
Category: ${category}
Language: ${locale}

Return a JSON array of 6 templates:
[
  {
    "name": "Template name",
    "category": "${category}",
    "platform": "all",
    "message": "The message with {{first_name}}, {{business_name}} variables",
    "quickReplies": ["Reply option 1", "Reply option 2"],
    "variables": ["first_name", "business_name"]
  }
]

Make them sound human and specific to a ${bp.category} business.
Include variables like {{first_name}}, {{business_name}}, {{service}}, {{date}}, {{amount}}.`,
      },
    ],
  })

  const raw = message.content.find(b => b.type === 'text')?.text ?? '[]'
  const json = raw.match(/\[[\s\S]*\]/)?.[0] ?? raw

  try {
    return JSON.parse(json) as ConversationTemplate[]
  } catch {
    return []
  }
}
