-- ─────────────────────────────────────────────────────────────────────────────
-- Prompt #43 — Loyalty bonus: free custom agent on subscription
-- Run in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bonus_agents_available INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bonus_agents_claimed INTEGER DEFAULT 0;
