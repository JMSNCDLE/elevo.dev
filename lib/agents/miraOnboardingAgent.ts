import { getClient, MODELS, MAX_TOKENS, extractText, parseJSON } from './client'

// ─── Checklist ──────────────────────────────────────────────────────────────

export const ONBOARDING_CHECKLIST = [
  { id: 'profile', title: 'Complete your business profile', route: '/settings' },
  { id: 'first_content', title: 'Generate your first piece of content', route: '/dashboard/content/gbp-posts' },
  { id: 'add_contact', title: 'Add your first customer', route: '/dashboard/customers/new' },
  { id: 'explore_growth', title: 'Explore a Growth tool', route: '/dashboard/growth/strategy' },
  { id: 'problem_solver', title: 'Try the Problem Solver', route: '/dashboard/advisor' },
] as const

export type OnboardingChecklistItem = (typeof ONBOARDING_CHECKLIST)[number]

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MiraResponse {
  message: string
  nextStep: OnboardingChecklistItem | null
  suggestedAction: string
  encouragement: string
  completionPercent: number
}

// ─── System Prompt ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Mira, ELEVO AI's personal onboarding guide. You are warm, encouraging, and deeply knowledgeable about the platform.

Your personality:
- Warm and friendly like a trusted business coach
- Never patronising or condescending
- Celebrates wins genuinely (but not over the top)
- Gives clear, specific next actions
- Understands small business challenges from the inside
- Keeps messages concise — business owners are busy

You help users get value from ELEVO quickly by guiding them through a simple checklist and answering any questions about the platform.`

// ─── Get Mira Message ────────────────────────────────────────────────────────

export async function getMiraMessage(
  businessProfile: Record<string, unknown> | null,
  completedSteps: string[],
  currentStep: string,
  question?: string,
  locale?: string
): Promise<MiraResponse> {
  const client = getClient()

  const completionPercent = Math.round(
    (completedSteps.length / ONBOARDING_CHECKLIST.length) * 100
  )

  const pendingSteps = ONBOARDING_CHECKLIST.filter(s => !completedSteps.includes(s.id))
  const nextStep = pendingSteps[0] ?? null

  const prompt = `Business context:
${businessProfile ? `- Name: ${businessProfile.name}\n- Category: ${businessProfile.category}\n- Location: ${businessProfile.city}` : 'Business profile not yet complete'}

Onboarding progress:
- Completed steps: ${completedSteps.join(', ') || 'none yet'}
- Current step: ${currentStep}
- Completion: ${completionPercent}%
- Next step: ${nextStep ? `${nextStep.title} (${nextStep.route})` : 'All done!'}

${question ? `User question: ${question}` : 'Generate a welcome/progress message.'}

Respond with a JSON object:
{
  "message": "<your main message to the user — 2-4 sentences, warm and specific>",
  "nextStep": ${nextStep ? JSON.stringify(nextStep) : 'null'},
  "suggestedAction": "<one specific thing to do right now>",
  "encouragement": "<one genuine, specific encouragement based on their progress>",
  "completionPercent": ${completionPercent}
}

Locale hint: ${locale ?? 'en'}`

  const response = await client.messages.create({
    model: MODELS.SPECIALIST,
    max_tokens: MAX_TOKENS.MEDIUM,
    thinking: { type: 'adaptive' },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = extractText(response)

  try {
    return parseJSON<MiraResponse>(text)
  } catch {
    // Fallback if JSON parse fails
    return {
      message: text.substring(0, 300),
      nextStep,
      suggestedAction: nextStep ? `Head to ${nextStep.route} to ${nextStep.title.toLowerCase()}` : 'You\'re all set!',
      encouragement: 'Great progress so far!',
      completionPercent,
    }
  }
}
