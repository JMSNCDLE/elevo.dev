// ─── Core Domain Types ────────────────────────────────────────────────────────

export type Plan = 'trial' | 'launch' | 'orbit' | 'galaxy'
export type ContentType =
  | 'gbp_post'
  | 'blog'
  | 'social_caption'
  | 'review_response'
  | 'email'
  | 'seo'
  | 'repurposed'

export type GrowthType =
  | 'sales_proposal'
  | 'market_research'
  | 'swot_strategy'
  | 'financial_health'
  | 'hr_document'
  | 'campaign_plan'

export interface UserProfile {
  id: string
  email: string
  plan: Plan
  credits_used: number
  credits_limit: number
  stripe_customer_id?: string
  role?: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface BusinessProfile {
  id: string
  user_id: string
  business_name: string
  category: string
  city: string
  country: string
  services: string[]
  unique_selling_points: string[]
  tone_of_voice: string
  website_url?: string
  phone?: string
  email?: string
  google_business_url?: string
  google_review_url?: string
  description?: string
  target_audience?: string
  is_primary: boolean
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

// ─── Contact & CRM ────────────────────────────────────────────────────────────

export type ContactStatus = 'active' | 'lapsed' | 'at_risk' | 'vip'

export interface Contact {
  id: string
  user_id: string
  business_profile_id?: string
  full_name: string
  email?: string
  phone?: string
  address?: string
  postcode?: string
  notes?: string
  tags: string[]
  source?: string
  total_jobs: number
  total_revenue: number
  last_contact_date?: string
  review_requested_at?: string
  review_completed_at?: string
  status: ContactStatus
  created_at: string
  updated_at: string
}

export type InteractionType =
  | 'job_completed'
  | 'call'
  | 'message'
  | 'quote'
  | 'review_request'
  | 'email'
  | 'visit'
  | 'other'

export interface Interaction {
  id: string
  contact_id: string
  user_id: string
  type: InteractionType
  notes?: string
  job_value?: number
  created_at: string
}

export interface Campaign {
  id: string
  user_id: string
  business_profile_id?: string
  name: string
  type: string
  segment: string
  message: string
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled'
  scheduled_at?: string
  sent_at?: string
  created_at: string
  updated_at: string
}

// ─── Generation & Agents ──────────────────────────────────────────────────────

export interface GenerationInput {
  type: ContentType
  businessProfile: BusinessProfile
  topic?: string
  service?: string
  keyword?: string
  season?: string
  tone?: string
  wordCount?: number
  angle?: string
  intent?: string
  goal?: string
  offer?: string
  platform?: string
  includeHashtags?: boolean
  schemaType?: string
  pageUrl?: string
  pageTitle?: string
  starRating?: number
  reviewerName?: string
  reviewText?: string
  locale?: string
}

export interface SEOScore {
  score: number
  keywordPresence: boolean
  localRelevance: boolean
  ctaPresent: boolean
  lengthOk: boolean
  readabilityOk: boolean
  feedback: string
}

export interface GenerationOutput {
  primary: string
  alternatives: string[]
  seoScore: SEOScore
  wordCount: number
  hashtags?: string[]
  schemaJson?: string
  contentType: ContentType
}

export interface ValidationResult {
  passed: boolean
  score: number
  issues: string[]
  suggestions: string[]
}

// ─── Growth Agent Outputs ─────────────────────────────────────────────────────

export interface SalesProposal {
  executiveSummary: string
  problemStatement: string
  proposedSolution: string
  deliverables: string[]
  pricing: string
  timeline: string
  whyUs: string
  nextSteps: string
  fullDocument: string
}

export interface MarketResearchReport {
  marketOverview: string
  targetAudience: string
  competitorLandscape: string[]
  marketTrends: string[]
  opportunities: string[]
  threats: string[]
  recommendations: string[]
  fullReport: string
}

export interface SWOTStrategy {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  strategicGoals: string[]
  actionPlan: string[]
  priorityActions: string
  fullDocument: string
}

export interface FinancialHealthReport {
  executiveSummary: string
  revenueAnalysis: string
  expenseReview: string
  cashFlowInsights: string
  kpiRecommendations: string[]
  costSavingOpportunities: string[]
  growthLevers: string[]
  actionPlan: string[]
  fullReport: string
}

export interface HRDocument {
  documentType: string
  title: string
  sections: Array<{ heading: string; content: string }>
  fullDocument: string
}

export interface CampaignPlan {
  campaignName: string
  objective: string
  targetAudience: string
  channels: string[]
  messaging: string
  contentCalendar: Array<{ week: string; content: string; channel: string }>
  budget: string
  kpis: string[]
  fullPlan: string
}

// ─── Problem Solver ───────────────────────────────────────────────────────────

export interface ProblemSolverResponse {
  diagnosis: string
  rootCause: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  actionPlan: Array<{ step: string; timeframe: string; impact: 'low' | 'medium' | 'high' }>
  generatedContent?: string
  longerTermRecommendations: string[]
  estimatedImpact: string
}

// ─── Live Assistant ───────────────────────────────────────────────────────────

export interface AssistantMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AssistantSession {
  id: string
  messages: AssistantMessage[]
  businessProfileId?: string
}

// ─── CRM Agent ────────────────────────────────────────────────────────────────

export interface CRMBrief {
  totalContacts: number
  activeContacts: number
  vipContacts: number
  lapsedContacts: number
  atRiskContacts: number
  reviewReady: number
  totalRevenue: number
  avgJobValue: number
  topSuggestion: string
  urgentActions: string[]
  campaignIdea: string
}

export interface MessageDraft {
  subject?: string
  smsVersion: string
  emailVersion: string
  whatsappVersion: string
}
