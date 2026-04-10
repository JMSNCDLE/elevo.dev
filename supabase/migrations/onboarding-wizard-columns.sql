-- ─────────────────────────────────────────────────────────────────────────────
-- Onboarding Wizard — additional profile columns
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS business_size TEXT,
  ADD COLUMN IF NOT EXISTS primary_goal TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_goals TEXT[];

-- Mark the admin user as already onboarded
UPDATE profiles
  SET onboarding_completed = true
  WHERE email = 'jamescn.2504@gmail.com';
