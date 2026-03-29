-- Run this in Supabase SQL Editor to add email lifecycle + campaigns tables

-- Profile columns for trial email tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS progress_email_sent_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_reminder_sent_at TIMESTAMPTZ;

-- Email preferences (GDPR unsubscribe)
CREATE TABLE IF NOT EXISTS email_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  marketing_emails BOOLEAN DEFAULT true,
  product_updates BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_prefs" ON email_preferences;
CREATE POLICY "own_prefs" ON email_preferences FOR ALL USING (auth.uid() = user_id);

-- Email campaigns (admin bulk sends)
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_en TEXT NOT NULL,
  subject_es TEXT,
  body_en TEXT NOT NULL,
  body_es TEXT,
  audience TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all','trial','launch','orbit','galaxy','churned')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sending','sent','failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_only_campaigns" ON email_campaigns;
CREATE POLICY "admin_only_campaigns" ON email_campaigns FOR ALL USING (
  auth.uid() = '5dc15dea-4633-441b-b37a-5406e7235114'::uuid
);
