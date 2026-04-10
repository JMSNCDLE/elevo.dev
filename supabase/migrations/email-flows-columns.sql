-- ─────────────────────────────────────────────────────────────────────────────
-- Email notification flows — additional profile columns
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email_welcome_sent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_digest_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_trial_reminders_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_reengagement_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS trial_reminder_sent_3d BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS trial_reminder_sent_1d BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS trial_reminder_sent_0d BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reengagement_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS digest_last_sent_at TIMESTAMPTZ;

-- Helpful indexes for cron lookups
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends_at ON profiles(trial_ends_at) WHERE trial_ends_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_last_active_at ON profiles(last_active_at);
