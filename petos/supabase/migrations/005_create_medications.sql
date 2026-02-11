CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  refill_date DATE,
  prescribing_vet TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medications_pet ON public.medications(pet_id);
CREATE INDEX idx_medications_active ON public.medications(is_active);

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage medications of own pets" ON public.medications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.pets WHERE pets.id = medications.pet_id AND pets.user_id = auth.uid())
  );
