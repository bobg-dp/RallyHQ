-- Initial schema for user profiles, codrivers, and cars

-- =========================
-- user_profiles
-- =========================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  team TEXT,
  club TEXT,
  birth_date TEXT,
  driving_license_number TEXT,
  sports_license BOOLEAN DEFAULT FALSE,
  email TEXT NOT NULL,
  phone TEXT,
  ice_contact_name TEXT,
  ice_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.user_profiles
  FOR DELETE
  USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS user_profiles_id_idx ON public.user_profiles(id);

-- =========================
-- codrivers
-- =========================
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

ALTER TABLE public.codrivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own codrivers"
  ON public.codrivers
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own codrivers"
  ON public.codrivers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own codrivers"
  ON public.codrivers
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own codrivers"
  ON public.codrivers
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_codrivers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_codrivers_updated_at
  BEFORE UPDATE ON public.codrivers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_codrivers_updated_at();

CREATE INDEX IF NOT EXISTS codrivers_user_id_idx ON public.codrivers(user_id);
CREATE INDEX IF NOT EXISTS codrivers_id_idx ON public.codrivers(id);

-- =========================
-- cars
-- =========================
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

ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cars"
  ON public.cars
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cars"
  ON public.cars
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cars"
  ON public.cars
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cars"
  ON public.cars
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_cars_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_cars_updated_at
  BEFORE UPDATE ON public.cars
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_cars_updated_at();

CREATE INDEX IF NOT EXISTS cars_user_id_idx ON public.cars(user_id);
CREATE INDEX IF NOT EXISTS cars_id_idx ON public.cars(id);