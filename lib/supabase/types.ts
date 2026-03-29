export type Plan = 'trial' | 'launch' | 'orbit' | 'galaxy'
export type Role = 'user' | 'admin'
export type ContentType = 'gbp_post' | 'blog' | 'review_response' | 'social_caption' | 'schema' | 'email_snippet' | 'repurposed'
export type ContactStatus = 'active' | 'lapsed' | 'at_risk' | 'vip'
export type DealStage = 'lead' | 'contacted' | 'quoted' | 'negotiating' | 'won' | 'lost'
export type DocumentType = 'swot' | 'roadmap' | 'financial' | 'research' | 'hr_doc' | 'proposal' | 'campaign'
export type CampaignType = 'review_request' | 'reactivation' | 'seasonal_offer' | 'service_reminder' | 'thank_you' | 'custom'
export type InteractionType = 'job_completed' | 'call' | 'message' | 'quote' | 'review_request' | 'email' | 'visit' | 'other'

export interface Profile {
  id: string
  email: string
  plan: Plan
  role: Role
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  credits_used: number
  credits_limit: number
  locale: string
  timezone: string
  onboarding_complete: boolean
  cancel_reason: string | null
  cancelled_at: string | null
  trial_ends_at: string
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
  locale: string
  services: string[]
  unique_selling_points: string[]
  tone_of_voice: string
  website_url: string | null
  phone: string | null
  email: string | null
  google_business_url: string | null
  google_review_url: string | null
  description: string | null
  target_audience: string | null
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  user_id: string
  business_profile_id: string
  full_name: string
  email: string | null
  phone: string | null
  address: string | null
  postcode: string | null
  notes: string | null
  tags: string[]
  source: string | null
  total_jobs: number
  total_revenue: number
  last_contact_date: string | null
  review_requested_at: string | null
  review_completed_at: string | null
  status: ContactStatus
  ai_status_reason: string | null
  created_at: string
  updated_at: string
}

export interface Interaction {
  id: string
  contact_id: string
  user_id: string
  type: InteractionType
  notes: string | null
  job_value: number | null
  created_at: string
}

export interface SavedGeneration {
  id: string
  user_id: string
  business_profile_id: string
  type: ContentType
  content: string
  metadata: Record<string, unknown>
  seo_score: Record<string, unknown>
  explanation: Record<string, unknown>
  word_count: number | null
  status: 'draft' | 'ready' | 'published'
  is_saved: boolean
  scheduled_for: string | null
  created_at: string
}

export interface SalesDeal {
  id: string
  user_id: string
  business_profile_id: string
  contact_id: string | null
  deal_name: string
  stage: DealStage
  value: number | null
  probability: number
  notes: string | null
  next_action: string | null
  next_action_date: string | null
  lost_reason: string | null
  created_at: string
  updated_at: string
}

export interface StrategyDocument {
  id: string
  user_id: string
  business_profile_id: string
  type: DocumentType
  title: string
  content: Record<string, unknown>
  is_saved: boolean
  created_at: string
}

export interface MarketingCampaign {
  id: string
  user_id: string
  business_profile_id: string
  name: string
  goal: string
  channels: string[]
  budget: number | null
  duration_weeks: number | null
  plan: Record<string, unknown>
  status: 'draft' | 'active' | 'completed' | 'paused'
  created_at: string
}

export interface Lead {
  id: string
  user_id: string | null
  name: string
  email: string
  company: string | null
  notes: string | null
  source: string | null
  created_at: string
}
