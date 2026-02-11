CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL DEFAULT 'dog' CHECK (species IN ('dog','cat','bird','fish','reptile','small_mammal','other')),
  breed TEXT,
  date_of_birth DATE,
  weight NUMERIC(6,2),
  weight_unit TEXT NOT NULL DEFAULT 'lbs' CHECK (weight_unit IN ('lbs','kg')),
  gender TEXT NOT NULL DEFAULT 'unknown' CHECK (gender IN ('male','female','unknown')),
  color TEXT,
  photo_url TEXT,
  microchip_id TEXT,
  is_neutered BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pets_user ON public.pets(user_id);
CREATE INDEX idx_pets_species ON public.pets(species);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own pets" ON public.pets
  FOR ALL USING (auth.uid() = user_id);
