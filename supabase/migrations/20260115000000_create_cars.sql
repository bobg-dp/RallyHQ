-- Create cars table
CREATE TABLE IF NOT EXISTS public.cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year TEXT,
  registration_number TEXT NOT NULL,
  vin TEXT,
  engine_capacity TEXT,
  engine_type TEXT,
  engine_capacity_multiplier NUMERIC,
  engine_capacity_with_multiplier TEXT,
  engine_fuel TEXT,
  drive TEXT,
  next_inspection TEXT,
  insurance_policy_number TEXT,
  insurance_expiry_date TEXT,
  sport_car_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view only their own cars
CREATE POLICY "Users can view own cars"
  ON public.cars
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert only their own cars
CREATE POLICY "Users can insert own cars"
  ON public.cars
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update only their own cars
CREATE POLICY "Users can update own cars"
  ON public.cars
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete only their own cars
CREATE POLICY "Users can delete own cars"
  ON public.cars
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_cars_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_cars_updated_at
  BEFORE UPDATE ON public.cars
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_cars_updated_at();

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS cars_user_id_idx ON public.cars(user_id);
CREATE INDEX IF NOT EXISTS cars_id_idx ON public.cars(id);
