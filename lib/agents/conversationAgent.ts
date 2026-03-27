import { createMessage, getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON } from './client'
import type { BusinessProfile } from './types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConversationChannel = 'whatsapp' | 'sms' | 'email' | 'instagram_dm' | 'facebook_messenger' | 'website_chat'

export interface ConversationFlow {
  name: string
  triggerType: 'new_lead' | 'review_request' | 'appointment_reminder' | 'reactivation' | 'post_purchase' | 'inquiry_response' | 'promotional' | 'birthday' | 'custom'
  channel: ConversationChannel
  agentPersona: string
  businessProfile: BusinessProfile
  contactName: string
  contactHistory?: string
  objective: string
  tone: 'professional' | 'friendly' | 'urgent' | 'celebratory'
  locale: string
}

export interface ConversationOutput {
  flowName: string
  channel: ConversationChannel
  messages: Array<{
    messageNumber: number
    sendAfter: string
    content: string
    waitForReply: boolean
    ifYesResponse?: string
    ifNoResponse?: string
    callToAction?: string
  }>
  agentInstructions: string
  fallbackScript: string
  successCriteria: string
  estimatedResponseRate: string
}

// ─── Channel Constraints ─────────────────────────────────────────────────────

const CHANNEL_CONSTRAINTS: Record<ConversationChannel, string> = {
  sms: 'Maximum 160 characters per message. Plain text only. No emojis unless deliberate. Include opt-out: "Reply STOP to unsubscribe."',
  whatsapp: 'Conversational tone. Can use emojis sparingly. Supports bold (*text*) and italic (_text_). Keep messages concise. Can include links.',
  email: 'Full paragraphs allowed. Include subject line in content field. Professional formatting. Can be longer (200-400 words). Include unsubscribe note.',
  instagram_dm: 'Casual, brand-aligned tone. Brief messages. Can use emojis. Feel like a genuine human interaction, not a broadcast.',
  facebook_messenger: 'Conversational and friendly. Medium length. Can use emojis. Feels personal not corporate.',
  website_chat: 'Immediate, helpful, concise. Like a knowledgeable staff member. Short responses. Ask qualifying questions.',
}

// ─── Build Conversation Flow ──────────────────────────────────────────────────

export async function buildConversationFlow(flow: ConversationFlow): Promise<ConversationOutput> {
  const client = getClient()

  const channelConstraints = CHANNEL_CONSTRAINTS[flow.channel]

  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    system: `You are ELEVO AI's Conversational Automation Agent — Echo. You design automated conversation flows that feel human, drive action, and achieve business objectives.

You build ManyChat-style multi-message automated sequences adapted to the specific channel and business context.

CHANNEL RULES — ${flow.channel.toUpperCase()}:
${channelConstraints}

FLOW DESIGN PRINCIPLES:
1. Message 1 should hook immediately — personalise with the contact's name
2. Never dump everything in one message — create a natural dialogue rhythm
3. Every message should have a clear micro-objective
4. Include decision branches where the contact can reply yes/no
5. Always provide a fallback for non-responders
6. Respect channel character limits absolutely (SMS: 160 chars per message)
7. The flow should feel like it's from a real person at ${flow.businessProfile.business_name}, not a robot
8. The ${flow.agentPersona} persona should come through in tone and language

TRIGGER-SPECIFIC BEST PRACTICES:
- new_lead: Respond within minutes psychologically. High urgency. Qualify fast.
- review_request: Only ask after a positive interaction. Make it easy. One-click.
- appointment_reminder: 24h before and 1h before. Include date/time explicitly.
- reactivation: Acknowledge the gap. Offer value first. Don't just sell.
- post_purchase: Thank them. Deliver value. Plant the seed for repeat.
- promotional: Lead with benefit not product. Create FOMO. Clear CTA.

Locale: ${flow.locale}`,
    messages: [
      {
        role: 'user',
        content: `Build a ${flow.triggerType} conversation flow for ${flow.businessProfile.business_name}.

FLOW DETAILS:
- Name: ${flow.name}
- Channel: ${flow.channel}
- Trigger: ${flow.triggerType}
- Contact name: ${flow.contactName}
- Objective: ${flow.objective}
- Tone: ${flow.tone}
- Agent persona: ${flow.agentPersona}
${flow.contactHistory ? `- Contact history: ${flow.contactHistory}` : ''}

BUSINESS CONTEXT:
- Business: ${flow.businessProfile.business_name}
- Type: ${flow.businessProfile.category}
- Location: ${flow.businessProfile.city}, ${flow.businessProfile.country}
- Services: ${flow.businessProfile.services.join(', ')}
- USPs: ${flow.businessProfile.unique_selling_points.join(', ')}
- Tone of voice: ${flow.businessProfile.tone_of_voice}
${flow.businessProfile.google_review_url ? `- Review URL: ${flow.businessProfile.google_review_url}` : ''}
${flow.businessProfile.website_url ? `- Website: ${flow.businessProfile.website_url}` : ''}

CHANNEL CONSTRAINT REMINDER — ${flow.channel}:
${channelConstraints}

Design a complete automated conversation sequence. Write all message content exactly as it would be sent. Respect all channel constraints strictly.

Return ONLY valid JSON:
{
  "flowName": "<name>",
  "channel": "${flow.channel}",
  "messages": [
    {
      "messageNumber": <1, 2, 3...>,
      "sendAfter": "<e.g. Immediately, After 2 hours, Day 2 at 10am>",
      "content": "<exact message content — respects channel constraints>",
      "waitForReply": <boolean>,
      "ifYesResponse": "<optional — what to send if they reply yes/positive>",
      "ifNoResponse": "<optional — what to send if they reply no/negative or don't reply>",
      "callToAction": "<optional — primary CTA for this message>"
    }
  ],
  "agentInstructions": "<instructions for a human taking over if automation fails>",
  "fallbackScript": "<what to send if the entire flow gets no engagement after all messages>",
  "successCriteria": "<how to know this flow worked — specific metric or response>",
  "estimatedResponseRate": "<realistic expected response rate for this trigger/channel combo>"
}`,
      },
    ],
  })

  try {
    return parseJSON<ConversationOutput>(extractText(response))
  } catch {
    return {
      flowName: flow.name,
      channel: flow.channel,
      messages: [
        {
          messageNumber: 1,
          sendAfter: 'Immediately',
          content: `Hi ${flow.contactName}, it's ${flow.businessProfile.business_name}. ${flow.objective}`,
          waitForReply: false,
        },
      ],
      agentInstructions: 'Follow up personally if automation does not receive a response within 48 hours.',
      fallbackScript: `Hi ${flow.contactName}, just checking in — is there anything I can help with? — ${flow.businessProfile.business_name}`,
      successCriteria: 'Contact responds or takes the desired action.',
      estimatedResponseRate: 'Unable to estimate.',
    }
  }
}

// ─── Generate Single Message ──────────────────────────────────────────────────

export async function generateSingleMessage(
  context: {
    channel: ConversationChannel
    purpose: string
    contactName: string
    businessProfile: BusinessProfile
    priorMessages?: string[]
    replyToReceived?: string
  },
  locale: string
): Promise<string> {
  const client = getClient()

  const channelConstraints = CHANNEL_CONSTRAINTS[context.channel]

  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: MAX_TOKENS.MEDIUM,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    system: `You are ELEVO AI's Conversational Automation Agent — Echo. You write single messages for specific channels that feel human, are appropriately concise, and achieve the stated purpose.

CHANNEL RULES — ${context.channel.toUpperCase()}:
${channelConstraints}

Write as if you are a real person at ${context.businessProfile.business_name}. Use the business's natural tone of voice: ${context.businessProfile.tone_of_voice}.

Return ONLY the message text itself — no JSON, no quotes, no explanation. Just the message.
Locale: ${locale}`,
    messages: [
      {
        role: 'user',
        content: `Write a single ${context.channel} message for ${context.businessProfile.business_name}.

Purpose: ${context.purpose}
Recipient name: ${context.contactName}
Business: ${context.businessProfile.business_name} (${context.businessProfile.category})
Location: ${context.businessProfile.city}, ${context.businessProfile.country}
${context.replyToReceived ? `\nThey just replied: "${context.replyToReceived}"` : ''}
${context.priorMessages && context.priorMessages.length > 0 ? `\nPrevious messages in this conversation:\n${context.priorMessages.join('\n')}` : ''}

Channel constraint reminder: ${channelConstraints}

Write only the message text. No explanation. Just the message.`,
      },
    ],
  })

  const text = extractText(response).trim()
  return text || `Hi ${context.contactName}, this is ${context.businessProfile.business_name}. ${context.purpose}`
}
