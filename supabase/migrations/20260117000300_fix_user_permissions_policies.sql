-- Fix recursive RLS policies on user_permissions
-- The previous policies referenced user_permissions inside their own USING/WITH CHECK,
-- which can cause "infinite recursion detected in policy" errors.

-- Drop recursive admin-based policies
DROP POLICY IF EXISTS "Admins can view all permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can insert permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can delete permissions" ON public.user_permissions;

-- Keep only per-user visibility. Inserts/updates/deletes should be done
-- via service_role (e.g. from Edge Functions), which bypasses RLS.

-- Optional: ensure select policy exists (idempotent safety)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_permissions'
      AND policyname = 'Users can view own permissions'
  ) THEN
    CREATE POLICY "Users can view own permissions"
      ON public.user_permissions
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;
