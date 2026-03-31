import { createMessage, buildThinkingConfig, WEB_SEARCH_TOOL, parseJSON } from './client'
import type { BusinessProfile } from './types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type BuildType =
  | 'landing_page'
  | 'full_website'
  | 'web_app'
  | 'mobile_concept'
  | 'internal_tool'
  | 'booking_system'

export interface BuildRequest {
  businessProfile: BusinessProfile
  buildType: BuildType
  description: string
  techStack?: string
  style?: string
  pages?: string[]
  locale: string
}

export interface BuildOutput {
  projectName: string
  buildType: string
  htmlOutput?: string
  pages?: Array<{ name: string; slug: string; html: string }>
  architecture?: {
    techStack: string[]
    fileStructure: string
    keyComponents: string[]
    databaseSchema?: string
    apiRoutes?: string[]
  }
  mobileScreens?: Array<{
    screenName: string
    description: string
    components: string[]
    navigationFlow: string
  }>
  deployGuide: {
    hostingOption: string
    steps: string[]
    estimatedCost: string
    domainSuggestion: string
  }
  stitchPrompt: string
  copyContent: {
    headline: string
    subheadline: string
    cta: string
    features: string[]
  }
  seoMeta: {
    title: string
    description: string
    keywords: string[]
  }
}

// ─── Style presets ────────────────────────────────────────────────────────────

const STYLE_GUIDANCE: Record<string, string> = {
  Minimal: 'Clean white space, minimal colors (white/off-white bg, single accent), simple typography, generous padding, no decorative elements',
  Bold: 'Strong contrast, large typography, vibrant colors, geometric shapes, high visual impact',
  Professional: 'Corporate feel, trust-building design, conservative color palette, structured layout, professional photography placeholders',
  Playful: 'Rounded corners, fun colors, friendly illustrations, casual tone, engaging micro-interactions',
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export async function buildProduct(
  request: BuildRequest,
  _locale: string
): Promise<BuildOutput> {
  const bp = request.businessProfile
  const style = request.style || 'Professional'
  const styleGuide = STYLE_GUIDANCE[style] || STYLE_GUIDANCE.Professional

  const isHtmlBuild = request.buildType === 'landing_page' || request.buildType === 'full_website' || request.buildType === 'booking_system'
  const isMobile = request.buildType === 'mobile_concept'

  const brandColors = `Indigo (#6366F1) as primary, white backgrounds, dark gray text`

  const htmlBuildInstructions = isHtmlBuild
    ? `CRITICAL: For the htmlOutput field, generate a COMPLETE, WORKING, BEAUTIFUL single-file HTML document.
- Embed ALL CSS in a <style> tag in the <head>
- Use modern CSS: flexbox, grid, CSS variables, animations
- Include smooth scroll, hover effects, and mobile responsiveness
- Use the business brand colors and information throughout
- Style: ${styleGuide}
- Colors: ${brandColors} (unless business has specific colors)
- The HTML must be 100% deployable — no external dependencies except Google Fonts (use <link> tag)
- Include all sections relevant to: ${request.description}
- Make it look like a €5,000 professionally designed website
${request.pages ? `- Include these pages/sections: ${request.pages.join(', ')}` : ''}`
    : `For htmlOutput: provide a minimal skeleton/starter HTML file for the developer to build on.`

  const prompt = `You are ELEVO Build™ — Forge, the world's best AI product builder.

BUSINESS CONTEXT:
- Business Name: ${bp.business_name}
- Category: ${bp.category}
- Location: ${bp.city}, ${bp.country}
- Services: ${bp.services.join(', ')}
- Unique Selling Points: ${bp.unique_selling_points.join(', ')}
- Target Audience: ${bp.target_audience || 'General customers'}
- Website: ${bp.website_url || 'Not yet built'}

BUILD REQUEST:
- Build Type: ${request.buildType}
- Description: ${request.description}
- Style: ${style}
- Tech Stack: ${request.techStack || 'Modern web (HTML/CSS/JS or Next.js)'}
${request.pages ? `- Pages/Sections: ${request.pages.join(', ')}` : ''}

${htmlBuildInstructions}

Return valid JSON only (no markdown fences) with this EXACT structure:
{
  "projectName": "Short project name",
  "buildType": "${request.buildType}",
  "htmlOutput": "${isHtmlBuild ? 'COMPLETE single-file HTML with embedded CSS and JS. MUST be working and beautiful.' : 'Minimal starter HTML skeleton'}",
  ${isMobile ? `"mobileScreens": [
    {
      "screenName": "Home Screen",
      "description": "What this screen shows and does",
      "components": ["Component 1", "Component 2"],
      "navigationFlow": "Where this screen navigates to"
    }
  ],` : ''}
  ${!isHtmlBuild && !isMobile ? `"architecture": {
    "techStack": ["Technology 1", "Technology 2"],
    "fileStructure": "Full file/folder tree as text",
    "keyComponents": ["Component descriptions"],
    "databaseSchema": "SQL or NoSQL schema if applicable",
    "apiRoutes": ["GET /api/...", "POST /api/..."]
  },` : ''}
  "deployGuide": {
    "hostingOption": "Best hosting recommendation for this build type",
    "steps": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
    "estimatedCost": "Monthly cost estimate",
    "domainSuggestion": "Domain name suggestion based on business"
  },
  "stitchPrompt": "A detailed prompt to give to ELEVO Stitch™ for further UI refinement",
  "copyContent": {
    "headline": "Main hero headline",
    "subheadline": "Supporting subheadline",
    "cta": "Primary call to action text",
    "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"]
  },
  "seoMeta": {
    "title": "SEO page title (60 chars max)",
    "description": "Meta description (155 chars max)",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
  }
}`

  const response = await createMessage({
    model: 'claude-opus-4-6',
    max_tokens: 16000,
    thinking: buildThinkingConfig(),
    betas: ['interleaved-thinking-2025-05-14'],
    effort: 'high',
    tools: [WEB_SEARCH_TOOL],
    messages: [{ role: 'user', content: prompt }],
  })

  let jsonText = ''
  for (const block of response.content) {
    if (block.type === 'text') {
      jsonText += block.text
    }
  }

  const parsed = parseJSON<BuildOutput>(jsonText)
  return parsed
}
