-- ─────────────────────────────────────────────────────────────────────────────
-- Prompt #38 — Conversations + credit audit + subscription columns
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Stripe / subscription fields on profiles (idempotent)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS keep_signed_in BOOLEAN DEFAULT FALSE;

-- 2. Persistent agent conversations (one per user × agent_type)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_type TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Credit audit trail
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deduct', 'add', 'purchase', 'subscription_renewal', 'refund')),
  agent_type TEXT,
  conversation_id UUID REFERENCES conversations(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS — users only see their own data
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own conversations" ON conversations;
CREATE POLICY "Users see own conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users see own conversation messages" ON conversation_messages;
CREATE POLICY "Users see own conversation messages" ON conversation_messages
  FOR ALL USING (
    conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users see own credit transactions" ON credit_transactions;
CREATE POLICY "Users see own credit transactions" ON credit_transactions
  FOR ALL USING (auth.uid() = user_id);

-- 5. Atomic credit deduction with audit trail
CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount INTEGER, p_agent_type TEXT DEFAULT NULL, p_conversation_id UUID DEFAULT NULL, p_description TEXT DEFAULT 'Agent usage')
RETURNS BOOLEAN AS $$
DECLARE
  used INTEGER;
  total INTEGER;
BEGIN
  SELECT credits_used, credits_limit INTO used, total FROM profiles WHERE id = p_user_id;
  IF used IS NULL OR (used + p_amount) > total THEN
    RETURN FALSE;
  END IF;

  UPDATE profiles SET credits_used = credits_used + p_amount WHERE id = p_user_id;

  INSERT INTO credit_transactions (user_id, amount, type, agent_type, conversation_id, description)
  VALUES (p_user_id, p_amount, 'deduct', p_agent_type, p_conversation_id, p_description);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_agent ON conversations(user_id, agent_type);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conv ON conversation_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id, created_at DESC);
