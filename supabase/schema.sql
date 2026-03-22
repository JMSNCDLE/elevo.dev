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
