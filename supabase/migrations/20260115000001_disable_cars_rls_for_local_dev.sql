-- Temporarily disable RLS for cars in local development
-- This allows service role key to work without JWT validation
ALTER TABLE public.cars DISABLE ROW LEVEL SECURITY;
