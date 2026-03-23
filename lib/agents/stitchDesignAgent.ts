import { createMessage, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON, WEB_SEARCH_TOOL } from './client'
import type { BusinessProfile } from './types'

// ─── Return Types ───────────────────────────────────────────────────────────

export interface UIComponentResult {
  html: string
  tailwindCode: string
  animationCode: string
  mobileVersion: string
  darkModeVariant: string
  imagePrompts: string[]
  accessibilityNotes: string
}

export interface SiteAnalysisResult {
  issues: Array<{
    issue: string
    severity: 'critical' | 'major' | 'minor'
    codeFix: string
  }>
  designRecommendations: Array<{
    before: string
    after: string
    rationale: string
  }>
  animationSuggestions: Array<{
    element: string
    code: string
  }>
  sectionsToAdd: Array<{
    name: string
    html: string
  }>
}

export interface FullWebsiteResult {
  pages: Array<{
    name: string
    html: string
    description: string
  }>
  cssVariables: string
  fontSetup: string
  deployInstructions: string
}

export type ComponentType =
  | 'Hero'
  | 'Navbar'
  | 'Pricing'
  | 'CTA'
  | 'Form'
  | 'Card'
  | 'Footer'
  | 'Testimonials'
  | 'Features'
  | 'FAQ'
  | 'Team'
  | 'Gallery'

export type DesignStyle = 'modern' | 'minimal' | 'bold' | 'playful' | 'luxury'

// ─── Agent Functions ─────────────────────────────────────────────────────────

/**
 * Generate a complete UI component with HTML, Tailwind, and animations
 */
export async function generateUIComponent(
  componentType: ComponentType,
  style: DesignStyle,
  description: string,
  framework: string,
  locale = 'en'
): Promise<UIComponentResult> {
  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    system: `You are ELEVO Stitch™ (Mila) — an elite AI UI/UX designer and front-end engineer. You create stunning, production-ready web components using Tailwind CSS and vanilla HTML/JS.

Your components are:
- Pixel-perfect and visually stunning
- Mobile-first and fully responsive
- Accessible (WCAG 2.1 AA)
- Performant and lightweight
- Immediately deployable

Framework: ${framework}
Locale: ${locale}`,
    messages: [
      {
        role: 'user',
        content: `Create a ${style} style ${componentType} component.
Description: ${description}

Return ONLY valid JSON (no markdown, no code fences):
{
  "html": "Complete standalone HTML with inline Tailwind CDN classes. Self-contained. Ready to paste into any webpage.",
  "tailwindCode": "The Tailwind CSS class string for the main container element, formatted for easy copying",
  "animationCode": "Any CSS keyframes or JS animation code as a string (can be empty string if none needed)",
  "mobileVersion": "Mobile-specific HTML adjustments or responsive notes",
  "darkModeVariant": "Dark mode version of the component HTML",
  "imagePrompts": ["Midjourney/DALL-E prompt for hero image", "Prompt for background or accent image"],
  "accessibilityNotes": "Key accessibility features included and recommendations"
}`,
      },
    ],
  })

  return parseJSON<UIComponentResult>(extractText(response))
}

/**
 * Analyse a website URL and suggest improvements
 */
export async function analyseAndImproveSite(
  siteUrl: string,
  improvementGoal: string,
  locale = 'en'
): Promise<SiteAnalysisResult> {
  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: MAX_TOKENS.HIGH,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    tools: [WEB_SEARCH_TOOL],
    system: `You are ELEVO Stitch™ (Mila) — an elite web design consultant and conversion rate optimisation expert. You analyse websites and provide specific, actionable improvements with real code.

Your analysis covers:
- Visual design and hierarchy
- Conversion rate optimisation
- Mobile experience
- Page speed and performance
- Accessibility
- Trust signals
- Call-to-action effectiveness

Locale: ${locale}`,
    messages: [
      {
        role: 'user',
        content: `Analyse this website: ${siteUrl}
Improvement goal: ${improvementGoal}

Research the website and provide specific improvements.

Return ONLY valid JSON:
{
  "issues": [
    {
      "issue": "Specific issue found",
      "severity": "critical|major|minor",
      "codeFix": "HTML/CSS/Tailwind code that fixes this issue"
    }
  ],
  "designRecommendations": [
    {
      "before": "Current design approach",
      "after": "Recommended design approach",
      "rationale": "Why this improves conversion/UX"
    }
  ],
  "animationSuggestions": [
    {
      "element": "Element to animate (e.g., hero headline, CTA button)",
      "code": "CSS keyframes or JS animation code"
    }
  ],
  "sectionsToAdd": [
    {
      "name": "Section name (e.g., Social Proof, FAQ)",
      "html": "Complete HTML for this new section with Tailwind classes"
    }
  ]
}`,
      },
    ],
  })

  return parseJSON<SiteAnalysisResult>(extractText(response))
}

/**
 * Generate a complete multi-page website
 */
export async function generateFullWebsite(
  businessProfile: BusinessProfile,
  pages: string[],
  style: DesignStyle,
  locale = 'en'
): Promise<FullWebsiteResult> {
  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: 12000,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('high'),
    system: `You are ELEVO Stitch™ (Mila) — a full-stack web designer who builds complete, beautiful websites for local businesses. You create production-ready HTML/Tailwind websites that look like they cost £5,000+.

Style: ${style}
Business locale: ${locale}

Each page must:
- Be a complete standalone HTML page
- Use Tailwind CSS CDN
- Be fully responsive
- Have a consistent nav and footer
- Be ready to deploy immediately
- Look stunning and professional`,
    messages: [
      {
        role: 'user',
        content: `Business: ${businessProfile.business_name}
Category: ${businessProfile.category}
Location: ${businessProfile.city}, ${businessProfile.country}
Services: ${businessProfile.services.join(', ')}
USPs: ${businessProfile.unique_selling_points.join(', ')}
${businessProfile.description ? `Description: ${businessProfile.description}` : ''}

Pages to generate: ${pages.join(', ')}
Design style: ${style}

Create a complete multi-page website.

Return ONLY valid JSON:
{
  "pages": [
    {
      "name": "Home",
      "html": "Complete standalone HTML page with Tailwind CDN",
      "description": "What this page contains and its purpose"
    }
  ],
  "cssVariables": "CSS custom properties / root variables for the brand colours and fonts",
  "fontSetup": "Google Fonts or font-face declarations for the chosen typography",
  "deployInstructions": "Step-by-step instructions to deploy this website (Vercel/Netlify/cPanel)"
}`,
      },
    ],
  })

  return parseJSON<FullWebsiteResult>(extractText(response))
}
