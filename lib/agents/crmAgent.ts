import { createMessage, getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON } from './client'
import type { BusinessProfile, Contact, CRMBrief, MessageDraft } from './types'

export async function runCRMBriefing(
  business: BusinessProfile,
  stats: {
    totalContacts: number
    activeContacts: number
    vipContacts: number
    lapsedContacts: number
    atRiskContacts: number
    reviewReady: number
    totalRevenue: number
    avgJobValue: number
  }
): Promise<CRMBrief> {
  const client = getClient()

  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: MAX_TOKENS.MEDIUM,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('medium'),
    system: `You are ELEVO AI's CRM Intelligence advisor. You analyse customer data for local businesses and provide smart, actionable briefings that help them prioritise who to contact, what to do, and how to grow revenue from existing customers.`,
    messages: [
      {
        role: 'user',
        content: `Generate a CRM briefing for ${business.business_name}.

CRM Stats:
- Total contacts: ${stats.totalContacts}
- Active contacts: ${stats.activeContacts}
- VIP contacts: ${stats.vipContacts}
- Lapsed (60-90 days): ${stats.lapsedContacts}
- At risk (90+ days): ${stats.atRiskContacts}
- Review-ready contacts: ${stats.reviewReady}
- Total recorded revenue: £${stats.totalRevenue}
- Average job value: £${stats.avgJobValue}

Return ONLY valid JSON:
{
  "totalContacts": ${stats.totalContacts},
  "activeContacts": ${stats.activeContacts},
  "vipContacts": ${stats.vipContacts},
  "lapsedContacts": ${stats.lapsedContacts},
  "atRiskContacts": ${stats.atRiskContacts},
  "reviewReady": ${stats.reviewReady},
  "totalRevenue": ${stats.totalRevenue},
  "avgJobValue": ${stats.avgJobValue},
  "topSuggestion": "The single most important thing to do with their CRM right now",
  "urgentActions": ["Action 1", "Action 2", "Action 3"],
  "campaignIdea": "A specific campaign idea based on these customer patterns"
}`,
      },
    ],
  })

  try {
    return parseJSON<CRMBrief>(extractText(response))
  } catch {
    return { ...stats, topSuggestion: 'Review lapsed contacts.', urgentActions: [], campaignIdea: '' }
  }
}

export async function draftContactMessage(
  contact: Contact,
  business: BusinessProfile,
  messageType: 'follow_up' | 'review_request' | 'win_back' | 'vip_appreciation' | 'seasonal'
): Promise<MessageDraft> {
  const client = getClient()
  const firstName = contact.full_name.split(' ')[0]

  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: MAX_TOKENS.MEDIUM,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('medium'),
    system: `You are ELEVO AI's customer communication expert. You write warm, personalised messages that feel human — not like marketing spam. You understand the relationship between a local business and its customers.`,
    messages: [
      {
        role: 'user',
        content: `Draft a ${messageType.replace('_', ' ')} message from ${business.business_name} to ${contact.full_name}.

Contact details:
- First name: ${firstName}
- Last contact: ${contact.last_contact_date ? new Date(contact.last_contact_date).toLocaleDateString('en-GB') : 'Unknown'}
- Total jobs: ${contact.total_jobs}
- Total value: £${contact.total_revenue}
- Notes: ${contact.notes || 'None'}
- Tags: ${contact.tags.join(', ') || 'None'}

Business: ${business.business_name} (${business.category}, ${business.city})

Return ONLY valid JSON:
{
  "subject": "Email subject line",
  "smsVersion": "Short SMS message (max 160 chars)",
  "emailVersion": "Full email body (friendly, personal, 3-4 paragraphs)",
  "whatsappVersion": "WhatsApp message (conversational, slightly longer than SMS)"
}`,
      },
    ],
  })

  try {
    return parseJSON<MessageDraft>(extractText(response))
  } catch {
    return {
      subject: `Hi ${firstName} — ${business.business_name}`,
      smsVersion: `Hi ${firstName}, it's ${business.business_name}. Hope you're well! Give us a call anytime.`,
      emailVersion: `Hi ${firstName},\n\nHope you're doing well!\n\nWe wanted to reach out and say thank you for your continued support.\n\nBest,\n${business.business_name}`,
      whatsappVersion: `Hi ${firstName}! It's the team at ${business.business_name}. Hope all is well — just checking in!`,
    }
  }
}

export async function enrichContact(
  contact: Contact,
  recentInteractions: Array<{ type: string; notes?: string }>
): Promise<{ tags: string[] }> {
  const client = getClient()

  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: MAX_TOKENS.LOW,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('medium'),
    system: `You are a CRM data enrichment agent. You analyse customer data and assign accurate, useful tags.`,
    messages: [
      {
        role: 'user',
        content: `Suggest tags for this contact:
Name: ${contact.full_name}
Total jobs: ${contact.total_jobs}
Total revenue: £${contact.total_revenue}
Status: ${contact.status}
Existing tags: ${contact.tags.join(', ') || 'None'}
Recent interactions: ${recentInteractions.map(i => `${i.type}: ${i.notes || ''}`).join('; ')}

Return ONLY valid JSON: { "tags": ["tag1", "tag2", "tag3"] }
Use tags like: high-value, regular, seasonal, needs-follow-up, review-potential, local, referral, etc.`,
      },
    ],
  })

  try {
    return parseJSON<{ tags: string[] }>(extractText(response))
  } catch {
    return { tags: contact.tags }
  }
}
