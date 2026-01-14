-- Create codrivers table
CREATE TABLE IF NOT EXISTS public.codrivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  club TEXT,
  birth_date TEXT,
  driving_license_number TEXT,
  sports_license BOOLEAN DEFAULT FALSE,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.codrivers ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view only their own codrivers
CREATE POLICY "Users can view own codrivers"
  ON public.codrivers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert only their own codrivers
CREATE POLICY "Users can insert own codrivers"
  ON public.codrivers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update only their own codrivers
CREATE POLICY "Users can update own codrivers"
  ON public.codrivers
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete only their own codrivers
CREATE POLICY "Users can delete own codrivers"
  ON public.codrivers
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_codrivers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_codrivers_updated_at
  BEFORE UPDATE ON public.codrivers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_codrivers_updated_at();

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS codrivers_user_id_idx ON public.codrivers(user_id);
CREATE INDEX IF NOT EXISTS codrivers_id_idx ON public.codrivers(id);
