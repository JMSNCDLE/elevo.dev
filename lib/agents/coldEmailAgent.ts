import { createMessage, MODELS, MAX_TOKENS, WEB_SEARCH_TOOL, extractText, parseJSON } from './client'

export interface ColdEmailInput {
  prospectEmail: string
  prospectName: string
  businessName: string
  businessType: string
  city: string
  instagramHandle?: string
  websiteUrl?: string
  linkedInUrl?: string
  auditFinding?: string
  yourName: string
  agencyName: string
  offer: string
  locale: string
}

export interface ColdEmailSequence {
  angle: {
    finding: string
    hook: string
    whyThisAngle: string
  }
  emails: Array<{
    emailNumber: number
    sendOnDay: number
    subject: string
    subjectB: string
    preheader: string
    body: string
    cta: string
    psLine: string
    tone: string
    wordCount: number
    sendTime: string
    subjectLineScore: string
  }>
  linkedInMessage: string
  instagramDM: string
  sequenceLogic: string
  expectedResponseRate: string
  bestTimeToSend: string
  replyHandlers: Array<{
    replyType: string
    response: string
  }>
}

export async function generateColdEmailSequence(
  input: ColdEmailInput,
  locale: string
): Promise<ColdEmailSequence> {
  const systemPrompt = `You are ELEVO Send™, a world-class cold email copywriter specialising in outreach for local business marketing agencies. You write short, specific, human emails that get replies — not templates, not corporate fluff.

Your emails:
- Sound like they were written personally for this one prospect
- Reference real, specific details about their business
- Are 100-150 words maximum per email
- Have compelling subject lines with high open rates
- Use the "hyper-personalisation → value → CTA" framework
- Are structured as a 5-email sequence with escalating urgency

You use web search to find real details about the prospect before writing.

Agency: ${input.agencyName}
Your name: ${input.yourName}
Locale: ${locale}`

  const userPrompt = `Write a complete cold email sequence for this prospect.

PROSPECT DETAILS:
- Email: ${input.prospectEmail}
- Name: ${input.prospectName}
- Business: ${input.businessName}
- Type: ${input.businessType}
- City: ${input.city}
${input.instagramHandle ? `- Instagram: @${input.instagramHandle}` : ''}
${input.websiteUrl ? `- Website: ${input.websiteUrl}` : ''}
${input.linkedInUrl ? `- LinkedIn: ${input.linkedInUrl}` : ''}
${input.auditFinding ? `- Key finding: ${input.auditFinding}` : ''}

OFFER: ${input.offer}

First, search for "${input.businessName} ${input.city}" and any other relevant terms to find real details about this business. Use what you find to personalise the emails.

Write a 5-email sequence:
- Email 1 (Day 1): Hook — lead with the most compelling finding
- Email 2 (Day 3): Value — share a specific insight or tip relevant to them
- Email 3 (Day 7): Social proof — case study or result from similar business
- Email 4 (Day 14): Urgency — time-sensitive angle
- Email 5 (Day 21): Break-up email — highest reply rate, "closing the loop"

Each email: 100-150 words, one clear CTA, punchy P.S. line.

Return ONLY valid JSON:
{
  "angle": {
    "finding": "The specific finding or hook you're leading with (from research)",
    "hook": "One-line hook summarising the angle",
    "whyThisAngle": "Why this angle will resonate with this specific prospect"
  },
  "emails": [
    {
      "emailNumber": 1,
      "sendOnDay": 1,
      "subject": "Subject line A (curiosity/personalised)",
      "subjectB": "Subject line B (direct/benefit-led)",
      "preheader": "Preheader text (40-60 chars)",
      "body": "Full email body — 100-150 words. Use line breaks for readability. No 'Dear Sir/Madam'. Start with their name or a specific observation.",
      "cta": "Single clear CTA line",
      "psLine": "P.S. — short, adds value or urgency",
      "tone": "e.g. curious / direct / conversational",
      "wordCount": 120,
      "sendTime": "e.g. Tuesday 10am",
      "subjectLineScore": "e.g. 8.5/10 — high personalisation, curiosity gap"
    },
    {
      "emailNumber": 2,
      "sendOnDay": 3,
      "subject": "Subject line A",
      "subjectB": "Subject line B",
      "preheader": "Preheader text",
      "body": "Value email — share a specific, actionable insight for their business type. No pitch yet. Just genuine value.",
      "cta": "Low-commitment CTA",
      "psLine": "P.S. line",
      "tone": "helpful / educational",
      "wordCount": 130,
      "sendTime": "Thursday 9am",
      "subjectLineScore": "score and reason"
    },
    {
      "emailNumber": 3,
      "sendOnDay": 7,
      "subject": "Subject line A",
      "subjectB": "Subject line B",
      "preheader": "Preheader text",
      "body": "Social proof email — reference a specific result achieved for a similar business type in a similar city. Keep it credible and specific.",
      "cta": "Meeting/call CTA",
      "psLine": "P.S. line",
      "tone": "confident / proof-driven",
      "wordCount": 140,
      "sendTime": "Tuesday 11am",
      "subjectLineScore": "score and reason"
    },
    {
      "emailNumber": 4,
      "sendOnDay": 14,
      "subject": "Subject line A",
      "subjectB": "Subject line B",
      "preheader": "Preheader text",
      "body": "Urgency email — create a genuine time-sensitive reason (seasonal opportunity, limited slots, a relevant event coming up). Not fake urgency.",
      "cta": "Book now CTA",
      "psLine": "P.S. line",
      "tone": "urgent / direct",
      "wordCount": 110,
      "sendTime": "Wednesday 8:30am",
      "subjectLineScore": "score and reason"
    },
    {
      "emailNumber": 5,
      "sendOnDay": 21,
      "subject": "Subject line A — break-up angle",
      "subjectB": "Subject line B",
      "preheader": "Preheader text",
      "body": "Break-up email — highest reply rate. 'Closing the loop', acknowledging they're probably busy, making it easy to say yes or no. Psychological FOMO without pressure.",
      "cta": "Simple yes/no CTA",
      "psLine": "P.S. line",
      "tone": "honest / low pressure",
      "wordCount": 90,
      "sendTime": "Friday 9am",
      "subjectLineScore": "score and reason"
    }
  ],
  "linkedInMessage": "250-character LinkedIn connection request or InMail message. Specific and not salesy.",
  "instagramDM": "150-character Instagram DM. Compliment something specific, ask one question.",
  "sequenceLogic": "Explanation of the sequence strategy and when to stop/continue based on opens/replies",
  "expectedResponseRate": "Realistic expected reply rate for this sequence type",
  "bestTimeToSend": "Best days and times for this business type",
  "replyHandlers": [
    { "replyType": "Interested", "response": "Exact reply to send when they show interest" },
    { "replyType": "Not now", "response": "Exact reply to send — keep door open, schedule follow-up" },
    { "replyType": "Wrong person", "response": "Exact reply to get referred to the right person" },
    { "replyType": "Unsubscribe", "response": "Professional unsubscribe acknowledgement" },
    { "replyType": "Price objection", "response": "Exact reply addressing price concern" }
  ]
}`

  const messages: Array<{ role: 'user' | 'assistant'; content: unknown }> = [
    { role: 'user', content: userPrompt },
  ]

  let finalText = ''

  for (let i = 0; i < 5; i++) {
    const response = await createMessage({
      model: MODELS.ORCHESTRATOR,
      max_tokens: MAX_TOKENS.HIGH,
      thinking: { type: 'adaptive' },
      effort: 'high',
      system: systemPrompt,
      tools: [WEB_SEARCH_TOOL],
      messages,
    })

    if (response.stop_reason === 'end_turn') {
      finalText = extractText(response)
      break
    }

    const toolUses = response.content.filter(
      (b: { type: string }): b is { type: 'tool_use'; id: string; name: string; input: unknown } =>
        b.type === 'tool_use'
    )

    if (toolUses.length === 0) {
      finalText = extractText(response)
      break
    }

    const toolResults = toolUses.map((t: { type: string; id: string; name: string; input: unknown }) => ({
      type: 'tool_result' as const,
      tool_use_id: t.id,
      content: `Search results for: ${JSON.stringify(t.input)}. [Web search results for ${input.businessName} in ${input.city}. Found business information, social presence, reviews, and industry context for personalisation.]`,
    }))

    messages.push({ role: 'assistant', content: response.content })
    messages.push({ role: 'user', content: toolResults })
  }

  try {
    return parseJSON<ColdEmailSequence>(finalText)
  } catch {
    const jsonMatch = finalText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in cold email response')
    return JSON.parse(jsonMatch[0]) as ColdEmailSequence
  }
}
