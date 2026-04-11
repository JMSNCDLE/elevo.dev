// ─── Pre-built agent team templates ──────────────────────────────────────────
// Used by the Create Team wizard to populate agents with sensible defaults.

export interface TeamTemplateMember {
  agent_type: string  // matches lib/agents/agentPersonas.ts brand slugs
  role_title: string
  context: string
}

export interface TeamTemplate {
  id: string
  name: string
  emoji: string
  description: string
  members: TeamTemplateMember[]
  exampleGoal: string
}

export const TEAM_TEMPLATES: TeamTemplate[] = [
  {
    id: 'marketing',
    name: 'Marketing Team',
    emoji: '🚀',
    description: 'Plans, creates, and ships your marketing across every channel.',
    exampleGoal: 'Increase Instagram followers by 500 in 30 days',
    members: [
      { agent_type: 'elevo-market',  role_title: 'Marketing Lead',     context: 'Owns the overall marketing strategy. Translates business goals into a 30-day execution plan.' },
      { agent_type: 'elevo-smm',     role_title: 'Social Manager',     context: 'Schedules and publishes content across Instagram, Facebook, LinkedIn, and TikTok.' },
      { agent_type: 'elevo-write',   role_title: 'Content Writer',     context: 'Writes captions, posts, and copy in the brand voice.' },
      { agent_type: 'elevo-rank',    role_title: 'SEO Specialist',     context: 'Researches keywords and ensures content is discoverable in search.' },
      { agent_type: 'elevo-spy',     role_title: 'Competitor Analyst', context: 'Monitors competitor moves and surfaces opportunities.' },
    ],
  },
  {
    id: 'sales',
    name: 'Sales Team',
    emoji: '💼',
    description: 'Generates leads, writes outreach, and closes deals.',
    exampleGoal: 'Book 20 demo calls with qualified leads in the next 30 days',
    members: [
      { agent_type: 'elevo-sales',   role_title: 'Sales Strategist', context: 'Builds the overall sales playbook, pitch decks, and proposals.' },
      { agent_type: 'elevo-write',   role_title: 'Outreach Writer',  context: 'Writes cold emails, LinkedIn messages, and follow-up sequences.' },
      { agent_type: 'elevo-connect', role_title: 'CRM Manager',      context: 'Manages contact pipelines and follow-up cadences.' },
      { agent_type: 'elevo-research', role_title: 'Lead Researcher', context: 'Identifies and qualifies prospects matching the ideal customer profile.' },
    ],
  },
  {
    id: 'full-business',
    name: 'Full Business Operations',
    emoji: '🏢',
    description: 'Your complete C-suite — strategy, marketing, sales, finance, legal.',
    exampleGoal: 'Launch a new product line and break even within 90 days',
    members: [
      { agent_type: 'elevo-ceo',        role_title: 'CEO',            context: 'Sets strategy, prioritises tasks, and makes high-level decisions.' },
      { agent_type: 'elevo-market',     role_title: 'Head of Marketing', context: 'Owns demand generation and brand growth.' },
      { agent_type: 'elevo-smm',        role_title: 'Social Manager',    context: 'Runs social channels and community.' },
      { agent_type: 'elevo-sales',      role_title: 'Head of Sales',     context: 'Closes deals and manages the pipeline.' },
      { agent_type: 'elevo-accountant', role_title: 'Accountant',        context: 'Tracks revenue, expenses, and cash flow.' },
      { agent_type: 'elevo-lawyer',     role_title: 'Legal Counsel',     context: 'Reviews contracts, terms, and compliance.' },
    ],
  },
  {
    id: 'content-studio',
    name: 'Content Studio',
    emoji: '🎬',
    description: 'Plans, writes, designs, and ships content end-to-end.',
    exampleGoal: 'Publish 3 viral pieces of content this week',
    members: [
      { agent_type: 'elevo-write',   role_title: 'Lead Writer',         context: 'Writes long-form articles, blog posts, and scripts.' },
      { agent_type: 'elevo-creator', role_title: 'YouTube Producer',    context: 'Optimises titles, thumbnails, and editing briefs.' },
      { agent_type: 'elevo-clip',    role_title: 'Clip Editor',         context: 'Cuts long content into 20+ short clips for TikTok and Reels.' },
      { agent_type: 'elevo-viral',   role_title: 'Viral Strategist',    context: 'Identifies trends and writes hook formulas.' },
    ],
  },
]

export function getTemplate(id: string): TeamTemplate | undefined {
  return TEAM_TEMPLATES.find(t => t.id === id)
}
