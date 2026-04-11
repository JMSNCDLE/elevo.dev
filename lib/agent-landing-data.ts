// ─── Standalone agent landing page data ───────────────────────────────────────
// One source of truth for the 25 placeholder agent pages.
// Mirrors lib/agents/agentPersonas.ts but typed for the AgentLandingPage component.

export interface AgentLandingData {
  brandName: string
  characterName: string
  tagline: string
  emoji: string
  description: string
  capabilities: string[]
  creditsPerUse: number
  availableFrom: 'trial' | 'launch' | 'orbit' | 'galaxy' | 'admin'
}

export const AGENT_LANDING: Record<string, AgentLandingData> = {
  write: {
    brandName: 'ELEVO Write', characterName: 'Sol',
    tagline: 'Content that ranks and converts',
    emoji: '✍️',
    description: 'Creates GBP posts, blogs, social captions, review responses, email campaigns, and SEO copy — all in your brand voice.',
    capabilities: ['GBP Posts', 'Blog articles', 'Social captions', 'Review responses', 'Email campaigns', 'SEO copy'],
    creditsPerUse: 1, availableFrom: 'trial',
  },
  check: {
    brandName: 'ELEVO Check', characterName: 'Val',
    tagline: 'Quality guaranteed, every time',
    emoji: '✅',
    description: 'Runs a 10-point quality check on every piece of content — grammar, tone, SEO, brand voice.',
    capabilities: ['10-point quality audit', 'SEO validation', 'Tone of voice check', 'Brand consistency'],
    creditsPerUse: 0, availableFrom: 'trial',
  },
  local: {
    brandName: 'ELEVO Local', characterName: 'Geo',
    tagline: 'Dominate your local search results',
    emoji: '📍',
    description: 'Optimises your Google Business Profile, improves local rankings, and finds everything your competitors rank for that you don\'t.',
    capabilities: ['GBP optimisation', 'Local SEO audit', 'Competitor gap analysis', 'Review strategy', 'Maps ranking'],
    creditsPerUse: 1, availableFrom: 'launch',
  },
  sales: {
    brandName: 'ELEVO Sales', characterName: 'Ava',
    tagline: 'Close more deals, faster',
    emoji: '🤝',
    description: 'Builds tailored sales proposals, scripts, and follow-up sequences that convert prospects into paying customers.',
    capabilities: ['Sales proposals', 'Pitch decks', 'Follow-up scripts', 'Objection handling', 'Quote templates'],
    creditsPerUse: 1, availableFrom: 'orbit',
  },
  research: {
    brandName: 'ELEVO Research', characterName: 'Aria',
    tagline: 'Know your market before your competitors do',
    emoji: '🔬',
    description: 'Deep market research powered by real-time web search. Competitor intelligence, market sizing, trend analysis.',
    capabilities: ['Market research', 'Competitor analysis', 'Trend identification', 'Opportunity mapping'],
    creditsPerUse: 1, availableFrom: 'orbit',
  },
  strategy: {
    brandName: 'ELEVO Strategy', characterName: 'Nova',
    tagline: 'A clear plan for where you\'re going',
    emoji: '🚀',
    description: 'Builds full SWOT analyses and 12-month growth strategies tailored to your business, market, and goals.',
    capabilities: ['SWOT analysis', '12-month strategy', 'Goal setting', 'Growth roadmap', 'KPI framework'],
    creditsPerUse: 1, availableFrom: 'orbit',
  },
  money: {
    brandName: 'ELEVO Money', characterName: 'Zara',
    tagline: 'Your P&L, finally making sense',
    emoji: '💰',
    description: 'Analyses your financial health, forecasts cash flow, identifies cost-cutting opportunities, and models growth scenarios.',
    capabilities: ['Financial health report', 'Cash flow forecast', 'Cost optimisation', 'Revenue modelling', 'Break-even analysis'],
    creditsPerUse: 1, availableFrom: 'orbit',
  },
  people: {
    brandName: 'ELEVO People', characterName: 'Finn',
    tagline: 'HR done right, without the HR team',
    emoji: '👥',
    description: 'Generates employment contracts, staff handbooks, performance frameworks, and hiring documents for your business.',
    capabilities: ['Employment contracts', 'Staff handbooks', 'Performance reviews', 'Hiring templates', 'Disciplinary procedures'],
    creditsPerUse: 1, availableFrom: 'orbit',
  },
  'ads-pro': {
    brandName: 'ELEVO Ads Pro', characterName: 'AdsP',
    tagline: 'Run Meta, Google, TikTok ads like an agency',
    emoji: '🎯',
    description: 'Builds complete ad campaigns with targeting, copy variations, creative briefs, and performance predictions — ready to launch.',
    capabilities: ['Meta Ads', 'Google Ads', 'TikTok Ads', 'LinkedIn Ads', 'Audience targeting', 'A/B copy', 'Creative briefs'],
    creditsPerUse: 3, availableFrom: 'orbit',
  },
  connect: {
    brandName: 'ELEVO Connect', characterName: 'Sage',
    tagline: 'Every conversation, handled beautifully',
    emoji: '💬',
    description: 'Powers your CRM conversations across Instagram, WhatsApp, SMS, and email. Books appointments, captures leads automatically.',
    capabilities: ['DM automation', 'Lead capture', 'Appointment booking', 'Follow-up sequences', 'CRM sync'],
    creditsPerUse: 1, availableFrom: 'orbit',
  },
  flow: {
    brandName: 'ELEVO Flow', characterName: 'Echo',
    tagline: 'Automated flows that close',
    emoji: '⚡',
    description: 'Builds ManyChat-style message flows triggered by comments, follows, payments, and more — powered by Claude.',
    capabilities: ['Comment triggers', 'DM flows', 'Review requests', 'Win-back sequences', 'Booking confirmations'],
    creditsPerUse: 1, availableFrom: 'orbit',
  },
  insight: {
    brandName: 'ELEVO Insight', characterName: 'Maya',
    tagline: 'Understand your customers deeply',
    emoji: '🧠',
    description: 'Analyses customer behaviour, segments your audience, identifies your best customers, and predicts who\'s about to churn.',
    capabilities: ['Customer segmentation', 'Churn prediction', 'Lifetime value analysis', 'Trend identification'],
    creditsPerUse: 1, availableFrom: 'orbit',
  },
  profile: {
    brandName: 'ELEVO Profile', characterName: 'Prof',
    tagline: 'Social profiles that stop the scroll',
    emoji: '✨',
    description: 'Creates optimised social media profiles with 30-day content calendars, hashtag strategies, and viral content ideas.',
    capabilities: ['Profile optimisation', '30-day calendar', 'Hashtag strategy', 'Bio variations', 'Viral content ideas'],
    creditsPerUse: 1, availableFrom: 'launch',
  },
  solve: {
    brandName: 'ELEVO Solve', characterName: 'Max',
    tagline: 'Your smartest advisor, on demand',
    emoji: '🧩',
    description: 'Powered by Claude Opus — the most capable AI model. Diagnoses complex business problems and builds step-by-step action plans.',
    capabilities: ['Problem analysis', 'Root cause identification', 'Action planning', 'Decision frameworks'],
    creditsPerUse: 2, availableFrom: 'launch',
  },
  live: {
    brandName: 'ELEVO Live', characterName: 'Iris',
    tagline: 'Always on, always ready',
    emoji: '💫',
    description: 'The live assistant panel across your entire dashboard. Quick answers, instant content, real-time guidance.',
    capabilities: ['Instant answers', 'Quick content', 'Dashboard assistant', 'Context-aware help'],
    creditsPerUse: 0, availableFrom: 'trial',
  },
  intel: {
    brandName: 'ELEVO Intel', characterName: 'Atlas',
    tagline: 'Market intelligence at your fingertips',
    emoji: '🌍',
    description: 'Monitors your market in real time. Tracks competitor moves, industry trends, and emerging opportunities.',
    capabilities: ['Market monitoring', 'Competitor tracking', 'Trend alerts', 'Opportunity scoring'],
    creditsPerUse: 1, availableFrom: 'orbit',
  },
  switch: {
    brandName: 'ELEVO Switch', characterName: 'Hugo',
    tagline: 'Cut costs without cutting quality',
    emoji: '🔄',
    description: 'Finds better, cheaper alternatives to every tool, supplier, and service you currently use.',
    capabilities: ['Tool alternatives', 'Supplier sourcing', 'Cost comparison', 'Vendor analysis'],
    creditsPerUse: 1, availableFrom: 'orbit',
  },
  guard: {
    brandName: 'ELEVO Guard', characterName: 'Guard',
    tagline: 'Protect your brand like a legal team',
    emoji: '🛡️',
    description: 'Checks trademark availability, recommends filing classes, builds your IP protection strategy.',
    capabilities: ['Trademark availability', 'Class recommendations', 'IP strategy', 'Brand monitoring'],
    creditsPerUse: 1, availableFrom: 'orbit',
  },
  studio: {
    brandName: 'ELEVO Studio', characterName: 'Vega',
    tagline: 'Every AI video tool, one studio',
    emoji: '🎬',
    description: 'Creates avatar ads, product videos, voiceovers, and cinematic UGC. Your complete video production studio.',
    capabilities: ['Avatar ads', 'Product URL videos', 'AI voiceovers', 'Cinematic UGC', 'D-ID prompts', 'HeyGen prompts'],
    creditsPerUse: 2, availableFrom: 'orbit',
  },
  import: {
    brandName: 'ELEVO Import', characterName: 'Dex',
    tagline: 'All your data, in one place',
    emoji: '📥',
    description: 'Imports and parses advertising data from Google Ads, Meta Ads, and other platforms.',
    capabilities: ['Google Ads import', 'Meta Ads import', 'CSV parsing', 'Data normalisation'],
    creditsPerUse: 0, availableFrom: 'orbit',
  },
  guide: {
    brandName: 'ELEVO Guide', characterName: 'Mira',
    tagline: 'Your friendly onboarding guide',
    emoji: '🧭',
    description: 'A 5-step business setup wizard that personalises your dashboard, recommends agents, and gets you to your first win in minutes.',
    capabilities: ['Onboarding wizard', 'Business setup', 'Agent recommendations', 'First-win checklist'],
    creditsPerUse: 0, availableFrom: 'trial',
  },
  site: {
    brandName: 'ELEVO Site', characterName: 'Wren',
    tagline: 'Your website, audited and improved',
    emoji: '🌐',
    description: 'Audits your website, generates new pages, refreshes existing content, and surfaces conversion improvements.',
    capabilities: ['Website audit', 'Page generation', 'Content refresh', 'Conversion review'],
    creditsPerUse: 1, availableFrom: 'orbit',
  },
  build: {
    brandName: 'ELEVO Build', characterName: 'Forge',
    tagline: 'Landing pages and apps from a prompt',
    emoji: '🔧',
    description: 'Builds landing pages, websites, and small web apps from a single prompt — production-ready code, no developers needed.',
    capabilities: ['Landing pages', 'Marketing sites', 'Web apps', 'Production code', 'Tailwind + Next.js'],
    creditsPerUse: 3, availableFrom: 'orbit',
  },
  route: {
    brandName: 'ELEVO Route', characterName: 'Route',
    tagline: 'Smart routing to the right agent',
    emoji: '🧭',
    description: 'Intelligently routes every prompt to the best ELEVO agent for the job. The brain behind ELEVO Chat.',
    capabilities: ['Intent classification', 'Agent routing', 'Multi-agent coordination', 'Context preservation'],
    creditsPerUse: 0, availableFrom: 'trial',
  },
}
