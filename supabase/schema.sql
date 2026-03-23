-- ELEVO AI — Supabase Schema
-- Run this in your Supabase SQL editor to set up the complete database

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ─────────────────────────────────────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  email         text not null,
  plan          text not null default 'trial' check (plan in ('trial', 'launch', 'orbit', 'galaxy')),
  credits_used  integer not null default 0,
  credits_limit integer not null default 20,
  stripe_customer_id text,
  stripe_subscription_id text,
  role          text not null default 'user' check (role in ('user', 'admin')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Service role full access on profiles"
  on public.profiles
  using (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────────────────────
-- BUSINESS PROFILES
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.business_profiles (
  id                    uuid default uuid_generate_v4() primary key,
  user_id               uuid references public.profiles(id) on delete cascade not null,
  business_name         text not null,
  category              text not null,
  city                  text not null,
  country               text not null default 'United Kingdom',
  services              text[] not null default '{}',
  unique_selling_points text[] not null default '{}',
  tone_of_voice         text not null default 'Professional and friendly',
  website_url           text,
  phone                 text,
  email                 text,
  google_business_url   text,
  google_review_url     text,
  description           text,
  target_audience       text,
  is_primary            boolean not null default false,
  onboarding_complete   boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.business_profiles enable row level security;

create policy "Users can manage own business profiles"
  on public.business_profiles for all
  using (auth.uid() = user_id);

create index if not exists idx_business_profiles_user_id on public.business_profiles(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SAVED GENERATIONS
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.saved_generations (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references public.profiles(id) on delete cascade not null,
  business_profile_id uuid references public.business_profiles(id) on delete set null,
  type                text not null,
  content             text not null,
  metadata            jsonb,
  seo_score           integer,
  word_count          integer,
  scheduled_for       timestamptz,
  created_at          timestamptz not null default now()
);

alter table public.saved_generations enable row level security;

create policy "Users can manage own generations"
  on public.saved_generations for all
  using (auth.uid() = user_id);

create index if not exists idx_saved_generations_user_id on public.saved_generations(user_id);
create index if not exists idx_saved_generations_type on public.saved_generations(type);
create index if not exists idx_saved_generations_scheduled on public.saved_generations(scheduled_for) where scheduled_for is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- PROBLEM SOLVER HISTORY
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.problem_solver_history (
  id                          uuid default uuid_generate_v4() primary key,
  user_id                     uuid references public.profiles(id) on delete cascade not null,
  business_profile_id         uuid references public.business_profiles(id) on delete set null,
  problem                     text not null,
  diagnosis                   text not null,
  root_cause                  text,
  urgency                     text not null default 'medium' check (urgency in ('low', 'medium', 'high', 'critical')),
  action_plan                 jsonb,
  generated_content           text,
  longer_term_recommendations jsonb,
  estimated_impact            text,
  created_at                  timestamptz not null default now()
);

alter table public.problem_solver_history enable row level security;

create policy "Users can manage own problem solver history"
  on public.problem_solver_history for all
  using (auth.uid() = user_id);

create index if not exists idx_problem_solver_user_id on public.problem_solver_history(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- CONTACTS (CRM)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.contacts (
  id                    uuid default uuid_generate_v4() primary key,
  user_id               uuid references public.profiles(id) on delete cascade not null,
  business_profile_id   uuid references public.business_profiles(id) on delete set null,
  full_name             text not null,
  email                 text,
  phone                 text,
  address               text,
  postcode              text,
  notes                 text,
  tags                  text[] not null default '{}',
  source                text,
  total_jobs            integer not null default 0,
  total_revenue         numeric(10,2) not null default 0,
  last_contact_date     timestamptz,
  review_requested_at   timestamptz,
  review_completed_at   timestamptz,
  status                text not null default 'active' check (status in ('active', 'lapsed', 'at_risk', 'vip')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.contacts enable row level security;

create policy "Users can manage own contacts"
  on public.contacts for all
  using (auth.uid() = user_id);

create index if not exists idx_contacts_user_id on public.contacts(user_id);
create index if not exists idx_contacts_status on public.contacts(status);
create index if not exists idx_contacts_last_contact on public.contacts(last_contact_date);
create index if not exists idx_contacts_fullname_trgm on public.contacts using gin (full_name gin_trgm_ops);

-- ─────────────────────────────────────────────────────────────────────────────
-- INTERACTIONS
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.interactions (
  id          uuid default uuid_generate_v4() primary key,
  contact_id  uuid references public.contacts(id) on delete cascade not null,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  type        text not null check (type in ('job_completed', 'call', 'message', 'quote', 'review_request', 'email', 'visit', 'other')),
  notes       text,
  job_value   numeric(10,2),
  created_at  timestamptz not null default now()
);

alter table public.interactions enable row level security;

create policy "Users can manage own interactions"
  on public.interactions for all
  using (auth.uid() = user_id);

create index if not exists idx_interactions_contact_id on public.interactions(contact_id);
create index if not exists idx_interactions_user_id on public.interactions(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- CAMPAIGNS
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.campaigns (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references public.profiles(id) on delete cascade not null,
  business_profile_id uuid references public.business_profiles(id) on delete set null,
  name                text not null,
  type                text not null,
  segment             text not null default 'all',
  message             text not null,
  status              text not null default 'draft' check (status in ('draft', 'scheduled', 'sent', 'cancelled')),
  scheduled_at        timestamptz,
  sent_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.campaigns enable row level security;

create policy "Users can manage own campaigns"
  on public.campaigns for all
  using (auth.uid() = user_id);

create index if not exists idx_campaigns_user_id on public.campaigns(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- GROWTH REPORTS (Orbit+)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.growth_reports (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references public.profiles(id) on delete cascade not null,
  business_profile_id uuid references public.business_profiles(id) on delete set null,
  type                text not null check (type in ('sales_proposal', 'market_research', 'swot_strategy', 'financial_health', 'hr_document', 'campaign_plan')),
  title               text not null,
  content             jsonb not null,
  created_at          timestamptz not null default now()
);

alter table public.growth_reports enable row level security;

create policy "Users can manage own growth reports"
  on public.growth_reports for all
  using (auth.uid() = user_id);

create index if not exists idx_growth_reports_user_id on public.growth_reports(user_id);
create index if not exists idx_growth_reports_type on public.growth_reports(type);

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, plan, credits_used, credits_limit)
  values (new.id, new.email, 'trial', 0, 20);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_business_profiles_updated_at
  before update on public.business_profiles
  for each row execute procedure public.set_updated_at();

create trigger set_contacts_updated_at
  before update on public.contacts
  for each row execute procedure public.set_updated_at();

create trigger set_campaigns_updated_at
  before update on public.campaigns
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE 5: ANALYTICS TABLES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'page_view','session_start','session_end',
    'content_generated','roas_viewed','problem_solved',
    'contact_added','review_requested','campaign_sent',
    'upgrade_clicked','feature_used','agent_chat',
    'lead_captured_social','conversation_converted',
    'dm_flow_triggered','template_sent','video_created'
  )),
  page TEXT,
  agent_name TEXT,
  feature TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS revenue_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id),
  snapshot_date DATE NOT NULL,
  total_revenue NUMERIC(12,2) DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  returning_customers INTEGER DEFAULT 0,
  avg_job_value NUMERIC(10,2) DEFAULT 0,
  reviews_received INTEGER DEFAULT 0,
  content_published INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, business_profile_id, snapshot_date)
);

CREATE TABLE IF NOT EXISTS website_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  sessions INTEGER DEFAULT 0,
  bounce_rate NUMERIC(5,2) DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0,
  top_pages JSONB DEFAULT '[]',
  traffic_sources JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_profile_id, date)
);

CREATE TABLE IF NOT EXISTS ad_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  platform TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  spend NUMERIC(10,2) DEFAULT 0,
  revenue NUMERIC(10,2) DEFAULT 0,
  cpm NUMERIC(10,4) DEFAULT 0,
  cpc NUMERIC(10,4) DEFAULT 0,
  ctr NUMERIC(5,4) DEFAULT 0,
  roas NUMERIC(8,2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own analytics" ON analytics_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own revenue" ON revenue_snapshots FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own web_analytics" ON website_analytics FOR ALL USING (business_profile_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));
CREATE POLICY "own ad_perf" ON ad_performance FOR ALL USING (business_profile_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_analytics_events_bp ON analytics_events(business_profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_date ON revenue_snapshots(user_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_ad_perf_date ON ad_performance(business_profile_id, date DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- Phase 8 Tables
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id),
  platform TEXT NOT NULL CHECK (platform IN ('instagram','facebook','linkedin','twitter','tiktok','google')),
  platform_user_id TEXT NOT NULL,
  platform_username TEXT,
  page_id TEXT,
  page_name TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  follower_count INTEGER DEFAULT 0,
  auto_post_enabled BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, platform_user_id)
);
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_social_accounts" ON social_accounts FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id),
  social_account_id UUID REFERENCES social_accounts(id),
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT DEFAULT 'IMAGE',
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','published','failed','cancelled')),
  published_at TIMESTAMPTZ,
  platform_post_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_scheduled_posts" ON scheduled_posts FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_due ON scheduled_posts(status, scheduled_for) WHERE status = 'scheduled';

CREATE TABLE IF NOT EXISTS ai_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id),
  title TEXT NOT NULL,
  video_type TEXT NOT NULL CHECK (video_type IN (
    'avatar_ad','product_url_ad','voiceover_ugc',
    'cinematic_ugc','talking_head','slideshow_ad','hook_video'
  )),
  platform TEXT NOT NULL,
  script TEXT,
  voice_style TEXT,
  visual_style TEXT,
  product_url TEXT,
  status TEXT DEFAULT 'brief_ready' CHECK (status IN (
    'brief_ready','prompts_generated','producing',
    'review','approved','published','archived'
  )),
  ai_prompts JSONB DEFAULT '{}',
  production_notes TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  scheduled_post_id UUID REFERENCES scheduled_posts(id),
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ai_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_ai_videos" ON ai_videos FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ai_videos_user ON ai_videos(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS conversation_flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id),
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'comment_keyword','dm_keyword','story_reply','new_follower',
    'post_reaction','link_click','form_submit','missed_call',
    'review_left','appointment_booked','payment_received','manual'
  )),
  trigger_config JSONB DEFAULT '{}',
  platform TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN (
    'instagram_dm','facebook_dm','whatsapp','sms','email','all'
  )),
  flow_steps JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT false,
  total_triggered INTEGER DEFAULT 0,
  total_converted INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE conversation_flows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_flows" ON conversation_flows FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS live_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  business_profile_id UUID REFERENCES business_profiles(id),
  platform TEXT NOT NULL,
  channel TEXT NOT NULL,
  external_thread_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','resolved','escalated','spam')),
  ai_handling BOOLEAN DEFAULT true,
  messages JSONB DEFAULT '[]',
  intent TEXT,
  sentiment TEXT,
  conversion_achieved BOOLEAN DEFAULT false,
  conversion_type TEXT,
  assigned_to TEXT DEFAULT 'ai',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE live_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_live_conversations" ON live_conversations FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_live_conv_status ON live_conversations(user_id, status, last_message_at DESC);

CREATE TABLE IF NOT EXISTS conversation_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'welcome','booking','quote','follow_up','review_request',
    'reactivation','objection_handling','faq','promo','custom'
  )),
  platform TEXT,
  message TEXT NOT NULL,
  quick_replies JSONB DEFAULT '[]',
  variables JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE conversation_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_conv_templates" ON conversation_templates FOR ALL USING (auth.uid() = user_id);

-- Phase 9 Tables
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  title TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  content TEXT NOT NULL,
  excerpt TEXT,
  target_keyword TEXT,
  category TEXT,
  reading_time INTEGER DEFAULT 5,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_blog_posts_locale_slug ON blog_posts(locale, slug) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC) WHERE published = true;

CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id),
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  objective TEXT NOT NULL,
  daily_budget NUMERIC NOT NULL,
  currency TEXT DEFAULT 'GBP',
  target_location TEXT,
  campaign_duration TEXT,
  product_or_service TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','paused','ended')),
  output JSONB DEFAULT '{}',
  actual_spend NUMERIC DEFAULT 0,
  actual_roas NUMERIC,
  leads_generated INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_ad_campaigns" ON ad_campaigns FOR ALL USING (auth.uid() = user_id);

-- ─── Phase 12 additions ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'gbp',
  plan TEXT NOT NULL,
  billing_period_start DATE,
  billing_period_end DATE,
  status TEXT DEFAULT 'paid' CHECK (status IN ('paid','refunded','void')),
  pdf_url TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_invoices" ON invoices FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_created ON invoices(user_id, created_at DESC);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS billing_anchor_day INTEGER;

CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 50,
  valid_for_plan TEXT,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS used_by_user_id UUID REFERENCES profiles(id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_email ON discount_codes(email);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);

CREATE TABLE IF NOT EXISTS competitor_intel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id),
  competitor_name TEXT NOT NULL,
  competitor_website TEXT,
  competitor_instagram TEXT,
  report JSONB NOT NULL,
  threat_level TEXT,
  analysis_depth TEXT,
  alert_enabled BOOLEAN DEFAULT true,
  last_refreshed_at TIMESTAMPTZ DEFAULT NOW(),
  next_refresh_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE competitor_intel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_competitor_intel" ON competitor_intel FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_competitor_intel_user ON competitor_intel(user_id);
CREATE INDEX IF NOT EXISTS idx_competitor_intel_next_refresh ON competitor_intel(next_refresh_at) WHERE alert_enabled = true;

-- ─── Phase 14: ELEVO Create™ ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS creative_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id),
  title TEXT NOT NULL,
  output_type TEXT NOT NULL,
  description TEXT NOT NULL,
  prompts JSONB NOT NULL DEFAULT '{}',
  brand_consistency JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','generating','ready','exported')),
  exported_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE creative_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_creative" ON creative_projects FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS creative_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tokens_balance INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  plan TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE creative_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_tokens" ON creative_tokens FOR ALL USING (auth.uid() = user_id);

-- ─── Phase 15: Dropshipping + Store Integrations ──────────────────────────────

CREATE TABLE IF NOT EXISTS dropship_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id),
  product_name TEXT NOT NULL,
  niche TEXT,
  status TEXT DEFAULT 'researching' CHECK (status IN ('researching','testing','scaling','paused','killed')),
  product_data JSONB NOT NULL DEFAULT '{}',
  shopify_product_id TEXT,
  shopify_store_url TEXT,
  monthly_revenue NUMERIC(10,2) DEFAULT 0,
  monthly_spend NUMERIC(10,2) DEFAULT 0,
  roas NUMERIC(6,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE dropship_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_dropship" ON dropship_products FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS store_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id),
  platform TEXT NOT NULL CHECK (platform IN ('shopify','woocommerce','wix','squarespace','custom')),
  store_url TEXT NOT NULL,
  access_token TEXT,
  shop_id TEXT,
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE store_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_integrations" ON store_integrations FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS store_analytics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID NOT NULL REFERENCES store_integrations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  revenue NUMERIC(10,2) DEFAULT 0,
  orders INTEGER DEFAULT 0,
  sessions INTEGER DEFAULT 0,
  conversion_rate NUMERIC(6,4) DEFAULT 0,
  avg_order_value NUMERIC(10,2) DEFAULT 0,
  top_products JSONB DEFAULT '[]',
  traffic_sources JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(integration_id, date)
);
ALTER TABLE store_analytics_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_store_analytics" ON store_analytics_daily FOR ALL USING (
  integration_id IN (SELECT id FROM store_integrations WHERE user_id = auth.uid())
);
