import { createMessage, MODELS, MAX_TOKENS, extractText, parseJSON } from './client'

export interface ColdCallInput {
  prospectName: string
  businessName: string
  businessType: string
  city: string
  instagramHandle?: string
  auditFinding?: string
  yourName: string
  agencyName: string
  offer: string
  locale: string
}

export interface ColdCallScript {
  openers: Array<{
    style: 'pattern_interrupt' | 'referral' | 'research_based'
    script: string
    whyThisWorks: string
  }>
  pitch: {
    painIdentification: string
    socialProof: string
    offer: string
    bridge: string
  }
  objections: Array<{
    objection: string
    response: string
    followUp: string
    tip: string
  }>
  closing: {
    softClose: string
    hardClose: string
    ifYes: string
    ifNo: string
    voicemail: string
  }
  deliveryNotes: Array<{
    note: string
    timing: string
  }>
  fullScript: string
  estimatedCallDuration: string
  successRate: string
}

export async function generateColdCallScript(
  input: ColdCallInput,
  locale: string
): Promise<ColdCallScript> {
  const systemPrompt = `You are ELEVO Dial™, a world-class sales script writer specialising in cold calling scripts for local business marketing agencies. You write natural, conversational scripts that sound human — not robotic. You understand the psychology of interruption-based selling, pattern interrupts, tonality, and objection handling.

Your scripts are:
- Conversational and natural (how real salespeople actually talk)
- Specific to the prospect's business type and location
- Built around the agency's unique offer
- Designed to get a meeting or micro-commitment, not to close on the first call
- Armed with responses to every common objection

Agency: ${input.agencyName}
Your name: ${input.yourName}
Locale: ${locale}`

  const userPrompt = `Write a complete cold call script package for this prospect.

PROSPECT DETAILS:
- Name: ${input.prospectName}
- Business: ${input.businessName}
- Type: ${input.businessType}
- City: ${input.city}
${input.instagramHandle ? `- Instagram: @${input.instagramHandle}` : ''}
${input.auditFinding ? `- Key finding to reference: ${input.auditFinding}` : ''}

OFFER BEING MADE: ${input.offer}

Write natural, conversational scripts. Include real pauses, natural speech patterns. No corporate jargon. Sound like a confident human, not a robot.

Return ONLY valid JSON with this exact structure:
{
  "openers": [
    {
      "style": "pattern_interrupt",
      "script": "full opening line + first 30 seconds of conversation",
      "whyThisWorks": "explanation of the psychology"
    },
    {
      "style": "referral",
      "script": "full opening line + first 30 seconds using a referral angle",
      "whyThisWorks": "explanation of the psychology"
    },
    {
      "style": "research_based",
      "script": "full opening line + first 30 seconds referencing specific research about their business",
      "whyThisWorks": "explanation of the psychology"
    }
  ],
  "pitch": {
    "painIdentification": "2-3 sentence pitch identifying their specific pain point",
    "socialProof": "social proof line relevant to this business type",
    "offer": "the offer framed compellingly in 1-2 sentences",
    "bridge": "bridge from their pain to your solution"
  },
  "objections": [
    {
      "objection": "Not interested",
      "response": "natural response script",
      "followUp": "follow-up if they don't hang up",
      "tip": "delivery tip"
    },
    {
      "objection": "Already have someone",
      "response": "natural response script",
      "followUp": "follow-up question",
      "tip": "delivery tip"
    },
    {
      "objection": "No budget",
      "response": "natural response script",
      "followUp": "follow-up question",
      "tip": "delivery tip"
    },
    {
      "objection": "Send me an email",
      "response": "natural response script",
      "followUp": "follow-up to keep them on the call",
      "tip": "delivery tip"
    },
    {
      "objection": "Too busy",
      "response": "natural response script",
      "followUp": "follow-up to book a future time",
      "tip": "delivery tip"
    },
    {
      "objection": "What is this about?",
      "response": "natural response script — fast and compelling",
      "followUp": "transition to pitch",
      "tip": "delivery tip"
    },
    {
      "objection": "How did you get my number?",
      "response": "natural, honest, confident response",
      "followUp": "pivot back to value",
      "tip": "delivery tip"
    },
    {
      "objection": "We tried this before",
      "response": "acknowledge and differentiate",
      "followUp": "question to understand what failed",
      "tip": "delivery tip"
    }
  ],
  "closing": {
    "softClose": "low-commitment ask — e.g. book a 15-min call",
    "hardClose": "stronger close for warmer prospects",
    "ifYes": "exactly what to say when they say yes",
    "ifNo": "exactly what to say to keep the door open",
    "voicemail": "30-second voicemail script if they don't answer"
  },
  "deliveryNotes": [
    { "note": "specific delivery advice", "timing": "when to apply this" },
    { "note": "tonality tip", "timing": "opening 5 seconds" },
    { "note": "pacing advice", "timing": "during objections" },
    { "note": "energy management", "timing": "after rejection" },
    { "note": "best time to call", "timing": "before dialing" }
  ],
  "fullScript": "The complete script from opener through close, formatted with [STAGE LABELS], ready to print and follow",
  "estimatedCallDuration": "e.g. 2-4 minutes if engaged",
  "successRate": "realistic expected booking rate with this script type"
}`

  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: 6000,
    thinking: { type: 'adaptive' },
    effort: 'high',
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  try {
    return parseJSON<ColdCallScript>(extractText(response))
  } catch {
    const text = extractText(response)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in cold call response')
    return JSON.parse(jsonMatch[0]) as ColdCallScript
  }
}
