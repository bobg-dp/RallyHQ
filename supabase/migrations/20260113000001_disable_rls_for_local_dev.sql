-- Temporarily disable RLS for local development
-- This allows service role key to work without JWT validation
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
