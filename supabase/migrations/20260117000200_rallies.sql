-- Rallies table based on the provided JSON schema

CREATE TABLE IF NOT EXISTS public.rallies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who created the rally (user with appropriate permission)
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),

  -- Basic info
  name TEXT NOT NULL,
  team_limit INTEGER,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  website TEXT,

  -- Nested objects stored as JSONB for flexibility
  organizer JSONB,      -- { name, website, contactEmail }
  registration JSONB,   -- { opens, closes, fee, currency, paymentMethods[] }
  files JSONB,          -- [ { name, type, url, description? }, ... ]
  description TEXT,     -- Markdown description
  short_description TEXT,
  team JSONB,           -- [ { role, userId }, ... ]

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.rallies ENABLE ROW LEVEL SECURITY;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS rallies_date_idx ON public.rallies(date);
CREATE INDEX IF NOT EXISTS rallies_created_by_idx ON public.rallies(created_by);

-- Reuse generic updated_at trigger
CREATE TRIGGER set_rallies_updated_at
  BEFORE UPDATE ON public.rallies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =========================
-- RLS policies
-- =========================

-- Public / authenticated users can view rallies (listing and details)
CREATE POLICY "Anyone can view rallies"
  ON public.rallies
  FOR SELECT
  USING (true);

-- Only users with the `create_rally` permission can create rallies
CREATE POLICY "Rally creators can insert rallies"
  ON public.rallies
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND public.has_permission('create_rally')
    AND (created_by IS NULL OR created_by = auth.uid())
  );

-- Only the creator (who also has `create_rally` permission) can update their rallies
CREATE POLICY "Rally creators can update own rallies"
  ON public.rallies
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND public.has_permission('create_rally')
    AND created_by = auth.uid()
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND public.has_permission('create_rally')
    AND created_by = auth.uid()
  );

-- Only admins can delete rallies
CREATE POLICY "Admins can delete rallies"
  ON public.rallies
  FOR DELETE
  USING (public.has_permission('admin'));
