// ─── Types ────────────────────────────────────────────────────────────────────

export interface AgentPersona {
  id: string
  name: string
  emoji: string
  role: string
  description: string
  specialties: string[]
  agentFile: string
  availableOn: Array<'trial' | 'launch' | 'orbit' | 'galaxy'>
  creditCost: number
}

// ─── Agent Registry ───────────────────────────────────────────────────────────

export const AGENTS: AgentPersona[] = [
  {
    id: 'leo',
    name: 'Leo',
    emoji: '📊',
    role: 'ROAS & Advertising Analyst',
    description:
      'Knows ad spend inside out. Leo calculates your exact ROAS per channel, hunts down wasted budget, and tells you precisely where to move every pound for maximum return. No fluff — just numbers and action.',
    specialties: ['ROAS calculation', 'Campaign analysis', 'Budget reallocation', 'Ad performance benchmarking'],
    agentFile: 'roasAgent',
    availableOn: ['orbit', 'galaxy'],
    creditCost: 3,
  },
  {
    id: 'flora',
    name: 'Flora',
    emoji: '💰',
    role: 'Financial Intelligence Officer',
    description:
      'Your on-call CFO. Flora parses any financial data — P&L statements, bank statements, Xero exports — and turns numbers into clarity. She spots cost leaks, surfaces growth levers, and forecasts what comes next.',
    specialties: ['P&L analysis', 'Cash flow intelligence', 'Expense benchmarking', 'Financial forecasting', 'Cost reduction'],
    agentFile: 'financeAgent',
    availableOn: ['orbit', 'galaxy'],
    creditCost: 3,
  },
  {
    id: 'rex',
    name: 'Rex',
    emoji: '📦',
    role: 'Inventory & Supply Chain Specialist',
    description:
      'Keeps your shelves right and your costs tight. Rex monitors stock levels, spots dead inventory, finds cheaper suppliers, and builds restocking plans before you run out of your best sellers.',
    specialties: ['Stock level analysis', 'Demand forecasting', 'Supplier sourcing', 'Supply risk assessment', 'Restock planning'],
    agentFile: 'inventoryAgent',
    availableOn: ['orbit', 'galaxy'],
    creditCost: 2,
  },
  {
    id: 'maya',
    name: 'Maya',
    emoji: '👥',
    role: 'Customer Trends Analyst',
    description:
      'Reads your customer base like a book. Maya segments your contacts, identifies who is about to churn, spots seasonal patterns, and builds content calendars targeted at the right people at the right time.',
    specialties: ['Customer segmentation', 'Churn prediction', 'Behavioural analysis', 'LTV optimisation', 'Seasonal planning'],
    agentFile: 'customerTrendsAgent',
    availableOn: ['orbit', 'galaxy'],
    creditCost: 2,
  },
  {
    id: 'geo',
    name: 'Geo',
    emoji: '📍',
    role: 'Google & Local Search Expert',
    description:
      'Gets your business found. Geo audits your Google Business Profile, finds keywords you should be ranking for, builds a 30-day Maps optimisation plan, and keeps you ahead in AI search results.',
    specialties: ['GBP optimisation', 'Local SEO', 'Google Maps ranking', 'Review strategy', 'AI search visibility'],
    agentFile: 'googleOptAgent',
    availableOn: ['trial', 'launch', 'orbit', 'galaxy'],
    creditCost: 1,
  },
  {
    id: 'sol',
    name: 'Sol',
    emoji: '✍️',
    role: 'Content Writer',
    description:
      'Writes content that actually sounds like you. Sol crafts GBP posts, blog articles, social captions, email campaigns, SEO copy, and review responses — all in your brand voice, all optimised for results.',
    specialties: ['GBP posts', 'Blog writing', 'Social captions', 'Email campaigns', 'SEO copy', 'Review responses'],
    agentFile: 'contentWriter',
    availableOn: ['trial', 'launch', 'orbit', 'galaxy'],
    creditCost: 1,
  },
  {
    id: 'val',
    name: 'Val',
    emoji: '✅',
    role: 'Quality & SEO Auditor',
    description:
      'The last line of defence before your content goes live. Val checks every piece for clarity, accuracy, SEO compliance, brand consistency, and factual integrity — so nothing embarrassing slips through.',
    specialties: ['Content QA', 'SEO scoring', 'Brand consistency', 'Readability analysis', 'Fact checking'],
    agentFile: 'validator',
    availableOn: ['trial', 'launch', 'orbit', 'galaxy'],
    creditCost: 1,
  },
  {
    id: 'nova',
    name: 'Nova',
    emoji: '🚀',
    role: 'Business Strategist',
    description:
      'Thinks three moves ahead. Nova runs deep SWOT analysis, builds strategic roadmaps, and turns your strengths into a competitive advantage. She is the strategic brain behind your next phase of growth.',
    specialties: ['SWOT analysis', 'Strategic planning', 'Competitive positioning', 'Growth roadmaps', 'Market positioning'],
    agentFile: 'strategyAgent',
    availableOn: ['orbit', 'galaxy'],
    creditCost: 2,
  },
  {
    id: 'ava',
    name: 'Ava',
    emoji: '🤝',
    role: 'Sales Intelligence Director',
    description:
      'Closes more deals without the cringe. Ava builds compelling sales proposals, scripts, and materials tailored to each prospect — so you walk in confident and walk out with the contract signed.',
    specialties: ['Sales proposals', 'Prospect research', 'Pricing strategy', 'Objection handling', 'Deal structuring'],
    agentFile: 'salesAgent',
    availableOn: ['orbit', 'galaxy'],
    creditCost: 2,
  },
  {
    id: 'clio',
    name: 'Clio',
    emoji: '📣',
    role: 'Marketing Campaign Architect',
    description:
      'Builds campaigns that move people. Clio designs full multi-channel marketing campaigns with content calendars, messaging frameworks, channel strategies, and KPI targets — from concept to launch-ready.',
    specialties: ['Campaign planning', 'Content calendars', 'Channel strategy', 'Messaging frameworks', 'Launch planning'],
    agentFile: 'campaignAgent',
    availableOn: ['orbit', 'galaxy'],
    creditCost: 2,
  },
  {
    id: 'aria',
    name: 'Aria',
    emoji: '🔍',
    role: 'Research Analyst',
    description:
      'Turns the internet into your intelligence department. Aria scours the web for market data, competitor intel, industry trends, and consumer behaviour — then distils it into actionable insight you can use today.',
    specialties: ['Market research', 'Competitor analysis', 'Industry trends', 'Consumer behaviour', 'Opportunity mapping'],
    agentFile: 'researchAgent',
    availableOn: ['orbit', 'galaxy'],
    creditCost: 2,
  },
  {
    id: 'zara',
    name: 'Zara',
    emoji: '📈',
    role: 'Financial Health Advisor',
    description:
      'Gives your finances a full health check without the accountant fees. Zara reviews your revenue streams, identifies cost pressures, benchmarks your margins, and builds an action plan to improve profitability.',
    specialties: ['Revenue analysis', 'Margin benchmarking', 'Cash flow health', 'KPI tracking', 'Profitability improvement'],
    agentFile: 'financialAgent',
    availableOn: ['orbit', 'galaxy'],
    creditCost: 2,
  },
  {
    id: 'finn',
    name: 'Finn',
    emoji: '👔',
    role: 'HR & Management Consultant',
    description:
      'Handles the people side so you can focus on the business side. Finn drafts employment contracts, job descriptions, performance review frameworks, HR policies, and management documents — all legally considered and ready to use.',
    specialties: ['HR documents', 'Employment contracts', 'Job descriptions', 'Performance frameworks', 'Staff policies'],
    agentFile: 'managementAgent',
    availableOn: ['orbit', 'galaxy'],
    creditCost: 2,
  },
  {
    id: 'sage',
    name: 'Sage',
    emoji: '💬',
    role: 'CRM & Customer Relations Manager',
    description:
      'Keeps your customer relationships alive. Sage analyses your contact base, identifies who needs attention, drafts personalised messages, and tells you exactly who to call, email, or visit this week.',
    specialties: ['CRM briefings', 'Contact prioritisation', 'Message drafting', 'Relationship scoring', 'Follow-up planning'],
    agentFile: 'crmAgent',
    availableOn: ['trial', 'launch', 'orbit', 'galaxy'],
    creditCost: 1,
  },
  {
    id: 'echo',
    name: 'Echo',
    emoji: '⚡',
    role: 'Conversational Automation Specialist',
    description:
      'Automates your conversations without killing the human touch. Echo builds multi-message flows for WhatsApp, SMS, email, and DMs — triggered by leads, reviews, appointments, reactivations, and more.',
    specialties: ['Conversation flows', 'WhatsApp automation', 'SMS sequences', 'Lead nurturing', 'Review requests', 'Reactivation campaigns'],
    agentFile: 'conversationAgent',
    availableOn: ['orbit', 'galaxy'],
    creditCost: 2,
  },
  {
    id: 'max',
    name: 'Max',
    emoji: '🧠',
    role: 'Problem Solver',
    description:
      'Your senior business consultant, on call 24/7. Max diagnoses the real root cause of your toughest business problems, builds an urgent action plan, and generates content or scripts you can deploy the same day.',
    specialties: ['Problem diagnosis', 'Root cause analysis', 'Action planning', 'Content generation', 'Crisis response'],
    agentFile: 'problemSolverAgent',
    availableOn: ['trial', 'launch', 'orbit', 'galaxy'],
    creditCost: 2,
  },
  {
    id: 'iris',
    name: 'Iris',
    emoji: '💡',
    role: 'Live Assistant',
    description:
      'Always in your corner. Iris is your always-on chat assistant — answering questions about your account, explaining features, helping you use ELEVO AI to its full potential, and guiding you when you are unsure what to do next.',
    specialties: ['Platform guidance', 'Feature explanation', 'Quick answers', 'Onboarding support', 'General advice'],
    agentFile: 'liveAssistant',
    availableOn: ['trial', 'launch', 'orbit', 'galaxy'],
    creditCost: 0,
  },
  {
    id: 'atlas',
    name: 'Atlas',
    emoji: '🌍',
    role: 'Market Intelligence Agent',
    description:
      'Maps your entire market landscape. Atlas goes deep on competitor research, market sizing, consumer sentiment, and emerging opportunities — giving you a complete picture of where your industry is heading.',
    specialties: ['Market sizing', 'Competitor deep-dives', 'Consumer sentiment', 'Emerging opportunities', 'Industry reports'],
    agentFile: 'researchAgent',
    availableOn: ['orbit', 'galaxy'],
    creditCost: 2,
  },
  {
    id: 'dex',
    name: 'Dex',
    emoji: '🗂️',
    role: 'Data Import & Analysis Specialist',
    description:
      'Speaks every data format fluently. Dex cleans and normalises raw data from CSV exports, Xero, QuickBooks, bank statements, or plain text — so other agents can work with it accurately and immediately.',
    specialties: ['CSV parsing', 'Xero imports', 'QuickBooks exports', 'Data normalisation', 'Format detection'],
    agentFile: 'dataIngestionAgent',
    availableOn: ['orbit', 'galaxy'],
    creditCost: 1,
  },
  {
    id: 'mira',
    name: 'Mira',
    emoji: '🌟',
    role: 'Onboarding Guide',
    description:
      'Makes sure you hit the ground running. Mira walks you through setting up your business profile, explains which agents will help you most, and ensures ELEVO AI is properly configured from day one.',
    specialties: ['Business profile setup', 'Platform orientation', 'Agent recommendations', 'First-use guidance', 'Goal setting'],
    agentFile: 'orchestrator',
    availableOn: ['trial', 'launch', 'orbit', 'galaxy'],
    creditCost: 0,
  },
  {
    id: 'hugo',
    name: 'Hugo',
    emoji: '🔄',
    role: 'Alternative Solutions Finder',
    description:
      'Finds a better way for everything you overpay for or underperform with. Hugo searches the web for real alternatives to your current tools, suppliers, processes, and approaches — with honest pros, cons, and a migration plan.',
    specialties: ['Software alternatives', 'Supplier sourcing', 'Cost reduction', 'Process improvement', 'Migration planning'],
    agentFile: 'alternativesAgent',
    availableOn: ['orbit', 'galaxy'],
    creditCost: 2,
  },
]

// ─── Helper ───────────────────────────────────────────────────────────────────

export function getAgentById(id: string): AgentPersona | undefined {
  return AGENTS.find((agent) => agent.id === id)
}
