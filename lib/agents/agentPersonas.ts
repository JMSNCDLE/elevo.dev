// ─── ELEVO AI — Agent Brand Names ─────────────────────────────────────────────
// Every ELEVO agent has both a character name and a product brand name.
// Marketing pages show brand names only.
// Dashboard and agent directory show both.

export interface AgentPersona {
  characterName: string
  brandName: string
  tagline: string
  pillar: 'visibility' | 'growth' | 'customers' | 'intelligence' | 'media' | 'support'
  emoji: string
  description: string
  capabilities: string[]
  creditsPerUse: number
  availableFrom: 'trial' | 'launch' | 'orbit' | 'galaxy'
}

export const AGENT_PERSONAS: AgentPersona[] = [
  // ── VISIBILITY PILLAR ──────────────────────────────────────────────────────
  {
    characterName: 'Sol',
    brandName: 'ELEVO Write',
    tagline: 'Content that ranks and converts',
    pillar: 'visibility',
    emoji: '✍️',
    description: 'Creates GBP posts, blogs, social captions, review responses, email campaigns, and SEO copy — all in your brand voice.',
    capabilities: ['GBP Posts', 'Blog articles', 'Social captions', 'Review responses', 'Email campaigns', 'SEO copy'],
    creditsPerUse: 1,
    availableFrom: 'trial',
  },
  {
    characterName: 'Val',
    brandName: 'ELEVO Check',
    tagline: 'Quality guaranteed, every time',
    pillar: 'visibility',
    emoji: '✅',
    description: 'Runs a 10-point quality check on every piece of content — grammar, tone, SEO, brand voice.',
    capabilities: ['10-point quality audit', 'SEO validation', 'Tone of voice check', 'Brand consistency'],
    creditsPerUse: 0,
    availableFrom: 'trial',
  },
  {
    characterName: 'Geo',
    brandName: 'ELEVO Local',
    tagline: 'Dominate your local search results',
    pillar: 'visibility',
    emoji: '📍',
    description: 'Optimises your Google Business Profile, improves local rankings, and finds everything your competitors rank for that you don\'t.',
    capabilities: ['GBP optimisation', 'Local SEO audit', 'Competitor gap analysis', 'Review strategy', 'Maps ranking'],
    creditsPerUse: 1,
    availableFrom: 'launch',
  },
  {
    characterName: 'Leo',
    brandName: 'ELEVO Ads',
    tagline: 'Know exactly where every pound goes',
    pillar: 'visibility',
    emoji: '📊',
    description: 'Analyses your ad spend across every platform. Finds wasted budget, identifies top performers, and tells you exactly what to do next.',
    capabilities: ['ROAS analysis', 'Ad spend audit', 'Platform comparison', 'Budget optimisation', 'Creative performance'],
    creditsPerUse: 1,
    availableFrom: 'orbit',
  },
  {
    characterName: 'Rank',
    brandName: 'ELEVO Rank',
    tagline: 'Rank #1 for your best keywords',
    pillar: 'visibility',
    emoji: '🔍',
    description: 'Audits your SEO, identifies content gaps, generates SEO-optimised blog posts, and builds your 90-day ranking plan.',
    capabilities: ['SEO audit', 'Keyword research', 'Blog generation', 'Technical SEO', 'Backlink strategy'],
    creditsPerUse: 1,
    availableFrom: 'launch',
  },

  // ── GROWTH PILLAR ──────────────────────────────────────────────────────────
  {
    characterName: 'Ava',
    brandName: 'ELEVO Sales',
    tagline: 'Close more deals, faster',
    pillar: 'growth',
    emoji: '🤝',
    description: 'Builds tailored sales proposals, scripts, and follow-up sequences that convert prospects into paying customers.',
    capabilities: ['Sales proposals', 'Pitch decks', 'Follow-up scripts', 'Objection handling', 'Quote templates'],
    creditsPerUse: 1,
    availableFrom: 'orbit',
  },
  {
    characterName: 'Aria',
    brandName: 'ELEVO Research',
    tagline: 'Know your market before your competitors do',
    pillar: 'growth',
    emoji: '🔬',
    description: 'Deep market research powered by real-time web search. Competitor intelligence, market sizing, trend analysis.',
    capabilities: ['Market research', 'Competitor analysis', 'Trend identification', 'Opportunity mapping'],
    creditsPerUse: 1,
    availableFrom: 'orbit',
  },
  {
    characterName: 'Nova',
    brandName: 'ELEVO Strategy',
    tagline: 'A clear plan for where you\'re going',
    pillar: 'growth',
    emoji: '🚀',
    description: 'Builds full SWOT analyses and 12-month growth strategies tailored to your business, market, and goals.',
    capabilities: ['SWOT analysis', '12-month strategy', 'Goal setting', 'Growth roadmap', 'KPI framework'],
    creditsPerUse: 1,
    availableFrom: 'orbit',
  },
  {
    characterName: 'Zara',
    brandName: 'ELEVO Money',
    tagline: 'Your P&L, finally making sense',
    pillar: 'growth',
    emoji: '💰',
    description: 'Analyses your financial health, forecasts cash flow, identifies cost-cutting opportunities, and models growth scenarios.',
    capabilities: ['Financial health report', 'Cash flow forecast', 'Cost optimisation', 'Revenue modelling', 'Break-even analysis'],
    creditsPerUse: 1,
    availableFrom: 'orbit',
  },
  {
    characterName: 'Finn',
    brandName: 'ELEVO People',
    tagline: 'HR done right, without the HR team',
    pillar: 'growth',
    emoji: '👥',
    description: 'Generates employment contracts, staff handbooks, performance frameworks, and hiring documents for your business.',
    capabilities: ['Employment contracts', 'Staff handbooks', 'Performance reviews', 'Hiring templates', 'Disciplinary procedures'],
    creditsPerUse: 1,
    availableFrom: 'orbit',
  },
  {
    characterName: 'AdsP',
    brandName: 'ELEVO Ads Pro',
    tagline: 'Run Meta, Google, TikTok ads like an agency',
    pillar: 'growth',
    emoji: '🎯',
    description: 'Builds complete ad campaigns with targeting, copy variations, creative briefs, and performance predictions — ready to launch.',
    capabilities: ['Meta Ads', 'Google Ads', 'TikTok Ads', 'LinkedIn Ads', 'Audience targeting', 'A/B copy', 'Creative briefs'],
    creditsPerUse: 3,
    availableFrom: 'orbit',
  },

  // ── CUSTOMERS PILLAR ───────────────────────────────────────────────────────
  {
    characterName: 'Sage',
    brandName: 'ELEVO Connect',
    tagline: 'Every conversation, handled beautifully',
    pillar: 'customers',
    emoji: '💬',
    description: 'Powers your CRM conversations across Instagram, WhatsApp, SMS, and email. Books appointments, captures leads automatically.',
    capabilities: ['DM automation', 'Lead capture', 'Appointment booking', 'Follow-up sequences', 'CRM sync'],
    creditsPerUse: 1,
    availableFrom: 'orbit',
  },
  {
    characterName: 'Echo',
    brandName: 'ELEVO Flow',
    tagline: 'Automated flows that close',
    pillar: 'customers',
    emoji: '⚡',
    description: 'Builds ManyChat-style message flows triggered by comments, follows, payments, and more — powered by Claude.',
    capabilities: ['Comment triggers', 'DM flows', 'Review requests', 'Win-back sequences', 'Booking confirmations'],
    creditsPerUse: 1,
    availableFrom: 'orbit',
  },
  {
    characterName: 'Maya',
    brandName: 'ELEVO Insight',
    tagline: 'Understand your customers deeply',
    pillar: 'customers',
    emoji: '🧠',
    description: 'Analyses customer behaviour, segments your audience, identifies your best customers, and predicts who\'s about to churn.',
    capabilities: ['Customer segmentation', 'Churn prediction', 'Lifetime value analysis', 'Trend identification'],
    creditsPerUse: 1,
    availableFrom: 'orbit',
  },
  {
    characterName: 'Clio',
    brandName: 'ELEVO Social',
    tagline: 'A full-time social media manager',
    pillar: 'customers',
    emoji: '📱',
    description: 'Manages your entire social presence — strategy, content calendar, scheduling, auto-posting, and performance analysis.',
    capabilities: ['Social strategy', 'Content calendar', 'Auto-posting', 'Performance analysis', 'Profile optimisation'],
    creditsPerUse: 1,
    availableFrom: 'launch',
  },
  {
    characterName: 'Prof',
    brandName: 'ELEVO Profile',
    tagline: 'Social profiles that stop the scroll',
    pillar: 'customers',
    emoji: '✨',
    description: 'Creates optimised social media profiles with 30-day content calendars, hashtag strategies, and viral content ideas.',
    capabilities: ['Profile optimisation', '30-day calendar', 'Hashtag strategy', 'Bio variations', 'Viral content ideas'],
    creditsPerUse: 1,
    availableFrom: 'launch',
  },

  // ── INTELLIGENCE PILLAR ────────────────────────────────────────────────────
  {
    characterName: 'Max',
    brandName: 'ELEVO Solve',
    tagline: 'Your smartest advisor, on demand',
    pillar: 'intelligence',
    emoji: '🧩',
    description: 'Powered by Claude Opus — the most capable AI model. Diagnoses complex business problems and builds step-by-step action plans.',
    capabilities: ['Problem analysis', 'Root cause identification', 'Action planning', 'Decision frameworks'],
    creditsPerUse: 2,
    availableFrom: 'launch',
  },
  {
    characterName: 'Iris',
    brandName: 'ELEVO Live',
    tagline: 'Always on, always ready',
    pillar: 'intelligence',
    emoji: '💫',
    description: 'The live assistant panel across your entire dashboard. Quick answers, instant content, real-time guidance.',
    capabilities: ['Instant answers', 'Quick content', 'Dashboard assistant', 'Context-aware help'],
    creditsPerUse: 0,
    availableFrom: 'trial',
  },
  {
    characterName: 'Atlas',
    brandName: 'ELEVO Intel',
    tagline: 'Market intelligence at your fingertips',
    pillar: 'intelligence',
    emoji: '🌍',
    description: 'Monitors your market in real time. Tracks competitor moves, industry trends, and emerging opportunities.',
    capabilities: ['Market monitoring', 'Competitor tracking', 'Trend alerts', 'Opportunity scoring'],
    creditsPerUse: 1,
    availableFrom: 'orbit',
  },
  {
    characterName: 'Hugo',
    brandName: 'ELEVO Switch',
    tagline: 'Cut costs without cutting quality',
    pillar: 'intelligence',
    emoji: '🔄',
    description: 'Finds better, cheaper alternatives to every tool, supplier, and service you currently use.',
    capabilities: ['Tool alternatives', 'Supplier sourcing', 'Cost comparison', 'Vendor analysis'],
    creditsPerUse: 1,
    availableFrom: 'orbit',
  },
  {
    characterName: 'Guard',
    brandName: 'ELEVO Guard',
    tagline: 'Protect your brand like a legal team',
    pillar: 'intelligence',
    emoji: '🛡️',
    description: 'Checks trademark availability, recommends filing classes, builds your IP protection strategy.',
    capabilities: ['Trademark availability', 'Class recommendations', 'IP strategy', 'Brand monitoring'],
    creditsPerUse: 1,
    availableFrom: 'orbit',
  },

  // ── MEDIA PILLAR ───────────────────────────────────────────────────────────
  {
    characterName: 'Vega',
    brandName: 'ELEVO Studio',
    tagline: 'Every AI video tool, one studio',
    pillar: 'media',
    emoji: '🎬',
    description: 'Creates avatar ads, product videos, voiceovers, and cinematic UGC. Your complete video production studio.',
    capabilities: ['Avatar ads', 'Product URL videos', 'AI voiceovers', 'Cinematic UGC', 'D-ID prompts', 'HeyGen prompts'],
    creditsPerUse: 2,
    availableFrom: 'orbit',
  },
  {
    characterName: 'Dex',
    brandName: 'ELEVO Import',
    tagline: 'All your data, in one place',
    pillar: 'media',
    emoji: '📥',
    description: 'Imports and parses advertising data from Google Ads, Meta Ads, and other platforms.',
    capabilities: ['Google Ads import', 'Meta Ads import', 'CSV parsing', 'Data normalisation'],
    creditsPerUse: 0,
    availableFrom: 'orbit',
  },

  // ── VIRAL / SOCIAL ─────────────────────────────────────────────────────────
  {
    characterName: 'ELEVO Viral™',
    brandName: 'ELEVO Viral™',
    tagline: 'Go viral. Grow organically.',
    pillar: 'media',
    emoji: '🚀',
    description: 'Builds viral content strategies using real-time trend data. Tracks trending topics in your niche daily and generates a 30-day viral calendar.',
    capabilities: ['TikTok virality', 'Instagram Reels strategy', 'Hook writing', 'Viral calendars', 'Organic growth', 'Trend riding'],
    creditsPerUse: 5,
    availableFrom: 'orbit',
  },

  // ── SUPPORT ────────────────────────────────────────────────────────────────
  {
    characterName: 'Mira',
    brandName: 'ELEVO Guide',
    tagline: 'Up and running in 5 minutes',
    pillar: 'support',
    emoji: '🗺️',
    description: 'Guides new users through onboarding with a conversational 5-step wizard that sets up their entire business profile.',
    capabilities: ['Business profile setup', 'Guided onboarding', 'First content generation'],
    creditsPerUse: 0,
    availableFrom: 'trial',
  },
  {
    characterName: 'Wren',
    brandName: 'ELEVO Site',
    tagline: 'Your website, always fresh',
    pillar: 'support',
    emoji: '🌐',
    description: 'Analyses your website, suggests improvements, generates new pages, and keeps your content up to date.',
    capabilities: ['Website audit', 'Page generation', 'Content refresh', 'SEO recommendations'],
    creditsPerUse: 1,
    availableFrom: 'orbit',
  },
]

// ─── Lookup helpers ────────────────────────────────────────────────────────────

export function getAgentByCharacter(characterName: string): AgentPersona | undefined {
  return AGENT_PERSONAS.find(a => a.characterName === characterName)
}

export function getAgentByBrand(brandName: string): AgentPersona | undefined {
  return AGENT_PERSONAS.find(a => a.brandName === brandName)
}

export function getAgentsByPillar(pillar: AgentPersona['pillar']): AgentPersona[] {
  return AGENT_PERSONAS.filter(a => a.pillar === pillar)
}

export const PILLARS = [
  { key: 'visibility' as const, label: 'Visibility', emoji: '👁️', description: 'Content, local SEO, ads analysis, and rankings' },
  { key: 'growth' as const, label: 'Growth', emoji: '📈', description: 'Sales, research, strategy, finance, HR, and ad campaigns' },
  { key: 'customers' as const, label: 'Customers', emoji: '🤝', description: 'CRM, conversations, flows, social, and profiles' },
  { key: 'intelligence' as const, label: 'Intelligence', emoji: '🧠', description: 'Problem solving, market intel, trends, and brand protection' },
  { key: 'media' as const, label: 'Media', emoji: '🎬', description: 'AI video studio and data import' },
]
