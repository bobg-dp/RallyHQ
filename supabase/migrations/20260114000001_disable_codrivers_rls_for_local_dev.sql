-- Temporarily disable RLS for codrivers in local development
-- This allows service role key to work without JWT validation
ALTER TABLE public.codrivers DISABLE ROW LEVEL SECURITY;
