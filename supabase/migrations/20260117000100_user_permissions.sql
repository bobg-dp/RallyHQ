-- User permissions table for fine-grained access control

CREATE TABLE IF NOT EXISTS public.user_permissions (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, permission)
);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- =========================
-- RLS policies
-- =========================

-- Each user can see their own permissions
CREATE POLICY "Users can view own permissions"
  ON public.user_permissions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins (users with 'admin' permission) can see all permissions
CREATE POLICY "Admins can view all permissions"
  ON public.user_permissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_permissions up
      WHERE up.user_id = auth.uid()
        AND up.permission = 'admin'
    )
  );

-- Only admins can grant permissions (insert rows)
CREATE POLICY "Admins can insert permissions"
  ON public.user_permissions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_permissions up
      WHERE up.user_id = auth.uid()
        AND up.permission = 'admin'
    )
  );

-- Only admins can revoke permissions (delete rows)
CREATE POLICY "Admins can delete permissions"
  ON public.user_permissions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_permissions up
      WHERE up.user_id = auth.uid()
        AND up.permission = 'admin'
    )
  );

-- =========================
-- Helper function to check permissions in RLS / SQL
-- =========================

CREATE OR REPLACE FUNCTION public.has_permission(perm TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_permissions
    WHERE user_id = auth.uid()
      AND permission = perm
  );
$$;
