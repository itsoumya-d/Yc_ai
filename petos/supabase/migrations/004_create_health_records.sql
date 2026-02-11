CREATE TABLE IF NOT EXISTS public.health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('vaccination','medication','vet_visit','surgery','checkup','dental','lab_work')),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  vet_name TEXT,
  vet_clinic TEXT,
  cost NUMERIC(10,2),
  notes TEXT,
  document_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_health_records_pet ON public.health_records(pet_id);
CREATE INDEX idx_health_records_type ON public.health_records(type);
CREATE INDEX idx_health_records_date ON public.health_records(date DESC);

ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage health records of own pets" ON public.health_records
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.pets WHERE pets.id = health_records.pet_id AND pets.user_id = auth.uid())
  );
