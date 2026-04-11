-- ─────────────────────────────────────────────────────────────────────────────
-- ELEVO Rank™ — Ahrefs-inspired SEO audit upgrade
-- Adds rich scoring + JSONB result columns to existing seo_audits table
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE seo_audits
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS domain TEXT,
  ADD COLUMN IF NOT EXISTS target_country TEXT DEFAULT 'us',
  ADD COLUMN IF NOT EXISTS competitor_domains TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS audit_depth TEXT DEFAULT 'quick',
  ADD COLUMN IF NOT EXISTS seo_score INTEGER,
  ADD COLUMN IF NOT EXISTS technical_health INTEGER,
  ADD COLUMN IF NOT EXISTS content_score INTEGER,
  ADD COLUMN IF NOT EXISTS backlink_score INTEGER,
  ADD COLUMN IF NOT EXISTS keyword_analysis JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS technical_issues JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS content_plan JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS competitor_data JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS overview JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_seo_audits_user_id ON seo_audits(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_audits_created_at ON seo_audits(created_at DESC);

-- RLS so users only see their own audits
ALTER TABLE seo_audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own seo audits" ON seo_audits;
CREATE POLICY "Users can read own seo audits" ON seo_audits
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own seo audits" ON seo_audits;
CREATE POLICY "Users can insert own seo audits" ON seo_audits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
