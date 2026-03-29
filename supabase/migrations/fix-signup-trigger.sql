-- ============================================================================
-- CRITICAL FIX: "Database error serving new user" on signup
-- Run this IMMEDIATELY in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- 1. Add full_name column to profiles (safe if already exists)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;

-- 2. Fix RLS policies — ensure INSERT is allowed for new user creation
DROP POLICY IF EXISTS "Allow insert for new users" ON public.profiles;
CREATE POLICY "Allow insert for new users"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Ensure service role has full access (drop + recreate to fix any broken policy)
DROP POLICY IF EXISTS "Service role full access on profiles" ON public.profiles;
CREATE POLICY "Service role full access on profiles"
  ON public.profiles FOR ALL
  USING (auth.role() = 'service_role');

-- 3. Fix the trigger function — robust version with:
--    - full_name extraction from user metadata
--    - ON CONFLICT handling (prevents duplicate key errors)
--    - Exception handling (trigger never blocks signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, plan, credits_used, credits_limit, role)
  VALUES (
    new.id,
    COALESCE(new.email, ''),
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    'trial',
    0,
    20,
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    updated_at = now();
  RETURN new;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'handle_new_user failed for %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- 4. Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Fix admin profile (ensure it exists and has correct role)
INSERT INTO public.profiles (id, email, full_name, plan, credits_used, credits_limit, role)
VALUES (
  '5dc15dea-4633-441b-b37a-5406e7235114',
  'jamescn.2504@gmail.com',
  'James Carlin',
  'galaxy',
  0,
  9999,
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  email = 'jamescn.2504@gmail.com',
  full_name = 'James Carlin',
  role = 'admin',
  plan = 'galaxy',
  credits_limit = 9999,
  updated_at = now();

-- 6. Verify the fix
DO $$
DECLARE
  trigger_exists boolean;
  profile_count integer;
  admin_exists boolean;
BEGIN
  -- Check trigger exists
  SELECT EXISTS(
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) INTO trigger_exists;

  -- Check profiles table has rows
  SELECT count(*) FROM public.profiles INTO profile_count;

  -- Check admin exists
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = '5dc15dea-4633-441b-b37a-5406e7235114' AND role = 'admin'
  ) INTO admin_exists;

  RAISE NOTICE '=== SIGNUP FIX VERIFICATION ===';
  RAISE NOTICE 'Trigger exists: %', trigger_exists;
  RAISE NOTICE 'Total profiles: %', profile_count;
  RAISE NOTICE 'Admin profile exists: %', admin_exists;
  RAISE NOTICE '=== END VERIFICATION ===';
END;
$$;
