import { createMessage, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText } from './client'
import { runContentWriter } from './contentWriter'
import { runProblemSolver } from './problemSolverAgent'
import type { BusinessProfile, GenerationOutput, ProblemSolverResponse } from './types'

export interface TaskMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  action?: {
    type: 'generate_content' | 'show_roas' | 'show_contacts' | 'send_review_requests' | 'run_problem_solver' | 'show_analytics' | 'search_competitors' | 'draft_message' | 'show_agent'
    result?: unknown
    status: 'pending' | 'running' | 'complete' | 'error'
    agentUsed?: string
    creditsUsed?: number
  }
  contentCard?: {
    type: string
    content: string
    copyable: boolean
    schedulable: boolean
  }
  dataCard?: {
    type: string
    data: unknown
  }
}

export interface ConversationalTaskContext {
  businessProfile: BusinessProfile
  recentMessages: TaskMessage[]
  availableCredits: number
  plan: string
  locale: string
}

interface ConversationalTaskResult {
  reply: string
  action?: TaskMessage['action']
  contentCard?: TaskMessage['contentCard']
  dataCard?: TaskMessage['dataCard']
  followUpSuggestions: string[]
}

type IntentType =
  | 'generate_gbp_post'
  | 'generate_blog'
  | 'generate_social'
  | 'generate_email'
  | 'generate_review_response'
  | 'generate_seo'
  | 'problem_solve'
  | 'show_analytics'
  | 'show_contacts'
  | 'draft_message'
  | 'general'

interface IntentAnalysis {
  intent: IntentType
  confidence: number
  extractedParams: Record<string, string>
}

async function classifyIntent(userMessage: string, bp: BusinessProfile): Promise<IntentAnalysis> {
  const response = await createMessage({
    model: MODELS.AGENT,
    max_tokens: 500,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('medium'),
    system: `Classify the user's intent from their message. Business: ${bp.business_name}, ${bp.category}, ${bp.city}.

Return ONLY JSON:
{
  "intent": "<one of: generate_gbp_post|generate_blog|generate_social|generate_email|generate_review_response|generate_seo|problem_solve|show_analytics|show_contacts|draft_message|general>",
  "confidence": <0.0-1.0>,
  "extractedParams": {
    "topic": "<topic if mentioned>",
    "keyword": "<keyword if mentioned>",
    "service": "<service if mentioned>",
    "problem": "<problem description if problem_solve>",
    "contactName": "<contact name if draft_message>"
  }
}`,
    messages: [{ role: 'user', content: userMessage }],
  })

  try {
    const text = extractText(response)
    const cleaned = text.replace(/^```(?:json)?\s*/im, '').replace(/\s*```\s*$/im, '').trim()
    return JSON.parse(cleaned) as IntentAnalysis
  } catch {
    return { intent: 'general', confidence: 0.5, extractedParams: {} }
  }
}

export async function processConversationalTask(
  userMessage: string,
  context: ConversationalTaskContext
): Promise<ConversationalTaskResult> {
  const { businessProfile: bp, availableCredits, plan, locale, recentMessages } = context
  void locale

  // Build conversation history for context
  const historyText = recentMessages
    .slice(-6)
    .map(m => `${m.role === 'user' ? 'User' : 'ELEVO'}: ${m.content}`)
    .join('\n')

  const systemPrompt = `You are ELEVO — an AI business partner with 54+ AI agents. When asked to do something, DO IT immediately and return the result. Never say you could do something — do it. You have access to: content writing, ROAS analysis, CRM, campaign planning, problem solving, market research, financial analysis.

Business: ${bp.business_name}, ${bp.category}, ${bp.city}, ${bp.country}
Services: ${bp.services.join(', ')}
USPs: ${bp.unique_selling_points.join(', ')}
Plan: ${plan}
Credits: ${availableCredits} remaining

${historyText ? `Recent conversation:\n${historyText}\n` : ''}

Respond naturally and briefly — the result speaks for itself.

When an action is taken, explain what was done in 1-2 sentences. Always suggest what to do next.`

  // Classify intent
  const intentAnalysis = await classifyIntent(userMessage, bp)
  const { intent, extractedParams } = intentAnalysis

  let replyText = ''
  let actionResult: TaskMessage['action'] | undefined
  let contentCard: TaskMessage['contentCard'] | undefined
  let dataCard: TaskMessage['dataCard'] | undefined
  let followUpSuggestions: string[] = []

  // Execute based on intent
  if (intent === 'generate_gbp_post' || intent === 'generate_blog' || intent === 'generate_social' || intent === 'generate_email' || intent === 'generate_review_response' || intent === 'generate_seo') {
    const contentTypeMap: Record<string, 'gbp_post' | 'blog' | 'social_caption' | 'email' | 'review_response' | 'seo'> = {
      generate_gbp_post: 'gbp_post',
      generate_blog: 'blog',
      generate_social: 'social_caption',
      generate_email: 'email',
      generate_review_response: 'review_response',
      generate_seo: 'seo',
    }
    const contentType = contentTypeMap[intent] ?? 'gbp_post'

    actionResult = {
      type: 'generate_content',
      status: 'running',
      agentUsed: 'Sol',
      creditsUsed: 1,
    }

    try {
      const output: GenerationOutput = await runContentWriter({
        type: contentType,
        businessProfile: bp,
        topic: extractedParams.topic,
        keyword: extractedParams.keyword,
        service: extractedParams.service,
        locale,
      })

      contentCard = {
        type: contentType,
        content: output.primary,
        copyable: true,
        schedulable: contentType === 'gbp_post' || contentType === 'social_caption',
      }

      actionResult.status = 'complete'
      actionResult.result = output

      const typeLabel: Record<string, string> = {
        gbp_post: 'GBP post', blog: 'blog post', social_caption: 'social caption',
        email: 'email', review_response: 'review response', seo: 'SEO copy',
      }

      replyText = `Done — Sol wrote a ${typeLabel[contentType] ?? 'piece of content'} for ${bp.business_name}. It's optimised for ${bp.city} and your services.`

      followUpSuggestions = ['Generate another version', 'Create a social media post', 'Write a blog post']
    } catch {
      actionResult.status = 'error'
      replyText = 'There was an error generating the content. Please try again.'
      followUpSuggestions = ['Try again', 'Try a different content type']
    }
  } else if (intent === 'problem_solve') {
    actionResult = {
      type: 'run_problem_solver',
      status: 'running',
      agentUsed: 'Max',
      creditsUsed: 2,
    }

    try {
      const problem = extractedParams.problem || userMessage
      const result: ProblemSolverResponse = await runProblemSolver(bp, problem)

      dataCard = {
        type: 'problem_solver',
        data: result,
      }

      actionResult.status = 'complete'
      actionResult.result = result

      replyText = `Max analysed your problem. Diagnosis: ${result.diagnosis.slice(0, 120)}...`

      followUpSuggestions = ['View full action plan', 'Analyse another problem', 'Generate related content']
    } catch {
      actionResult.status = 'error'
      replyText = 'Error analysing the problem. Please try again.'
      followUpSuggestions = []
    }
  } else if (intent === 'show_analytics') {
    actionResult = {
      type: 'show_analytics',
      status: 'complete',
      agentUsed: 'Leo',
    }
    replyText = 'Taking you to your analytics dashboard where you can see revenue, jobs, ad performance and more.'
    dataCard = { type: 'analytics_link', data: { href: '/analytics' } }
    followUpSuggestions = ['View ROAS analysis', 'Import ad data', 'View customer trends']
  } else if (intent === 'show_contacts') {
    actionResult = {
      type: 'show_contacts',
      status: 'complete',
      agentUsed: 'Sage',
    }
    replyText = 'Here\'s quick access to your contacts. Use the CRM to manage customers, log jobs, and send messages.'
    dataCard = { type: 'contacts_link', data: { href: '/dashboard/customers' } }
    followUpSuggestions = ['Add a new contact', 'View at-risk contacts', 'Draft a message']
  } else {
    // General conversational response
    const response = await createMessage({
      model: MODELS.ORCHESTRATOR,
      max_tokens: MAX_TOKENS.LOW,
      thinking: buildThinkingConfig(),
      ...buildEffortConfig('high'),
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    replyText = extractText(response)

    followUpSuggestions = ['Write a Google post', 'Analyse a business problem', 'View my analytics']
  }

  return {
    reply: replyText,
    action: actionResult,
    contentCard,
    dataCard,
    followUpSuggestions,
  }
}
