-- ─────────────────────────────────────────────────────────────────────────────
-- Prompt #39 — Agent Teams orchestration
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Agent Teams
CREATE TABLE IF NOT EXISTS agent_teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  goal TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'failed')),
  template TEXT,
  total_credits_used INTEGER DEFAULT 0,
  credit_budget INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Agent Team Members
CREATE TABLE IF NOT EXISTS agent_team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES agent_teams(id) ON DELETE CASCADE NOT NULL,
  agent_type TEXT NOT NULL,
  role_title TEXT NOT NULL,
  context TEXT,
  credit_budget INTEGER,
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Agent Tasks
CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES agent_teams(id) ON DELETE CASCADE NOT NULL,
  assigned_agent TEXT NOT NULL,
  task_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'needs_approval')),
  priority INTEGER DEFAULT 0,
  depends_on UUID[],
  result JSONB,
  credits_used INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Agent Handoffs
CREATE TABLE IF NOT EXISTS agent_handoffs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES agent_teams(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES agent_tasks(id),
  from_agent TEXT NOT NULL,
  to_agent TEXT NOT NULL,
  context TEXT NOT NULL,
  task_data JSONB,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS
ALTER TABLE agent_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_handoffs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own teams" ON agent_teams;
CREATE POLICY "Users manage own teams" ON agent_teams
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own team members" ON agent_team_members;
CREATE POLICY "Users manage own team members" ON agent_team_members
  FOR ALL USING (
    team_id IN (SELECT id FROM agent_teams WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users manage own tasks" ON agent_tasks;
CREATE POLICY "Users manage own tasks" ON agent_tasks
  FOR ALL USING (
    team_id IN (SELECT id FROM agent_teams WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users see own handoffs" ON agent_handoffs;
CREATE POLICY "Users see own handoffs" ON agent_handoffs
  FOR ALL USING (
    team_id IN (SELECT id FROM agent_teams WHERE user_id = auth.uid())
  );

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_agent_teams_user_id ON agent_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_team_members_team_id ON agent_team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_team_id ON agent_tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_handoffs_team_id ON agent_handoffs(team_id);
